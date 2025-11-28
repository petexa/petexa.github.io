#!/usr/bin/env python3
"""
Generate Needs Reports
======================

Reads the latest workouts JSON and produces two filtered files:
- workouts_needing_enrichment.json
- workouts_needing_revalidation.json

Usage:
    python scripts/generate_needs_reports.py --input data/latest.json --output-dir data/reports
"""

import argparse
import json
import logging
import sys
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def load_json(filepath: Path):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(data, filepath: Path):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    logger.info(f"Saved {len(data)} records → {filepath}")

def generate_reports(input_path: Path, output_dir: Path):
    workouts = load_json(input_path)

    # Filter by enrichment needs
    needing_enrichment = [
        w for w in workouts
        if isinstance(w.get("needsEnrichment"), list) and len(w["needsEnrichment"]) > 0
    ]

    # Filter by revalidation flag
    needing_revalidation = [
        w for w in workouts
        if bool(w.get("needsRevalidation"))
    ]

    # Save outputs
    save_json(needing_enrichment, output_dir / "workouts_needing_enrichment.json")
    save_json(needing_revalidation, output_dir / "workouts_needing_revalidation.json")

    # Summary
    logger.info("========================================")
    logger.info("Needs Report Summary")
    logger.info("========================================")
    logger.info(f"Total Workouts: {len(workouts)}")
    logger.info(f"Needs Enrichment: {len(needing_enrichment)}")
    logger.info(f"Needs Revalidation: {len(needing_revalidation)}")
    logger.info("========================================")

def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate enrichment and revalidation reports from workouts JSON"
    )
    parser.add_argument(
        "--input", "-i",
        default="data/latest.json",
        help="Path to latest workouts JSON (default: data/latest.json)"
    )
    parser.add_argument(
        "--output-dir", "-o",
        default="data/reports",
        help="Directory to save reports (default: data/reports)"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    input_path = Path(args.input)
    output_dir = Path(args.output_dir)

    if not input_path.exists():
        logger.error(f"Input file not found: {input_path}")
        sys.exit(1)

    generate_reports(input_path, output_dir)

if __name__ == "__main__":
    main()
