import json
import os
import re
from copy import deepcopy
from typing import Dict, Any, List

# ------------- CONFIG -------------

INPUT_PATH = os.path.join("data", "reports", "workouts_merged_cleaned.json")
OUTPUT_PATH = os.path.join("data", "reports", "workouts_merged_quality.json")

# Set True to preview changes without writing out the file
DRY_RUN = False

# Fields to clean for markdown/whitespace
TEXT_FIELDS_TO_CLEAN: List[str] = [
    "Description",
    "CoachNotes",
    "Flavor_Text",
    "ScalingOptions",
    "Coaching_Cues",
    "Instructions",
    "Instructions_Clean",
]

# ------------- HELPERS -------------

DESCRIPTION_LABEL_RE = re.compile(
    r"^\s*(\*\*Description:\*\*|Description:)\s*\\?n?\s*",
    re.IGNORECASE,
)
COACH_LABEL_RE = re.compile(
    r"^\s*(\*\*Coach ?Notes:\*\*|Coach ?Notes:)\s*\\?n?\s*",
    re.IGNORECASE,
)


def is_placeholder_text(s: str) -> bool:
    """Detect leftover AI/placeholder markers that mean we shouldn't clear needsRevalidation."""
    if not isinstance(s, str):
        return False
    s_lower = s.lower()
    return any(
        key in s_lower
        for key in [
            "web search performed",
            "no description available",
            "unknown — needs manual review",
            "unknown - needs manual review",
            "needs manual review",
            "[ai generated",
            "placeholder",
        ]
    )


def clean_markdown_wrapping(text: str, field_name: str) -> str:
    """
    Clean common markdown / formatting junk:
    - Strip global ** / __ wrapping
    - Remove Description: / CoachNotes: labels at the start
    - Strip a leading '- ' bullet if it's the only one on first line
    - Collapse excessive blank lines
    """
    if not isinstance(text, str):
        return text

    original = text

    # Basic strip
    t = text.strip()

    # Remove outermost ** or __ if the entire string is wrapped
    if t.startswith("**") and t.endswith("**") and len(t) > 4:
        t = t[2:-2].strip()
    if t.startswith("__") and t.endswith("__") and len(t) > 4:
        t = t[2:-2].strip()

    # Strip Description: / CoachNotes: headers at the very start
    if field_name == "Description":
        t = DESCRIPTION_LABEL_RE.sub("", t, count=1)
    elif field_name == "CoachNotes":
        t = COACH_LABEL_RE.sub("", t, count=1)

    # Remove stray leading "- " on first line (common from bullet output)
    lines = t.splitlines()
    if lines:
        first = lines[0].lstrip()
        if first.startswith("- "):
            lines[0] = first[2:].lstrip()
        t = "\n".join(lines)

    # Collapse excessive blank lines (>=2 blank lines → 1)
    t = re.sub(r"\n\s*\n\s*\n+", "\n\n", t)

    # Final strip
    t = t.strip()

    return t


def workout_has_placeholders(w: Dict[str, Any]) -> bool:
    """Check if any key text fields still look placeholder-ish."""
    for field in TEXT_FIELDS_TO_CLEAN:
        val = w.get(field)
        if isinstance(val, str) and is_placeholder_text(val):
            return True

    needs = w.get("needsEnrichment")
    if isinstance(needs, list) and needs:
        return True

    return False


def process_workout(w: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply formatting cleanup and optionally flip needsRevalidation
    when everything looks good.
    """
    w = deepcopy(w)
    changes: Dict[str, Any] = {}

    # 1) Clean markdown/whitespace on key text fields
    for field in TEXT_FIELDS_TO_CLEAN:
        val = w.get(field)
        if isinstance(val, str):
            cleaned_val = clean_markdown_wrapping(val, field)
            if cleaned_val != val:
                w[field] = cleaned_val
                changes.setdefault(field, {})["from"] = val
                changes[field]["to"] = cleaned_val

    # 2) If there are no placeholders and no outstanding enrichment flags,
    #    we can safely clear needsRevalidation.
    if not workout_has_placeholders(w):
        if w.get("needsRevalidation") is True:
            old_val = w.get("needsRevalidation")
            w["needsRevalidation"] = False
            changes.setdefault("needsRevalidation", {})["from"] = old_val
            changes["needsRevalidation"]["to"] = False

    # Merge field-level changes into the workout's changes map
    if changes:
        existing = w.get("changes") or {}
        for field, change in changes.items():
            existing[field] = change
        w["changes"] = existing

    return w, bool(changes)


# ------------- MAIN -------------

def main():
    if not os.path.exists(INPUT_PATH):
        raise FileNotFoundError(f"Input file not found: {INPUT_PATH}")

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        workouts = json.load(f)

    total = len(workouts)
    print(f"Loaded {total} workouts from {INPUT_PATH}")

    cleaned = []
    modified_count = 0
    examples = []

    for w in workouts:
        new_w, changed = process_workout(w)
        cleaned.append(new_w)
        if changed:
            modified_count += 1
            if len(examples) < 20:
                examples.append(
                    {"id": new_w.get("id"), "Name": new_w.get("Name")}
                )

    print(f"Workouts modified: {modified_count}")
    if examples:
        print("Examples of modified workouts:")
        for ex in examples:
            print(f" - id={ex.get('id')}, name={ex.get('Name')}")

    if DRY_RUN:
        print("DRY_RUN is True: no output file written.")
        return

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    print(f"Wrote quality-cleaned file to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
