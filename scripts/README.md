# Workout Data Cleaning Script - Idiot's Guide 🏋️

This guide will walk you through cleaning your workout dataset step-by-step. No technical expertise required!

## 📋 What This Script Does

The `clean_workouts.py` script automatically fixes common problems in the workout dataset:

1. ✅ Removes duplicate header rows
2. ✅ Removes empty/artifact columns
3. ✅ Fixes column alignment issues (data in wrong columns)
4. ✅ Fills in missing values intelligently
5. ✅ Optionally searches the web for workout descriptions and coaching tips

**Result:** A clean, complete dataset with 499 workouts and zero missing values!

---

## 🚀 Quick Start (3 Easy Steps)

### Step 1: Install Python

**Already have Python?** Skip to Step 2.

**Don't have Python?** 
- **Windows:** Download from [python.org](https://www.python.org/downloads/)
- **Mac:** Open Terminal and type: `brew install python3`
- **Linux:** Open Terminal and type: `sudo apt-get install python3`

**Check if Python is installed:** Open Terminal/Command Prompt and type:
```bash
python3 --version
```
You should see something like `Python 3.8.0` or higher.

---

### Step 2: Install Required Package

The script needs one package called `pandas`. Install it by typing:

```bash
pip3 install pandas
```

**Troubleshooting:**
- If `pip3` doesn't work, try `pip` instead
- On Windows, you might need to use `python -m pip install pandas`

---

### Step 3: Run the Script

Open Terminal/Command Prompt, navigate to your repository folder, and run:

```bash
python3 scripts/clean_workouts.py
```

**That's it!** The script will:
- Take about 5-10 seconds to run
- Show you a progress report
- Save the cleaned data back to `WOD/data/workouts_table.csv`

---

## 📖 Detailed Usage

### Basic Cleaning (Fast - Recommended for Most Users)

```bash
python3 scripts/clean_workouts.py
```

**What you'll see:**
```
================================================================================
STARTING WORKOUT DATA CLEANING PROCESS
================================================================================
Loading data from WOD/data/workouts_table.csv...
  ✓ Loaded 500 rows

Removing duplicate header rows...
  ✓ Removed 1 duplicate header row(s)

Removing artifact columns...
  ✓ Removed columns: Unnamed: 7, Unnamed: 8

Validating column alignment...
  ⚠ Fixed 6 row(s) with column misalignment

Searching for missing data...
  ✓ Found 184 values from dataset patterns
  ✓ Found 0 values from web searches

Filling remaining missing values with defaults...
  ✓ Applied 1912 default values

✓ Cleaning process completed successfully!
```

---

### Advanced Cleaning (With Web Search - Slower)

**⚠️ Warning:** This takes ~15-30 minutes because it searches the internet for workout information.

```bash
python3 scripts/clean_workouts.py --web-search
```

**When to use this:**
- You want real workout descriptions instead of generic defaults
- You want actual coaching tips from the web
- You have time to wait (15-30 minutes)
- You have an internet connection

**What's different:**
- Searches Google for workout descriptions and coaching notes
- Focuses on well-known benchmark workouts first
- Much slower but provides richer data

---

### Custom CSV File Location

If your workout file is somewhere else:

```bash
python3 scripts/clean_workouts.py --csv-path path/to/your/file.csv
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

## ❓ Frequently Asked Questions

### Q: Will this delete my original data?

**A:** Yes, it overwrites the file. But your data is in Git, so you can always:
```bash
git checkout WOD/data/workouts_table.csv  # Restore original
```

### Q: How long does it take?

**A:** 
- **Basic cleaning:** 5-10 seconds
- **With web search:** 15-30 minutes

### Q: What if I get an error?

**Common errors and fixes:**

1. **"ModuleNotFoundError: No module named 'pandas'"**
   - Solution: Run `pip3 install pandas`

2. **"python3: command not found"**
   - Solution: Try `python` instead of `python3`

3. **"FileNotFoundError: workouts_table.csv"**
   - Solution: Make sure you're in the repository root folder
   - Or use `--csv-path` to specify the correct location

### Q: Can I undo the cleaning?

**A:** Yes! If you have Git:
```bash
git checkout WOD/data/workouts_table.csv
```

### Q: What gets cleaned exactly?

1. **Duplicate headers:** Removes duplicate column names in the middle of the file
2. **Artifact columns:** Removes `Unnamed: 7` and `Unnamed: 8` 
3. **Column misalignment:** Fixes rows where data shifted into wrong columns (like the 6 Deadly Dozen workouts)
4. **Missing values:** Fills empty cells with:
   - Similar workout data (when available)
   - Web-searched information (if `--web-search` enabled)
   - Sensible defaults (as last resort)

---

## 🛠️ Troubleshooting

### Script runs but data looks wrong?

Check the summary report. If you see unexpected numbers, you might want to:
1. Restore original: `git checkout WOD/data/workouts_table.csv`
2. Report the issue with the error message

### Script is too slow?

Skip the web search:
```bash
python3 scripts/clean_workouts.py  # Default is fast
```

### Need to clean a different file?

```bash
python3 scripts/clean_workouts.py --csv-path your_file.csv
```

---

## 📞 Need More Help?

1. Check the error message - it usually tells you what's wrong
2. Make sure you're in the correct directory (repository root)
3. Verify Python and pandas are installed correctly
4. Check that the CSV file exists at `WOD/data/workouts_table.csv`

---

## 🎯 Quick Reference Card

```bash
# Basic cleaning (fast, recommended)
python3 scripts/clean_workouts.py

# With web search (slow, richer data)
python3 scripts/clean_workouts.py --web-search

# Custom file location
python3 scripts/clean_workouts.py --csv-path path/to/file.csv

# Get help
python3 scripts/clean_workouts.py --help

# Install pandas (if needed)
pip3 install pandas

# Restore original file (if something went wrong)
git checkout WOD/data/workouts_table.csv
```

---

## ✨ What You Get

**Before Cleaning:**
- 500 rows (includes duplicate header)
- 44 columns (includes 2 empty columns)
- 1,912 missing values
- 6 workouts with misaligned data
- Inconsistent formatting

**After Cleaning:**
- 499 rows (clean data only)
- 42 columns (all useful)
- 0 missing values ✅
- All data properly aligned ✅
- Consistent formatting ✅

---

**🎉 You're all set! Run the script and watch your data get cleaned automatically!**
