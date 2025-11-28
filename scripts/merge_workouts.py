#!/usr/bin/env python3
"""
Merge Workouts
==============
Takes a base dataset (all workouts) and overlays enriched results.
Ensures you end up with one unified JSON containing all workouts.
"""

import json
from pathlib import Path

BASE_PATH = Path("data/reports/workouts_needing_enrichment.json")   # 600 workouts
ENRICHED_PATH = Path("data/reports/workouts_enriched.json")         # 140 enriched
OUTPUT_PATH = Path("data/reports/workouts_merged.json")             # unified file

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def merge_workouts(base, enriched):
    enriched_map = {w["id"]: w for w in enriched}
    merged = []
    for w in base:
        if w["id"] in enriched_map:
            merged.append(enriched_map[w["id"]])  # overlay enriched version
        else:
            merged.append(w)  # keep original
    return merged

def main():
    base = load_json(BASE_PATH)
    enriched = load_json(ENRICHED_PATH)
    merged = merge_workouts(base, enriched)

    print(f"Base workouts: {len(base)}")
    print(f"Enriched workouts: {len(enriched)}")
    print(f"Merged workouts: {len(merged)}")

    save_json(OUTPUT_PATH, merged)
    print(f"Unified dataset written to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
