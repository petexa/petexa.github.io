# 🏋️‍♂️ Enrichment Agent – README

## 📖 Overview
This project automates the enrichment of workout JSON data for the **Iron & Ale – Handstand Tracker System**.  
It ensures every workout has clear descriptions, flavor text, and coach notes by combining:

- **Local templates** (for common archetypes like AMRAP, EMOM, Strength, Benchmarks).  
- **AI enrichment** (stubbed locally or via OpenAI API).  
- **Batch processing** (to minimize token usage and keep enrichment reproducible).  

The pipeline produces a clean, enriched JSON file ready for display on your gym community site.

---

## ⚙️ Features
- **Template filling**: Automatically adds flavor text for common workout types.  
- **Stub mode**: Fills missing fields with placeholders for safe local testing.  
- **OpenAI mode**: Calls GPT models to generate real enrichment text.  
- **Batching**: Processes workouts in groups of 20 for efficiency.  
- **Audit trail**: Marks each workout with `source` (`template` or `ai`) and `enrichedFields`.  
- **Summary report**: Logs counts of template vs AI enriched workouts.  

---

## 📂 Project Structure
```
scripts/
  enrichment_agent.py   # Orchestrates enrichment workflow
  enrichment_stub.py    # Stub + OpenAI integration
  config.json           # Toggle between stub and openai modes
data/
  reports/
    workouts_needing_enrichment.json  # Input file
    workouts_enriched.json            # Output file
```

---

## 🚀 Setup Instructions
1. **Install dependencies**  
   ```bash
   pip install openai
   ```

2. **Configure API key (for OpenAI mode)**  
   In PowerShell:
   ```powershell
   $env:OPENAI_API_KEY="sk-xxxx..."
   ```

3. **Check config.json**  
   - `"mode": "stub"` → local placeholders (fast, safe).  
   - `"mode": "openai"` → real enrichment via API.  

   Example:
   ```json
   {
     "mode": "stub",
     "openai": {
       "model": "gpt-4.1",
       "system_prompt": "You are a fitness coach. Provide concise, schema‑friendly enrichment text.",
       "max_tokens": 300
     }
   }
   ```

---

## ▶️ Usage
Run the agent from your project root:

```powershell
python scripts\enrichment_agent.py --input data\reports\workouts_needing_enrichment.json --output data\reports\workouts_enriched.json
```

- Reads the input JSON.  
- Applies local templates.  
- Batches remaining workouts.  
- Calls stub or OpenAI depending on config.  
- Saves enriched output to `workouts_enriched.json`.  

---

## 📊 Example Log Output
```
2025-11-28 21:36:11,339 - INFO - Prepared 30 batches for AI enrichment
2025-11-28 21:36:11,340 - INFO - Batch 1: 20 workouts enriched → IDs: [101, 102, ...]
...
========================================
Enrichment Summary
========================================
Templates applied: 128
AI enriched: 465
Still missing: 0
========================================
```

---

## 🛠️ Troubleshooting
- **Finishes too fast** → You’re in stub mode. Switch config to `"openai"`.  
- **SyntaxError in config.json** → Ensure braces `{}` and quotes `"` are balanced.  
- **APIRemovedInV1 error** → Update code to use `client.chat.completions.create` (already fixed in this repo).  
- **No API key** → Set `$env:OPENAI_API_KEY` before running in openai mode.  

---

## 📌 Notes
- Use stub mode for dry runs and testing pipeline logic.  
- Switch to openai mode when you want real enrichment text.  
- Keep batch size small (default 20) to avoid token overload.  
- All enriched workouts are tagged with their source for transparency.  

📄 Other Scripts
🧩 generate_needs_reports.py
Purpose: Scans the latest workouts JSON and produces two filtered files:

workouts_needing_enrichment.json → workouts missing descriptions, flavor text, or coach notes.

workouts_needing_revalidation.json → workouts referencing external sources (e.g. crossfit.com).

Usage:

powershell
python scripts\generate_needs_reports.py --input data\latest.json --output-dir data\reports
Workflow:

Reads latest.json (pipeline output).

Filters by needsEnrichment and needsRevalidation flags.

Saves reports into data/reports/.

Logs summary counts (e.g. “593 needing enrichment, 465 needing revalidation”).

🧩 enrichment_agent.py
Purpose: Applies archetype templates, batches workouts, and orchestrates AI enrichment.

Usage:

powershell
python scripts\enrichment_agent.py --input data\reports\workouts_needing_enrichment.json --output data\reports\workouts_enriched.json
Workflow:

Applies local templates (Benchmark, AMRAP, EMOM, Strength).

Prepares batches of 20 workouts.

Calls stub or OpenAI depending on config.json.

Merges enriched results back into workouts.

Saves workouts_enriched.json.

Logs summary of template vs AI enriched counts.

🧩 enrichment_stub.py
Purpose: Provides two enrichment modes:

Stub mode → fills flagged fields with placeholders.

OpenAI mode → calls GPT models for real enrichment.

Usage: Automatically invoked by enrichment_agent.py.

Workflow:

Prepares payloads with only flagged fields.

In stub mode → inserts [AI generated …] placeholders.

In OpenAI mode → sends prompts to GPT, returns enriched text.

Merges enriched results back into workouts.

🧩 config.json
Purpose: Controls enrichment mode and OpenAI parameters.

Example:

json
{
  "mode": "stub",
  "openai": {
    "model": "gpt-4.1",
    "system_prompt": "You are a fitness coach. Provide concise, schema‑friendly enrichment text.",
    "max_tokens": 300
  }
}
Workflow:

"mode": "stub" → fast local testing.

"mode": "openai" → real enrichment via API.

Parameters define model, prompt, and token limits.

🔗 End-to-End Flow
Run generate_needs_reports.py → produces enrichment & revalidation reports.

Run enrichment_agent.py → applies templates, batches, calls stub/AI, merges results.

Inspect workouts_enriched.json → ready for site integration.