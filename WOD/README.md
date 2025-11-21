# Workout Dataset Starter Kit (Full)

This starter kit contains the full workout dataset pipeline for validation and build.

## Included files
- data/ (canonical CSVs: workouts_table.csv, movement_library.csv, workout_movement_map.csv, equipment_library.csv, movement_equipment_map.csv)
- validate_and_build.py - validation and build script
- schema.sql - SQL schema
- data_dictionary.md - data dictionary
- workflow.yml - GitHub Actions example
- agent.yaml - GitHub Agent example

## Original uploaded source
The original uploaded CSV used during development is available at the local path:
`/mnt/data/wods-table-corrected.csv`

**Note:** In CI, the GitHub Agent or workflow should place input CSVs in `data/` before running the script.
