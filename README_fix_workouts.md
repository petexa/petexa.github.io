# Workout Data Cleaning Script

This document explains how to configure and run the `scripts/clean_workouts.py` script for cleaning and validating CrossFit workout CSV data.

## Overview

The `clean_workouts.py` script performs comprehensive data cleaning on workout CSV files:

- **Unit Conversion**: Converts all `lb`/`lbs` values to `kg` consistently
- **Duplicate Detection**: Finds exact and fuzzy duplicates using normalized keys and Levenshtein distance
- **AI-Assisted Fills**: Uses OpenAI API to fill missing metadata with citations
- **Web Scraping Fallback**: Falls back to web scraping when AI is unavailable
- **Contradiction Detection**: Identifies and flags inconsistent data
- **Column Cleanup**: Removes columns not used by the workout page (keeps only essential columns)
- **JSON Regeneration**: Automatically regenerates the JSON file used by the workout page
- **Audit Trail**: Generates detailed audit logs with source citations
- **Validation Reports**: Creates human-readable markdown reports

## Requirements

### Python Dependencies

Install required packages:

```bash
pip install pandas requests beautifulsoup4 tqdm
# Optional: For AI-assisted features
pip install openai
```

### OpenAI API Key (Optional)

For AI-assisted metadata filling, set the `OPENAI_API_KEY` environment variable:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

**Note**: The script works without this key but will only use web scraping heuristics for metadata.

## Usage

### Basic Usage

```bash
# Clean the default input file
python scripts/clean_workouts.py --input data/workouts_table.csv

# With custom output paths
python scripts/clean_workouts.py \
    --input data/workouts_table.csv \
    --out workouts_table_cleaned.csv \
    --audit workouts_table_audit.csv \
    --report validation_report.md
```

### CLI Options

| Option | Default | Description |
|--------|---------|-------------|
| `--input`, `-i` | `data/workouts_table.csv` | Input CSV file path |
| `--out`, `-o` | `workouts_table_cleaned.csv` | Output cleaned CSV path |
| `--audit`, `-a` | `workouts_table_audit.csv` | Output audit CSV path |
| `--report`, `-r` | `validation_report.md` | Output report path |
| `--rounding` | `1` | Kg rounding precision (1, 2.5, or 5) |
| `--dry-run` | - | Run without saving files |
| `--replace-input` | - | Replace input file with cleaned output |
| `--max-ai-requests` | `50` | Maximum AI API requests |
| `--verbose`, `-v` | - | Enable verbose logging |

### Examples

```bash
# Dry run to see what would change
python scripts/clean_workouts.py --input data/workouts_table.csv --dry-run

# Round weights to nearest 2.5 kg
python scripts/clean_workouts.py --input data/workouts_table.csv --rounding 2.5

# Replace input file in-place
python scripts/clean_workouts.py --input data/workouts_table.csv --replace-input

# Limit AI requests (useful for testing)
python scripts/clean_workouts.py --input data/workouts_table.csv --max-ai-requests 10
```

## CI/CD Integration

### GitHub Actions

The repository includes a GitHub Actions workflow at `.github/workflows/clean_workouts.yml` that:

1. Runs automatically on push to `main` when data files change
2. Can be triggered manually via workflow dispatch
3. Uses `OPENAI_API_KEY` secret if available
4. Falls back to web-only heuristics if no API key
5. Commits cleaned data back to the repository

### Setting Up the OPENAI_API_KEY Secret

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `OPENAI_API_KEY`
5. Value: Your OpenAI API key
6. Click **Add secret**

**Note**: The workflow will work without this secret, falling back to web scraping only.

### Manual Trigger

You can manually trigger the workflow from the **Actions** tab with options:
- `dry_run`: Run without making changes
- `max_ai_requests`: Limit AI API calls

## Data Architecture

### CSV is the Source of Truth

The `data/workouts_table.csv` file is the **single source of truth** for workout data:

1. **Edit the CSV** to add/modify workout data
2. **Run the cleaning script** to validate, clean, and normalize the data
3. **JSON is auto-generated** from the CSV for the workout page

**Never edit the JSON file directly** - it will be overwritten when the CSV is processed.

### Data Flow

```
workouts_table.csv (source of truth)
        ↓
    clean_workouts.py
        ↓
    ├── workouts_table.csv (cleaned, in-place)
    ├── workouts_table.json (auto-generated for web page)
    ├── workouts_table_audit.csv (audit trail)
    └── validation_report.md (human-readable report)
```

## Output Files

### 1. Cleaned CSV (`data/workouts_table.csv`)

The cleaned version of the input data with:
- Units converted to kg
- Formats normalized
- Unused columns removed (only essential columns for the workout page are kept)
- Missing values filled where possible
- Flagged values for unknowns

### 2. Generated JSON (`data/workouts_table.json`)

Auto-generated from the CSV with proper field names for the workout page JavaScript.
**Do not edit this file directly** - it is regenerated from the CSV.

### 3. Audit CSV (`workouts_table_audit.csv`)

Detailed audit trail with columns:
- `row_index`: Original row number
- `original_row`: JSON of original data
- `cleaned_row`: JSON of cleaned data
- `changes`: JSON array of changes made
- `flags`: Any warnings or issues
- `sources`: JSON array of source citations
- `ai_responses`: Raw AI responses (if used)

### 4. Validation Report (`validation_report.md`)

Human-readable markdown report including:
- Summary statistics
- Top audit entries
- Source citations
- Rows requiring manual review

## Caching

The script caches AI and web results in `.cache/` directory to:
- Avoid redundant API calls on re-runs
- Maintain idempotence
- Speed up subsequent runs

To clear cache, delete the `.cache/` directory.

## Conservative Approach

The script follows a conservative approach:
- **No invented values**: All numeric fills require source citations
- **UNKNOWN flags**: Uncertain values are marked as "UNKNOWN — needs manual review"
- **AI verification**: AI suggestions without URLs are marked as "AI-SUGGESTED-UNVERIFIED"
- **Human review**: Contradictions and unclear data are flagged for manual review

## Troubleshooting

### "Module not found" errors

Install missing dependencies:
```bash
pip install pandas requests beautifulsoup4 tqdm openai
```

### Rate limiting

If you hit API rate limits:
- Reduce `--max-ai-requests`
- Wait and retry (caching prevents re-querying)

### Web scraping fails

Some sites may block requests. The script handles this gracefully and continues with available data.

## License

This script is part of the petexa.github.io repository.
