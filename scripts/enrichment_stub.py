"""
AI Enrichment Stub
==================
Prepares payloads for an external AI service and simulates enrichment.
Supports stub mode and OpenAI mode, with optional force re-enrichment.
Logs from → to changes in the terminal for transparency.
"""

import logging, json, os
from pathlib import Path
from openai import OpenAI

logger = logging.getLogger(__name__)

# Load config
CONFIG_PATH = Path(__file__).parent / "config.json"
config = json.load(open(CONFIG_PATH))

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def detect_placeholders(workout, force=False):
    """
    Detect stub placeholders like [AI generated ...].
    If force=True, re-add them to needsEnrichment.
    """
    for field, value in list(workout.items()):
        if isinstance(value, str) and value.startswith("[AI generated"):
            if force:
                if "needsEnrichment" not in workout:
                    workout["needsEnrichment"] = []
                if field not in workout["needsEnrichment"]:
                    workout["needsEnrichment"].append(field)
                workout[field] = ""  # clear placeholder so AI fills fresh
    return workout

def prepare_ai_payload(batch, force=False):
    """
    Prepare payload for AI enrichment.
    Only include fields flagged in needsEnrichment.
    """
    payload = []
    for w in batch:
        w = detect_placeholders(w, force=force)
        entry = {
            "id": w["id"],
            "Name": w.get("Name"),
            "Category": w.get("Category"),
            "FormatDuration": w.get("FormatDuration"),
            "ScoreType": w.get("ScoreType"),
            "fields_to_enrich": {}
        }
        for field in w.get("needsEnrichment", []):
            entry["fields_to_enrich"][field] = w.get(field)
        payload.append(entry)
    return payload

def call_ai_service(payload):
    """
    Call AI service depending on mode (stub or openai).
    """
    mode = config.get("mode", "stub")

    if mode == "stub":
        enriched = []
        for entry in payload:
            enriched_entry = entry.copy()
            for field in entry["fields_to_enrich"]:
                enriched_entry["fields_to_enrich"][field] = f"[AI generated {field} for {entry['Name']}]"
            enriched.append(enriched_entry)
        logger.info(f"Stub enriched {len(enriched)} workouts")
        return enriched

    elif mode == "openai":
        enriched = []
        for entry in payload:
            prompt = f"Enrich workout {entry['Name']} ({entry['Category']}, {entry['FormatDuration']})\n"
            for field in entry["fields_to_enrich"]:
                prompt += f"Provide {field}: \n"

            response = client.chat.completions.create(
                model=config["openai"]["model"],
                messages=[
                    {"role": "system", "content": config["openai"]["system_prompt"]},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=config["openai"]["max_tokens"]
            )

            enriched_entry = entry.copy()
            for field in entry["fields_to_enrich"]:
                enriched_entry["fields_to_enrich"][field] = response.choices[0].message.content
            enriched.append(enriched_entry)
        logger.info(f"OpenAI enriched {len(enriched)} workouts")
        return enriched

def merge_enriched_results(batch, enriched_results):
    """
    Merge AI enriched results back into the original workouts.
    Logs from → to changes in the terminal.
    """
    enriched_map = {entry["id"]: entry for entry in enriched_results}
    updated_batch = []

    for w in batch:
        enriched_entry = enriched_map.get(w["id"])
        if enriched_entry:
            filled_fields = []
            changes = {}
            for field, value in enriched_entry.get("fields_to_enrich", {}).items():
                old_value = w.get(field, "")
                w[field] = value
                if "needsEnrichment" in w and field in w["needsEnrichment"]:
                    w["needsEnrichment"].remove(field)
                filled_fields.append(field)
                changes[field] = {"from": old_value, "to": value}

                # Terminal log of the change
                logger.info(f"Workout {w['id']} – {field}: FROM → {old_value} TO → {value}")

            if filled_fields:
                w["source"] = "ai"
                w["enrichedFields"] = filled_fields
                w["changes"] = changes
        updated_batch.append(w)

    return updated_batch
