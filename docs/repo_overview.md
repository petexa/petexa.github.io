# Iron & Ale Repository Overview

> **Complete technical documentation for the petexa/petexa.github.io repository**  
> Last updated: 2025-11-29

This document provides a comprehensive overview of the Iron & Ale fitness community website repository. It is designed to enable any external assistant (e.g., ChatGPT) to fully understand the project structure, data flows, and operational details.

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Workout Data Pipeline (Python)](#3-workout-data-pipeline-python)
4. [JSON Data Files](#4-json-data-files)
5. [Events System Overview](#5-events-system-overview)
6. [Known Issues, Warnings, and Dead Files](#6-known-issues-warnings-and-dead-files)
7. [Final JSON Output Definition](#7-final-json-output-definition)
8. [Recommendations](#8-recommendations)

---

## 1. Repository Structure

### Top-Level Directories

| Directory | Purpose |
|-----------|---------|
| `/assets/` | Static assets including CSS and JavaScript |
| `/assets/css/` | Tailwind-style utility CSS framework |
| `/assets/js/` | Core JavaScript files for workouts, events, themes |
| `/utilities/` | Standalone fitness tools (calculators, timers, trackers) |
| `/scripts/` | Python data processing pipeline scripts |
| `/data/` | Workout data files (CSV source, JSON outputs) |
| `/data/reports/` | Intermediate and final processed workout JSON files |
| `/events/` | Event JSON files and n8n workflow definitions |
| `/style-guide/` | UI component documentation and examples |
| `/about/` | About page |
| `/workouts/` | Workouts browser page |
| `/readme/` | Additional documentation files |
| `/backup/` | Legacy/archived code (not in production) |
| `/archive/` | Archived CSS files |
| `/images/` | Image assets |
| `/docs/` | Project documentation |
| `/node_modules/` | npm dependencies |
| `/.github/workflows/` | GitHub Actions CI/CD workflows |

### Top-Level Files

| File | Purpose |
|------|---------|
| `index.html` | Homepage / Dashboard |
| `events.html` | Events calendar page |
| `projects.html` | Community projects page |
| `utilities.html` | Utilities index page |
| `admin.html` | Admin panel for logging workouts/events |
| `pb-matrix.html` | Personal Bests leaderboard |
| `past.html` | Past events archive |
| `README.md` | Main project README |
| `CNAME` | GitHub Pages custom domain config |
| `package.json` | npm dependencies configuration |
| `csvToJsonWorkouts.js` | Node.js CSV to JSON converter (legacy) |

---

## 2. Frontend Architecture

### Technology Stack

- **HTML5** - Static pages, no build step required
- **CSS** - Custom Tailwind-inspired utility framework (`tailwind.css`)
- **JavaScript** - Vanilla JS, no frameworks
- **Chart.js** - Only external dependency (for progress charts)

### CSS Structure

| File | Purpose | Size |
|------|---------|------|
| `assets/css/tailwind.css` | Entry point, imports other files | 596 bytes |
| `assets/css/variables.css` | CSS custom properties (colors, spacing) | 10.7 KB |
| `assets/css/utilities.css` | Utility classes (flex, grid, spacing) | 17.8 KB |
| `assets/css/components.css` | Component styles (cards, buttons, forms) | 14.4 KB |
| `assets/css/theme.css` | Dark/light theme support | 6.1 KB |

### JavaScript Modules

| File | Purpose | Key Functions |
|------|---------|---------------|
| `assets/js/workouts.js` | Workout browser, WOD display, pinning | Fetches `workouts_final.json` |
| `assets/js/events.js` | Events calendar rendering | Fetches `events/events.json` |
| `assets/js/app.js` | Sidebar navigation, utilities index | General app logic |
| `assets/js/main.js` | Legacy scripts | Minimal usage |
| `assets/js/theme.js` | Dark/light theme toggle | Theme persistence |
| `assets/js/pb-matrix-apps-script.js` | Google Apps Script for PB Matrix | External integration |

### HTML Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `index.html` | Dashboard with WOD, events, quick links |
| Workouts | `workouts/index.html` | Workout browser with cards, modal, pinning |
| Events | `events.html` | Upcoming and past events calendar |
| Utilities | `utilities/index.html` | Index of all fitness tools |
| Style Guide | `style-guide/index.html` | UI component documentation |
| About | `about/index.html` | About the community |
| Projects | `projects.html` | Community projects |
| Admin | `admin.html` | Logging interface for workouts/events |
| PB Matrix | `pb-matrix.html` | Personal Bests leaderboard |

### Utility Tools

| Tool | Path | Description |
|------|------|-------------|
| Plate Calculator | `utilities/plate-calculator/` | Calculate plates needed for barbell |
| 1RM Calculator | `utilities/one-rep-max/` | Estimate one-rep max from submaximal lifts |
| CrossFit Timer | `utilities/crossfit-timer/` | EMOM, Tabata, AMRAP timers |
| Workout Tracker | `utilities/workout-tracker/` | Log workout results |
| Progress Chart | `utilities/progress-chart/` | Visualize progress over time |
| Community Tools | `utilities/community-tools/` | Community resources |

### Frontend Data Loading

| File | Fetches | URL |
|------|---------|-----|
| `assets/js/workouts.js` | Workout data | `../data/reports/workouts_final.json` |
| `assets/js/events.js` | Events data | `events/events.json` |
| `pb-matrix.html` | PB Matrix data | External Google Sheets URL |
| `admin.html` | Various | n8n webhook URLs |
| `utilities/workout-tracker/index.html` | Submit workout | Webhook URL |

---

## 3. Workout Data Pipeline (Python)

### Pipeline Overview

The workout data pipeline transforms CSV source data into enriched, validated JSON for the website.

```
┌─────────────────────────────────────────────────────────────────┐
│  data/workouts_table.csv (SOURCE OF TRUTH)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: workout_pipeline.py                                    │
│  CSV → JSON, unit conversion, schema enforcement                │
│  Output: data/workouts_table.json, data/latest.json             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: generate_needs_reports.py                              │
│  Identify workouts needing enrichment/revalidation              │
│  Output: data/reports/workouts_needing_enrichment.json          │
│          data/reports/workouts_needing_revalidation.json        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: enrichment_agent.py                                    │
│  Apply templates, batch AI enrichment                           │
│  Output: data/reports/workouts_enriched.json                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: merge_workouts.py                                      │
│  Overlay enriched data onto base dataset                        │
│  Output: data/reports/workouts_merged.json                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: fix_workouts.py                                        │
│  Remove garbage, fill placeholders via AI                       │
│  Output: data/reports/workouts_merged_cleaned.json              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: final_cleanup.py                                       │
│  Clean markdown formatting, clear revalidation flags            │
│  Output: data/reports/workouts_merged_quality.json              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: update_flavor_text.py                                  │
│  Replace generic flavor text with category templates            │
│  Output: data/reports/workouts_flavor_enhanced.json             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: targeted_patches.py (FINAL STEP)                       │
│  Apply manual overrides, enforce quality gate                   │
│  Output: data/reports/workouts_final.json ← PRODUCTION FILE     │
└─────────────────────────────────────────────────────────────────┘
```

### Script Inventory

| Script | Status | Input | Output | Purpose |
|--------|--------|-------|--------|---------|
| `workout_pipeline.py` | **Active** | `data/workouts_table.csv` | `data/workouts_table.json`, `data/latest.json` | Main CSV → JSON converter, unit conversion, schema enforcement |
| `clean_workouts.py` | **Active** | `data/workouts_table.csv` | Cleaned CSV + JSON | GitHub Actions cleaner with AI (alternative entry point) |
| `generate_needs_reports.py` | **Active** | `data/latest.json` | `data/reports/workouts_needing_*.json` | Identifies enrichment needs |
| `enrichment_agent.py` | **Active** | `workouts_needing_enrichment.json` | `workouts_enriched.json` | Orchestrates AI enrichment |
| `enrichment_stub.py` | **Active** | N/A (library) | N/A | AI service integration (stub/OpenAI) |
| `merge_workouts.py` | **Active** | `workouts_needing_enrichment.json`, `workouts_enriched.json` | `workouts_merged.json` | Merges enriched data |
| `fix_workouts.py` | **Active** | `workouts_merged.json` | `workouts_merged_cleaned.json` | Fixes broken/placeholder data |
| `final_cleanup.py` | **Active** | `workouts_merged_cleaned.json` | `workouts_merged_quality.json` | Quality formatting cleanup |
| `update_flavor_text.py` | **Active** | `workouts_merged_quality.json` | `workouts_flavor_enhanced.json` | Enhances generic flavor text |
| `targeted_patches.py` | **Active** | `workouts_flavor_enhanced.json` | `workouts_final.json` | **Final step**: manual overrides + quality gate |
| `ai_workout_generator.py` | **Active** | CLI args | Stdout | Standalone workout generator |
| `config.json` | **Config** | N/A | N/A | Pipeline configuration (mode: stub/openai) |
| `fix_text_quality.py` | **Legacy** | N/A | N/A | Appears unused, duplicate of fix_workouts |

### Script Dependencies

```
workout_pipeline.py → standalone (CSV input)
                   ↓
generate_needs_reports.py → reads latest.json
                   ↓
enrichment_agent.py → reads workouts_needing_enrichment.json
    └── enrichment_stub.py (library)
    └── config.json (configuration)
                   ↓
merge_workouts.py → reads base + enriched
                   ↓
fix_workouts.py → reads workouts_merged.json
                   ↓
final_cleanup.py → reads workouts_merged_cleaned.json
                   ↓
update_flavor_text.py → reads workouts_merged_quality.json
                   ↓
targeted_patches.py → reads workouts_flavor_enhanced.json
                   ↓
OUTPUT: workouts_final.json (PRODUCTION)
```

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Optional | Enables AI enrichment in fix_workouts.py, enrichment_agent.py |

---

## 4. JSON Data Files

### Data Directory Structure

```
data/
├── workouts_table.csv      # Source of truth (602 workouts)
├── workouts_table.json     # Initial conversion (602 workouts, 1.3 MB)
├── latest.json             # Copy of initial conversion (1.3 MB)
├── workout_schema.json     # JSON Schema definition (1.3 KB)
├── wodSanitizer.js         # Node.js sanitizer (legacy)
├── conversionReport.log    # Conversion log
└── reports/
    ├── workouts_final.json           # PRODUCTION FILE (593 workouts, 1.5 MB)
    ├── workouts_flavor_enhanced.json # Pre-final (2.5 MB)
    ├── workouts_merged_quality.json  # Quality cleaned (2.4 MB)
    ├── workouts_merged_cleaned.json  # Fixed (2.3 MB)
    ├── workouts_merged.json          # Merged (2.4 MB)
    ├── workouts_enriched.json        # AI enriched (2.4 MB)
    ├── workouts_needing_enrichment.json  # Needs work (1.3 MB)
    └── workouts_needing_revalidation.json # Needs review (1.2 MB)
```

### File Classification

| File | Type | Status | Used By |
|------|------|--------|---------|
| `workouts_table.csv` | Raw Source | **Active** | Pipeline input |
| `workouts_table.json` | Intermediate | **Active** | Legacy references, GitHub Actions |
| `latest.json` | Intermediate | **Active** | generate_needs_reports.py |
| `workouts_final.json` | **Production** | **Active** | Frontend (workouts.js) |
| `workouts_flavor_enhanced.json` | Intermediate | Active | targeted_patches.py input |
| `workouts_merged_quality.json` | Intermediate | Active | update_flavor_text.py input |
| `workouts_merged_cleaned.json` | Intermediate | Active | final_cleanup.py input |
| `workouts_merged.json` | Intermediate | Active | fix_workouts.py input |
| `workouts_enriched.json` | Intermediate | Active | merge_workouts.py input |
| `workouts_needing_enrichment.json` | Report | Active | enrichment_agent.py input |
| `workouts_needing_revalidation.json` | Report | Active | Manual review |
| `workout_schema.json` | Schema | Active | Documentation |
| `wodSanitizer.js` | Legacy | **Dead** | Not used |
| `conversionReport.log` | Log | Active | Audit |

### Workout Count Discrepancy

| File | Workout Count | Notes |
|------|---------------|-------|
| `workouts_table.csv` | 602 | Source |
| `workouts_table.json` | 602 | Initial conversion |
| `workouts_final.json` | 593 | Production (9 removed during pipeline) |

The 9 missing workouts were likely filtered out during the enrichment/quality process.

---

## 5. Events System Overview

### Events File Structure

```
events/
├── events.json                        # Consolidated events file (8.8 KB)
├── events-list.json                   # List of individual event file paths
├── 24-hour-work-out-20251122.json     # Individual event files
├── christmas-drinks-20251128.json
├── deadly-dozen-20260425.json
├── ...
├── n8n-workflow.json                  # n8n automation workflow
├── n8n-workflow-simple.json
├── n8n-workflow-1-create-event.json
├── n8n-workflow-2-update-list.json
└── README.md                          # Events documentation
```

### Events Data Flow

1. **events.json** - Main consolidated file loaded by `events.js`
2. **events-list.json** - List of individual event file paths (legacy pattern)
3. **Individual JSON files** - One per event (historical/backup)
4. **n8n workflows** - Automation for adding events via webhook

### Frontend Loading

```javascript
// assets/js/events.js
const EVENTS_FILE = 'events/events.json';
fetch(EVENTS_FILE).then(res => res.json())
```

### Event Schema

```json
{
  "id": "event-id-date",
  "name": "Event Name",
  "date": "2025-12-01T00:00:00",
  "link": "https://...",
  "image": "images/event.jpg",
  "description": "Event description",
  "calendarDetails": {
    "location": "Location",
    "description": "Calendar description",
    "durationHours": 4
  },
  "showMoreInfo": true,
  "showBookNow": false,
  "showRemindMe": true
}
```

### n8n Integration

The repository includes n8n workflow definitions for:
- Creating new events via webhook
- Updating the events list
- Generating event descriptions with AI

---

## 6. Known Issues, Warnings, and Dead Files

### Dead Files (Safe to Remove)

| File | Reason | Classification |
|------|--------|----------------|
| `data/wodSanitizer.js` | Node.js sanitizer, replaced by Python pipeline | **Dead** |
| `csvToJsonWorkouts.js` | Node.js converter, replaced by workout_pipeline.py | **Dead** |
| `scripts/fix_text_quality.py` | Fragment, appears unused | **Dead** |
| `backup/` directory | Contains archived legacy code | **Historical** |
| `archive/unused-css/` | Archived CSS files | **Historical** |

### Duplicate Data

| Issue | Files | Classification |
|-------|-------|----------------|
| Multiple JSON versions | `workouts_table.json`, `latest.json`, `workouts_final.json` | **By Design** (pipeline stages) |
| Events stored twice | `events.json` + individual event files | **Duplicate** |

### Path Mismatches (FIXED)

| Issue | Old Path | New Path | Status |
|-------|----------|----------|--------|
| workouts.js referenced wrong file | `../data/workouts_table.json` | `../data/reports/workouts_final.json` | **Fixed** |

### Production-Critical Files

| File | Critical For | Notes |
|------|--------------|-------|
| `data/reports/workouts_final.json` | Workouts page | **Production** |
| `events/events.json` | Events page | **Production** |
| `assets/js/workouts.js` | Workouts page functionality | **Production** |
| `assets/js/events.js` | Events page functionality | **Production** |
| `assets/css/tailwind.css` | All pages styling | **Production** |

### Possibly Relevant (Needs Review)

| Item | Status | Notes |
|------|--------|-------|
| `events-list.json` | Possibly unused | Legacy pattern, events.js uses events.json |
| Individual event JSON files | Possibly unused | May be for n8n or backup purposes |
| `README_fix_workouts.md` | Outdated | Contains old instructions |
| `PB-MATRIX-SETUP.md` | Active | Root-level duplicate of readme/PB-MATRIX-SETUP.md |
| `validation_report.md` | Active | Generated by clean_workouts.py |

---

## 7. Final JSON Output Definition

### Canonical Production File

**Path:** `data/reports/workouts_final.json`

**Produced By:** `scripts/targeted_patches.py` (Step 8 of pipeline)

**Loaded By:** `assets/js/workouts.js`

### Workout Schema

```json
{
  "id": "1",
  "Name": "Fran",
  "Category": "Benchmark (girl/classic)",
  "FormatDuration": "For Time",
  "ScoreType": "Time",
  "Description": "One of CrossFit's original benchmark...",
  "Flavor_Text": "Fran - A very high intensity...",
  "CoachNotes": "Go unbroken if possible...",
  "Warmup": "5-10m general cardio...",
  "Scaling_Tiers": {
    "Beginner": "...",
    "Intermediate": "...",
    "Advanced": "...",
    "Limited Equipment": "..."
  },
  "Estimated_Times": {
    "RX": 420,
    "Intermediate": 588,
    "Beginner": 840
  },
  "Estimated_Times_Human": "7m 0s",
  "EquipmentNeeded": "Barbell, Pull-up Bar",
  "MovementTypes": "Gymnastics, Weightlifting",
  "Stimulus": "Very High Intensity...",
  "TargetStimulus": "High-intensity sprint...",
  "Instructions": "complete 21-15-9 reps...",
  "Instructions_Clean": "complete 21-15-9 repetitions...",
  "Level": "Intermediate",
  "DifficultyTier": "Elite",
  "TrainingGoals": "Cardiovascular Endurance...",
  "ScalingOptions": "Reduce reps, lighten load...",
  "Coaching_Cues": "Pace the workout...",
  "Environment": "Gym",
  "lastCleaned": "2025-11-28T21:12:48.127549+00:00",
  "needsEnrichment": [],
  "needsRevalidation": false
}
```

### Required Fields

| Field | Type | Required |
|-------|------|----------|
| `id` | string | Yes |
| `Name` | string | Yes |
| `Category` | string | Yes |
| `FormatDuration` | string | Yes |
| `ScoreType` | string | Yes |
| `lastCleaned` | string (ISO date) | Yes |

### Quality Constraints (Enforced by targeted_patches.py)

- No placeholder text (`"UNKNOWN — needs manual review"`, `"no description available"`, etc.)
- `needsEnrichment` must be empty array `[]`
- `needsRevalidation` must be `false`
- Internal tracking fields (`changes`, `enrichedFields`, `source`) are removed

---

## 8. Recommendations

### Immediate Actions

1. **Remove Dead Files**
   - Delete `data/wodSanitizer.js`
   - Delete `csvToJsonWorkouts.js`
   - Delete `scripts/fix_text_quality.py`

2. **Clean Up Events**
   - Consider removing individual event JSON files if not needed
   - Remove or archive `events-list.json` if unused

3. **Update Root-Level Docs**
   - Remove or redirect `PB-MATRIX-SETUP.md` (duplicate of readme version)
   - Update `README_fix_workouts.md` or archive it

### Short-Term Improvements

1. **Add Pipeline Runner Script**
   ```bash
   # scripts/run_full_pipeline.sh
   python scripts/workout_pipeline.py
   python scripts/generate_needs_reports.py
   # ... etc
   ```

2. **Add GitHub Action for Full Pipeline**
   - Currently only `clean_workouts.py` runs in CI
   - Add workflow for full enrichment pipeline

3. **Consolidate Intermediate Files**
   - Consider cleaning up intermediate JSON files after pipeline runs
   - Or move to a `data/intermediate/` subfolder

### Long-Term Refactors

1. **Single Entry Point**
   - Create a master pipeline script that runs all steps in order
   - Add `--full` and `--quick` modes

2. **Configuration Centralization**
   - Move all paths to `scripts/config.json`
   - Support environment variable overrides

3. **Testing**
   - Add unit tests for pipeline scripts
   - Add integration test that validates final JSON quality

4. **Documentation**
   - Add inline JSDoc comments to JavaScript files
   - Add type hints to all Python functions

### Suggested Deletions

| File/Folder | Reason | Risk |
|-------------|--------|------|
| `data/wodSanitizer.js` | Replaced by Python | None |
| `csvToJsonWorkouts.js` | Replaced by Python | None |
| `scripts/fix_text_quality.py` | Unused fragment | None |
| `backup/` | Old code, git history exists | Low (historical) |
| `archive/unused-css/` | Old CSS | Low (historical) |

### Next Steps Checklist

- [ ] Delete dead files listed above
- [ ] Create `scripts/run_full_pipeline.sh` or Makefile
- [ ] Add GitHub Action for full pipeline
- [ ] Review and clean up events system
- [ ] Add basic tests for pipeline scripts
- [ ] Update main README with pipeline documentation link

---

## Appendix: Quick Reference

### Running the Pipeline

```bash
# Full pipeline (with AI enrichment - requires OPENAI_API_KEY)
python scripts/workout_pipeline.py
python scripts/generate_needs_reports.py
python scripts/enrichment_agent.py
python scripts/merge_workouts.py
python scripts/fix_workouts.py
python scripts/final_cleanup.py
python scripts/update_flavor_text.py
python scripts/targeted_patches.py

# Quick pipeline (no AI)
python scripts/workout_pipeline.py --input data/workouts_table.csv
```

### Key URLs

- **Live Site:** https://petexa.github.io
- **Workouts:** https://petexa.github.io/workouts/
- **Events:** https://petexa.github.io/events.html
- **Repository:** https://github.com/petexa/petexa.github.io

### Contact / Support

For questions about this repository, refer to the main README.md or open a GitHub issue.

---

*This document was auto-generated as part of repository maintenance.*
