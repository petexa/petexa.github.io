import json
import os
from copy import deepcopy
from typing import Dict, Any

# -------- CONFIG --------

INPUT_PATH = os.path.join("data", "reports", "workouts_flavor_enhanced.json")
OUTPUT_PATH = os.path.join("data", "reports", "workouts_final.json")

DRY_RUN = False  # set to False once you're happy


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

def apply_overrides(w: Dict[str, Any]) -> (Dict[str, Any], bool):
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
    modified = 0
    examples = []

    for w in workouts:
        new_w, changed = apply_overrides(w)
        cleaned.append(new_w)
        if changed:
            modified += 1
            if len(examples) < 20:
                examples.append({"id": new_w.get("id"), "Name": new_w.get("Name")})

    print(f"Workouts modified by targeted patches: {modified}")
    if examples:
        print("Examples:")
        for ex in examples:
            print(f" - id={ex['id']}, name={ex['Name']}")

    if DRY_RUN:
        print("DRY_RUN is True: no output file written.")
        return

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    print(f"Wrote final workouts file to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
