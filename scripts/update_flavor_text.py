import json
import os
from copy import deepcopy
from typing import Dict, Any, List

INPUT_PATH = os.path.join("data", "reports", "workouts_merged_quality.json")
OUTPUT_PATH = os.path.join("data", "reports", "workouts_flavor_enhanced.json")

DRY_RUN = False  # set to False once you're happy

# --------- FLAVOR TEMPLATE BANK ---------

FLAVOR_BANK: Dict[str, List[str]] = {
    "interval_power": [
        "{name} – Short, punchy intervals that reward tight pacing and crisp transitions.",
        "{name} – Stay sharp each round; smooth reps and quick resets beat hero bursts.",
        "{name} – Control the early minutes and let clean movement carry you late.",
        "{name} – Manageable work, small windows; don’t waste time between stations.",
        "{name} – Interval-style intensity that tests composure under mounting fatigue.",
    ],
    "amrap_mixed": [
        "{name} – A grinder; steady round times beat one big opening sprint.",
        "{name} – Chip away each round with smooth transitions and smart breaks.",
        "{name} – Treat it like a long fight: relaxed breathing, tidy movement, no panic.",
        "{name} – Volume adds up fast, so break early and stay moving.",
        "{name} – Pure mixed-modal engine work; consistency across rounds is the real score.",
    ],
    "long_engine": [
        "{name} – An engine test; settle into a pace you can actually hold.",
        "{name} – Simple on paper, brutal if you disrespect the distance.",
        "{name} – Build aerobic grit with honest pacing and controlled breathing.",
        "{name} – Let patience do the work; speed only matters once you’re halfway in.",
        "{name} – Long, steady output; aim for a rhythm you could explain, not survive.",
    ],
    "mixed_for_time": [
        "{name} – Classic for-time intensity: aggressive but controlled from the first rep.",
        "{name} – A straightforward suffer-fest; clean mechanics matter more than hero splits.",
        "{name} – Big sets, big fatigue; smart breaking keeps you moving when it hurts.",
        "{name} – Benchmark-style grit: push the clock without letting form fall apart.",
        "{name} – A full-body punch that rewards tidy technique and calm transitions.",
    ],
    "bodyweight_travel": [
        "{name} – Minimal kit, maximum effort; proof you don’t need a full gym to hurt.",
        "{name} – Travel-friendly but far from easy; move well and keep the tempo high.",
        "{name} – Simple bodyweight work that turns anywhere into a training floor.",
        "{name} – Packs plenty of sting into a light, portable package.",
        "{name} – Clean, repeatable bodyweight work you can do in any environment.",
    ],
    "strength_barbell": [
        "{name} – Heavy and honest; respect the bar and stay tidy under load.",
        "{name} – Strength-focused work that rewards patience, bracing, and clean positions.",
        "{name} – A chance to practice heavy lifts under fatigue without getting sloppy.",
        "{name} – Barbell-centric grind; control the setup, own every rep.",
        "{name} – Strength first, ego second; smooth bar paths beat ugly PR attempts.",
    ],
    "skill_gymnastics": [
        "{name} – A skill-forward piece; keep mechanics clean and ego low.",
        "{name} – Great for gymnastic confidence; crisp positions beat big rep counts.",
        "{name} – Focused skill work that turns good positions into great habits.",
        "{name} – Technical but scalable; everyone can practice cleaner movement here.",
        "{name} – Less about winning the clock, more about earning better skills.",
    ],
    "partner_team": [
        "{name} – Shared suffering; clean handovers and honest effort keep the team moving.",
        "{name} – Communication, trust, and tempo matter more than any single split.",
        "{name} – Perfect for sharpening teamwork under controlled chaos.",
        "{name} – Trade work, trade lungs; push hard while your partner watches.",
        "{name} – A team test where pacing and attitude are just as important as fitness.",
    ],
    "benchmark_hero": [
        "{name} – A classic test of grit; pace with respect and move with intent.",
        "{name} – Heavy on history and effort; bring focus, not just bravado.",
        "{name} – A staple benchmark; use it to measure honest progress over time.",
        "{name} – A demanding piece that rewards steady pacing and uncompromising standards.",
        "{name} – Show up, move well, and let the workout speak for itself.",
    ],
    "general_default": [
        "{name} – A well-rounded test of fitness that punishes sloppiness, not just slowness.",
        "{name} – Simple structure, plenty of sting; effort and discipline set the tone.",
        "{name} – A solid piece for building capacity without overcomplicating the session.",
        "{name} – Clean movement and sensible pacing will carry you further than heroics.",
        "{name} – Versatile enough for many levels, tough enough to stay interesting.",
    ],
}

GENERIC_FLAVOR_PHRASES = [
    "Brutal but fair; pace wisely and prioritize technique.",
    "Expect sharp efforts and quick transitions; small mistakes add up.",
    "An effective CrossFit workout.",
    "challenge that demands focus and grit.",
    "A interval power / strength-endurance challenge that demands focus and grit.",
    "A for time – high intensity pacing challenge that demands focus and grit.",
]


def is_generic_flavor(text: str) -> bool:
    if not isinstance(text, str):
        return True  # treat missing as generic
    stripped = text.strip()
    if not stripped:
        return True
    low = stripped.lower()
    for phrase in GENERIC_FLAVOR_PHRASES:
        if phrase.lower() in low:
            return True
    return False


def choose_bucket(w: Dict[str, Any]) -> str:
    stim = (w.get("Stimulus") or "").lower()
    fmt = (w.get("FormatDuration") or "").lower()
    cat = (w.get("Category") or "").lower()
    mov = (w.get("MovementTypes") or "").lower()
    flavor = (w.get("Flavor_Text") or "").lower()
    name = (w.get("Name") or "")

    # partner/team first
    if "partner" in cat or "team" in cat:
        return "partner_team"

    # interval / EMOM
    if "interval" in stim or "emom" in fmt or "every minute" in fmt:
        return "interval_power"

    # AMRAP
    if "amrap" in fmt or "amrap" in stim:
        if "monostructural" in cat or "cardio" in cat or "monostructural" in stim:
            return "long_engine"
        else:
            return "amrap_mixed"

    # For Time
    if "for time" in fmt or "for time" in stim:
        if "monostructural" in cat or "cardio" in cat:
            return "long_engine"
        else:
            return "mixed_for_time"

    # bodyweight/travel
    if "bodyweight" in cat or "travel" in cat:
        return "bodyweight_travel"

    # strength / barbell bias
    if "weightlifting" in mov or "strength" in cat:
        return "strength_barbell"

    # skill / gymnastics
    if "gymnastics" in mov or "skill" in stim:
        return "skill_gymnastics"

    # benchmarks that currently have the very generic line
    if "an effective crossfit workout" in flavor and name:
        return "benchmark_hero"

    # fallback
    return "general_default"


def render_flavor(bucket: str, w: Dict[str, Any]) -> str:
    templates = FLAVOR_BANK.get(bucket) or FLAVOR_BANK["general_default"]
    key = w.get("id") or w.get("Name") or "0"
    idx = sum(ord(c) for c in str(key)) % len(templates)
    tmpl = templates[idx]
    name = w.get("Name") or "This workout"
    return tmpl.format(name=name, workout=name or "this workout")


def process_workout(w: Dict[str, Any]) -> Dict[str, Any]:
    w = deepcopy(w)
    flavor = w.get("Flavor_Text")

    if not is_generic_flavor(flavor):
        # keep custom flavour text as-is
        return w, False

    bucket = choose_bucket(w)
    new_flavor = render_flavor(bucket, w)
    if new_flavor == flavor:
        return w, False

    changes = w.get("changes") or {}
    changes["Flavor_Text"] = {
        "from": flavor,
        "to": new_flavor,
    }
    w["changes"] = changes
    w["Flavor_Text"] = new_flavor
    return w, True


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
        new_w, changed = process_workout(w)
        cleaned.append(new_w)
        if changed:
            modified += 1
            if len(examples) < 20:
                examples.append(
                    {"id": new_w.get("id"), "Name": new_w.get("Name")}
                )

    print(f"Workouts with updated Flavor_Text: {modified}")
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

    print(f"Wrote updated workouts with flavour text to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
