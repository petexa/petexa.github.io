#!/usr/bin/env python3
"""
Update a specific workout in workouts_table.csv by name or WorkoutID.

Usage:
    # Find by name and update a field
    python scripts/update_workout.py --name "Fran" --field "Coach Notes" --value "Sprint workout!"
    
    # Find by WorkoutID and update multiple fields
    python scripts/update_workout.py --id "116" --field "Level" --value "Advanced"
    
    # View a workout
    python scripts/update_workout.py --name "J.T." --view
"""

import pandas as pd
import sys
import argparse
from typing import Optional, Dict, Any


class WorkoutUpdater:
    """Find and update specific workouts in the dataset."""
    
    def __init__(self, csv_path: str = 'WOD/data/workouts_table.csv'):
        self.csv_path = csv_path
        self.df = None
        
    def load_data(self) -> None:
        """Load the CSV file."""
        print(f"Loading data from {self.csv_path}...")
        self.df = pd.read_csv(self.csv_path, low_memory=False)
        print(f"  ✓ Loaded {len(self.df)} workouts")
        
    def find_workout_by_name(self, name: str) -> Optional[int]:
        """Find a workout by name (case-insensitive)."""
        matches = self.df[self.df['Name'].str.lower() == name.lower()]
        
        if len(matches) == 0:
            print(f"\n✗ No workout found with name: '{name}'")
            print("\nDid you mean one of these?")
            similar = self.df[self.df['Name'].str.contains(name, case=False, na=False)]
            if len(similar) > 0:
                for idx, row in similar.head(5).iterrows():
                    print(f"  - {row['Name']} (WorkoutID: {row.get('WorkoutID', 'N/A')})")
            return None
            
        if len(matches) > 1:
            print(f"\n⚠ Multiple workouts found with name '{name}':")
            for idx, row in matches.iterrows():
                print(f"  - Row {idx}: {row['Name']} (WorkoutID: {row.get('WorkoutID', 'N/A')})")
            return None
            
        idx = matches.index[0]
        print(f"\n✓ Found workout: '{matches.iloc[0]['Name']}' at row {idx}")
        return idx
        
    def find_workout_by_id(self, workout_id: str) -> Optional[int]:
        """Find a workout by WorkoutID."""
        # Try both string and numeric comparison
        matches = self.df[
            (self.df['WorkoutID'] == workout_id) | 
            (self.df['WorkoutID'].astype(str) == str(workout_id))
        ]
        
        if len(matches) == 0:
            print(f"\n✗ No workout found with WorkoutID: '{workout_id}'")
            return None
            
        if len(matches) > 1:
            print(f"\n⚠ Multiple workouts found with WorkoutID '{workout_id}':")
            for idx, row in matches.iterrows():
                print(f"  - Row {idx}: {row['Name']}")
            return None
            
        idx = matches.index[0]
        print(f"\n✓ Found workout: '{matches.iloc[0]['Name']}' at row {idx}")
        return idx
        
    def view_workout(self, idx: int) -> None:
        """Display all fields for a specific workout."""
        if idx is None or idx not in self.df.index:
            print(f"\n✗ Invalid workout index: {idx}")
            return
            
        workout = self.df.iloc[idx]
        
        print("\n" + "=" * 80)
        print(f"WORKOUT: {workout['Name']}")
        print("=" * 80)
        
        # Display key fields first
        key_fields = [
            'WorkoutID', 'Name', 'Category', 'Level',
            'Format & Duration', 'Instructions', 'Equipment Needed', 
            'Muscle Groups', 'Training Goals', 'Scaling Options',
            'Score Type', 'Coach Notes', 'Flavor-Text'
        ]
        
        for field in key_fields:
            if field in workout.index:
                value = workout[field]
                # Truncate long values
                if pd.notna(value):
                    value_str = str(value)
                    if len(value_str) > 100:
                        value_str = value_str[:100] + "..."
                    print(f"\n{field}:")
                    print(f"  {value_str}")
                else:
                    print(f"\n{field}: (empty)")
        
        # Show remaining fields
        remaining = [col for col in workout.index if col not in key_fields]
        if len(remaining) > 0:
            print(f"\n\n{len(remaining)} additional fields available:")
            print(f"  {', '.join(remaining[:10])}")
            if len(remaining) > 10:
                print(f"  ... and {len(remaining) - 10} more")
        
        print("\n" + "=" * 80)
        
    def update_workout(self, idx: int, field: str, value: str) -> bool:
        """Update a specific field for a workout."""
        if idx is None or idx not in self.df.index:
            print(f"\n✗ Invalid workout index: {idx}")
            return False
            
        if field not in self.df.columns:
            print(f"\n✗ Field '{field}' does not exist in the dataset")
            print(f"\nAvailable fields: {', '.join(self.df.columns[:20])}")
            if len(self.df.columns) > 20:
                print(f"... and {len(self.df.columns) - 20} more")
            return False
        
        old_value = self.df.at[idx, field]
        self.df.at[idx, field] = value
        
        workout_name = self.df.at[idx, 'Name']
        
        print(f"\n✓ Updated '{field}' for workout '{workout_name}'")
        print(f"\n  Old value: {old_value}")
        print(f"  New value: {value}")
        
        return True
        
    def save_data(self) -> None:
        """Save the updated data back to the CSV file."""
        print(f"\nSaving changes to {self.csv_path}...")
        self.df.to_csv(self.csv_path, index=False)
        print(f"  ✓ Saved {len(self.df)} workouts")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Find and update a specific workout in workouts_table.csv',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # View a workout by name
  python scripts/update_workout.py --name "Fran" --view
  
  # Update a field by name
  python scripts/update_workout.py --name "Fran" --field "Coach Notes" --value "Go fast!"
  
  # Update by WorkoutID
  python scripts/update_workout.py --id "116" --field "Level" --value "Advanced"
  
  # Update multiple times (saves after each update)
  python scripts/update_workout.py --name "J.T." --field "Coach Notes" --value "Push hard"
  python scripts/update_workout.py --name "J.T." --field "Level" --value "Elite"
        """
    )
    
    parser.add_argument('--name', help='Find workout by name (case-insensitive)')
    parser.add_argument('--id', help='Find workout by WorkoutID')
    parser.add_argument('--field', help='Field name to update')
    parser.add_argument('--value', help='New value for the field')
    parser.add_argument('--view', action='store_true', help='View workout details')
    parser.add_argument('--csv-path', default='WOD/data/workouts_table.csv', 
                        help='Path to the CSV file')
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.name and not args.id:
        print("\n✗ Error: Must specify either --name or --id")
        parser.print_help()
        return 1
        
    if args.name and args.id:
        print("\n✗ Error: Cannot use both --name and --id")
        return 1
        
    if not args.view and (not args.field or not args.value):
        print("\n✗ Error: Must specify both --field and --value (or use --view)")
        parser.print_help()
        return 1
    
    try:
        updater = WorkoutUpdater(args.csv_path)
        updater.load_data()
        
        # Find the workout
        if args.name:
            idx = updater.find_workout_by_name(args.name)
        else:
            idx = updater.find_workout_by_id(args.id)
        
        if idx is None:
            return 1
        
        # View or update
        if args.view:
            updater.view_workout(idx)
        else:
            success = updater.update_workout(idx, args.field, args.value)
            if success:
                updater.save_data()
                print("\n✓ Update complete!\n")
            else:
                return 1
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
