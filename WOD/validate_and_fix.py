#!/usr/bin/env python3
"""
WOD Dataset Validation and Auto-Fix System
Comprehensive validation, normalization, and maintenance for the WOD dataset.
"""

import pandas as pd
import sys
import os
import re
from typing import Dict, List, Tuple, Set
import json

# Import shared configuration
from config import (
    DATA_DIR, OUT_DIR, REQUIRED_FILES,
    MOVEMENT_KEYWORDS, ARTIFACT_PATTERNS,
    MOVEMENT_CAPITALIZATIONS, VALID_DIFFICULTY_TIERS,
    MIN_INSTRUCTION_LENGTH, EXPECTED_WORKOUT_COLUMNS,
    EXPECTED_MOVEMENT_COLUMNS, EXPECTED_EQUIPMENT_COLUMNS
)

os.makedirs(OUT_DIR, exist_ok=True)

class WODValidator:
    """Main validation and auto-fix class for WOD dataset"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.fixes = []
        self.workouts = None
        self.movements = None
        self.equipment = None
        self.wm_map = None
        self.me_map = None
        
    def load_data(self):
        """Load all CSV files"""
        print("Loading data files...")
        
        # Check for missing files
        missing = [f for f in REQUIRED_FILES if not os.path.exists(os.path.join(DATA_DIR, f))]
        if missing:
            self.errors.append(f'Missing required files: {", ".join(missing)}')
            return False
        
        # Load with proper handling
        self.workouts = pd.read_csv(os.path.join(DATA_DIR, 'workouts_table.csv'), dtype=str).fillna('')
        self.movements = pd.read_csv(os.path.join(DATA_DIR, 'movement_library.csv'), dtype=str).fillna('')
        self.equipment = pd.read_csv(os.path.join(DATA_DIR, 'equipment_library.csv'), dtype=str).fillna('')
        self.wm_map = pd.read_csv(os.path.join(DATA_DIR, 'workout_movement_map.csv'), dtype=str).fillna('')
        self.me_map = pd.read_csv(os.path.join(DATA_DIR, 'movement_equipment_map.csv'), dtype=str).fillna('')
        
        print(f"Loaded: {len(self.workouts)} workouts, {len(self.movements)} movements, "
              f"{len(self.equipment)} equipment items")
        return True
    
    def validate_schema(self):
        """Validate required columns exist"""
        print("\n=== Schema Validation ===")
        
        if 'WorkoutID' not in self.workouts.columns:
            self.errors.append('Workouts table missing WorkoutID column')
        if 'MovementID' not in self.movements.columns:
            self.errors.append('Movements table missing MovementID column')
        if 'EquipmentID' not in self.equipment.columns:
            self.errors.append('Equipment table missing EquipmentID column')
        
        # Check for expected columns
        for col in EXPECTED_WORKOUT_COLUMNS:
            if col not in self.workouts.columns:
                self.warnings.append(f'Workouts table missing recommended column: {col}')
        
        for col in EXPECTED_MOVEMENT_COLUMNS:
            if col not in self.movements.columns:
                self.warnings.append(f'Movements table missing recommended column: {col}')
        
        for col in EXPECTED_EQUIPMENT_COLUMNS:
            if col not in self.equipment.columns:
                self.warnings.append(f'Equipment table missing recommended column: {col}')
        
        print(f"Schema validation: {len(self.errors)} errors, {len(self.warnings)} warnings")
    
    def check_duplicates(self):
        """Check for duplicate entries"""
        print("\n=== Duplicate Check ===")
        
        # Check for duplicate IDs
        if 'WorkoutID' in self.workouts.columns:
            dup_workout_ids = self.workouts[self.workouts['WorkoutID'].duplicated(keep=False)]
            if not dup_workout_ids.empty:
                self.errors.append(f"Duplicate WorkoutIDs found: {dup_workout_ids['WorkoutID'].unique().tolist()}")
        
        if 'MovementID' in self.movements.columns:
            dup_movement_ids = self.movements[self.movements['MovementID'].duplicated(keep=False)]
            if not dup_movement_ids.empty:
                self.errors.append(f"Duplicate MovementIDs found: {dup_movement_ids['MovementID'].unique().tolist()}")
        
        if 'EquipmentID' in self.equipment.columns:
            dup_equipment_ids = self.equipment[self.equipment['EquipmentID'].duplicated(keep=False)]
            if not dup_equipment_ids.empty:
                self.errors.append(f"Duplicate EquipmentIDs found: {dup_equipment_ids['EquipmentID'].unique().tolist()}")
        
        # Check for duplicate movement names (case-insensitive)
        if 'Movement' in self.movements.columns:
            movements_lower = self.movements['Movement'].str.lower().str.strip()
            dup_names = movements_lower[movements_lower.duplicated(keep=False)]
            if not dup_names.empty:
                unique_dups = dup_names.unique()
                self.warnings.append(f"Duplicate movement names detected (case-insensitive): {list(unique_dups)}")
        
        print(f"Duplicate check: {len(self.errors)} errors, {len(self.warnings)} warnings")
    
    def validate_foreign_keys(self):
        """Validate foreign key relationships"""
        print("\n=== Foreign Key Validation ===")
        
        if 'WorkoutID' not in self.workouts.columns:
            return
        if 'MovementID' not in self.movements.columns:
            return
        if 'EquipmentID' not in self.equipment.columns:
            return
        
        wk_ids = set(self.workouts['WorkoutID'].astype(str))
        mv_ids = set(self.movements['MovementID'].astype(str))
        eq_ids = set(self.equipment['EquipmentID'].astype(str))
        
        # Check workout-movement map
        orphan_workouts = []
        orphan_movements_in_wm = []
        
        for idx, row in self.wm_map.iterrows():
            wid = str(row.get('WorkoutID', ''))
            mid = str(row.get('MovementID', ''))
            
            if wid and wid not in wk_ids:
                orphan_workouts.append(wid)
            if mid and mid not in mv_ids:
                orphan_movements_in_wm.append(mid)
        
        if orphan_workouts:
            self.errors.append(f"Orphan WorkoutIDs in workout_movement_map: {list(set(orphan_workouts))[:10]}")
        if orphan_movements_in_wm:
            self.errors.append(f"Orphan MovementIDs in workout_movement_map: {list(set(orphan_movements_in_wm))[:10]}")
        
        # Check movement-equipment map
        orphan_movements_in_me = []
        orphan_equipment = []
        
        for idx, row in self.me_map.iterrows():
            mid = str(row.get('MovementID', ''))
            eid = str(row.get('EquipmentID', ''))
            
            if mid and mid not in mv_ids:
                orphan_movements_in_me.append(mid)
            if eid and eid not in eq_ids:
                orphan_equipment.append(eid)
        
        if orphan_movements_in_me:
            self.errors.append(f"Orphan MovementIDs in movement_equipment_map: {list(set(orphan_movements_in_me))[:10]}")
        if orphan_equipment:
            self.errors.append(f"Orphan EquipmentIDs in movement_equipment_map: {list(set(orphan_equipment))[:10]}")
        
        # Check that each workout has at least one movement
        workouts_with_movements = set(self.wm_map['WorkoutID'].astype(str))
        workouts_without_movements = wk_ids - workouts_with_movements
        if workouts_without_movements:
            self.warnings.append(f"Workouts without movements: {list(workouts_without_movements)[:10]}")
        
        print(f"Foreign key validation: {len(self.errors)} errors, {len(self.warnings)} warnings")
    
    def normalize_text(self):
        """Normalize text formatting across all tables"""
        print("\n=== Text Normalization ===")
        fix_count = 0
        
        # Normalize workout names and instructions
        if 'Name' in self.workouts.columns:
            original = self.workouts['Name'].copy()
            self.workouts['Name'] = self.workouts['Name'].str.strip()
            changes = (original != self.workouts['Name']).sum()
            if changes > 0:
                fix_count += changes
                self.fixes.append(f"Normalized whitespace in {changes} workout names")
        
        if 'Instructions' in self.workouts.columns:
            original = self.workouts['Instructions'].copy()
            # Strip whitespace
            self.workouts['Instructions'] = self.workouts['Instructions'].str.strip()
            # Fix multiple spaces
            self.workouts['Instructions'] = self.workouts['Instructions'].str.replace(r'\s+', ' ', regex=True)
            # Standardize sentence endings
            self.workouts['Instructions'] = self.workouts['Instructions'].apply(
                lambda x: x.rstrip('.') + '.' if x and not x.endswith(('.', '!', '?')) else x
            )
            changes = (original != self.workouts['Instructions']).sum()
            if changes > 0:
                fix_count += changes
                self.fixes.append(f"Normalized formatting in {changes} workout instructions")
        
        # Normalize movement names
        if 'Movement' in self.movements.columns:
            original = self.movements['Movement'].copy()
            self.movements['Movement'] = self.movements['Movement'].str.strip()
            # Standardize capitalization for common movements using config
            for lower, proper in MOVEMENT_CAPITALIZATIONS.items():
                mask = self.movements['Movement'].str.lower() == lower
                self.movements.loc[mask, 'Movement'] = proper
            
            changes = (original != self.movements['Movement']).sum()
            if changes > 0:
                fix_count += changes
                self.fixes.append(f"Normalized {changes} movement names")
        
        # Normalize equipment names
        if 'Equipment' in self.equipment.columns:
            original = self.equipment['Equipment'].copy()
            self.equipment['Equipment'] = self.equipment['Equipment'].str.strip()
            changes = (original != self.equipment['Equipment']).sum()
            if changes > 0:
                fix_count += changes
                self.fixes.append(f"Normalized whitespace in {changes} equipment names")
        
        print(f"Text normalization: {fix_count} fixes applied")
    
    def validate_instructions(self):
        """Validate workout instructions quality"""
        print("\n=== Instruction Validation ===")
        
        if 'Instructions' not in self.workouts.columns or 'Name' not in self.workouts.columns:
            return
        
        # Check for empty instructions
        empty_instructions = self.workouts[self.workouts['Instructions'].str.strip() == '']
        if not empty_instructions.empty:
            self.errors.append(f"Workouts with empty instructions: {empty_instructions['Name'].tolist()}")
        
        # Check for very short instructions (likely incomplete)
        short_instructions = self.workouts[
            (self.workouts['Instructions'].str.len() < MIN_INSTRUCTION_LENGTH) & 
            (self.workouts['Instructions'].str.len() > 0)
        ]
        if not short_instructions.empty:
            self.warnings.append(f"Workouts with suspiciously short instructions: {short_instructions['Name'].tolist()[:5]}")
        
        # Check that instructions contain movement-related keywords
        missing_keywords = self.workouts[
            ~self.workouts['Instructions'].str.contains(MOVEMENT_KEYWORDS, case=False, na=False, regex=True) &
            (self.workouts['Instructions'].str.len() > 0)
        ]
        if not missing_keywords.empty:
            self.warnings.append(f"Instructions may lack movement keywords: {missing_keywords['Name'].tolist()[:5]}")
        
        print(f"Instruction validation: {len(self.errors)} errors, {len(self.warnings)} warnings")
    
    def clean_movement_library(self):
        """Clean up movement library by removing parsing artifacts"""
        print("\n=== Movement Library Cleanup ===")
        
        if 'Movement' not in self.movements.columns:
            return
        
        # Identify movements that look like parsing artifacts using shared patterns
        artifacts = []
        
        for idx, row in self.movements.iterrows():
            movement = str(row['Movement']).strip()
            if not movement or movement == '':
                artifacts.append(idx)
                continue
            
            for pattern in ARTIFACT_PATTERNS:
                if re.match(pattern, movement, re.IGNORECASE):
                    artifacts.append(idx)
                    self.warnings.append(f"Movement library contains artifact: '{movement}' (ID: {row.get('MovementID', 'N/A')})")
                    break
        
        if artifacts:
            self.warnings.append(f"Found {len(artifacts)} movement artifacts that should be reviewed")
        
        print(f"Movement library cleanup: {len(artifacts)} artifacts identified")
    
    def validate_difficulty_tiers(self):
        """Validate difficulty tier assignments"""
        print("\n=== Difficulty Tier Validation ===")
        
        if 'DifficultyTier' not in self.workouts.columns:
            self.warnings.append("DifficultyTier column not found in workouts")
            return
        
        valid_tiers = VALID_DIFFICULTY_TIERS
        
        invalid_tiers = self.workouts[
            ~self.workouts['DifficultyTier'].isin(valid_tiers) &
            (self.workouts['DifficultyTier'] != '')
        ]
        
        if not invalid_tiers.empty:
            unique_invalid = invalid_tiers['DifficultyTier'].unique()
            self.warnings.append(f"Workouts with non-standard difficulty tiers: {list(unique_invalid)}")
        
        # Check for missing difficulty tiers
        missing_tiers = self.workouts[self.workouts['DifficultyTier'].str.strip() == '']
        if not missing_tiers.empty:
            self.warnings.append(f"{len(missing_tiers)} workouts missing difficulty tier")
        
        print(f"Difficulty tier validation: {len(self.warnings)} warnings")
    
    def save_cleaned_data(self):
        """Save cleaned and validated data to dist/ directory"""
        print("\n=== Saving Cleaned Data ===")
        
        # Save all cleaned files
        self.workouts.to_csv(os.path.join(OUT_DIR, 'workouts_table.csv'), index=False)
        self.movements.to_csv(os.path.join(OUT_DIR, 'movement_library.csv'), index=False)
        self.equipment.to_csv(os.path.join(OUT_DIR, 'equipment_library.csv'), index=False)
        self.wm_map.to_csv(os.path.join(OUT_DIR, 'workout_movement_map.csv'), index=False)
        self.me_map.to_csv(os.path.join(OUT_DIR, 'movement_equipment_map.csv'), index=False)
        
        # Generate data quality report
        stats = {
            'workouts': len(self.workouts),
            'movements': len(self.movements),
            'equipment': len(self.equipment),
            'workout_movement_mappings': len(self.wm_map),
            'movement_equipment_mappings': len(self.me_map),
        }
        
        with open(os.path.join(OUT_DIR, 'data_stats.json'), 'w') as f:
            json.dump(stats, f, indent=2)
        
        print(f"Saved cleaned data to {OUT_DIR}/")
    
    def generate_report(self):
        """Generate comprehensive validation report"""
        print("\n=== Generating Report ===")
        
        report_path = os.path.join(OUT_DIR, 'validation_report.txt')
        
        with open(report_path, 'w') as f:
            f.write('='*60 + '\n')
            f.write('WOD DATASET VALIDATION REPORT\n')
            f.write('='*60 + '\n\n')
            
            # Summary
            if not self.errors:
                f.write('✓ VALIDATION PASSED\n\n')
            else:
                f.write('✗ VALIDATION FAILED\n\n')
            
            f.write(f'Errors:   {len(self.errors)}\n')
            f.write(f'Warnings: {len(self.warnings)}\n')
            f.write(f'Fixes:    {len(self.fixes)}\n\n')
            
            # Dataset statistics
            f.write('-'*60 + '\n')
            f.write('DATASET STATISTICS\n')
            f.write('-'*60 + '\n')
            if self.workouts is not None:
                f.write(f'Workouts:  {len(self.workouts)}\n')
            if self.movements is not None:
                f.write(f'Movements: {len(self.movements)}\n')
            if self.equipment is not None:
                f.write(f'Equipment: {len(self.equipment)}\n')
            if self.wm_map is not None:
                f.write(f'Workout-Movement mappings: {len(self.wm_map)}\n')
            if self.me_map is not None:
                f.write(f'Movement-Equipment mappings: {len(self.me_map)}\n')
            f.write('\n')
            
            # Errors
            if self.errors:
                f.write('-'*60 + '\n')
                f.write('ERRORS\n')
                f.write('-'*60 + '\n')
                for i, error in enumerate(self.errors, 1):
                    f.write(f'{i}. {error}\n')
                f.write('\n')
            
            # Warnings
            if self.warnings:
                f.write('-'*60 + '\n')
                f.write('WARNINGS\n')
                f.write('-'*60 + '\n')
                for i, warning in enumerate(self.warnings, 1):
                    f.write(f'{i}. {warning}\n')
                f.write('\n')
            
            # Fixes applied
            if self.fixes:
                f.write('-'*60 + '\n')
                f.write('FIXES APPLIED\n')
                f.write('-'*60 + '\n')
                for i, fix in enumerate(self.fixes, 1):
                    f.write(f'{i}. {fix}\n')
                f.write('\n')
            
            f.write('='*60 + '\n')
        
        print(f'Report saved to {report_path}')
        
        # Print summary to console
        print('\n' + '='*60)
        print('VALIDATION SUMMARY')
        print('='*60)
        print(f'Errors:   {len(self.errors)}')
        print(f'Warnings: {len(self.warnings)}')
        print(f'Fixes:    {len(self.fixes)}')
        print('='*60)
        
        return len(self.errors) == 0
    
    def run(self):
        """Run full validation and auto-fix pipeline"""
        print("="*60)
        print("WOD DATASET VALIDATOR")
        print("="*60)
        
        # Load data
        if not self.load_data():
            self.generate_report()
            return False
        
        # Run all validation steps
        self.validate_schema()
        self.check_duplicates()
        self.validate_foreign_keys()
        self.validate_instructions()
        self.clean_movement_library()
        self.validate_difficulty_tiers()
        
        # Apply fixes
        self.normalize_text()
        
        # Save cleaned data
        self.save_cleaned_data()
        
        # Generate report
        success = self.generate_report()
        
        return success


def main():
    """Main entry point"""
    validator = WODValidator()
    success = validator.run()
    
    # Exit with appropriate code
    if success:
        print("\n✓ Validation passed - all checks successful")
        sys.exit(0)
    elif validator.errors:
        print("\n✗ Validation failed - errors must be fixed")
        sys.exit(1)
    else:
        print("\n⚠ Validation passed with warnings - review recommended")
        sys.exit(0)


if __name__ == '__main__':
    main()
