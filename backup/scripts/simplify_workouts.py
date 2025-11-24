#!/usr/bin/env python3
"""
Simplify workouts_table.csv by keeping only essential columns.

This script keeps only the most useful columns for the workout database
and removes all the extra metadata/computed fields.

Usage:
    python scripts/simplify_workouts.py
"""

import pandas as pd
import sys


def simplify_workouts():
    """Keep only essential columns and remove the rest."""
    
    csv_path = 'WOD/data/workouts_table.csv'
    
    # Columns to keep (in order)
    columns_to_keep = [
        'WorkoutID',
        'Name',
        'Category',
        'Format & Duration',
        'Instructions',
        'Equipment Needed',
        'Muscle Groups',
        'Training Goals',
        'Level',  # This is "Difficulty Level" in your list
        'Scaling Options',
        'Score Type',
        'Coach Notes',
        'Flavor-Text'
    ]
    
    print("=" * 80)
    print("SIMPLIFYING WORKOUT DATABASE")
    print("=" * 80)
    
    # Load the CSV
    print(f"\nLoading data from {csv_path}...")
    df = pd.read_csv(csv_path, low_memory=False)
    print(f"  ✓ Loaded {len(df)} workouts with {len(df.columns)} columns")
    
    # Check which columns exist
    missing_columns = [col for col in columns_to_keep if col not in df.columns]
    if missing_columns:
        print(f"\n⚠ Warning: These columns don't exist: {', '.join(missing_columns)}")
        columns_to_keep = [col for col in columns_to_keep if col in df.columns]
    
    # Keep only specified columns
    print(f"\nKeeping {len(columns_to_keep)} essential columns...")
    df_simplified = df[columns_to_keep].copy()
    
    columns_removed = len(df.columns) - len(columns_to_keep)
    print(f"  ✓ Removed {columns_removed} columns")
    
    # Show what we're keeping
    print("\nColumns in simplified dataset:")
    for i, col in enumerate(columns_to_keep, 1):
        print(f"  {i}. {col}")
    
    # Save the simplified version
    print(f"\nSaving simplified data to {csv_path}...")
    df_simplified.to_csv(csv_path, index=False)
    print(f"  ✓ Saved {len(df_simplified)} workouts with {len(df_simplified.columns)} columns")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Original columns:    {len(df.columns)}")
    print(f"Simplified columns:  {len(df_simplified.columns)}")
    print(f"Columns removed:     {columns_removed}")
    print(f"Workouts preserved:  {len(df_simplified)}")
    print("=" * 80)
    
    print("\n✓ Database simplified successfully!\n")


def main():
    """Main entry point."""
    try:
        # Ask for confirmation
        print("\n⚠ WARNING: This will permanently remove 29 columns from workouts_table.csv")
        print("A backup exists at: WOD/data/workouts_table.backup.csv")
        
        response = input("\nContinue? (yes/no): ").strip().lower()
        
        if response not in ['yes', 'y']:
            print("\nOperation cancelled.")
            return 0
        
        simplify_workouts()
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
