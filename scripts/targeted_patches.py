"""
Targeted Patches + Final Quality Gate
======================================

This script is the final step in the workout data pipeline:
1. Applies targeted manual overrides for specific benchmark/hero workouts
2. Enforces data quality constraints (removes placeholders, cleans flags)
3. Produces the canonical production file: workouts_final.json

Usage:
    python scripts/targeted_patches.py
    python scripts/targeted_patches.py --dry-run
"""

import json
import os
import re
from copy import deepcopy
from typing import Dict, Any, List, Tuple

# -------- CONFIG --------

INPUT_PATH = os.path.join("data", "reports", "workouts_flavor_enhanced.json")
OUTPUT_PATH = os.path.join("data", "reports", "workouts_final.json")

DRY_RUN = False  # set to False once you're happy

# Placeholder patterns that indicate incomplete data
PLACEHOLDER_PATTERNS = [
    r"unknown\s*[—–-]\s*needs\s*manual\s*review",
    r"no description available",
    r"web search performed",
    r"\[ai generated",
    r"placeholder",
    r"tbd\b",
]

# Critical fields that should not be empty in final output
CRITICAL_FIELDS = [
    "Name", "Category", "FormatDuration", "ScoreType"
]

# Fields where empty string should be converted to None
OPTIONAL_TEXT_FIELDS = [
    "Description", "CoachNotes", "Flavor_Text",
    "Instructions", "Instructions_Clean",
    "MovementTypes", "DifficultyTier", "ScalingOptions",
    "Warmup", "Coaching_Cues", "Stimulus", "TargetStimulus"
]


# -------- TARGETED OVERRIDES --------
# Keyed by workout Name. You can change / extend this.
# Fields you specify here will overwrite the current values.

TARGET_OVERRIDES: Dict[str, Dict[str, Any]] = {
    # Example hero / benchmark WODs

    "JT": {
        "MovementTypes": "Gymnastics, Bodyweight",
        "DifficultyTier": "Advanced",
        "Instructions_Clean": (
            "For time, complete 21-15-9 reps of handstand push-ups, ring dips, "
            "and push-ups. Finish all handstand push-ups of a round before moving "
            "to ring dips, then all ring dips before moving to push-ups."
        ),
        "ScalingOptions": (
            "Scale handstand push-ups to pike handstand push-ups or dumbbell "
            "strict press. Scale ring dips to banded ring dips or box dips. "
            "Scale push-ups to knee push-ups or elevated push-ups. Reduce the "
            "rep scheme to 15-12-9 or 12-9-6 for newer athletes."
        ),
        "CoachNotes": (
            "This is a pure upper-body gymnastics smash. Break sets early to "
            "avoid complete muscular failure, especially on the handstand "
            "push-ups and ring dips. Keep transitions tight and move with purpose "
            "through the push-ups rather than sprinting the first round and "
            "stalling later."
        ),
    },

    "Isabel": {
        "MovementTypes": "Weightlifting",
        "DifficultyTier": "Intermediate",
        "Instructions_Clean": (
            "For time, complete 30 snatches at the prescribed load. Athletes may "
            "power snatch or squat snatch. Choose a weight that allows quick singles "
            "or small sets while maintaining safe technique."
        ),
        "ScalingOptions": (
            "Reduce the load so you can perform technically sound singles or small "
            "sets throughout. Newer athletes can use hang power snatches or light "
            "power snatches and reduce to 20 reps if needed."
        ),
        "CoachNotes": (
            "Treat this as a fast barbell sprint, not a max-effort strength test. "
            "Quick singles with consistent setup are often better than big touch-and-go "
            "sets that fall apart. Keep the bar close, brace before each pull, and "
            "avoid chasing the clock at the expense of form."
        ),
    },

    "Angie": {
        "MovementTypes": "Gymnastics, Bodyweight",
        "DifficultyTier": "Intermediate",
        "Instructions_Clean": (
            "For time, complete 100 pull-ups, 100 push-ups, 100 sit-ups, and "
            "100 air squats. Finish all reps of one movement before moving on "
            "to the next."
        ),
        "ScalingOptions": (
            "Reduce volume to 50 or 75 reps per movement for newer athletes. "
            "Scale pull-ups to banded pull-ups or ring rows, and push-ups to "
            "knee or elevated push-ups. Keep movement quality high as fatigue builds."
        ),
        "CoachNotes": (
            "This is high-volume gymnastics. Break sets early and often to avoid "
            "hitting a wall, especially on pull-ups and push-ups. Keep transitions "
            "short and maintain a breathing rhythm on sit-ups and squats to stay moving."
        ),
    },

    "Michael": {
        "MovementTypes": "Monostructural, Bodyweight",
        "DifficultyTier": "Intermediate",
        "Instructions_Clean": (
            "Three rounds for time of an 800-meter run, 50 back extensions, and "
            "50 sit-ups. Complete all reps of each movement before progressing."
        ),
        "ScalingOptions": (
            "Shorten the run to 400–600 meters and reduce reps to 30–40 per movement "
            "for beginners. Back extensions can be scaled to supermans or good mornings "
            "with light load if a GHD is not available."
        ),
        "CoachNotes": (
            "Set a sustainable pace from the first run and avoid sprinting early. "
            "Keep back extension range controlled and avoid aggressive hyperextension. "
            "Use the sit-ups to breathe and keep transitions tight between stations."
        ),
    },

    "Kelly": {
        "MovementTypes": "Monostructural, Weightlifting, Gymnastics",
        "DifficultyTier": "Intermediate",
        "Instructions_Clean": (
            "Five rounds for time of a 400-meter run, 30 box jumps, and "
            "30 wall-ball shots. Complete all reps of each movement before moving on."
        ),
        "ScalingOptions": (
            "Reduce to 3–4 rounds or lower the reps to 20 per movement. "
            "Shorten the run to 200–300 meters, use a lower box, and choose a lighter "
            "wall ball to maintain smooth, repeatable reps."
        ),
        "CoachNotes": (
            "This is a longer grind. Find a sustainable run pace and keep box jumps "
            "and wall balls in small, controlled sets. Focus on safe landings, full hip "
            "extension, and consistent ball height rather than rushing the early rounds."
        ),
    },

    # Example custom workout – adjust to taste
    "Bragg": {
        "MovementTypes": "Weightlifting, Gymnastics, Monostructural",
        "DifficultyTier": "Intermediate",
        "ScalingOptions": (
            "Adjust loading so you can maintain clean reps under fatigue. "
            "Scale complex gymnastics to simpler pulling or pushing variations as needed, "
            "and reduce total rounds or reps for newer athletes."
        ),
        "CoachNotes": (
            "Aim for consistent round times and tidy transitions between movements. "
            "Break sets before your form degrades and manage your breathing on any "
            "running or machine work built into the piece."
        ),
    },
}


# -------- CORE LOGIC --------

def is_placeholder(value: str) -> bool:
    """Check if a string contains placeholder text."""
    if not isinstance(value, str):
        return False
    value_lower = value.lower().strip()
    for pattern in PLACEHOLDER_PATTERNS:
        if re.search(pattern, value_lower, re.IGNORECASE):
            return True
    return False


def clean_text_field(value: Any) -> Any:
    """Clean a text field - remove placeholders and normalize empty strings."""
    if not isinstance(value, str):
        return value
    
    # Strip whitespace
    cleaned = value.strip()
    
    # Check for placeholder content
    if is_placeholder(cleaned):
        return None
    
    # Return None for empty strings
    if not cleaned:
        return None
    
    return cleaned


def apply_quality_gate(w: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Apply final quality constraints to a workout.
    Returns (cleaned workout, list of issues found).
    """
    w = deepcopy(w)
    issues = []
    
    # 1. Clean optional text fields (remove placeholders, normalize empty)
    for field in OPTIONAL_TEXT_FIELDS:
        if field in w:
            old_val = w[field]
            new_val = clean_text_field(old_val)
            if new_val != old_val:
                w[field] = new_val
                if old_val and is_placeholder(str(old_val)):
                    issues.append(f"Removed placeholder from {field}")
    
    # 2. Clear enrichment flags for production
    if w.get("needsEnrichment"):
        if isinstance(w["needsEnrichment"], list) and len(w["needsEnrichment"]) > 0:
            issues.append(f"Cleared needsEnrichment: {w['needsEnrichment']}")
        w["needsEnrichment"] = []
    
    if w.get("needsRevalidation") is True:
        issues.append("Cleared needsRevalidation flag")
        w["needsRevalidation"] = False
    
    # 3. Remove internal tracking fields from production output
    internal_fields = ["changes", "enrichedFields", "source", "validationErrors"]
    for field in internal_fields:
        if field in w:
            del w[field]
    
    # 4. Ensure critical fields have values
    for field in CRITICAL_FIELDS:
        if not w.get(field):
            issues.append(f"Missing critical field: {field}")
    
    return w, issues


def apply_overrides(w: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
    """Apply TARGET_OVERRIDES for this workout (by Name) if present."""
    name = w.get("Name")
    if not name or name not in TARGET_OVERRIDES:
        return w, False

    overrides = TARGET_OVERRIDES[name]
    w = deepcopy(w)
    changes = w.get("changes") or {}
    changed = False

    for field, new_val in overrides.items():
        old_val = w.get(field)
        if old_val != new_val:
            w[field] = new_val
            changes[field] = {"from": old_val, "to": new_val}
            changed = True

    if changed:
        w["changes"] = changes

    return w, changed


def main():
    if not os.path.exists(INPUT_PATH):
        raise FileNotFoundError(f"Input file not found: {INPUT_PATH}")

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        workouts = json.load(f)

    total = len(workouts)
    print(f"Loaded {total} workouts from {INPUT_PATH}")

    cleaned = []
    overrides_applied = 0
    quality_issues_count = 0
    override_examples = []
    quality_examples = []

    for w in workouts:
        # Step 1: Apply targeted overrides
        new_w, override_changed = apply_overrides(w)
        if override_changed:
            overrides_applied += 1
            if len(override_examples) < 10:
                override_examples.append({"id": new_w.get("id"), "Name": new_w.get("Name")})
        
        # Step 2: Apply quality gate (final cleanup)
        final_w, quality_issues = apply_quality_gate(new_w)
        if quality_issues:
            quality_issues_count += 1
            if len(quality_examples) < 10:
                quality_examples.append({
                    "id": final_w.get("id"),
                    "Name": final_w.get("Name"),
                    "issues": quality_issues
                })
        
        cleaned.append(final_w)

    print(f"\n=== Pipeline Summary ===")
    print(f"Total workouts processed: {total}")
    print(f"Targeted overrides applied: {overrides_applied}")
    print(f"Workouts with quality issues cleaned: {quality_issues_count}")
    
    if override_examples:
        print("\nOverride examples:")
        for ex in override_examples:
            print(f"  - id={ex['id']}, name={ex['Name']}")
    
    if quality_examples:
        print("\nQuality cleanup examples:")
        for ex in quality_examples[:5]:
            print(f"  - id={ex['id']}, name={ex['Name']}: {', '.join(ex['issues'][:3])}")

    if DRY_RUN:
        print("\nDRY_RUN is True: no output file written.")
        return

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Wrote final workouts file to: {OUTPUT_PATH}")
    print(f"   This is the canonical production file for the frontend.")


if __name__ == "__main__":
    main()
