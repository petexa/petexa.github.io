#!/usr/bin/env python3
"""
Publish production datasets for the website.
"""

import os
import json
import sys

PROD_WORKOUTS_PATH = "data/production/workouts.json"
PROD_EVENTS_PATH = "data/production/events.json"


def _ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)


def validate_workouts_data(data):
    if not isinstance(data, list):
        raise ValueError("Workouts data must be a list")
    if len(data) == 0:
        raise ValueError("Workouts data is empty")
    sample = data[0]
    required_keys = ("id", "Name", "Category", "FormatDuration", "Description")
    missing = [k for k in required_keys if k not in sample]
    if missing:
        raise ValueError(f"Workouts items missing required keys: {missing}")
    return True


def publish_workouts(final_data):
    _ensure_dir(PROD_WORKOUTS_PATH)
    validate_workouts_data(final_data)
    with open(PROD_WORKOUTS_PATH, "w", encoding="utf-8") as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    print(f"Published production workouts file → {PROD_WORKOUTS_PATH}")


def validate_events_data(data):
    if isinstance(data, list):
        if len(data) == 0:
            raise ValueError("Events list is empty")
        sample = data[0]
        for k in ("id", "name", "date"):
            if k not in sample:
                raise ValueError(f"Event item missing required key: {k}")
    elif not isinstance(data, dict):
        raise ValueError("Events data must be list or dict")
    return True


def publish_events(events_data):
    _ensure_dir(PROD_EVENTS_PATH)
    validate_events_data(events_data)
    with open(PROD_EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(events_data, f, ensure_ascii=False, indent=2)
    print(f"Published production events file → {PROD_EVENTS_PATH}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: publish_production.py <workouts|events> <input_file>")
        sys.exit(1)

    data_type = sys.argv[1]
    input_file = sys.argv[2]

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if data_type == "workouts":
        publish_workouts(data)
    elif data_type == "events":
        publish_events(data)
    else:
        print(f"Unknown data type: {data_type}")
        sys.exit(1)
