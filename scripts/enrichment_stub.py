"""
AI Enrichment Stub
==================
Prepares payloads for an external AI service and simulates enrichment.
Replace call_ai_service with actual OpenAI or other LLM integration later.
"""

import logging
logger = logging.getLogger(__name__)

def prepare_ai_payload(batch):
    """
    Prepare payload for AI enrichment.
    Only include fields flagged in needsEnrichment.
    """
    payload = []
    for w in batch:
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
    Stub for AI call.
    Replace with actual API integration.
    """
    enriched = []
    for entry in payload:
        enriched_entry = entry.copy()
        for field in entry["fields_to_enrich"]:
            enriched_entry["fields_to_enrich"][field] = f"[AI generated {field} for {entry['Name']}]"
        enriched.append(enriched_entry)
    logger.info(f"Stub enriched {len(enriched)} workouts")
    return enriched

def merge_enriched_results(batch, enriched_results):
    """
    Merge AI enriched results back into the original workouts.
    """
    enriched_map = {entry["id"]: entry for entry in enriched_results}
    updated_batch = []

    for w in batch:
        enriched_entry = enriched_map.get(w["id"])
        if enriched_entry:
            filled_fields = []
            for field, value in enriched_entry.get("fields_to_enrich", {}).items():
                w[field] = value
                if "needsEnrichment" in w and field in w["needsEnrichment"]:
                    w["needsEnrichment"].remove(field)
                filled_fields.append(field)
            if filled_fields:
                w["source"] = "ai"
                w["enrichedFields"] = filled_fields
        updated_batch.append(w)

    return updated_batch
