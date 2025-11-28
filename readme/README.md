# Iron & Ale Documentation Index

This is the documentation index for the Iron & Ale project. All guides are stored in the `readme/` folder for better organization.

Refer to the following files for specific guides:
- [Events & n8n Workflow Guide](events.md)
- [Personal Bests Matrix Setup Guide](PB-MATRIX-SETUP.md)
- [n8n Event Workflow Guide](N8N-EVENT-WORKFLOW.md)

---

For more, see individual docs in the `readme/` folder.

---

## Scripts & Data Cleaning

### `scripts/clean_workouts.py` — Workout Data Cleaning Script

**Purpose:**
Cleans and validates workout CSV data for the Iron & Ale web app, ensuring consistency, accuracy, and readiness for use on the workout page.

**Key Features:**
- Converts lb/lbs units to kg
- Detects and handles duplicates (exact and fuzzy)
- Uses OpenAI (if available) to fill missing metadata, with citations
- Falls back to web scraping if AI is unavailable
- Detects contradictions and flags issues
- Generates audit trails and human-readable validation reports
- Removes unused columns not required by the workout page

**Usage Example:**
```powershell
python scripts/clean_workouts.py --input workouts_table.csv --out workouts_table_cleaned.csv
```

**Dependencies:**
- pandas, requests, beautifulsoup4, openai (optional), tqdm

**Environment Variables:**
- `OPENAI_API_KEY` (optional, for AI-assisted metadata filling)