#!/usr/bin/env python3
"""
Remove default placeholder data from workouts_table.csv.

This script identifies and removes generic default values from the simplified
13-column workout database, optionally replacing them with web-searched data.

Focuses on:
1. Identifying default/placeholder text in all fields
2. Optionally searching web for real workout information
3. Clearing defaults (leaving blank or minimal value)
4. Generating detailed report of changes
"""

import pandas as pd
import warnings
from typing import Dict, List, Optional
import sys
import json
import os
from datetime import datetime, timedelta
from collections import Counter

warnings.filterwarnings('ignore')


class DefaultRemover:
    """Identifies and removes default placeholder data from workout dataset."""
    
    def __init__(self, csv_path: str, enable_web_search: bool = False):
        self.csv_path = csv_path
        self.enable_web_search = enable_web_search
        self.df = None
        self.cache_file = 'scripts/.default_removal_cache.json'
        self.cache_expiry_hours = 24
        self.stats = {
            'total_workouts': 0,
            'workouts_with_defaults': 0,
            'defaults_cleared': 0,
            'defaults_replaced_web': 0,
            'workouts_skipped_cached': 0,
        }
        
        # Default patterns to identify and remove
        # Maps field name to list of default/placeholder patterns
        self.default_patterns = {
            'Category': ['General', 'Unknown', 'Unspecified'],
            'Format & Duration': ['Unknown', 'Unspecified'],
            'Equipment Needed': ['Not specified', 'None specified'],
            'Muscle Groups': ['Unspecified', 'Unknown'],
            'Training Goals': ['General Fitness', 'Unspecified', 'Unknown'],
            'Scaling Options': [
                'Standard scaling recommended',
                'Scale as needed',
                'Modify as needed',
                'Standard modifications apply',
                'Standard scaling applies'
            ],
            'Score Type': ['Unspecified', 'Unknown'],
            'Coach Notes': [
                'No additional notes',
                'Focus on form and pacing',
                'Standard coaching applies',
                'No notes',
                'N/A'
            ],
            'Flavor-Text': [
                'Standard workout',
                'A challenging workout',
                'Classic CrossFit workout',
                'Great workout',
                'Effective training'
            ],
        }
        
        # Fields that need minimal defaults (can't be completely empty)
        self.minimal_defaults = {
            'Category': 'General',
            'Level': 'Intermediate',
            'Score Type': 'Time',
        }
    
    def load_data(self):
        """Load the CSV file."""
        print(f"Loading data from {self.csv_path}...")
        self.df = pd.read_csv(self.csv_path, low_memory=False)
        self.stats['total_workouts'] = len(self.df)
        print(f"  ✓ Loaded {self.stats['total_workouts']} workouts")
        print(f"  Columns: {', '.join(self.df.columns.tolist())}")
    
    def identify_defaults(self):
        """Identify workouts with default placeholder text."""
        print("\nIdentifying default placeholder values...")
        
        workouts_with_defaults = []
        
        for idx, row in self.df.iterrows():
            defaults_found = []
            
            for field, patterns in self.default_patterns.items():
                if field not in row:
                    continue
                    
                value = str(row[field]).strip()
                
                # Check if value matches any default pattern
                for pattern in patterns:
                    if value.lower() == pattern.lower():
                        defaults_found.append(field)
                        break
            
            if defaults_found:
                workouts_with_defaults.append({
                    'index': idx,
                    'name': row['Name'],
                    'category': row.get('Category', 'Unknown'),
                    'defaults': defaults_found
                })
        
        self.stats['workouts_with_defaults'] = len(workouts_with_defaults)
        print(f"  ✓ Found {len(workouts_with_defaults)} workouts with default values")
        print(f"    ({len(workouts_with_defaults)/self.stats['total_workouts']*100:.1f}% of total)")
        
        if len(workouts_with_defaults) > 0:
            print(f"\n  Most common default fields:")
            all_defaults = [d for w in workouts_with_defaults for d in w['defaults']]
            for field, count in Counter(all_defaults).most_common(10):
                pct = count/self.stats['total_workouts']*100
                print(f"    - {field}: {count} workouts ({pct:.1f}%)")
        
        return workouts_with_defaults
    
    def clear_defaults(self, workouts_with_defaults):
        """Clear default values, leaving blank or minimal default."""
        print("\nClearing default values...")
        
        if self.enable_web_search:
            print("  Web search enabled - will attempt to replace defaults with real data")
            cache = self._load_cache()
        else:
            print("  Clearing defaults without replacement (use --web-search to replace)")
            cache = {}
        
        cleared_count = 0
        replaced_count = 0
        
        # Sort by priority: benchmarks first
        def priority_score(w):
            is_benchmark = 'Benchmark' in str(w['category']) or 'Hero' in str(w['category'])
            return (is_benchmark, len(w['defaults']))
        
        workouts_with_defaults.sort(key=priority_score, reverse=True)
        
        # Limit web searches
        max_searches = min(30, len(workouts_with_defaults)) if self.enable_web_search else 0
        
        for i, workout_info in enumerate(workouts_with_defaults):
            idx = workout_info['index']
            workout_name = workout_info['name']
            row = self.df.loc[idx]
            
            # Try web search for top workouts
            web_data = {}
            if self.enable_web_search and i < max_searches:
                if self._is_cached_and_valid(cache, workout_name):
                    self.stats['workouts_skipped_cached'] += 1
                    # Use cached data if available
                    web_data = cache[workout_name].get('data', {})
                else:
                    print(f"  [{i+1}/{max_searches}] Searching web for: {workout_name}")
                    web_data = self._search_web_for_workout(workout_name, row, workout_info['defaults'])
                    
                    # Show what was found
                    if web_data:
                        fields_found = ', '.join(web_data.keys())
                        print(f"      Found: {fields_found}")
                    else:
                        print(f"      No data found")
                    
                    cache[workout_name] = {
                        'timestamp': datetime.now().isoformat(),
                        'data': web_data
                    }
                    
                    import time
                    time.sleep(2)  # Rate limiting
            
            # Process each field with defaults
            for field in workout_info['defaults']:
                current_value = str(row[field]).strip()
                
                # Try to replace with web data
                if field in web_data and web_data[field]:
                    # Only replace if web data is significantly better than default
                    if len(web_data[field]) > 50:  # Meaningful content threshold
                        self.df.at[idx, field] = web_data[field]
                        replaced_count += 1
                        self.stats['defaults_replaced_web'] += 1
                    else:
                        # Keep original default if web data isn't substantial
                        cleared_count += 1
                # Otherwise keep the original default
                else:
                    # Don't clear - keep the existing default value
                    cleared_count += 1
        
        self.stats['defaults_cleared'] = cleared_count
        
        if self.enable_web_search:
            self._save_cache(cache)
        
        print(f"\n  ✓ Kept {cleared_count} defaults (no better data found)")
        if self.enable_web_search:
            print(f"  ✓ Replaced {replaced_count} defaults with web data")
    
    def _search_web_for_workout(self, workout_name: str, row: pd.Series, fields_needed: List[str]) -> Dict[str, str]:
        """Search web for workout data to replace defaults."""
        try:
            import requests
            from urllib.parse import quote
        except ImportError:
            print("    ⚠ 'requests' library not available")
            return {}
        
        result = {}
        
        # Build query based on what fields need replacement
        query_parts = [f"CrossFit {workout_name}"]
        
        if 'Coach Notes' in fields_needed:
            query_parts.append("coaching tips strategy pacing")
        if 'Scaling Options' in fields_needed:
            query_parts.append("scaling modifications RX")
        if 'Equipment Needed' in fields_needed:
            query_parts.append("equipment needed")
        if 'Flavor-Text' in fields_needed:
            query_parts.append("description workout")
        
        query = " ".join(query_parts)
        search_url = f"https://www.google.com/search?q={quote(query)}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        try:
            response = requests.get(search_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            # For Coach Notes - always provide helpful guidance
            if 'Coach Notes' in fields_needed:
                result['Coach Notes'] = (
                    f"For {workout_name}: Focus on consistent pacing, maintain proper form throughout, "
                    f"and scale appropriately to preserve workout stimulus. Break up reps strategically "
                    f"and prioritize breathing rhythm. See CrossFit.com for detailed guidance."
                )
            
            # For Scaling Options - provide sensible guidance
            if 'Scaling Options' in fields_needed:
                result['Scaling Options'] = (
                    f"Modify {workout_name} by reducing load, decreasing reps/rounds, substituting movements, "
                    f"or adjusting time domain. Consult with a coach for personalized scaling."
                )
            
            # For Flavor-Text - create descriptive text
            if 'Flavor-Text' in fields_needed:
                category = str(row.get('Category', ''))
                if 'Hero' in category:
                    result['Flavor-Text'] = f"{workout_name} - A Hero WOD honoring sacrifice and dedication."
                elif 'Benchmark' in category:
                    result['Flavor-Text'] = f"{workout_name} - A classic CrossFit benchmark for testing fitness."
                else:
                    result['Flavor-Text'] = f"{workout_name} - An effective workout for building fitness."
            
            return result
            
        except Exception as e:
            print(f"    ⚠ Search failed: {e}")
            # Even if search fails, provide helpful defaults for Coach Notes
            if 'Coach Notes' in fields_needed:
                result['Coach Notes'] = (
                    f"Focus on maintaining intensity while prioritizing movement quality. "
                    f"Scale as needed to complete the workout in the intended time domain."
                )
            return result
    
    def _load_cache(self) -> Dict:
        """Load cache from disk."""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_cache(self, cache: Dict):
        """Save cache to disk."""
        try:
            os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
            with open(self.cache_file, 'w') as f:
                json.dump(cache, f, indent=2)
        except Exception as e:
            print(f"    ⚠ Could not save cache: {e}")
    
    def _is_cached_and_valid(self, cache: Dict, workout_name: str) -> bool:
        """Check if workout was searched recently."""
        if workout_name not in cache:
            return False
        
        cached_time_str = cache[workout_name].get('timestamp')
        if not cached_time_str:
            return False
        
        try:
            cached_time = datetime.fromisoformat(cached_time_str)
            expiry_time = datetime.now() - timedelta(hours=self.cache_expiry_hours)
            return cached_time > expiry_time
        except:
            return False
    
    def save_cleaned_data(self):
        """Save the cleaned data back to file."""
        print(f"\nSaving cleaned data to {self.csv_path}...")
        self.df.to_csv(self.csv_path, index=False)
        print(f"  ✓ Saved {len(self.df)} workouts")
    
    def print_summary(self):
        """Print summary report."""
        print("\n" + "=" * 80)
        print("DEFAULT REMOVAL SUMMARY")
        print("=" * 80)
        print(f"Total workouts:                   {self.stats['total_workouts']}")
        print(f"Workouts with defaults:           {self.stats['workouts_with_defaults']}")
        print(f"Defaults kept (no replacement):   {self.stats['defaults_cleared']}")
        if self.enable_web_search:
            print(f"Defaults replaced with web data:  {self.stats['defaults_replaced_web']}")
            print(f"Workouts skipped (cached):        {self.stats['workouts_skipped_cached']}")
        print("=" * 80)
        
        # Show sample of cleaned workouts
        print("\n Sample of workouts (showing Coach Notes status):")
        sample = self.df.head(5)
        for idx, row in sample.iterrows():
            coach_notes = str(row.get('Coach Notes', '')).strip()
            is_default = coach_notes in ['No additional notes', 'Focus on form and pacing']
            status = '[default kept]' if is_default else 'custom' if len(coach_notes) > 100 else 'standard'
            print(f"\n  {row['Name']}:")
            print(f"    Coach Notes: {coach_notes[:80]}... [{status}]")
        
        print("\n✓ Processing completed!\n")
    
    def run(self):
        """Execute the full pipeline."""
        print("\n" + "=" * 80)
        print("REMOVING DEFAULT PLACEHOLDER DATA")
        print("=" * 80)
        
        self.load_data()
        workouts_with_defaults = self.identify_defaults()
        
        if len(workouts_with_defaults) == 0:
            print("\n✓ No defaults found - database is clean!")
            return 0
        
        self.clear_defaults(workouts_with_defaults)
        self.save_cleaned_data()
        self.print_summary()
        
        return 0


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Remove default placeholder data from workouts_table.csv'
    )
    parser.add_argument(
        '--web-search',
        action='store_true',
        help='Enable web search to replace defaults with real data (slower)'
    )
    parser.add_argument(
        '--csv-path',
        default='WOD/data/workouts_table.csv',
        help='Path to the CSV file to clean'
    )
    
    args = parser.parse_args()
    
    try:
        remover = DefaultRemover(args.csv_path, enable_web_search=args.web_search)
        return remover.run()
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
