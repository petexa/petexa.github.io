#!/usr/bin/env python3
"""
Workout Data Pipeline
=====================

Process 600+ workouts from CSV → JSON, ensuring consistency, schema compliance,
efficient enrichment, logging, and template application.

Steps:
1. Local Cleaning & Normalization
2. Schema Enforcement
3. Token-Efficient Enrichment
4. Logging + Versioning
5. Templates for Archetypes

Usage:
    python scripts/workout_pipeline.py
    python scripts/workout_pipeline.py --input data/workouts_table.csv
    python scripts/workout_pipeline.py --help
"""

import argparse
import csv
import json
import logging
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


# =============================================================================
# Constants
# =============================================================================

LBS_TO_KG = 0.453592

# Required fields per schema
REQUIRED_FIELDS = ['id', 'Name', 'Category', 'FormatDuration', 'ScoreType', 'lastCleaned']

# Optional fields per schema
OPTIONAL_FIELDS = [
    'Description', 'Flavor_Text', 'CoachNotes', 'Warmup',
    'Scaling_Tiers', 'Estimated_Times', 'Estimated_Times_Human',
    'EquipmentNeeded', 'MovementTypes', 'Stimulus', 'TargetStimulus',
    'needsEnrichment', 'needsRevalidation', 'source'
]

# Fields that can be enriched
ENRICHABLE_FIELDS = ['Description', 'Flavor_Text', 'CoachNotes']

# CSV to JSON field mapping
FIELD_MAPPING = {
    'Name': 'Name',
    'Category': 'Category',
    'Format & Duration': 'FormatDuration',
    'Score Type': 'ScoreType',
    'Description': 'Description',
    'Flavor-Text': 'Flavor_Text',
    'Coach Notes': 'CoachNotes',
    'Warmup': 'Warmup',
    'Scaling-Tiers': 'Scaling_Tiers',
    'Estimated-Times': 'Estimated_Times',
    'Estimated-Times-Human': 'Estimated_Times_Human',
    'Equipment Needed': 'EquipmentNeeded',
    'Movement Types': 'MovementTypes',
    'Stimulus': 'Stimulus',
    'Target Stimulus': 'TargetStimulus',
    'WorkoutID': 'id',
    'Instructions': 'Instructions',
    'Instructions_Clean': 'Instructions_Clean',
    'Level': 'Level',
    'DifficultyTier': 'DifficultyTier',
    'Training Goals': 'TrainingGoals',
    'Scaling Options': 'ScalingOptions',
    'Coaching-Cues': 'Coaching_Cues',
    'Environment': 'Environment',
}

# Archetype templates for Flavor_Text
ARCHETYPE_TEMPLATES = {
    'benchmark': "Classic CrossFit benchmark testing endurance, grit, and pacing. Compare against past scores to measure progress.",
    'amrap': "Push for maximum rounds in limited time. Focus on consistent pacing and efficient transitions.",
    'emom': "Structured intervals where work starts each minute. Prioritize quality reps, recovery, and rhythm under the clock.",
    'strength': "Emphasize progressive overload and form. Track weights and reps to build long-term capacity."
}


# =============================================================================
# Step 1: Local Cleaning & Normalization
# =============================================================================

def convert_lbs_to_kg(value: str, precision: float = 0.5) -> str:
    """
    Convert all weights from lbs → kgs (e.g., 135 lbs → 61.5 kgs).
    
    Args:
        value: Input string potentially containing lb/lbs values
        precision: Rounding precision (default 0.5 for 61.5 kgs style)
    
    Returns:
        String with converted values
    """
    if not isinstance(value, str):
        return value
    
    def round_to_precision(val: float, prec: float) -> float:
        """Round to nearest precision value."""
        return round(val / prec) * prec
    
    # Pattern for paired values like "135/95 lbs" or "95/65lbs"
    paired_pattern = r'(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)'
    
    def replace_paired(match):
        lb1 = float(match.group(1))
        lb2 = float(match.group(2))
        kg1 = round_to_precision(lb1 * LBS_TO_KG, precision)
        kg2 = round_to_precision(lb2 * LBS_TO_KG, precision)
        return f'{kg1}/{kg2} kgs'
    
    result = re.sub(paired_pattern, replace_paired, value, flags=re.IGNORECASE)
    
    # Pattern for single values like "135 lbs" or "20lb"
    single_pattern = r'(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)\b'
    
    def replace_single(match):
        lb_val = float(match.group(1))
        kg_val = round_to_precision(lb_val * LBS_TO_KG, precision)
        return f'{kg_val} kgs'
    
    result = re.sub(single_pattern, replace_single, result, flags=re.IGNORECASE)
    
    return result


def standardize_time_format(value: str) -> str:
    """
    Standardize time formats (e.g., "10 minutes" → "10m 0s").
    
    Args:
        value: Input string with time values
    
    Returns:
        Standardized time string
    """
    if not isinstance(value, str):
        return value
    
    result = value
    
    # Pattern for "X minutes" or "X min" → "Xm 0s"
    min_pattern = r'(\d+)\s*(?:minutes?|mins?)\b'
    
    def replace_minutes(match):
        mins = int(match.group(1))
        return f'{mins}m 0s'
    
    result = re.sub(min_pattern, replace_minutes, result, flags=re.IGNORECASE)
    
    # Pattern for "X:YY" format → "Xm Ys"
    colon_pattern = r'\b(\d+):(\d{2})\b'
    
    def replace_colon(match):
        mins = int(match.group(1))
        secs = int(match.group(2))
        return f'{mins}m {secs}s'
    
    result = re.sub(colon_pattern, replace_colon, result)
    
    return result


def normalize_instructions(value: str) -> str:
    """
    Lowercase + trim instructions for consistency.
    
    Args:
        value: Input instruction string
    
    Returns:
        Normalized instruction string (lowercase, trimmed)
    """
    if not isinstance(value, str):
        return value
    
    # Lowercase and strip whitespace
    result = value.lower().strip()
    
    # Collapse multiple whitespace
    result = re.sub(r'\s+', ' ', result)
    
    return result


def parse_nested_json(value: str) -> Any:
    """
    Parse nested fields (Scaling_Tiers, Estimated_Times) to JSON objects.
    
    Args:
        value: String that might be JSON
    
    Returns:
        Parsed JSON object or None if empty/invalid
    """
    if not isinstance(value, str):
        return value if value else None
    
    value = value.strip()
    
    if not value or value.lower() in ('', 'nan', 'none', 'null'):
        return None
    
    # Try to parse as JSON
    try:
        parsed = json.loads(value)
        return parsed if parsed else None
    except (json.JSONDecodeError, TypeError):
        pass
    
    # If it looks like a dict string but isn't valid JSON, return as-is
    if value.startswith('{') and value.endswith('}'):
        return value
    
    return value if value else None


def replace_empty_with_null(value: Any) -> Any:
    """
    Replace missing/empty values with None instead of empty strings.
    
    Args:
        value: Input value
    
    Returns:
        None if empty, otherwise the original value
    """
    if value is None:
        return None
    
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped or stripped.lower() in ('nan', 'none', 'null', ''):
            return None
        return stripped
    
    if isinstance(value, (list, dict)) and not value:
        return None
    
    return value


def clean_workout(workout: Dict[str, Any], timestamp: str) -> Dict[str, Any]:
    """
    Apply all cleaning transformations to a single workout.
    
    Args:
        workout: Raw workout dictionary
        timestamp: ISO timestamp for lastCleaned field
    
    Returns:
        Cleaned workout dictionary
    """
    cleaned = {}
    
    # Map fields from CSV column names to JSON field names
    for csv_col, json_field in FIELD_MAPPING.items():
        if csv_col in workout:
            cleaned[json_field] = workout[csv_col]
    
    # Copy any unmapped fields
    for key, value in workout.items():
        if key not in FIELD_MAPPING:
            # Use camelCase for unmapped fields
            json_key = key.replace(' ', '_').replace('-', '_')
            if json_key not in cleaned:
                cleaned[json_key] = value
    
    # Apply transformations to all string fields
    for key in list(cleaned.keys()):
        value = cleaned[key]
        
        if isinstance(value, str):
            # Convert weights
            value = convert_lbs_to_kg(value)
            
            # Standardize time formats
            value = standardize_time_format(value)
            
            cleaned[key] = value
    
    # Normalize instructions (lowercase + trim)
    for instr_field in ['Instructions', 'Instructions_Clean']:
        if instr_field in cleaned and cleaned[instr_field]:
            cleaned[instr_field] = normalize_instructions(cleaned[instr_field])
    
    # Parse nested JSON fields
    for nested_field in ['Scaling_Tiers', 'Estimated_Times']:
        if nested_field in cleaned:
            cleaned[nested_field] = parse_nested_json(cleaned[nested_field])
    
    # Replace empty values with null
    for key in list(cleaned.keys()):
        cleaned[key] = replace_empty_with_null(cleaned[key])
    
    # Add lastCleaned timestamp
    cleaned['lastCleaned'] = timestamp
    
    return cleaned


# =============================================================================
# Step 2: Schema Enforcement
# =============================================================================

def validate_workout(workout: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate a workout against the schema.
    
    Args:
        workout: Workout dictionary to validate
    
    Returns:
        Tuple of (is_valid, list of validation errors)
    """
    errors = []
    
    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in workout or workout[field] is None:
            errors.append(f"Missing required field: {field}")
    
    # Validate id is a string
    if 'id' in workout and workout['id'] is not None:
        workout['id'] = str(workout['id'])
    
    # Validate nested object fields
    for field in ['Scaling_Tiers', 'Estimated_Times']:
        if field in workout and workout[field] is not None:
            if isinstance(workout[field], str):
                # Try to parse as JSON
                try:
                    parsed = json.loads(workout[field])
                    workout[field] = parsed
                except (json.JSONDecodeError, TypeError):
                    # Keep as string if can't parse
                    pass
    
    # Validate array field
    if 'needsEnrichment' in workout and workout['needsEnrichment'] is not None:
        if not isinstance(workout['needsEnrichment'], list):
            workout['needsEnrichment'] = []
    
    # Validate boolean field
    if 'needsRevalidation' in workout and workout['needsRevalidation'] is not None:
        workout['needsRevalidation'] = bool(workout['needsRevalidation'])
    
    return len(errors) == 0, errors


def enforce_schema(workout: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enforce schema on a workout, normalizing malformed fields.
    
    Args:
        workout: Workout dictionary
    
    Returns:
        Schema-compliant workout dictionary with validationErrors if needed
    """
    # Ensure id exists
    if 'id' not in workout or workout['id'] is None:
        # Generate id from WorkoutID or index
        if 'WorkoutID' in workout:
            workout['id'] = str(workout['WorkoutID'])
        else:
            workout['id'] = None
    else:
        workout['id'] = str(workout['id'])
    
    # Ensure required string fields have defaults
    string_defaults = {
        'Name': 'Unknown Workout',
        'Category': 'General',
        'FormatDuration': 'For Time',
        'ScoreType': 'Time',
    }
    
    for field, default in string_defaults.items():
        if field not in workout or workout[field] is None:
            workout[field] = default
    
    # Ensure lastCleaned exists
    if 'lastCleaned' not in workout or workout['lastCleaned'] is None:
        workout['lastCleaned'] = datetime.now(timezone.utc).isoformat()
    
    # Normalize optional fields
    for field in OPTIONAL_FIELDS:
        if field not in workout:
            workout[field] = None
        elif field in ['Scaling_Tiers', 'Estimated_Times']:
            # Ensure these are objects or null
            if isinstance(workout[field], str):
                parsed = parse_nested_json(workout[field])
                workout[field] = parsed if isinstance(parsed, dict) else None
            elif not isinstance(workout[field], dict):
                workout[field] = None
    
    # Initialize arrays
    if 'needsEnrichment' not in workout or not isinstance(workout['needsEnrichment'], list):
        workout['needsEnrichment'] = []
    
    if 'needsRevalidation' not in workout:
        workout['needsRevalidation'] = False
    
    # Validate and add errors if any
    is_valid, errors = validate_workout(workout)
    if not is_valid:
        workout['validationErrors'] = errors
    
    return workout


# =============================================================================
# Step 3: Token-Efficient Enrichment
# =============================================================================

def identify_enrichment_needs(workout: Dict[str, Any]) -> List[str]:
    """
    Identify which fields need enrichment.
    
    Args:
        workout: Workout dictionary
    
    Returns:
        List of field names that need enrichment
    """
    needs = []
    
    for field in ENRICHABLE_FIELDS:
        value = workout.get(field)
        
        # Check if field is missing or has placeholder text
        if value is None:
            needs.append(field)
        elif isinstance(value, str):
            lower_val = value.lower()
            # Check for placeholder/empty content
            if any(placeholder in lower_val for placeholder in [
                'no description available',
                'web search performed',
                'unknown',
                'tbd',
                'n/a'
            ]):
                needs.append(field)
    
    return needs


def check_crossfit_url(workout: Dict[str, Any]) -> bool:
    """
    Check if workout contains crossfit.com in relevant fields.
    
    Args:
        workout: Workout dictionary
    
    Returns:
        True if crossfit.com URL found, False otherwise
    """
    check_fields = ['Description', 'CoachNotes', 'Flavor_Text']
    
    for field in check_fields:
        value = workout.get(field)
        if value and isinstance(value, str):
            if 'crossfit.com' in value.lower():
                return True
    
    return False


def apply_archetype_template(workout: Dict[str, Any]) -> Optional[str]:
    """
    Apply archetype template if applicable.
    
    Args:
        workout: Workout dictionary
    
    Returns:
        Template string if applicable, None otherwise
    """
    category = str(workout.get('Category', '')).lower()
    format_duration = str(workout.get('FormatDuration', '')).lower()
    name = str(workout.get('Name', '')).lower()
    
    # Check for benchmark workouts
    if 'benchmark' in category or any(bench in name for bench in [
        'fran', 'grace', 'helen', 'cindy', 'karen', 'diane', 'elizabeth',
        'isabel', 'jackie', 'nancy', 'annie', 'eva', 'kelly', 'lynne',
        'mary', 'nicole', 'barbara', 'chelsea', 'amanda', 'angie',
        'murph', 'filthy fifty', 'fight gone bad', 'dt', 'randy'
    ]):
        return ARCHETYPE_TEMPLATES['benchmark']
    
    # Check for AMRAP
    if 'amrap' in format_duration or 'amrap' in category:
        return ARCHETYPE_TEMPLATES['amrap']
    
    # Check for EMOM
    if 'emom' in format_duration or 'emom' in category:
        return ARCHETYPE_TEMPLATES['emom']
    
    # Check for strength workouts
    if any(s in category for s in ['strength', 'weightlifting', 'barbell']):
        if any(s in format_duration for s in ['sets', 'reps', 'rm', '1rm', '3rm', '5rm']):
            return ARCHETYPE_TEMPLATES['strength']
    
    return None


def enrich_workout(workout: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply enrichment logic to a workout.
    
    Args:
        workout: Workout dictionary
    
    Returns:
        Enriched workout dictionary
    """
    # Identify fields that need enrichment
    needs = identify_enrichment_needs(workout)
    workout['needsEnrichment'] = needs
    
    # Check for crossfit.com URLs - always set to True or False
    workout['needsRevalidation'] = check_crossfit_url(workout)
    
    # Apply archetype templates first to reduce AI usage
    template = apply_archetype_template(workout)
    
    if template:
        # Only apply template to Flavor_Text if it needs enrichment
        if 'Flavor_Text' in needs and (
            workout.get('Flavor_Text') is None or 
            'no description' in str(workout.get('Flavor_Text', '')).lower()
        ):
            workout['Flavor_Text'] = template
            workout['source'] = 'template'
            # Remove from needs since we filled it
            if 'Flavor_Text' in workout['needsEnrichment']:
                workout['needsEnrichment'].remove('Flavor_Text')
    
    return workout


# =============================================================================
# Step 4: Logging + Versioning
# =============================================================================

class PipelineLogger:
    """Handles logging for the workout pipeline."""
    
    def __init__(self, log_dir: Path):
        self.log_dir = log_dir
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        self.conversion_log = log_dir / 'conversionReport.log'
        self.update_log = log_dir / 'updateReport.log'
        
        self.stats = {
            'total_workouts': 0,
            'cleaned': 0,
            'schema_errors': 0,
            'needs_enrichment': 0,
            'needs_revalidation': 0,
            'templates_applied': 0,
            'unit_conversions': 0,
        }
    
    def log_conversion(self, message: str):
        """Log conversion activity."""
        timestamp = datetime.now(timezone.utc).isoformat()
        with open(self.conversion_log, 'a') as f:
            f.write(f"[{timestamp}] {message}\n")
    
    def log_update(self, message: str):
        """Log update activity."""
        timestamp = datetime.now(timezone.utc).isoformat()
        with open(self.update_log, 'a') as f:
            f.write(f"[{timestamp}] {message}\n")
    
    def write_summary(self):
        """Write summary to both logs."""
        summary = f"""
========================================
Pipeline Run Summary
========================================
Total Workouts Processed: {self.stats['total_workouts']}
Successfully Cleaned: {self.stats['cleaned']}
Schema Validation Errors: {self.stats['schema_errors']}
Workouts Needing Enrichment: {self.stats['needs_enrichment']}
Workouts Needing Revalidation: {self.stats['needs_revalidation']}
Templates Applied: {self.stats['templates_applied']}
Unit Conversions: {self.stats['unit_conversions']}
========================================
"""
        self.log_conversion(summary)
        self.log_update(summary)


def save_snapshot(workouts: List[Dict], output_dir: Path) -> str:
    """
    Save a timestamped snapshot of the workouts.
    
    Args:
        workouts: List of workout dictionaries
        output_dir: Directory to save snapshots
    
    Returns:
        Filename of the saved snapshot
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    filename = f'workouts_table_{timestamp}.json'
    filepath = output_dir / filename
    
    with open(filepath, 'w') as f:
        json.dump(workouts, f, indent=2)
    
    logger.info(f"Saved snapshot: {filepath}")
    return filename


def save_latest(workouts: List[Dict], output_path: Path):
    """
    Save the latest workouts JSON for app consumption.
    
    Args:
        workouts: List of workout dictionaries
        output_path: Path to save the latest JSON
    """
    with open(output_path, 'w') as f:
        json.dump(workouts, f, indent=2)
    
    logger.info(f"Saved latest: {output_path}")


# =============================================================================
# Main Pipeline
# =============================================================================

def load_csv(filepath: Path) -> List[Dict[str, Any]]:
    """Load workouts from CSV file."""
    workouts = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            workouts.append(dict(row))
    
    logger.info(f"Loaded {len(workouts)} workouts from {filepath}")
    return workouts


def run_pipeline(
    input_path: Path,
    output_path: Path,
    log_dir: Path,
    snapshot_dir: Path
) -> List[Dict[str, Any]]:
    """
    Run the complete workout data pipeline.
    
    Args:
        input_path: Path to input CSV file
        output_path: Path to output JSON file
        log_dir: Directory for log files
        snapshot_dir: Directory for snapshots
    
    Returns:
        List of processed workout dictionaries
    """
    # Initialize logger
    pipeline_logger = PipelineLogger(log_dir)
    pipeline_logger.log_conversion("Starting workout data pipeline")
    
    # Get timestamp for this run
    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Load CSV data
    raw_workouts = load_csv(input_path)
    pipeline_logger.stats['total_workouts'] = len(raw_workouts)
    
    processed_workouts = []
    
    for i, raw_workout in enumerate(raw_workouts):
        workout_name = raw_workout.get('Name', f'Workout {i+1}')
        
        try:
            # Step 1: Clean and normalize
            cleaned = clean_workout(raw_workout, timestamp)
            pipeline_logger.stats['cleaned'] += 1
            
            # Track unit conversions
            for key in ['Instructions', 'Instructions_Clean', 'EquipmentNeeded', 'Description']:
                if key in cleaned and key in raw_workout:
                    old_val = str(raw_workout.get(key, ''))
                    new_val = str(cleaned.get(key, ''))
                    if old_val != new_val and ('kg' in new_val and 'lb' in old_val.lower()):
                        pipeline_logger.stats['unit_conversions'] += 1
            
            # Step 2: Enforce schema
            validated = enforce_schema(cleaned)
            
            if 'validationErrors' in validated:
                pipeline_logger.stats['schema_errors'] += 1
                pipeline_logger.log_conversion(
                    f"Schema validation errors for '{workout_name}': {validated['validationErrors']}"
                )
            
            # Step 3: Enrich
            enriched = enrich_workout(validated)
            
            if enriched.get('needsEnrichment'):
                pipeline_logger.stats['needs_enrichment'] += 1
            
            if enriched.get('needsRevalidation'):
                pipeline_logger.stats['needs_revalidation'] += 1
            
            if enriched.get('source') == 'template':
                pipeline_logger.stats['templates_applied'] += 1
            
            processed_workouts.append(enriched)
            
        except Exception as e:
            pipeline_logger.log_conversion(f"Error processing '{workout_name}': {str(e)}")
            logger.error(f"Error processing '{workout_name}': {str(e)}")
            # Still include the workout with minimal processing
            raw_workout['id'] = str(raw_workout.get('WorkoutID', i + 1))
            raw_workout['lastCleaned'] = timestamp
            raw_workout['validationErrors'] = [str(e)]
            processed_workouts.append(raw_workout)
    
    # Step 4: Save outputs
    
    # Save timestamped snapshot
    save_snapshot(processed_workouts, snapshot_dir)
    
    # Save latest.json
    latest_path = output_path.parent / 'latest.json'
    save_latest(processed_workouts, latest_path)
    
    # Save main output
    save_latest(processed_workouts, output_path)
    
    # Write summary
    pipeline_logger.write_summary()
    
    logger.info("Pipeline complete!")
    logger.info(f"Total: {pipeline_logger.stats['total_workouts']}")
    logger.info(f"Cleaned: {pipeline_logger.stats['cleaned']}")
    logger.info(f"Schema errors: {pipeline_logger.stats['schema_errors']}")
    logger.info(f"Needs enrichment: {pipeline_logger.stats['needs_enrichment']}")
    logger.info(f"Needs revalidation: {pipeline_logger.stats['needs_revalidation']}")
    logger.info(f"Templates applied: {pipeline_logger.stats['templates_applied']}")
    
    return processed_workouts


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Workout Data Pipeline - Process CSV to JSON with cleaning, validation, and enrichment',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    %(prog)s
    %(prog)s --input data/workouts_table.csv
    %(prog)s --input data/workouts_table.csv --output data/workouts_processed.json
        """
    )
    
    parser.add_argument(
        '--input', '-i',
        default='data/workouts_table.csv',
        help='Input CSV file path (default: data/workouts_table.csv)'
    )
    
    parser.add_argument(
        '--output', '-o',
        default='data/workouts_table.json',
        help='Output JSON file path (default: data/workouts_table.json)'
    )
    
    parser.add_argument(
        '--log-dir',
        default='data/logs',
        help='Directory for log files (default: data/logs)'
    )
    
    parser.add_argument(
        '--snapshot-dir',
        default='data/snapshots',
        help='Directory for timestamped snapshots (default: data/snapshots)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    return parser.parse_args()


def main():
    """Main entry point."""
    args = parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Convert paths
    input_path = Path(args.input)
    output_path = Path(args.output)
    log_dir = Path(args.log_dir)
    snapshot_dir = Path(args.snapshot_dir)
    
    # Validate input exists
    if not input_path.exists():
        logger.error(f"Input file not found: {input_path}")
        sys.exit(1)
    
    # Run pipeline
    run_pipeline(input_path, output_path, log_dir, snapshot_dir)


if __name__ == '__main__':
    main()
