#!/usr/bin/env python3
"""
Enrichment Agent
================

Reads workouts_needing_enrichment.json, applies archetype templates,
and prepares batches of workouts for AI enrichment (only flagged fields).
Merges AI results back into the workouts.

Usage:
    python scripts/enrichment_agent.py \
        --input data/reports/workouts_needing_enrichment.json \
        --output data/reports/workouts_enriched.json \
        [--force]
"""

import argparse
import json
import logging
import sys
from pathlib import Path

from enrichment_stub import prepare_ai_payload, call_ai_service, merge_enriched_results

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Archetype templates
ARCHETYPE_TEMPLATES = {
    "benchmark": "Classic CrossFit benchmark testing endurance, grit, and pacing. Compare against past scores to measure progress.",
    "amrap": "Push for maximum rounds in limited time. Focus on consistent pacing and efficient transitions.",
    "emom": "Structured intervals where work starts each minute. Prioritize quality reps, recovery, and rhythm under the clock.",
    "strength": "Emphasize progressive overload and form. Track weights and reps to build long-term capacity."
}

BENCHMARK_NAMES = [
    "fran","grace","helen","cindy","karen","diane","elizabeth","isabel","jackie",
    "nancy","annie","eva","kelly","lynne","mary","nicole","barbara","chelsea",
    "amanda","angie","murph","filthy fifty","fight gone bad","dt","randy"
]

def apply_template(workout):
    """Apply archetype template if applicable."""
    category = str(workout.get("Category", "")).lower()
    format_duration = str(workout.get("FormatDuration", "")).lower()
    name = str(workout.get("Name", "")).lower()

    if "benchmark" in category or any(b in name for b in BENCHMARK_NAMES):
        return ARCHETYPE_TEMPLATES["benchmark"]
    if "amrap" in format_duration or "amrap" in category:
        return ARCHETYPE_TEMPLATES["amrap"]
    if "emom" in format_duration or "emom" in category:
        return ARCHETYPE_TEMPLATES["emom"]
    if "strength" in category:
        return ARCHETYPE_TEMPLATES["strength"]

    return None

def enrich_locally(workout):
    """Fill Flavor_Text with template if missing, reduce enrichment needs."""
    template = apply_template(workout)
    if template and "Flavor_Text" in workout.get("needsEnrichment", []):
        workout["Flavor_Text"] = template
        workout["source"] = "template"
        workout["needsEnrichment"].remove("Flavor_Text")
    return workout

def batch_for_ai(workouts, batch_size=20):
    """Prepare batches of workouts still needing enrichment."""
    to_enrich = [w for w in workouts if w.get("needsEnrichment")]
    batches = [to_enrich[i:i+batch_size] for i in range(0, len(to_enrich), batch_size)]
    return batches

def run_agent(input_path: Path, output_path: Path, force: bool):
    workouts = json.load(open(input_path, "r", encoding="utf-8"))
    enriched = []

    # Step 1: Local template enrichment
    for w in workouts:
        w = enrich_locally(w)
        enriched.append(w)

    # Step 2: Batch for AI
    batches = batch_for_ai(enriched)
    logger.info(f"Prepared {len(batches)} batches for AI enrichment")

    # Step 3: AI enrichment + merge
    for i, batch in enumerate(batches, 1):
        payload = prepare_ai_payload(batch, force=force)
        enriched_results = call_ai_service(payload)  # stub or real AI
        updated_batch = merge_enriched_results(batch, enriched_results)

        # Replace in main list
        for w in updated_batch:
            for idx, ew in enumerate(enriched):
                if ew["id"] == w["id"]:
                    enriched[idx] = w

        ids = [w["id"] for w in batch]
        logger.info(f"Batch {i}: {len(batch)} workouts enriched → IDs: {ids}")

    # Step 4: Save enriched workouts
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(enriched, f, indent=2)

    # Step 5: Summary
    template_count = sum(1 for w in enriched if w.get("source") == "template")
    ai_count = sum(1 for w in enriched if w.get("source") == "ai")
    still_missing = sum(1 for w in enriched if w.get("needsEnrichment"))

    logger.info("========================================")
    logger.info("Enrichment Summary")
    logger.info("========================================")
    logger.info(f"Templates applied: {template_count}")
    logger.info(f"AI enriched: {ai_count}")
    logger.info(f"Still missing: {still_missing}")
    logger.info("========================================")

def parse_args():
    parser = argparse.ArgumentParser(description="Enrichment Agent")
    parser.add_argument("--input", "-i", default="data/reports/workouts_needing_enrichment.json",
                        help="Input JSON file of workouts needing enrichment")
    parser.add_argument("--output", "-o", default="data/reports/workouts_enriched.json",
                        help="Output JSON file for enriched workouts")
    parser.add_argument("--force", action="store_true",
                        help="Force re-enrichment of stub placeholders")
    return parser.parse_args()

def main():
    args = parse_args()
    run_agent(Path(args.input), Path(args.output), force=args.force)

if __name__ == "__main__":
    main()
