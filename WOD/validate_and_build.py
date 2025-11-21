# validate_and_build.py
import os
import sys

import pandas as pd

DATA_DIR = "data"
OUT_DIR = "dist"
os.makedirs(OUT_DIR, exist_ok=True)

# Required files
required = [
    "workouts_table.csv",
    "movement_library.csv",
    "workout_movement_map.csv",
    "equipment_library.csv",
    "movement_equipment_map.csv",
]

missing = [f for f in required if not os.path.exists(os.path.join(DATA_DIR, f))]
if missing:
    print("Missing required input files:", missing)
    sys.exit(2)

# load
workouts = pd.read_csv(os.path.join(DATA_DIR, "workouts_table.csv"), dtype=str).fillna("")
movements = pd.read_csv(os.path.join(DATA_DIR, "movement_library.csv"), dtype=str).fillna("")
equipment = pd.read_csv(os.path.join(DATA_DIR, "equipment_library.csv"), dtype=str).fillna("")
wm = pd.read_csv(os.path.join(DATA_DIR, "workout_movement_map.csv"), dtype=str).fillna("")
me = pd.read_csv(os.path.join(DATA_DIR, "movement_equipment_map.csv"), dtype=str).fillna("")

# Basic validations
errors = []

# Primary keys existence
if "WorkoutID" not in workouts.columns:
    errors.append("Workouts table missing WorkoutID column")
if "MovementID" not in movements.columns:
    errors.append("Movements table missing MovementID column")
if "EquipmentID" not in equipment.columns:
    errors.append("Equipment table missing EquipmentID column")

# Foreign key checks
try:
    wk_ids = set(workouts["WorkoutID"].astype(str))
    mv_ids = set(movements["MovementID"].astype(str))
    eq_ids = set(equipment["EquipmentID"].astype(str))
    for idx, row in wm.iterrows():
        if str(row.get("WorkoutID", "")) not in wk_ids:
            errors.append(f"Orphan WorkoutID in workout_movement_map: {row.get('WorkoutID')}")
        if str(row.get("MovementID", "")) not in mv_ids:
            errors.append(f"Orphan MovementID in workout_movement_map: {row.get('MovementID')}")
    for idx, row in me.iterrows():
        if str(row.get("MovementID", "")) not in mv_ids:
            errors.append(f"Orphan MovementID in movement_equipment_map: {row.get('MovementID')}")
        if str(row.get("EquipmentID", "")) not in eq_ids:
            errors.append(f"Orphan EquipmentID in movement_equipment_map: {row.get('EquipmentID')}")
except Exception as e:
    errors.append("Error during FK checks: " + str(e))

# Duplication checks
dup_moves = movements[movements.duplicated(subset=["Movement"], keep=False)]
if not dup_moves.empty:
    errors.append("Duplicate movement names detected: " + ", ".join(dup_moves["Movement"].unique()))

# Instruction validation sample
bad_instructions = workouts[
    ~workouts["Instructions"].str.contains(
        r"\b(run|row|pull|push|clean|snatch|thruster|burpee|squat|swing|jump|bike)\b",
        case=False,
        na=False,
    )
]
if not bad_instructions.empty:
    errors.append(
        "Some workouts may have malformed instructions; sample names: "
        + ", ".join(bad_instructions["Name"].head(5).tolist())
    )

# If errors -> write report and exit non-zero
report = os.path.join(OUT_DIR, "validation_report.txt")
with open(report, "w") as f:
    if errors:
        f.write("VALIDATION FAILED\n")
        for e in errors:
            f.write("- " + str(e) + "\n")
        print("VALIDATION FAILED, see", report)
        sys.exit(3)
    else:
        f.write("VALIDATION PASSED\n")
        f.write(
            "Rows: Workouts=%d Movements=%d WM=%d ME=%d Equipment=%d\n"
            % (len(workouts), len(movements), len(wm), len(me), len(equipment))
        )
        print("VALIDATION PASSED, outputs in", OUT_DIR)

# On success, copy canonical files to dist/
for f in required:
    df = pd.read_csv(os.path.join(DATA_DIR, f), dtype=str).fillna("")
    df.to_csv(os.path.join(OUT_DIR, f), index=False)
