#!/usr/bin/env python3
"""
WOD Dataset Cleaning and Enhancement
Advanced cleaning to remove artifacts and enhance data quality
"""

import os
import re
import sys
from typing import Dict, List, Set

import pandas as pd

# Import shared configuration
from config import ARTIFACT_PATTERNS, DATA_DIR, MAX_EQUIPMENT_NAME_LENGTH, OUT_DIR


class WODCleaner:
    """Advanced cleaning for WOD dataset"""

    def __init__(self):
        self.movements = None
        self.equipment = None
        self.wm_map = None
        self.me_map = None
        self.changes = []

    def load_data(self):
        """Load CSV files"""
        print("Loading data for cleaning...")
        self.movements = pd.read_csv(
            os.path.join(DATA_DIR, "movement_library.csv"), dtype=str
        ).fillna("")
        self.equipment = pd.read_csv(
            os.path.join(DATA_DIR, "equipment_library.csv"), dtype=str
        ).fillna("")
        self.wm_map = pd.read_csv(
            os.path.join(DATA_DIR, "workout_movement_map.csv"), dtype=str
        ).fillna("")
        self.me_map = pd.read_csv(
            os.path.join(DATA_DIR, "movement_equipment_map.csv"), dtype=str
        ).fillna("")
        print(f"Loaded {len(self.movements)} movements, {len(self.equipment)} equipment items")

    def remove_movement_artifacts(self):
        """Remove parsing artifacts from movement library"""
        print("\n=== Removing Movement Artifacts ===")

        artifacts_to_remove = []

        for idx, row in self.movements.iterrows():
            movement = str(row["Movement"]).strip()
            movement_id = str(row["MovementID"])

            if not movement or movement == "":
                artifacts_to_remove.append(movement_id)
                self.changes.append(f"Removing empty movement (ID: {movement_id})")
                continue

            for pattern in ARTIFACT_PATTERNS:
                if re.match(pattern, movement, re.IGNORECASE):
                    artifacts_to_remove.append(movement_id)
                    self.changes.append(
                        f"Removing artifact movement: '{movement}' (ID: {movement_id})"
                    )
                    break

        if artifacts_to_remove:
            # Remove from movements table
            self.movements = self.movements[~self.movements["MovementID"].isin(artifacts_to_remove)]

            # Remove from workout-movement map
            wm_before = len(self.wm_map)
            self.wm_map = self.wm_map[~self.wm_map["MovementID"].isin(artifacts_to_remove)]
            wm_removed = wm_before - len(self.wm_map)
            if wm_removed > 0:
                self.changes.append(
                    f"Removed {wm_removed} workout-movement mappings for artifact movements"
                )

            # Remove from movement-equipment map
            me_before = len(self.me_map)
            self.me_map = self.me_map[~self.me_map["MovementID"].isin(artifacts_to_remove)]
            me_removed = me_before - len(self.me_map)
            if me_removed > 0:
                self.changes.append(
                    f"Removed {me_removed} movement-equipment mappings for artifact movements"
                )

            print(f"Removed {len(artifacts_to_remove)} artifact movements")
        else:
            print("No artifact movements found")

    def clean_equipment_names(self):
        """Clean up equipment library"""
        print("\n=== Cleaning Equipment Names ===")

        # Find equipment entries that are too long (likely parsing errors)
        long_equipment = self.equipment[
            self.equipment["Equipment"].str.len() > MAX_EQUIPMENT_NAME_LENGTH
        ]

        if not long_equipment.empty:
            equipment_to_remove = long_equipment["EquipmentID"].tolist()

            for idx, row in long_equipment.iterrows():
                self.changes.append(
                    f"Removing overly long equipment entry (ID: {row['EquipmentID']}): {row['Equipment'][:50]}..."
                )

            # Remove from equipment table
            self.equipment = self.equipment[
                ~self.equipment["EquipmentID"].isin(equipment_to_remove)
            ]

            # Remove from movement-equipment map
            me_before = len(self.me_map)
            self.me_map = self.me_map[~self.me_map["EquipmentID"].isin(equipment_to_remove)]
            me_removed = me_before - len(self.me_map)
            if me_removed > 0:
                self.changes.append(
                    f"Removed {me_removed} movement-equipment mappings for invalid equipment"
                )

            print(f"Removed {len(equipment_to_remove)} invalid equipment entries")
        else:
            print("No invalid equipment entries found")

    def deduplicate_movements(self):
        """Remove duplicate movement entries (case-insensitive)"""
        print("\n=== Deduplicating Movements ===")

        # Create normalized version for comparison
        self.movements["Movement_normalized"] = self.movements["Movement"].str.lower().str.strip()

        # Find duplicates
        duplicates = self.movements[self.movements["Movement_normalized"].duplicated(keep="first")]

        if not duplicates.empty:
            duplicate_ids = duplicates["MovementID"].tolist()

            for idx, row in duplicates.iterrows():
                self.changes.append(
                    f"Removing duplicate movement: '{row['Movement']}' (ID: {row['MovementID']})"
                )

            # Remove duplicates
            self.movements = self.movements[~self.movements["MovementID"].isin(duplicate_ids)]

            # Update mappings to use the kept movement IDs
            # Note: This simplified approach removes mappings for duplicates.
            # In production, you may want to implement remapping logic to preserve
            # all workout relationships by updating references to use the canonical movement ID.
            wm_before = len(self.wm_map)
            self.wm_map = self.wm_map[~self.wm_map["MovementID"].isin(duplicate_ids)]
            wm_removed = wm_before - len(self.wm_map)
            if wm_removed > 0:
                self.changes.append(
                    f"Removed {wm_removed} workout-movement mappings for duplicate movements"
                )

            me_before = len(self.me_map)
            self.me_map = self.me_map[~self.me_map["MovementID"].isin(duplicate_ids)]
            me_removed = me_before - len(self.me_map)
            if me_removed > 0:
                self.changes.append(
                    f"Removed {me_removed} movement-equipment mappings for duplicate movements"
                )

            print(f"Removed {len(duplicate_ids)} duplicate movements")
        else:
            print("No duplicate movements found")

        # Clean up temporary column
        self.movements = self.movements.drop("Movement_normalized", axis=1)

    def save_cleaned_data(self):
        """Save cleaned data back to data directory"""
        print("\n=== Saving Cleaned Data ===")

        self.movements.to_csv(os.path.join(DATA_DIR, "movement_library.csv"), index=False)
        self.equipment.to_csv(os.path.join(DATA_DIR, "equipment_library.csv"), index=False)
        self.wm_map.to_csv(os.path.join(DATA_DIR, "workout_movement_map.csv"), index=False)
        self.me_map.to_csv(os.path.join(DATA_DIR, "movement_equipment_map.csv"), index=False)

        print(f"Saved cleaned data to {DATA_DIR}/")

        # Save change log
        if self.changes:
            change_log_path = os.path.join(OUT_DIR, "cleaning_changes.log")
            with open(change_log_path, "w") as f:
                f.write("WOD DATASET CLEANING LOG\n")
                f.write("=" * 60 + "\n\n")
                for i, change in enumerate(self.changes, 1):
                    f.write(f"{i}. {change}\n")
            print(f"Change log saved to {change_log_path}")

    def run(self):
        """Run cleaning pipeline"""
        print("=" * 60)
        print("WOD DATASET CLEANER")
        print("=" * 60)

        self.load_data()
        self.remove_movement_artifacts()
        self.clean_equipment_names()
        self.deduplicate_movements()
        self.save_cleaned_data()

        print("\n" + "=" * 60)
        print(f"CLEANING COMPLETE: {len(self.changes)} changes made")
        print("=" * 60)


def main():
    cleaner = WODCleaner()
    cleaner.run()
    print("\n✓ Cleaning completed successfully")


if __name__ == "__main__":
    main()
