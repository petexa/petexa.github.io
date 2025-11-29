# Iron & Ale - Workout Data Pipeline

> This document describes how workout data flows from raw sources to the final production JSON used by the website.

## Overview

The workout data pipeline transforms CSV source data into enriched, validated JSON for the Iron & Ale fitness website. The pipeline ensures data quality, consistency, and completeness.

## Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│  SOURCE DATA                                                              │
│  data/workouts_table.csv                                                  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 1: CSV → JSON Conversion (workout_pipeline.py)                      │
│  - Converts lb/lbs to kg                                                  │
│  - Standardizes time formats                                              │
│  - Maps CSV columns to JSON fields                                        │
│  - Enforces schema requirements                                           │
│  Output: data/workouts_table.json, data/latest.json                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Generate Needs Reports (generate_needs_reports.py)               │
│  - Identifies workouts missing descriptions, coach notes, etc.            │
│  - Identifies workouts with external references needing review            │
│  Output: data/reports/workouts_needing_enrichment.json                    │
│          data/reports/workouts_needing_revalidation.json                  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Enrichment (enrichment_agent.py)                                 │
│  - Applies archetype templates (benchmark, AMRAP, EMOM, strength)         │
│  - Optionally calls AI for missing fields                                 │
│  Output: data/reports/workouts_enriched.json                              │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Merge (merge_workouts.py)                                        │
│  - Overlays enriched data onto base dataset                               │
│  Output: data/reports/workouts_merged.json                                │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Fix & Clean (fix_workouts.py)                                    │
│  - Removes SVG garbage from instructions                                  │
│  - Fills placeholders via AI                                              │
│  - Normalizes needsEnrichment arrays                                      │
│  Output: data/reports/workouts_merged_cleaned.json                        │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Quality Pass (final_cleanup.py)                                  │
│  - Cleans markdown formatting                                             │
│  - Clears needsRevalidation flags when content looks good                 │
│  Output: data/reports/workouts_merged_quality.json                        │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Flavor Text Enhancement (update_flavor_text.py)                  │
│  - Replaces generic flavor text with category-specific templates          │
│  - Uses deterministic selection based on workout ID                       │
│  Output: data/reports/workouts_flavor_enhanced.json                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  STEP 8: Targeted Patches (targeted_patches.py)                           │
│  - Applies manual overrides for specific benchmark/hero workouts          │
│  - Final quality gate                                                     │
│  Output: data/reports/workouts_final.json  ← CANONICAL PRODUCTION FILE    │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                                 │
│  assets/js/workouts.js fetches: data/workouts_table.json                  │
│  ⚠️ Currently points to workouts_table.json instead of final              │
└──────────────────────────────────────────────────────────────────────────┘
```

## Canonical Files

| File | Purpose | Status |
|------|---------|--------|
| `data/workouts_table.csv` | Source of truth (raw data) | Active |
| `data/workouts_table.json` | Initial JSON conversion | Intermediate |
| `data/latest.json` | Copy of initial conversion | Intermediate |
| `data/reports/workouts_final.json` | **PRODUCTION FILE** (most enriched) | **Active** |
| `events/events.json` | Events data for events page | Active |

## Running the Pipeline

### Prerequisites

```bash
# Install Python dependencies
pip install pandas requests beautifulsoup4 tqdm openai

# Set API key for AI enrichment (optional)
export OPENAI_API_KEY="sk-..."
```

### Full Pipeline Run

```bash
# Step 1: Convert CSV to JSON (main entrypoint)
python scripts/workout_pipeline.py --input data/workouts_table.csv

# Step 2: Generate needs reports
python scripts/generate_needs_reports.py --input data/latest.json --output-dir data/reports

# Step 3: Run enrichment (optional - requires API key)
python scripts/enrichment_agent.py --input data/reports/workouts_needing_enrichment.json --output data/reports/workouts_enriched.json

# Step 4: Merge enriched results
python scripts/merge_workouts.py

# Step 5: Fix and clean
python scripts/fix_workouts.py

# Step 6: Quality pass
python scripts/final_cleanup.py

# Step 7: Enhance flavor text
python scripts/update_flavor_text.py

# Step 8: Apply targeted patches (produces final output)
python scripts/targeted_patches.py
```

### Quick Pipeline (No AI)

If you only need to update the data without AI enrichment:

```bash
python scripts/workout_pipeline.py --input data/workouts_table.csv
```

This produces `data/workouts_table.json` and `data/latest.json`.

## Script Status

| Script | Status | Purpose |
|--------|--------|---------|
| `workout_pipeline.py` | **Active** | Main CSV → JSON converter |
| `clean_workouts.py` | **Active** | CSV cleaner with AI (GitHub Actions) |
| `generate_needs_reports.py` | **Active** | Identifies enrichment needs |
| `enrichment_agent.py` | **Active** | Orchestrates AI enrichment |
| `enrichment_stub.py` | **Active** | AI service integration |
| `merge_workouts.py` | **Active** | Merges enriched data |
| `fix_workouts.py` | **Active** | Fixes broken/placeholder data |
| `final_cleanup.py` | **Active** | Quality formatting cleanup |
| `update_flavor_text.py` | **Active** | Enhances generic flavor text |
| `targeted_patches.py` | **Active** | Final manual overrides |
| `ai_workout_generator.py` | **Active** | Standalone workout generator |
| `config.json` | **Active** | Pipeline configuration |

## Data Quality Requirements

The final production JSON (`workouts_final.json`) must satisfy:

### No Placeholders
- No `"UNKNOWN — needs manual review"`
- No `"unknown — needs manual review"`
- No `[AI generated`
- No `"web search performed"`
- No `"no description available"`
- No `"placeholder"`

### No Empty Critical Fields
Required fields that must have values:
- `Name`, `Category`, `FormatDuration`, `ScoreType`
- `Description`, `CoachNotes`, `Flavor_Text`
- `Instructions` or `Instructions_Clean`
- `MovementTypes`, `DifficultyTier`

### Clean Enrichment Flags
- `needsEnrichment` should be empty `[]` or absent
- `needsRevalidation` should be `false` or absent

## Events Data

Events are stored in `events/events.json` and loaded by `assets/js/events.js`.

Individual event files are also stored in `events/` as separate JSON files for reference.

## GitHub Actions

- **clean_workouts.yml**: Runs `clean_workouts.py` on CSV changes
- **run-clean_workouts.yml**: Manual workflow trigger
- **wod-validation.yml**: Validates workout data integrity

## Troubleshooting

### Missing OPENAI_API_KEY
The pipeline can run without AI. It will use local templates only.

### File Not Found Errors
Check that all intermediate files exist. Run the pipeline steps in order.

### Data Quality Issues
Run the full pipeline through `targeted_patches.py` to produce clean output.
