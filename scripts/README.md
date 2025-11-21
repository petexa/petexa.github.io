# Workout Management Scripts - User Guide 🏋️

Quick reference for managing the workout database.

---

## 🚀 Quick Commands

### Add Workouts

```bash
# Interactive mode - prompts for all fields
python scripts/add_workout.py

# Auto-search web for 10 actual CrossFit workouts
python scripts/add_workout.py --search-add 10

# Batch mode - add multiple workouts
python scripts/add_workout.py --batch 5

# Command-line mode
python scripts/add_workout.py --name "Helen" --instructions "3 rounds..." --category "Benchmark"

# Enable random suggestions in interactive mode
python scripts/add_workout.py --random
```

### Update Workouts

```bash
# View workout by name
python scripts/update_workout.py --name "Fran" --view

# View by WorkoutID
python scripts/update_workout.py --id 1 --view

# Update a field
python scripts/update_workout.py --name "Fran" --field "Level" --value "Advanced"
```

### Clean Data

```bash
# Remove default placeholder data
python scripts/remove_defaults.py

# Replace defaults with web-searched data
python scripts/remove_defaults.py --web-search
```

### Database Management

```bash
# Check database stats
python -c "import pandas as pd; print(f'Workouts: {len(pd.read_csv(\"WOD/data/workouts_table.csv\"))}')"

# Restore from backup
copy WOD\data\workouts_table.backup.csv WOD\data\workouts_table.csv

# Restore from Git
git checkout WOD/data/workouts_table.csv
```

---

## 📋 What Each Script Does

### `add_workout.py` - Add New Workouts

**Purpose:** Create new workouts with duplicate prevention

**Key Features:**
- **Interactive mode** - Full prompts with defaults
- **Auto web search** - Searches for 200+ known CrossFit workouts (Benchmarks, Hero WODs, Open workouts)
- **Random mode** - Get random suggestions for Category, Format, Equipment, etc.
- **Batch mode** - Add multiple workouts at once
- **Duplicate blocking** - Prevents adding workouts that already exist
- **Web auto-fill** - Searches Google to detect Category, Format, Equipment, Level

**What it does:**
1. Checks if workout name already exists (prevents duplicates)
2. Optionally searches web for workout details
3. Prompts for required fields (Name, Instructions)
4. Prompts for optional fields with sensible defaults
5. Auto-generates WorkoutID
6. Saves to database

**When to use:**
- Adding workouts from online sources
- Building your workout library
- Importing known CrossFit benchmarks

---

### `update_workout.py` - Modify Existing Workouts

**Purpose:** Find and update any field in existing workouts

**Key Features:**
- **Find by name** - Case-insensitive with partial matching
- **Find by ID** - Direct WorkoutID lookup
- **View details** - Display full workout information
- **Update any field** - Modify Category, Level, Instructions, etc.
- **Before/after** - Shows changes made

**What it does:**
1. Searches for workout by name or ID
2. Shows suggestions if multiple matches found
3. Displays current field value
4. Updates with new value
5. Shows before/after comparison
6. Saves changes

**When to use:**
- Fixing typos or errors
- Updating difficulty levels
- Improving instructions
- Adding missing information

---

### `remove_defaults.py` - Clean Placeholder Data

**Purpose:** Identify and remove generic default values

**Key Features:**
- **Detects placeholders** - "No additional notes", "Scale as needed", etc.
- **Shows statistics** - Reports how many workouts have defaults
- **Smart replacement** - Only replaces if web data is substantial (>50 chars)
- **Web search mode** - Attempts to find real data online
- **Caching** - Skips recently searched workouts (24-hour cache)

**What it does:**
1. Scans all 13 fields for default patterns
2. Identifies workouts with placeholder text
3. **Basic mode:** Clears defaults to blank
4. **Web search mode:** Searches web to replace with real data
5. Only replaces if web data is better than default
6. Saves cleaned database

**Common defaults removed:**
- Coach Notes: "No additional notes"
- Scaling Options: "Scale as needed"
- Flavor-Text: "A challenging workout"
- Equipment: "Not specified"

**When to use:**
- After bulk imports with placeholder data
- Improving database quality
- Preparing for public release

---

### `simplify_workouts.py` - Database Restructuring ✅ COMPLETED

**Purpose:** Simplified database from 42 to 13 essential columns

**What it did:**
- Removed 29 computed/redundant columns
- Kept 13 essential fields
- Preserved all 499 workouts
- Created backup of original 42-column version

**13 Essential Columns:**
WorkoutID, Name, Category, Format & Duration, Instructions, Equipment Needed, Muscle Groups, Training Goals, Level, Scaling Options, Score Type, Coach Notes, Flavor-Text

**Status:** One-time migration completed

---

## 📖 Detailed Usage

### add_workout.py - All Modes

#### 1. Interactive Mode (Default)
```bash
python scripts/add_workout.py
```

**Step-by-step:**
1. **Name** (required) - Must be unique
2. **Web search?** (yes/no) - Auto-fill from Google
3. **Instructions** (required) - Main workout description
4. **Category** - Press Enter for default or type custom
5. **Format & Duration** - AMRAP/EMOM/For Time/etc.
6. **Equipment** - Barbell/Bodyweight/etc.
7. **Muscle Groups** - Full Body/Upper Body/etc.
8. **Training Goals** - Strength/Endurance/etc.
9. **Level** - Beginner/Intermediate/Advanced
10. **Scaling Options** - Modification suggestions
11. **Score Type** - Time/Reps/Rounds/etc.
12. **Coach Notes** - Tips and guidance
13. **Flavor-Text** - Marketing description

**Example:**
```
Workout Name: Diane
Instructions: 21-15-9 reps of: Deadlifts (225/155 lb), Handstand Push-ups
Search web? yes
  ✓ Generated 4 field(s) from web analysis
    - Category: Benchmark
    - Equipment Needed: Barbell
    - Level: Advanced
[Continue with remaining fields...]
✓ Workout added successfully!
```

#### 2. Auto Web Search Mode (Find & Add Known Workouts)
```bash
# Search for and add 10 actual CrossFit workouts
python scripts/add_workout.py --search-add 10

# Add up to 50 workouts
python scripts/add_workout.py --search-add 50
```

**How it works:**
1. Searches through **200+ known workouts**:
   - 30 Benchmark "Girls" (Fran, Grace, Diane, etc.)
   - 100+ Hero WODs (Murph, DT, Michael, etc.)
   - 70+ Other Benchmarks (Open workouts, Games workouts)
2. Checks which ones don't exist in database
3. Searches web for each workout
4. Auto-detects Category, Format, Equipment, Level
5. Adds workouts automatically

**Example:**
```
🔍 Searching web for 10 CrossFit workouts...
  • Searching for: Grace
    ℹ Using Google search results
    ✓ Found details for Grace
  ⊘ Skipping Fran (already exists)
  • Searching for: Isabel
    ✓ Found details for Isabel

================================================================================
Found 2 workout(s) - Adding to database...
================================================================================

  ✓ Added: Grace (Category: Benchmark)
  ✓ Added: Isabel (Category: Benchmark)

✓ Successfully added 2 workout(s)!
```

#### 3. Random Mode (Get Creative Suggestions)
```bash
python scripts/add_workout.py --random
```

**Features:**
- Type `random` at any prompt to get a random suggestion
- Suggestions from curated pools:
  - **Category:** General, Strength, Endurance, Partner, Competition, Gymnastics
  - **Format:** For Time, AMRAP 10/15/20, EMOM 12/16, Tabata, etc.
  - **Equipment:** Bodyweight, Barbell, Dumbbell, Kettlebell, etc.
  - **Muscle Groups:** Full Body, Upper Body, Lower Body, Core, etc.
  - **Training Goals:** General Fitness, Strength, Endurance, Power, etc.
  - **Level:** Beginner, Intermediate, Advanced
  - **Score Type:** Time, Reps, Rounds, Rounds + Reps, Load, Distance

**Example:**
```
Category [General]: random
  🎲 Random: Strength

Format & Duration [For Time]: random
  🎲 Random: EMOM 16
```

#### 4. Batch Mode (Add Multiple)
```bash
python scripts/add_workout.py --batch 5
```

**Process:**
1. Enter workouts one by one
2. Type `done` at name prompt to finish early
3. Type `cancel` to abort everything
4. All workouts saved together at end

**Shortcuts:**
- Quick entry (only Name, Instructions, Category, Level, Equipment)
- Web search available for each
- Shows progress (Workout 1 of 5, 2 of 5, etc.)

#### 5. Command-Line Mode (Automation)
```bash
python scripts/add_workout.py \
  --name "Helen" \
  --instructions "3 rounds for time: 400m Run, 21 KBS (53/35), 12 Pull-ups" \
  --category "Benchmark" \
  --level "Intermediate"
```

**Optional fields:**
All other fields can be omitted (will use defaults)

---

### update_workout.py - All Functions

#### View Workouts

**By name (case-insensitive):**
```bash
python scripts/update_workout.py --name "fran" --view
python scripts/update_workout.py --name "MURPH" --view
```

**By WorkoutID:**
```bash
python scripts/update_workout.py --id 1 --view
```
```

**Output:**
```
================================================================================
WORKOUT: Fran
================================================================================

WorkoutID: 1
Name: Fran
Category: Benchmark
Level: Advanced
Format & Duration: For Time
Instructions: 21-15-9 reps of: Thrusters (95/65 lb), Pull-ups
Equipment Needed: Barbell, Pull-up Bar
Muscle Groups: Full Body
Training Goals: Metabolic Conditioning
Scaling Options: Reduce weight, band-assisted pull-ups
Score Type: Time
Coach Notes: Classic benchmark. Fast transitions crucial.
Flavor-Text: One of the most infamous CrossFit benchmarks
================================================================================
```

#### Update a Field
```bash
python scripts/update_workout.py --name "Fran" --field "Level" --value "Elite"
```

**Updatable Fields:**
- Name
- Category
- Level
- Format & Duration
- Instructions
- Equipment Needed
- Muscle Groups
- Training Goals
- Scaling Options
- Score Type
- Coach Notes
- Flavor-Text

**Before/After Display:**
```
BEFORE: Level = Advanced
AFTER:  Level = Elite
```

#### Find by Name with Suggestions
```bash
python scripts/update_workout.py --name "fran" --view
```

**If multiple matches:**
```
Found multiple workouts matching 'fran':
  1. Fran (ID: 1)
  2. Fran Jr (ID: 123)
  3. Frannie (ID: 456)
```

---

## 🔧 Installation

### Step 1: Install Python

**Check if installed:**
```bash
python --version
```

**Don't have Python?**
- **Windows:** Download from [python.org](https://www.python.org/downloads/)
- **Mac:** `brew install python3`
- **Linux:** `sudo apt-get install python3`

### Step 2: Install Required Packages

```bash
pip install pandas requests
```

**Troubleshooting:**
- Try `pip3` instead of `pip`
- Windows: `python -m pip install pandas requests`

---

## 💻 Running in VS Code

### Method 1: Integrated Terminal (Recommended)
1. Open terminal: `` Ctrl+` ``
2. Run any command from this guide

### Method 2: Right-Click Run
1. Right-click script file in Explorer
2. Select **"Run Python File in Terminal"**

### Method 3: F5 Debugger
1. Open script file
2. Press `F5`
3. Select **"Python File"**

---

## 🚀 Common Workflows

### Workflow 1: Clean Database of Default Values
```bash
# Quick clean (clear defaults)
python scripts/remove_defaults.py

# Or replace with web data (slower)
python scripts/remove_defaults.py --web-search
```

### Workflow 2: Add a Single Workout
```bash
python scripts/add_workout.py
# Follow prompts, use web search for auto-fill
```

### Workflow 3: Add Multiple Workouts Quickly
```bash
python scripts/add_workout.py --batch 10
# Enter up to 10 workouts, type 'done' when finished
```

### Workflow 4: Fix a Typo in a Workout
```bash
python scripts/update_workout.py --name "Fran" --field "Instructions" --value "21-15-9 reps of: Thrusters (95/65 lb), Pull-ups"
```

### Workflow 5: Check if Workout Exists
```bash
python scripts/update_workout.py --name "Fran" --view
# If not found, add it with add_workout.py
```

### Workflow 6: Complete Database Cleanup
```bash
# 1. Remove defaults
python scripts/remove_defaults.py --web-search

# 2. Check for issues
python -c "import pandas as pd; df = pd.read_csv('WOD/data/workouts_table.csv'); print(df.isnull().sum())"

# 3. Backup
copy WOD\data\workouts_table.csv WOD\data\workouts_table.backup.csv
```

---

## 🔍 Understanding the Output

### Summary Report

At the end, you'll see a summary like this:

```
================================================================================
CLEANING SUMMARY REPORT
================================================================================
Initial rows:                     500
Duplicate headers removed:        1
Final rows:                       499
Columns removed:                  2
Column alignments fixed:          6
Values found from dataset:        184
Values found from web:            0
Default values applied:           1912
WorkoutIDs generated:             0
================================================================================
```

**What this means:**
- **Initial rows → Final rows:** Started with 500, ended with 499 (removed duplicate header)
- **Columns removed:** Deleted 2 empty columns that served no purpose
- **Column alignments fixed:** Fixed 6 workouts where data was in wrong columns
- **Values found from dataset:** Found 184 missing values by looking at similar workouts
- **Default values applied:** Filled 1,912 missing values with sensible defaults

---

---

## ❓ Frequently Asked Questions

### General Questions

**Q: What's the difference between add_workout.py and update_workout.py?**

**A:** 
- `add_workout.py` - Creates NEW workouts (prevents duplicates)
- `update_workout.py` - Modifies EXISTING workouts (find by name or ID)

**Q: How many columns does the database have?**

**A:** 13 essential columns (simplified from original 42 columns):
1. WorkoutID, 2. Name, 3. Category, 4. Format & Duration, 5. Instructions, 6. Equipment Needed, 7. Muscle Groups, 8. Training Goals, 9. Level, 10. Scaling Options, 11. Score Type, 12. Coach Notes, 13. Flavor-Text

**Q: Can I undo changes?**

**A:** Yes! If you have Git:
```bash
git checkout WOD/data/workouts_table.csv
```

Or restore from backup:
```bash
copy WOD/data/workouts_table.backup.csv WOD/data/workouts_table.csv
```

### add_workout.py Questions

**Q: What if I try to add a duplicate workout?**

**A:** The script blocks duplicates completely:
```
✗ Error: Workout 'Fran' already exists (WorkoutID: 1)
  To update this workout, use: python scripts/update_workout.py --name "Fran" --field <field> --value <value>
```

**Q: Does web search work for all workouts?**

**A:** It works best for:
- Famous CrossFit benchmarks (Fran, Murph, Cindy)
- Hero WODs
- Standard workout formats (AMRAP, EMOM)

Less effective for:
- Custom/unique workout names
- Obscure or new workouts

**Q: Can I skip web search?**

**A:** Yes! Just answer "no" when prompted, or use command-line mode with explicit values.

**Q: How does batch mode work?**

**A:** 
1. Specify count: `--batch 5`
2. Enter workouts one by one
3. Type `done` at name prompt to finish early
4. Type `cancel` to abort everything
5. All workouts saved together at end

### update_workout.py Questions

**Q: How do I find a workout if I don't know the exact name?**

**A:** Use partial names (case-insensitive):
```bash
python scripts/update_workout.py --name "fran" --view
# Matches: "Fran", "Fran Jr", "Frannie", etc.
```

**Q: Can I change the WorkoutID?**

**A:** No, WorkoutID is auto-generated and should not be changed (it's the primary key).

**Q: What if I update the wrong workout?**

**A:** The script shows before/after values. If you make a mistake:
```bash
# Fix it immediately
python scripts/update_workout.py --name "Fran" --field "Level" --value "Advanced"

# Or restore from Git
git checkout WOD/data/workouts_table.csv
```

### Database Questions

**Q: Where is the workout database stored?**

**A:** `WOD/data/workouts_table.csv` (main file, 499 workouts, 13 columns)

**Q: Is there a backup?**

**A:** Yes! `WOD/data/workouts_table.backup.csv` (original 42-column version)

**Q: How are WorkoutIDs assigned?**

**A:** Auto-incremented starting from highest existing ID + 1.

**Q: Can I delete workouts?**

**A:** Not yet - coming soon! For now, use pandas:
```bash
python -c "import pandas as pd; df = pd.read_csv('WOD/data/workouts_table.csv'); df = df[df['Name'] != 'Workout Name']; df.to_csv('WOD/data/workouts_table.csv', index=False)"
```

---

---

## 🛠️ Troubleshooting

### Installation Issues

**"ModuleNotFoundError: No module named 'pandas'"**
```bash
pip install pandas requests
# Or try: pip3 install pandas requests
# Windows: python -m pip install pandas requests
```

**"python: command not found"**
- Try `python3` instead of `python`
- Or `py` on Windows

**"Permission denied"**
- Windows: Run as Administrator
- Mac/Linux: Use `sudo pip3 install pandas requests`

### Script Errors

**"FileNotFoundError: workouts_table.csv"**
- Make sure you're in repository root: `cd c:\Users\Pete\VSCode\petexa.github.io`
- Or use `--csv-path` to specify location

**"Duplicate workout name"**
- Use `update_workout.py` instead to modify existing workout
- Or choose a different name

**"Workout not found"**
- Check spelling (search is case-insensitive)
- Try partial name: `--name "fran"` matches "Fran", "Fran Jr", etc.
- Use `--view` to see all details

**EOFError in batch mode**
- Fixed in latest version! Update script if you see this.

### Data Issues

**"Column count mismatch"**
- Database should have 13 columns
- If you see 42 columns, you may have the old backup file
- Verify file: `WOD/data/workouts_table.csv` (not `workouts_table.backup.csv`)

**"Invalid WorkoutID"**
- Don't manually edit WorkoutIDs
- Let script auto-generate them
- If corrupted, restore from backup

**Unexpected results after update**
- View workout first: `--view` flag
- Check exact field name (case-sensitive)
- Restore from Git if needed: `git checkout WOD/data/workouts_table.csv`

---

## 🎯 Quick Reference Card

### add_workout.py Commands
```bash
# Interactive mode (full prompts)
python scripts/add_workout.py

# Batch mode (add multiple)
python scripts/add_workout.py --batch 5

# Command-line mode
python scripts/add_workout.py --name "Helen" --instructions "3 rounds..." --category "Benchmark"

# With web search auto-fill
python scripts/add_workout.py --web-search
```

### update_workout.py Commands
```bash
# View by name
python scripts/update_workout.py --name "Fran" --view

# View by ID
python scripts/update_workout.py --id 1 --view

# Update field by name
python scripts/update_workout.py --name "Fran" --field "Level" --value "Elite"

# Update field by ID
python scripts/update_workout.py --id 1 --field "Coach Notes" --value "Fast transitions"
```

### Common Tasks
```bash
# Install dependencies
pip install pandas requests

# Check database
python -c "import pandas as pd; print(f'Workouts: {len(pd.read_csv(\"WOD/data/workouts_table.csv\"))}')"

# Restore from backup
copy WOD\data\workouts_table.backup.csv WOD\data\workouts_table.csv

# Restore from Git
git checkout WOD/data/workouts_table.csv
```

---

## 📊 Database Schema

**File:** `WOD/data/workouts_table.csv`  
**Rows:** 499 workouts  
**Columns:** 13 fields

| # | Column Name | Type | Required | Example |
|---|-------------|------|----------|---------|
| 1 | WorkoutID | Integer | Auto | 1 |
| 2 | Name | String | Yes | Fran |
| 3 | Category | String | No | Benchmark |
| 4 | Format & Duration | String | No | For Time |
| 5 | Instructions | Text | Yes | 21-15-9 reps of: Thrusters (95/65 lb), Pull-ups |
| 6 | Equipment Needed | String | No | Barbell, Pull-up Bar |
| 7 | Muscle Groups | String | No | Full Body |
| 8 | Training Goals | String | No | Metabolic Conditioning |
| 9 | Level | String | No | Advanced |
| 10 | Scaling Options | Text | No | Reduce weight, band-assisted pull-ups |
| 11 | Score Type | String | No | Time |
| 12 | Coach Notes | Text | No | Focus on smooth transitions |
| 13 | Flavor-Text | Text | No | One of the most infamous CrossFit benchmarks |

**Category Options:** General, Benchmark, Hero WOD, Partner, Competition, Specialty, Weightlifting, Gymnastics, Endurance, Strength

**Level Options:** Beginner, Intermediate, Advanced, Elite

**Format Options:** AMRAP, EMOM, For Time, Tabata, Chipper, Ladder, Death By, Custom

**Score Type Options:** Reps, Time, Rounds, Weight, Distance, Calories

---

## 📞 Need More Help?

1. **Check error message** - Usually tells you what's wrong
2. **Verify installation** - `python --version` and `pip list | grep pandas`
3. **Check file location** - `ls WOD/data/workouts_table.csv`
4. **Read this README** - Most questions answered above
5. **Check Git status** - `git status` to see if files are modified

---

**🎉 You're all set! Start managing your workout database with confidence!**
