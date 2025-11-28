import json
import re
from copy import deepcopy
from typing import List, Dict, Any
from openai import OpenAI

# ---------------- CONFIG ----------------

INPUT_PATH = "data/reports/workouts_merged.json"
OUTPUT_PATH = "data/reports/workouts_merged_cleaned.json"

# Toggle to avoid API calls during testing
DRY_RUN = False

# Temporary limit for safety while testing (adjust/remove later)
MAX_AI_CALLS = 105

OPENAI_MODEL = "gpt-4.1-mini"

client = OpenAI()  # uses env var OPENAI_API_KEY

# ---------------- HELPERS ----------------

SVG_GARBAGE_RE = re.compile(
    r"171-192-51-51 357-357h576v-72h240v240h-72", re.I
)

def is_placeholder_text(s: str) -> bool:
    if not s:
        return False
    s_lower = s.lower()
    return any(keyword in s_lower for keyword in [
        "web search performed",
        "no description available",
        "unknown — needs manual review",
        "unknown - needs manual review",
        "[ai generated",
        "this workout can be researched"
    ])

def clean_combined_desc_notes(text: str):
    if not text:
        return None, None
    m_desc = re.search(r"(?i)description:\s*", text)
    m_notes = re.search(r"(?i)coach ?notes:\s*", text)
    if not (m_desc and m_notes):
        return None, None
    if m_desc.start() > m_notes.start():
        return None, None
    d = text[m_desc.end():m_notes.start()].strip()
    n = text[m_notes.end():].strip()
    return d, n

def mark_svg_instructions_missing(w):
    instr = w.get("Instructions") or ""
    if SVG_GARBAGE_RE.search(instr):
        w["Instructions"] = None
        w["Instructions_Clean"] = None
        needs = w.get("needsEnrichment") or []
        for f in ["Instructions", "Instructions_Clean"]:
            if f not in needs:
                needs.append(f)
        w["needsEnrichment"] = needs

def normalize_needs_enrichment(w):
    needs = w.get("needsEnrichment")
    if needs is None:
        w["needsEnrichment"] = []
        return
    if not isinstance(needs, list):
        w["needsEnrichment"] = []
        return
    w["needsEnrichment"] = sorted({str(x) for x in needs})

def add_change_record(w, field, old, new):
    if old == new:
        return
    changes = w.setdefault("changes", {})
    record = changes.setdefault(field, {})
    record["from"] = old
    record["to"] = new

def field_has_unknown(value):
    if not isinstance(value, str):
        return False
    low = value.lower().strip()
    return ("unknown" in low and "review" in low) or low == "unknown"

def build_ai_prompt(w, fields_to_fill):
    ctx = {
        "Name": w.get("Name"),
        "Category": w.get("Category"),
        "FormatDuration": w.get("FormatDuration"),
        "ScoreType": w.get("ScoreType"),
        "Instructions": w.get("Instructions"),
        "Instructions_Clean": w.get("Instructions_Clean"),
        "MovementTypes": w.get("MovementTypes"),
        "DifficultyTier": w.get("DifficultyTier"),
    }
    compact = {k: v for k, v in ctx.items() if v}

    system_msg = (
        "You are a senior CrossFit coach. "
        "Fill ONLY the requested fields with concise, coach-friendly text. "
        "Return STRICT JSON only."
    )

    user_msg = (
        "Fill these fields for this workout: "
        + ", ".join(fields_to_fill)
        + ".\n\nWorkout context:\n"
        + json.dumps(compact, ensure_ascii=False)
        + "\n\nReturn JSON with exactly these keys."
    )

    return system_msg, user_msg

def call_openai_for_fields(w, fields):
    system_msg, user_msg = build_ai_prompt(w, fields)
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg}
        ],
        temperature=0.4,
        max_tokens=300,
    )
    data = json.loads(resp.choices[0].message.content)
    return {f: data.get(f) for f in fields}

# ---------------- MAIN ----------------

def main():
    print(">>> fix_workouts.py starting")

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        workouts = json.load(f)

    total = len(workouts)
    print(f"Loaded {total} workouts from {INPUT_PATH}")

    cleaned = []
    ai_targets = []
    ai_calls_made = 0

    for idx, w in enumerate(workouts, start=1):
        w = deepcopy(w)

        normalize_needs_enrichment(w)
        mark_svg_instructions_missing(w)

        desc = w.get("Description")
        notes = w.get("CoachNotes")

        # Fix combined Description:CoachNotes blob
        if isinstance(desc, str) and isinstance(notes, str) and desc.strip() == notes.strip():
            d_part, n_part = clean_combined_desc_notes(desc)
            if d_part and n_part:
                add_change_record(w, "Description", desc, d_part)
                add_change_record(w, "CoachNotes", notes, n_part)
                w["Description"] = d_part
                w["CoachNotes"] = n_part

        fields_needed = set()
        watch_fields = {
            "Description", "CoachNotes",
            "Instructions", "Instructions_Clean",
            "MovementTypes", "DifficultyTier"
        }

        # NeedsEnrichment-based
        for f_name in w.get("needsEnrichment", []):
            if f_name in watch_fields:
                fields_needed.add(f_name)

        # UNKNOWN markers
        if field_has_unknown(w.get("MovementTypes")):
            fields_needed.add("MovementTypes")
        if field_has_unknown(w.get("DifficultyTier")):
            fields_needed.add("DifficultyTier")
        if field_has_unknown(w.get("Instructions_Clean")):
            fields_needed.add("Instructions_Clean")

        # SVG removed instructions
        if w.get("Instructions") is None and "Instructions" in w.get("needsEnrichment", []):
            fields_needed.add("Instructions")
        if w.get("Instructions_Clean") is None and "Instructions_Clean" in w.get("needsEnrichment", []):
            fields_needed.add("Instructions_Clean")

        # Placeholder desc/notes
        if isinstance(desc, str) and is_placeholder_text(desc):
            fields_needed.add("Description")
        if isinstance(notes, str) and is_placeholder_text(notes):
            fields_needed.add("CoachNotes")

        fields_to_fill = sorted(fields_needed)

        # Track all that WOULD hit OpenAI
        if fields_to_fill:
            ai_targets.append({
                "id": w.get("id"),
                "Name": w.get("Name"),
                "fields": fields_to_fill,
            })

        # DRY RUN or no fields
        if DRY_RUN or not fields_to_fill:
            cleaned.append(w)
            continue

        # Limit safety
        if ai_calls_made >= MAX_AI_CALLS:
            cleaned.append(w)
            continue

        ai_calls_made += 1
        print(f"[{ai_calls_made}/{MAX_AI_CALLS}] Calling OpenAI for id={w.get('id')} name={w.get('Name')} fields={fields_to_fill}")

        # --- OpenAI enrichment ---
        try:
            ai_updates = call_openai_for_fields(w, fields_to_fill)
            for f in fields_to_fill:
                new_val = ai_updates.get(f)
                if new_val:
                    old_val = w.get(f)
                    w[f] = new_val
                    add_change_record(w, f, old_val, new_val)

            w["source"] = "ai"
            w["needsEnrichment"] = []
            enriched = set(w.get("enrichedFields") or [])
            enriched.update(fields_to_fill)
            w["enrichedFields"] = sorted(enriched)

        except Exception as e:
            print(f"AI enrichment failed for id={w.get('id')} name={w.get('Name')}: {e}")

        cleaned.append(w)

    # ---- Summary ----
    print(f"\nTotal workouts: {total}")
    print(f"Workouts that WOULD hit OpenAI (no limit): {len(ai_targets)}")
    print(f"Actual OpenAI calls made: {ai_calls_made}")

    if DRY_RUN:
        print("DRY_RUN is True: no output file written.")
        return

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    print(f"Written cleaned file to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
