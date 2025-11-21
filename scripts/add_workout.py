#!/usr/bin/env python3
"""
Add a new workout to workouts_table.csv.

Usage:
    # Interactive mode (prompts for all fields)
    python scripts/add_workout.py
    
    # Quick add with required fields
    python scripts/add_workout.py --name "Murph" --category "Hero WOD" --instructions "1 mile run, 100 pull-ups, 200 push-ups, 300 squats, 1 mile run"
"""

import pandas as pd
import sys
import argparse
import requests
import time
import random
from typing import Dict, Optional


class WorkoutAdder:
    """Add new workouts to the database."""
    
    def __init__(self, csv_path: str = 'WOD/data/workouts_table.csv'):
        self.csv_path = csv_path
        self.df = None
        
        # Column definitions with defaults
        self.columns = {
            'WorkoutID': None,  # Auto-generated
            'Name': None,  # Required
            'Category': 'General',
            'Format & Duration': 'For Time',
            'Instructions': None,  # Required
            'Equipment Needed': 'Bodyweight',
            'Muscle Groups': 'Full Body',
            'Training Goals': 'General Fitness',
            'Level': 'Intermediate',
            'Scaling Options': 'Scale as needed',
            'Score Type': 'Time',
            'Coach Notes': 'Focus on form and pacing',
            'Flavor-Text': 'A challenging workout'
        }
        
        # Random value pools for generating creative defaults
        self.random_pools = {
            'Category': ['General', 'Strength', 'Endurance', 'Partner', 'Competition', 'Gymnastics'],
            'Format & Duration': ['For Time', 'AMRAP 10', 'AMRAP 15', 'AMRAP 20', 'EMOM 12', 'EMOM 16', 'Tabata', '5 Rounds', '3 Rounds', 'Chipper'],
            'Equipment Needed': ['Bodyweight', 'Barbell', 'Dumbbell', 'Kettlebell', 'Pull-up Bar', 'Rower', 'Assault Bike', 'Jump Rope', 'Box', 'Wall Ball'],
            'Muscle Groups': ['Full Body', 'Upper Body', 'Lower Body', 'Core', 'Legs, Core', 'Push, Pull', 'Posterior Chain', 'Hips, Legs'],
            'Training Goals': ['General Fitness', 'Strength', 'Endurance', 'Power', 'Cardio', 'Muscular Endurance', 'Strength Endurance', 'Speed', 'Agility'],
            'Level': ['Beginner', 'Intermediate', 'Advanced'],
            'Score Type': ['Time', 'Reps', 'Rounds', 'Rounds + Reps', 'Load', 'Distance'],
        }
    
    def get_random_value(self, field: str) -> str:
        """Get a random value for a field from the pool."""
        if field in self.random_pools:
            return random.choice(self.random_pools[field])
        return self.columns.get(field, '')
    
    def search_web_for_new_workouts(self, count: int = 10) -> list:
        """Search the web for actual CrossFit workouts to add."""
        print(f"\n🔍 Searching web for {count} CrossFit workouts...")
        
        workouts_found = []
        
        # Common CrossFit workout names to search for
        # Benchmark "Girls" - Classic CrossFit Benchmarks
        benchmark_workouts = [
            'Fran', 'Grace', 'Diane', 'Elizabeth', 'Helen', 'Cindy', 'Mary', 'Nancy',
            'Annie', 'Kelly', 'Eva', 'Jackie', 'Karen', 'Lynne', 'Nicole', 'Amanda',
            'Angie', 'Barbara', 'Chelsea', 'Christine', 'Isabel', 'Linda', 'Candy',
            'Erin', 'Gwen', 'Helga', 'Hope', 'Lauren', 'Maggie', 'Margaret'
        ]
        
        # Hero WODs - Honoring Fallen Heroes (100+ workouts)
        hero_workouts = [
            'Murph', 'DT', 'Michael', 'JT', 'Daniel', 'Jason', 'Badger', 'Griff',
            'Randy', 'Josh', 'Tommy', 'Nate', 'Blake', 'Collin', 'Hansen', 'Jag 28',
            'Nutts', 'McGhee', 'Luce', 'Holbrook', 'Wilmot', 'Arnie', 'Bull', 'The Seven',
            'Klepto', 'Coe', 'Bulger', 'Morrison', 'Bradshaw', 'Brenton',
            'Alexander', 'Abbate', 'Ace', 'Adam Brown', 'Adrian', 'Alberti', 'Alcatraz',
            'Andes', 'Andy', 'Ariel', 'Armstrong', 'Atkins', 'Barden', 'Barber',
            'Barrett', 'Barry', 'Bartosz', 'Bear', 'Beaver', 'Bell', 'Ben', 'Benton',
            'Bert', 'BK', 'Blaine', 'Blakley', 'Blockbuster', 'Bojanowski', 'Borden',
            'Bohrer', 'Bowie', 'Bragg', 'Brainard', 'Bravo', 'Brehm', 'Brian',
            'Bruckenthal', 'Bull', 'Butcher', 'Carse', 'Chad', 'Champ', 'Childs',
            'Clovis', 'Collins', 'Colt', 'Cooper', 'Curtis', 'Danny', 'Davis', 'Deegan',
            'Desforges', 'Dork', 'Dragon', 'Draper', 'Egan', 'Elrod', 'Elvis', 'Erin',
            'Faulk', 'Fehling', 'Felix', 'Forrest', 'Frank', 'Franklin', 'Garfield',
            'Garrett', 'Giunta', 'Glen', 'Grady', 'Graham', 'Gretchen', 'Grock', 'Gruber',
            'Halo', 'Hamilton', 'Hannah', 'Hatfield', 'Hawk', 'Helton', 'Hidalgo',
            'Hogan', 'Holbrook', 'Holmes', 'Horton', 'Hotaling', 'Hover'
        ]
        
        # Other Named Benchmarks & Games Workouts
        other_benchmarks = [
            'Fight Gone Bad', 'Filthy Fifty', 'King Kong', 'Kalsu', 
            'The Bear', 'Death by Burpees', 'Tabata Something Else',
            # CrossFit Games & Open Workouts
            'Open 11.1', 'Open 11.2', 'Open 11.3', 'Open 11.4', 'Open 11.5',
            'Open 12.1', 'Open 12.2', 'Open 12.3', 'Open 12.4', 'Open 12.5',
            'Open 13.1', 'Open 13.2', 'Open 13.3', 'Open 13.4', 'Open 13.5',
            'Open 14.1', 'Open 14.2', 'Open 14.3', 'Open 14.4', 'Open 14.5',
            'Open 15.1', 'Open 15.2', 'Open 15.3', 'Open 15.4', 'Open 15.5',
            'Open 16.1', 'Open 16.2', 'Open 16.3', 'Open 16.4', 'Open 16.5',
            'Open 17.1', 'Open 17.2', 'Open 17.3', 'Open 17.4', 'Open 17.5',
            'Open 18.1', 'Open 18.2', 'Open 18.3', 'Open 18.4', 'Open 18.5',
            'Open 19.1', 'Open 19.2', 'Open 19.3', 'Open 19.4', 'Open 19.5',
            'Open 20.1', 'Open 20.2', 'Open 20.3', 'Open 20.4', 'Open 20.5',
            # Classic Benchmarks
            'The Chief', 'The Outlaw', 'Seven', 'Eleven', 'Twelve Days of Christmas',
            'Heavy Fran', 'Heavy Cindy', 'Heavy Grace', 'Heavy DT',
            'Chelsea', 'Lynne', 'Nicole', 'Annie', 'Amanda Scaled'
        ]
        
        all_known_workouts = benchmark_workouts + hero_workouts + other_benchmarks
        random.shuffle(all_known_workouts)
        
        for workout_name in all_known_workouts[:count]:
            # Check if already exists
            if not self.df[self.df['Name'].str.lower() == workout_name.lower()].empty:
                print(f"  ⊘ Skipping {workout_name} (already exists)")
                continue
            
            # Search for workout details
            print(f"  • Searching for: {workout_name}")
            workout_data = self._fetch_workout_from_web(workout_name)
            
            if workout_data:
                workouts_found.append(workout_data)
                print(f"    ✓ Found details for {workout_name}")
            else:
                print(f"    ⚠ Could not find complete details")
            
            # Rate limiting
            time.sleep(2)
            
            if len(workouts_found) >= count:
                break
        
        return workouts_found
    
    def _fetch_workout_from_web(self, workout_name: str) -> Optional[Dict[str, str]]:
        """Fetch actual workout details from the web."""
        try:
            # Try multiple authoritative sources
            sources_to_check = [
                f"https://www.crossfit.com/workout/{workout_name.lower()}",
                f"https://wodwell.com/wod/{workout_name.lower()}/",
                f"https://beyondthewhiteboard.com/gyms/crossfit-workouts",
            ]
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            # First try direct CrossFit.com URL
            try:
                response = requests.get(sources_to_check[0], headers=headers, timeout=10)
                if response.status_code == 200:
                    text = response.text.lower()
                    print(f"    ℹ Found on CrossFit.com")
                else:
                    # Fall back to Google search
                    query = f"{workout_name} crossfit workout instructions"
                    search_url = f"https://www.google.com/search?q={requests.utils.quote(query)}"
                    response = requests.get(search_url, headers=headers, timeout=10)
                    response.raise_for_status()
                    text = response.text.lower()
                    print(f"    ℹ Using Google search results")
            except:
                # Fall back to Google search
                query = f"{workout_name} crossfit workout instructions site:crossfit.com OR site:wodwell.com"
                search_url = f"https://www.google.com/search?q={requests.utils.quote(query)}"
                response = requests.get(search_url, headers=headers, timeout=10)
                response.raise_for_status()
                text = response.text.lower()
                print(f"    ℹ Using Google search results")
            
            # Build workout data
            workout_data = {
                'Name': workout_name,
                'Instructions': self._extract_instructions(text, workout_name),
            }
            
            # Detect Category
            if 'hero' in text and ('wod' in text or 'memorial' in text or 'fallen' in text):
                workout_data['Category'] = 'Hero WOD'
            elif 'benchmark' in text or 'girl' in text or ('classic' in text and 'crossfit' in text):
                workout_data['Category'] = 'Benchmark'
            else:
                workout_data['Category'] = 'General'
            
            # Detect Format
            if 'for time' in text:
                workout_data['Format & Duration'] = 'For Time'
            elif 'amrap' in text:
                if '20 minute' in text or '20-minute' in text:
                    workout_data['Format & Duration'] = 'AMRAP 20'
                elif '10 minute' in text or '10-minute' in text:
                    workout_data['Format & Duration'] = 'AMRAP 10'
                else:
                    workout_data['Format & Duration'] = 'AMRAP'
            elif 'emom' in text:
                workout_data['Format & Duration'] = 'EMOM'
            elif 'rounds' in text:
                workout_data['Format & Duration'] = '5 Rounds For Time'
            else:
                workout_data['Format & Duration'] = 'For Time'
            
            # Detect Level
            if 'advanced' in text or 'elite' in text or 'difficult' in text:
                workout_data['Level'] = 'Advanced'
            elif 'beginner' in text or 'scaled' in text:
                workout_data['Level'] = 'Beginner'
            else:
                workout_data['Level'] = 'Intermediate'
            
            # Detect Equipment
            equipment_list = []
            equipment_keywords = {
                'barbell': 'Barbell',
                'dumbbell': 'Dumbbell',
                'kettlebell': 'Kettlebell',
                'pull-up': 'Pull-up Bar',
                'pullup': 'Pull-up Bar',
                'box jump': 'Box',
                'rower': 'Rower',
                'rowing': 'Rower',
                'assault bike': 'Assault Bike',
                'bike': 'Assault Bike',
                'jump rope': 'Jump Rope',
                'double under': 'Jump Rope',
                'wall ball': 'Wall Ball',
                'rings': 'Rings',
                'muscle-up': 'Rings',
                'ghd': 'GHD Machine'
            }
            
            for keyword, equipment in equipment_keywords.items():
                if keyword in text and equipment not in equipment_list:
                    equipment_list.append(equipment)
            
            if equipment_list:
                workout_data['Equipment Needed'] = ', '.join(equipment_list[:5])
            elif 'bodyweight' in text or 'no equipment' in text:
                workout_data['Equipment Needed'] = 'Bodyweight'
            else:
                workout_data['Equipment Needed'] = 'Various'
            
            # Set other fields based on category
            workout_data['Muscle Groups'] = 'Full Body'
            workout_data['Training Goals'] = 'General Fitness'
            
            if workout_data['Category'] == 'Hero WOD':
                workout_data['Coach Notes'] = f"For {workout_name}: Honor the sacrifice this workout represents. Focus on consistent pacing and maintain proper form throughout."
                workout_data['Flavor-Text'] = f"{workout_name} - A Hero WOD honoring fallen heroes."
                workout_data['Training Goals'] = 'Endurance, Mental Toughness'
            elif workout_data['Category'] == 'Benchmark':
                workout_data['Coach Notes'] = f"For {workout_name}: This is a classic benchmark. Focus on efficient movement and smart pacing."
                workout_data['Flavor-Text'] = f"{workout_name} - A classic CrossFit benchmark workout."
                workout_data['Training Goals'] = 'Benchmark Testing'
            else:
                workout_data['Coach Notes'] = f"For {workout_name}: Maintain consistent effort and prioritize movement quality."
                workout_data['Flavor-Text'] = f"{workout_name} - An effective CrossFit workout."
            
            # Set Scaling Options based on format
            if 'For Time' in workout_data['Format & Duration']:
                workout_data['Scaling Options'] = 'Reduce reps, lighten load, or set time cap at 20 minutes.'
            elif 'AMRAP' in workout_data['Format & Duration']:
                workout_data['Scaling Options'] = 'Reduce reps per round or substitute movements as needed.'
            else:
                workout_data['Scaling Options'] = 'Scale load and reps to maintain movement quality.'
            
            workout_data['Score Type'] = 'Time' if 'For Time' in workout_data['Format & Duration'] else 'Rounds + Reps'
            
            return workout_data
            
        except Exception as e:
            print(f"    ⚠ Error fetching {workout_name}: {e}")
            return None
    
    def _extract_instructions(self, text: str, workout_name: str) -> str:
        """Try to extract actual workout instructions from web content."""
        # Look for common instruction patterns
        # Pattern 1: "X rounds for time:" or "AMRAP X minutes:"
        import re
        
        # Try to find workout format markers
        patterns = [
            r'(\d+\s+rounds?\s+for\s+time[:\s]+[^<]+)',
            r'(amrap\s+\d+[^<]+)',
            r'(for\s+time[:\s]+[^<]+)',
            r'(emom\s+\d+[^<]+)',
            r'(\d+-\d+-\d+[^<]+)',  # Rep schemes like 21-15-9
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                instructions = match.group(1)
                # Clean up HTML and extra whitespace
                instructions = re.sub(r'<[^>]+>', '', instructions)
                instructions = re.sub(r'\s+', ' ', instructions).strip()
                if len(instructions) > 20 and len(instructions) < 500:
                    return instructions[:300]  # Cap at 300 chars
        
        # Fallback to generic message
        return f"See CrossFit.com for official {workout_name} workout instructions and standards."
    
    def search_web_for_workout(self, workout_name: str) -> Optional[Dict[str, str]]:
        """Search the web for workout information and generate helpful content."""
        print(f"\n🔍 Searching web for '{workout_name}'...")
        
        try:
            # Construct search query
            query = f"{workout_name} crossfit workout description equipment"
            search_url = f"https://www.google.com/search?q={requests.utils.quote(query)}"
            
            # Set headers to mimic browser
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            # Make request
            response = requests.get(search_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            text = response.text.lower()
            
            # Extract potential information
            web_data = {}
            
            # Detect Category
            if 'hero' in text and 'wod' in text:
                web_data['Category'] = 'Hero WOD'
            elif 'benchmark' in text or 'girl' in text:
                web_data['Category'] = 'Benchmark'
            elif 'partner' in text:
                web_data['Category'] = 'Partner'
            
            # Detect Format
            if 'for time' in text:
                web_data['Format & Duration'] = 'For Time'
            elif 'amrap' in text:
                web_data['Format & Duration'] = 'AMRAP'
            elif 'emom' in text:
                web_data['Format & Duration'] = 'EMOM'
            elif 'tabata' in text:
                web_data['Format & Duration'] = 'Tabata'
            
            # Detect Level
            if 'advanced' in text or 'elite' in text or 'rx' in text:
                web_data['Level'] = 'Advanced'
            elif 'beginner' in text or 'scaled' in text or 'novice' in text:
                web_data['Level'] = 'Beginner'
            else:
                web_data['Level'] = 'Intermediate'
            
            # Detect Equipment
            equipment_list = []
            equipment_keywords = {
                'barbell': 'Barbell',
                'dumbbell': 'Dumbbell',
                'kettlebell': 'Kettlebell',
                'pull-up bar': 'Pull-up Bar',
                'pullup bar': 'Pull-up Bar',
                'pull up': 'Pull-up Bar',
                'box': 'Box',
                'rower': 'Rower',
                'bike': 'Assault Bike',
                'rope': 'Jump Rope',
                'wall ball': 'Wall Ball',
                'rings': 'Rings',
                'ghd': 'GHD Machine'
            }
            
            for keyword, equipment in equipment_keywords.items():
                if keyword in text and equipment not in equipment_list:
                    equipment_list.append(equipment)
            
            if equipment_list:
                web_data['Equipment Needed'] = ', '.join(equipment_list[:5])
            elif 'bodyweight' in text or 'no equipment' in text:
                web_data['Equipment Needed'] = 'Bodyweight'
            
            # Generate helpful Coach Notes
            category = web_data.get('Category', 'workout')
            coach_notes_parts = []
            
            if 'Hero' in category:
                coach_notes_parts.append(f"For {workout_name}: Honor the sacrifice this workout represents.")
            else:
                coach_notes_parts.append(f"For {workout_name}:")
            
            coach_notes_parts.append("Focus on consistent pacing and proper form.")
            
            if web_data.get('Level') == 'Advanced':
                coach_notes_parts.append("This is an advanced workout - scale appropriately.")
            elif web_data.get('Level') == 'Beginner':
                coach_notes_parts.append("Great for beginners - focus on mechanics first.")
            
            coach_notes_parts.append("Break up reps strategically and maintain breathing rhythm.")
            
            web_data['Coach Notes'] = ' '.join(coach_notes_parts)
            
            # Generate Flavor Text
            if 'Hero' in category:
                web_data['Flavor-Text'] = f"{workout_name} - A Hero WOD honoring sacrifice and dedication."
            elif 'Benchmark' in category:
                web_data['Flavor-Text'] = f"{workout_name} - A classic CrossFit benchmark for testing fitness."
            else:
                web_data['Flavor-Text'] = f"{workout_name} - An effective workout for building fitness and capacity."
            
            # Generate Scaling Options if format detected
            if web_data.get('Format & Duration'):
                format_type = web_data['Format & Duration']
                if 'Time' in format_type:
                    web_data['Scaling Options'] = "Reduce reps, lighten load, or modify movements to complete within reasonable time cap."
                elif 'AMRAP' in format_type:
                    web_data['Scaling Options'] = "Reduce reps per round, lighten load, or substitute movements as needed."
                elif 'EMOM' in format_type:
                    web_data['Scaling Options'] = "Reduce reps to allow adequate rest, lighten load, or extend interval time."
            
            if web_data:
                print(f"  ✓ Generated {len(web_data)} field(s) from web analysis")
                for key, value in web_data.items():
                    display_value = value if len(str(value)) <= 60 else str(value)[:60] + '...'
                    print(f"    - {key}: {display_value}")
                return web_data
            else:
                print("  ℹ No specific workout data found - will use defaults")
                return None
                
        except requests.RequestException as e:
            print(f"  ⚠ Web search failed: {e}")
            print(f"  ℹ Will use default values")
            return None
        except Exception as e:
            print(f"  ⚠ Error during search: {e}")
            print(f"  ℹ Will use default values")
            return None
        
    def load_data(self) -> None:
        """Load the CSV file."""
        print(f"Loading data from {self.csv_path}...")
        self.df = pd.read_csv(self.csv_path, low_memory=False)
        print(f"  ✓ Loaded {len(self.df)} workouts")
        
    def get_next_workout_id(self) -> int:
        """Generate the next WorkoutID."""
        if self.df is None or len(self.df) == 0:
            return 1
        
        # Get max ID and add 1
        max_id = self.df['WorkoutID'].max()
        return int(max_id) + 1
        
    def check_duplicate_name(self, name: str, allow_override: bool = False) -> bool:
        """Check if workout name already exists. Returns True if duplicate exists."""
        if self.df is None:
            return False
        
        existing = self.df[self.df['Name'].str.lower() == name.lower()]
        if len(existing) > 0:
            print(f"\n✗ Error: A workout named '{name}' already exists!")
            print(f"   WorkoutID: {existing.iloc[0]['WorkoutID']}")
            print(f"   Category: {existing.iloc[0].get('Category', 'N/A')}")
            print(f"   Level: {existing.iloc[0].get('Level', 'N/A')}")
            if not allow_override:
                print("\n   To update this workout, use: python scripts/update_workout.py")
            return True
        return False
        
    def interactive_input(self, enable_web_search: bool = True, use_random: bool = False) -> Dict[str, str]:
        """Prompt user for workout details interactively."""
        print("\n" + "=" * 80)
        print("ADD NEW WORKOUT - Interactive Mode")
        print("=" * 80)
        print("\nPress Enter to use default values shown in [brackets]")
        print("Type 'cancel' at any prompt to abort")
        if use_random:
            print("Type 'random' at any prompt to get a random suggestion\n")
        else:
            print()
        
        workout = {}
        web_data = {}
        
        # Required fields
        while True:
            name = input("Workout Name (required): ").strip()
            if name.lower() == 'cancel':
                return None
            if not name:
                print("  ✗ Name is required")
                continue
            if self.check_duplicate_name(name, allow_override=False):
                # Duplicate found - don't allow override in interactive mode
                continue
            workout['Name'] = name
            
            # Offer to search web
            if enable_web_search:
                search = input("\nSearch web for workout details? (yes/no) [yes]: ").strip().lower()
                if search in ['', 'y', 'yes']:
                    web_data = self.search_web_for_workout(name) or {}
            
            break
        
        while True:
            instructions = input("\nInstructions (required): ").strip()
            if instructions.lower() == 'cancel':
                return None
            if not instructions:
                print("  ✗ Instructions are required")
                continue
            workout['Instructions'] = instructions
            break
        
        # Optional fields with defaults (use web data if available, or random if requested)
        print("\n--- Optional Fields (press Enter to use defaults")
        if use_random:
            print("    or type 'random' for a random suggestion) ---\n")
        else:
            print(") ---\n")
        
        default_category = web_data.get('Category', self.columns['Category'])
        category = input(f"Category [{default_category}]: ").strip()
        if category.lower() == 'random':
            category = self.get_random_value('Category')
            print(f"  🎲 Random: {category}")
        workout['Category'] = category if category else default_category
        
        default_format = web_data.get('Format & Duration', self.columns['Format & Duration'])
        format_duration = input(f"Format & Duration [{default_format}]: ").strip()
        if format_duration.lower() == 'random':
            format_duration = self.get_random_value('Format & Duration')
            print(f"  🎲 Random: {format_duration}")
        workout['Format & Duration'] = format_duration if format_duration else default_format
        
        default_equipment = web_data.get('Equipment Needed', self.columns['Equipment Needed'])
        equipment = input(f"Equipment Needed [{default_equipment}]: ").strip()
        if equipment.lower() == 'random':
            equipment = self.get_random_value('Equipment Needed')
            print(f"  🎲 Random: {equipment}")
        workout['Equipment Needed'] = equipment if equipment else default_equipment
        
        muscle_groups = input(f"Muscle Groups [{self.columns['Muscle Groups']}]: ").strip()
        if muscle_groups.lower() == 'random':
            muscle_groups = self.get_random_value('Muscle Groups')
            print(f"  🎲 Random: {muscle_groups}")
        workout['Muscle Groups'] = muscle_groups if muscle_groups else self.columns['Muscle Groups']
        
        training_goals = input(f"Training Goals [{self.columns['Training Goals']}]: ").strip()
        if training_goals.lower() == 'random':
            training_goals = self.get_random_value('Training Goals')
            print(f"  🎲 Random: {training_goals}")
        workout['Training Goals'] = training_goals if training_goals else self.columns['Training Goals']
        
        default_level = web_data.get('Level', self.columns['Level'])
        level = input(f"Difficulty Level [{default_level}]: ").strip()
        if level.lower() == 'random':
            level = self.get_random_value('Level')
            print(f"  🎲 Random: {level}")
        workout['Level'] = level if level else default_level
        
        scaling = input(f"Scaling Options [{self.columns['Scaling Options']}]: ").strip()
        workout['Scaling Options'] = scaling if scaling else self.columns['Scaling Options']
        
        score_type = input(f"Score Type [{self.columns['Score Type']}]: ").strip()
        if score_type.lower() == 'random':
            score_type = self.get_random_value('Score Type')
            print(f"  🎲 Random: {score_type}")
        workout['Score Type'] = score_type if score_type else self.columns['Score Type']
        
        coach_notes = input(f"Coach Notes [{self.columns['Coach Notes']}]: ").strip()
        workout['Coach Notes'] = coach_notes if coach_notes else self.columns['Coach Notes']
        
        flavor_text = input(f"Flavor Text [{self.columns['Flavor-Text']}]: ").strip()
        workout['Flavor-Text'] = flavor_text if flavor_text else self.columns['Flavor-Text']
        
        return workout
        
    def add_workout(self, workout_data: Dict[str, str], silent: bool = False) -> bool:
        """Add a new workout to the database."""
        if workout_data is None:
            print("\n✗ Operation cancelled")
            return False
        
        # Validate required fields
        if not workout_data.get('Name'):
            print("\n✗ Error: Name is required")
            return False
        if not workout_data.get('Instructions'):
            print("\n✗ Error: Instructions are required")
            return False
        
        # Generate WorkoutID
        next_id = self.get_next_workout_id()
        workout_data['WorkoutID'] = next_id
        
        # Fill in any missing fields with defaults
        for col, default in self.columns.items():
            if col not in workout_data or workout_data[col] is None:
                workout_data[col] = default if default is not None else ''
        
        # Create DataFrame with single row
        new_row = pd.DataFrame([workout_data])
        
        # Append to existing data
        self.df = pd.concat([self.df, new_row], ignore_index=True)
        
        if not silent:
            print("\n" + "=" * 80)
            print("NEW WORKOUT ADDED")
            print("=" * 80)
            print(f"WorkoutID:     {next_id}")
            print(f"Name:          {workout_data['Name']}")
            print(f"Category:      {workout_data['Category']}")
            print(f"Level:         {workout_data['Level']}")
            print(f"Instructions:  {workout_data['Instructions'][:80]}...")
            print("=" * 80)
        
        return True
        
    def save_data(self) -> None:
        """Save the updated data back to the CSV file."""
        print(f"\nSaving to {self.csv_path}...")
        self.df.to_csv(self.csv_path, index=False)
        print(f"  ✓ Saved {len(self.df)} workouts")
    
    def batch_add_workouts(self, count: int = 5, enable_web_search: bool = True) -> int:
        """Add multiple workouts in batch mode."""
        print("\n" + "=" * 80)
        print(f"BATCH ADD MODE - Adding up to {count} workouts")
        print("=" * 80)
        print("Type 'done' at any workout name prompt to finish early")
        print("Type 'cancel' to abort the entire batch\n")
        
        added_count = 0
        workout_list = []
        should_break = False
        
        for i in range(count):
            if should_break:
                break
                
            print(f"\n--- Workout {i+1} of {count} ---")
            
            # Get workout name
            while True:
                name = input(f"\nWorkout Name (required) [or 'done'/'cancel']: ").strip()
                
                if name.lower() == 'cancel':
                    print("\n✗ Batch operation cancelled")
                    return 0
                    
                if name.lower() == 'done':
                    if added_count == 0:
                        print("\n✗ No workouts added yet. Use 'cancel' to abort.")
                        continue
                    print(f"\n✓ Finishing early after queuing {added_count} workout(s)")
                    should_break = True
                    break
                
                if not name:
                    print("  ✗ Name is required")
                    continue
                    
                if self.check_duplicate_name(name, allow_override=False):
                    continue
                    
                break
            
            # Check if we should break out
            if should_break:
                break
            
            # Get instructions
            instructions = input("Instructions (required): ").strip()
            if not instructions:
                print("  ✗ Instructions required - skipping this workout")
                continue
            
            # Web search option
            web_data = {}
            if enable_web_search:
                search = input("Search web? (yes/no) [yes]: ").strip().lower()
                if search in ['', 'y', 'yes']:
                    web_data = self.search_web_for_workout(name) or {}
            
            # Quick mode - just essential fields
            print("\nQuick fields (press Enter for defaults):")
            category = input(f"  Category [{web_data.get('Category', self.columns['Category'])}]: ").strip()
            level = input(f"  Level [{web_data.get('Level', self.columns['Level'])}]: ").strip()
            equipment = input(f"  Equipment [{web_data.get('Equipment Needed', self.columns['Equipment Needed'])}]: ").strip()
            
            # Build workout data
            workout_data = {
                'Name': name,
                'Instructions': instructions,
                'Category': category or web_data.get('Category', self.columns['Category']),
                'Format & Duration': web_data.get('Format & Duration', self.columns['Format & Duration']),
                'Equipment Needed': equipment or web_data.get('Equipment Needed', self.columns['Equipment Needed']),
                'Muscle Groups': self.columns['Muscle Groups'],
                'Training Goals': self.columns['Training Goals'],
                'Level': level or web_data.get('Level', self.columns['Level']),
                'Scaling Options': self.columns['Scaling Options'],
                'Score Type': self.columns['Score Type'],
                'Coach Notes': self.columns['Coach Notes'],
                'Flavor-Text': self.columns['Flavor-Text']
            }
            
            # Add to list
            workout_list.append(workout_data)
            added_count += 1
            print(f"  ✓ Queued: {name}")
            
            # Check if done early
            if name.lower() == 'done':
                break
        
        if added_count == 0:
            print("\n✗ No workouts to add")
            return 0
        
        # Add all workouts
        print(f"\n{'=' * 80}")
        print(f"Adding {added_count} workout(s) to database...")
        print(f"{'=' * 80}")
        
        for workout_data in workout_list:
            success = self.add_workout(workout_data, silent=True)
            if success:
                print(f"  ✓ Added: {workout_data['Name']} (ID: {workout_data.get('WorkoutID', 'pending')})")
            else:
                print(f"  ✗ Failed: {workout_data['Name']}")
        
        self.save_data()
        return added_count


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Add a new workout to workouts_table.csv',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Interactive mode (single workout)
  python scripts/add_workout.py
  
  # Search web and auto-add 10 actual CrossFit workouts
  python scripts/add_workout.py --search-add 10
  
  # Search web and auto-add 5 workouts
  python scripts/add_workout.py --search-add 5
  
  # Batch mode - add 5 workouts manually
  python scripts/add_workout.py --batch 5
  
  # Quick add with minimal fields
  python scripts/add_workout.py --name "Murph" --instructions "1 mile run, 100 pull-ups, 200 push-ups, 300 squats, 1 mile run"
  
  # Add with web search
  python scripts/add_workout.py --name "Annie" --instructions "50-40-30-20-10 double unders and sit-ups" --web-search
        """
    )
    
    parser.add_argument('--name', help='Workout name (required)')
    parser.add_argument('--instructions', help='Workout instructions (required)')
    parser.add_argument('--category', help='Category (default: General)')
    parser.add_argument('--format', help='Format & Duration (default: For Time)')
    parser.add_argument('--equipment', help='Equipment needed (default: Bodyweight)')
    parser.add_argument('--muscles', help='Muscle groups (default: Full Body)')
    parser.add_argument('--goals', help='Training goals (default: General Fitness)')
    parser.add_argument('--level', help='Difficulty level (default: Intermediate)')
    parser.add_argument('--scaling', help='Scaling options')
    parser.add_argument('--score', help='Score type (default: Time)')
    parser.add_argument('--notes', help='Coach notes')
    parser.add_argument('--flavor', help='Flavor text')
    parser.add_argument('--web-search', action='store_true', 
                        help='Search web for workout details (command line mode)')
    parser.add_argument('--random', action='store_true',
                        help='Enable random suggestions in interactive mode')
    parser.add_argument('--batch', type=int, metavar='N',
                        help='Batch mode: add N workouts interactively (default: 5)')
    parser.add_argument('--search-add', type=int, metavar='N',
                        help='Search web for N actual workouts and add them automatically')
    parser.add_argument('--csv-path', default='WOD/data/workouts_table.csv', 
                        help='Path to the CSV file')
    
    args = parser.parse_args()
    
    try:
        adder = WorkoutAdder(args.csv_path)
        adder.load_data()
        
        # Check for search-add mode
        if args.search_add:
            count = args.search_add if args.search_add > 0 else 10
            print(f"\n{'=' * 80}")
            print(f"AUTOMATIC WEB SEARCH MODE")
            print(f"{'=' * 80}")
            print(f"Searching for {count} actual CrossFit workouts online...\n")
            
            workouts_found = adder.search_web_for_new_workouts(count=count)
            
            if not workouts_found:
                print("\n✗ No new workouts found to add")
                return 1
            
            print(f"\n{'=' * 80}")
            print(f"Found {len(workouts_found)} workout(s) - Adding to database...")
            print(f"{'=' * 80}\n")
            
            added_count = 0
            for workout_data in workouts_found:
                success = adder.add_workout(workout_data, silent=True)
                if success:
                    added_count += 1
                    print(f"  ✓ Added: {workout_data['Name']} (Category: {workout_data.get('Category', 'N/A')})")
            
            if added_count > 0:
                adder.save_data()
                print(f"\n✓ Successfully added {added_count} workout(s)!\n")
                return 0
            else:
                print("\n✗ No workouts were added")
                return 1
        
        # Check for batch mode
        if args.batch:
            count = args.batch if args.batch > 0 else 5
            added = adder.batch_add_workouts(count=count, enable_web_search=True)
            if added > 0:
                print(f"\n✓ Successfully added {added} workout(s)!\n")
                return 0
            else:
                return 1
        
        # Check if using command line args or interactive mode
        if args.name and args.instructions:
            # Command line mode
            
            # Check for duplicate first (block if found)
            if adder.check_duplicate_name(args.name, allow_override=False):
                return 1
            
            workout_data = {
                'Name': args.name,
                'Instructions': args.instructions,
                'Category': args.category,
                'Format & Duration': args.format,
                'Equipment Needed': args.equipment,
                'Muscle Groups': args.muscles,
                'Training Goals': args.goals,
                'Level': args.level,
                'Scaling Options': args.scaling,
                'Score Type': args.score,
                'Coach Notes': args.notes,
                'Flavor-Text': args.flavor
            }
            
            # Web search if requested
            if args.web_search:
                web_data = adder.search_web_for_workout(args.name)
                if web_data:
                    # Merge web data (only fill in missing fields)
                    for key, value in web_data.items():
                        if not workout_data.get(key):
                            workout_data[key] = value
                            print(f"  ℹ Using web data for {key}: {value}")
            
        elif args.name or args.instructions:
            print("\n✗ Error: Both --name and --instructions are required when using command line mode")
            print("Run without arguments for interactive mode")
            return 1
        else:
            # Interactive mode
            workout_data = adder.interactive_input(enable_web_search=True, use_random=args.random)
        
        # Add the workout
        success = adder.add_workout(workout_data)
        if success:
            adder.save_data()
            print("\n✓ Workout added successfully!\n")
            return 0
        else:
            return 1
        
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
