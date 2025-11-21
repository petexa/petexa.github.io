# GitHub Agent Rules for WOD Dataset Maintenance

## Overview

This document provides comprehensive guidelines for GitHub Agents maintaining the WOD (Workout of the Day) dataset in the petexa.github.io repository. These rules ensure data integrity, consistency, and proper automation of the workout database.

## Table of Contents

1. [Dataset Structure](#dataset-structure)
2. [Validation Rules](#validation-rules)
3. [Normalization Rules](#normalization-rules)
4. [Handling New Workouts](#handling-new-workouts)
5. [Handling New Movements](#handling-new-movements)
6. [Handling New Equipment](#handling-new-equipment)
7. [Automated Fix Principles](#automated-fix-principles)
8. [When to Open PRs](#when-to-open-prs)
9. [Error Handling](#error-handling)
10. [Workflow Execution](#workflow-execution)

---

## Dataset Structure

The WOD dataset consists of **5 core CSV files** that maintain referential integrity:

### 1. `data/workouts_table.csv`
Primary workout catalog containing 500+ workouts.

**Required Columns:**
- `WorkoutID` (INTEGER, Primary Key) - Unique identifier
- `Name` (TEXT) - Human-readable workout name
- `Instructions` (TEXT) - Detailed workout instructions describing movements, rep schemes, and format
- `DifficultyTier` (TEXT) - Must be one of: `Beginner`, `Intermediate`, `Advanced`, `Elite`, `Moderate`, `Hard`
- `Category` (TEXT) - Workout classification (e.g., "AMRAP", "For Time")

**Optional Columns:**
- `Instructions_Clean`, `Primary_Category`, `Difficulty_Score`, `Equipment_Needed`, `Score_Type`, `Movement_Patterns`, `Stimulus`, `Scaling_Options`, `Coaching_Cues`, `Format`, `Time_Domain`, `Energy_System`, `Training_Goals`, `Warmup`, `Coach_Notes`

### 2. `data/movement_library.csv`
Catalog of 307+ standardized movements.

**Required Columns:**
- `MovementID` (INTEGER, Primary Key) - Unique identifier
- `Movement` (TEXT, Unique) - Movement name (title case)
- `Type` (TEXT) - One of: `Weightlifting`, `Gymnastics`, `Monostructural`, `General`
- `Pattern` (TEXT) - One of: `Squat`, `Hinge`, `Push`, `Pull`, `Locomotion`, `General`
- `Skill_Level` (TEXT) - One of: `Beginner`, `Intermediate`, `Advanced`

### 3. `data/equipment_library.csv`
Catalog of 104+ equipment items.

**Required Columns:**
- `EquipmentID` (INTEGER, Primary Key) - Unique identifier
- `Equipment` (TEXT, Unique) - Equipment name

### 4. `data/workout_movement_map.csv`
Many-to-many relationship linking workouts to movements.

**Required Columns:**
- `WorkoutID` (INTEGER, Foreign Key) - References workouts_table
- `MovementID` (INTEGER, Foreign Key) - References movement_library
- `Reps` (TEXT) - Rep scheme (e.g., "21-15-9", "400m", "AMRAP")

**Rules:**
- Each workout MUST have at least one movement
- The same movement can appear multiple times in a workout

### 5. `data/movement_equipment_map.csv`
Many-to-many relationship linking movements to equipment.

**Required Columns:**
- `MovementID` (INTEGER, Foreign Key) - References movement_library
- `EquipmentID` (INTEGER, Foreign Key) - References equipment_library

---

## Validation Rules

### Critical Errors (MUST Block Build)

1. **Schema Validation**
   - All required files must exist in `WOD/data/`
   - All required columns must be present
   - Column names must match exactly (case-sensitive)

2. **Duplicate Detection**
   - No duplicate `WorkoutID` values in workouts_table.csv
   - No duplicate `MovementID` values in movement_library.csv
   - No duplicate `EquipmentID` values in equipment_library.csv
   - No duplicate `Movement` names (case-insensitive comparison)
   - No duplicate `Equipment` names (case-insensitive comparison)

3. **Foreign Key Integrity**
   - All `WorkoutID` in workout_movement_map.csv must exist in workouts_table.csv
   - All `MovementID` in workout_movement_map.csv must exist in movement_library.csv
   - All `MovementID` in movement_equipment_map.csv must exist in movement_library.csv
   - All `EquipmentID` in movement_equipment_map.csv must exist in equipment_library.csv

4. **Orphaned References**
   - Orphaned foreign keys are **CRITICAL ERRORS** and must be removed or fixed

### Warnings (Review Required, Don't Block Build)

1. **Instruction Quality**
   - Instructions shorter than 20 characters trigger a warning
   - Instructions missing movement keywords trigger a warning
   - Empty or whitespace-only instructions trigger a warning

2. **Difficulty Tiers**
   - Invalid difficulty values (not in approved list) trigger a warning
   - Agent should flag for manual review

3. **Movement Library Artifacts**
   - Entries matching weight-only patterns (e.g., "45 Kgs)).", "16 Kg)") trigger a warning
   - Entries that appear to be parsing errors trigger a warning

4. **Equipment Library Issues**
   - Equipment names exceeding 100 characters trigger a warning
   - May indicate parsing errors or invalid data

5. **Workouts Without Movements**
   - Workouts with no entries in workout_movement_map.csv trigger a warning
   - Every workout should have at least one movement

---

## Normalization Rules

### Text Normalization (Auto-Fix Safe)

1. **Whitespace Normalization**
   - Trim leading and trailing whitespace from all text fields
   - Collapse multiple consecutive spaces to a single space
   - Remove newline characters within text fields (except for Instructions)
   - Apply to ALL text columns in ALL files

2. **Capitalization Standardization**
   - Movement names MUST use title case
   - Standard movements (defined in `config.py`) use predefined capitalization
   - Examples: "Pull-Up" (not "pull-up" or "PULL-UP"), "Box Jump" (not "box jump")

3. **Instruction Punctuation**
   - Instructions MUST end with proper punctuation (., !, or ?)
   - If missing, add a period (.)
   - Do NOT change punctuation in the middle of instructions

4. **ID Preservation**
   - NEVER modify ID values (WorkoutID, MovementID, EquipmentID)
   - IDs are stable identifiers and must remain unchanged

### Artifact Removal (Auto-Fix Safe)

1. **Movement Library Artifacts**
   - Remove entries matching regex patterns for weight specifications
   - Pattern examples: weight-only entries like "45 Kgs", "16 Kg)", "25 Kgs)"
   - Remove entries that are just numbers with weight units
   - Remove incomplete entries like "15 Squats." without proper movement name
   - Log all removals in `dist/cleaning_changes.log`

2. **Equipment Library Artifacts**
   - Remove entries exceeding 100 characters (likely parsing errors)
   - Log all removals

3. **Orphaned Mappings**
   - Remove orphaned entries from workout_movement_map.csv
   - Remove orphaned entries from movement_equipment_map.csv
   - Maintain referential integrity

### Deduplication (Auto-Fix with Caution)

1. **Case-Insensitive Duplicate Detection**
   - Detect duplicate movement names (e.g., "Pull-Up" vs "pull-up")
   - Choose canonical version (prefer title case)
   - Update all references in mapping tables
   - Log all merges

2. **Preserve First Occurrence**
   - When deduplicating, keep the first occurrence (lowest ID)
   - Update foreign key references in mapping tables
   - Remove duplicate entries

---

## Handling New Workouts

### When a New Workout is Added

1. **ID Assignment**
   - Assign the next available `WorkoutID` (max existing ID + 1)
   - Verify the ID is unique
   - Never reuse deleted IDs

2. **Required Field Validation**
   - `Name` - Must be non-empty and reasonably descriptive
   - `Instructions` - Must be detailed and contain movement references
   - `DifficultyTier` - Must use one of the approved values

3. **Movement Mapping**
   - Ensure at least one entry in `workout_movement_map.csv` for this WorkoutID
   - Verify all referenced MovementIDs exist in movement_library.csv
   - If movements don't exist, they must be added first (see [Handling New Movements](#handling-new-movements))

4. **Auto-Fix Application**
   - Apply whitespace normalization to all text fields
   - Add punctuation to Instructions if missing
   - Standardize text formatting

5. **Validation**
   - Run full validation suite: `python validate_and_fix.py`
   - Check for errors in `dist/validation_report.txt`
   - Ensure no critical errors exist

### Example: Adding a New Workout

```csv
# Simplified example showing key columns only (actual CSV has 44 columns)
# Key columns: WorkoutID, Name, Category, Instructions, DifficultyTier

# workouts_table.csv (showing key fields)
WorkoutID=501, Name="New Workout Name", Category="For Time", 
Instructions="Complete 5 rounds for time: 10 Push-Ups, 20 Air Squats, 30 Sit-Ups", 
DifficultyTier="Beginner"

# workout_movement_map.csv
501,45,10  # Push-Up
501,12,20  # Air Squat
501,89,30  # Sit-Up
```

---

## Handling New Movements

### When a New Movement is Added

1. **ID Assignment**
   - Assign the next available `MovementID` (max existing ID + 1)
   - Verify the ID is unique
   - Never reuse deleted IDs

2. **Required Field Validation**
   - `Movement` - Must be unique (case-insensitive), use title case
   - `Type` - Must be one of: `Weightlifting`, `Gymnastics`, `Monostructural`, `General`
   - `Pattern` - Must be one of: `Squat`, `Hinge`, `Push`, `Pull`, `Locomotion`, `General`
   - `Skill_Level` - Must be one of: `Beginner`, `Intermediate`, `Advanced`

3. **Uniqueness Check**
   - Check for existing movements with the same name (case-insensitive)
   - If duplicate exists, DO NOT add; use existing MovementID instead
   - Check standard capitalizations in `config.py`

4. **Equipment Mapping**
   - Add entries to `movement_equipment_map.csv` for required equipment
   - Bodyweight movements may have zero equipment mappings
   - Ensure all referenced EquipmentIDs exist in equipment_library.csv

5. **Auto-Fix Application**
   - Apply title case to movement name
   - Trim whitespace
   - Validate against artifact patterns

### Example: Adding a New Movement

```csv
# movement_library.csv
308,Turkish Get-Up,Weightlifting,General,Advanced

# movement_equipment_map.csv
308,45  # Kettlebell
```

---

## Handling New Equipment

### When New Equipment is Added

1. **ID Assignment**
   - Assign the next available `EquipmentID` (max existing ID + 1)
   - Verify the ID is unique
   - Never reuse deleted IDs

2. **Required Field Validation**
   - `Equipment` - Must be unique (case-insensitive), non-empty
   - Must be under 100 characters (longer names are likely errors)

3. **Uniqueness Check**
   - Check for existing equipment with the same name (case-insensitive)
   - If duplicate exists, DO NOT add; use existing EquipmentID instead

4. **Auto-Fix Application**
   - Trim whitespace
   - Validate length (<= 100 characters)

### Example: Adding New Equipment

```csv
# equipment_library.csv
105,Medicine Ball (20 lbs)
```

---

## Automated Fix Principles

### What Agents SHOULD Auto-Fix

✅ **Safe Automatic Fixes:**
1. Whitespace normalization (trim, collapse multiple spaces)
2. Text capitalization for standard movements
3. Instruction punctuation (adding periods)
4. Removing parsing artifacts (weight-only entries, overly long descriptions)
5. Removing orphaned mappings (foreign keys pointing to non-existent entities)
6. Deduplicating movements (case-insensitive, preserve first occurrence)

### What Agents SHOULD NOT Auto-Fix

❌ **Require Manual Review:**
1. Changing workout instructions content (semantic changes)
2. Modifying movement names beyond standardization
3. Deleting workouts, movements, or equipment (unless clearly artifacts)
4. Changing difficulty tiers
5. Modifying rep schemes in mappings
6. Reassigning IDs
7. Structural changes to CSV schema

### Auto-Fix Workflow

1. **Run Cleaner First**: `python clean_and_enhance.py`
   - Removes artifacts
   - Deduplicates movements
   - Cleans equipment entries
   - Logs all changes to `dist/cleaning_changes.log`

2. **Run Validator Second**: `python validate_and_fix.py`
   - Applies text normalization
   - Validates referential integrity
   - Generates validation report
   - Exports cleaned data to `dist/`

3. **Review Changes**
   - Check `dist/cleaning_changes.log` for cleaning operations
   - Check `dist/validation_report.txt` for validation results
   - Verify no critical errors exist

4. **Commit Safe Fixes**
   - Auto-commit changes to `data/` directory
   - Use commit message: "🤖 Auto-clean WOD dataset [skip ci]" (prevents infinite loop)
   - Only commit on main branch (not pull requests)
   - Note: [skip ci] prevents re-triggering the validation workflow on automated commits

---

## When to Open PRs

### Automatic Commits (No PR Required)

Auto-commit directly to main branch when:
- ✅ Whitespace normalization fixes
- ✅ Capitalization standardization
- ✅ Punctuation fixes
- ✅ Artifact removal (logged changes)
- ✅ Orphaned mapping cleanup

**Conditions:**
- Must be triggered by push to main (not pull request)
- Must pass validation (0 errors)
- All changes logged in `dist/cleaning_changes.log`

### Open PR for Manual Review (Don't Auto-Commit)

Open a PR for human review when:
- ❌ Structural changes to dataset (adding/removing columns)
- ❌ Large-scale deduplication (>10 movements affected)
- ❌ Semantic changes to instructions
- ❌ Changes to validation logic or scripts
- ❌ Updates to schema.sql or configuration
- ❌ Critical errors that can't be auto-fixed

**PR Requirements:**
- Title: Clear description of changes
- Body: Summary of modifications, affected entities, validation results
- Labels: Add appropriate labels (e.g., "data-quality", "automated-fix")
- Artifacts: Attach validation_report.txt and cleaning_changes.log

### PR Comments

On pull requests, the agent should:
1. Post validation results as a comment
2. Include full validation report from `dist/validation_report.txt`
3. Include cleaning changes from `dist/cleaning_changes.log`
4. Highlight errors, warnings, and fixes applied
5. Do NOT auto-commit changes (let humans review first)

---

## Error Handling

### Critical Errors

When critical errors are detected:
1. **DO NOT** commit changes
2. Generate detailed error report in `dist/validation_report.txt`
3. Fail the GitHub Actions workflow (exit code 1)
4. Post error details on pull request (if applicable)
5. Alert maintainers to manual intervention needed

**Example Critical Errors:**
- Missing required columns
- Duplicate IDs
- Orphaned foreign keys (after cleanup attempt)
- Schema violations

### Warnings

When warnings are detected:
1. Complete the validation process
2. Include warnings in `dist/validation_report.txt`
3. Do NOT fail the workflow
4. Log warnings for human review
5. Proceed with safe auto-fixes

**Example Warnings:**
- Short instructions (<20 chars)
- Missing movement keywords
- Non-standard difficulty tiers
- Workouts without movements

### Recovery Strategies

If validation fails:
1. **Check Foreign Keys**: Verify all IDs referenced exist
2. **Check Duplicates**: Look for duplicate names or IDs
3. **Check Schema**: Ensure all required columns present
4. **Check Artifacts**: Look for parsing errors in data
5. **Review Logs**: Check `dist/cleaning_changes.log` for hints
6. **Manual Inspection**: Open CSV files and inspect problematic rows

---

## Workflow Execution

### GitHub Actions Workflow

**Trigger Conditions:**
- Push to `WOD/data/**`
- Push to `WOD/*.py`
- Pull request modifying above paths
- Manual workflow dispatch

**Execution Steps:**
1. Checkout repository
2. Setup Python 3.11
3. Install dependencies: `pip install pandas`
4. Run cleaner: `python WOD/clean_and_enhance.py`
5. Run validator: `python WOD/validate_and_fix.py`
6. Check for data changes: `git status --porcelain WOD/data/`
7. Upload artifacts: validation_report.txt, cleaning_changes.log, data_stats.json
8. Display summary in job output
9. Comment on PR (if pull request)
10. Auto-commit cleaned data (if main branch and changes detected)
11. Fail workflow if validation errors exist

### Manual Execution

For local testing and development:

```bash
cd WOD

# Step 1: Clean data
python clean_and_enhance.py

# Step 2: Validate and normalize
python validate_and_fix.py

# Step 3: Review outputs
cat dist/validation_report.txt
cat dist/cleaning_changes.log
cat dist/data_stats.json

# Step 4: Commit changes if valid
git add data/
git commit -m "Update WOD dataset"
git push
```

### Output Files

**Generated in `WOD/dist/` directory:**

1. **validation_report.txt**
   - Comprehensive validation results
   - Lists errors, warnings, and fixes
   - Summary statistics

2. **cleaning_changes.log**
   - Record of all cleaning operations
   - Lists artifacts removed
   - Lists duplicates merged
   - Lists mappings cleaned

3. **data_stats.json**
   - Dataset statistics (JSON format)
   - Counts of workouts, movements, equipment, mappings

4. **Cleaned CSV files**
   - `workouts_table.csv`
   - `movement_library.csv`
   - `equipment_library.csv`
   - `workout_movement_map.csv`
   - `movement_equipment_map.csv`

---

## Key Principles

### Data Integrity First
- Never break referential integrity
- Validate foreign keys before deleting entities
- Maintain cascade relationships

### Prefer Automation
- Auto-fix safe, reversible issues
- Log all changes for transparency
- Generate clear, detailed reports

### Clear Communication
- Descriptive commit messages
- Comprehensive validation reports
- Detailed change logs

### Conservative Approach
- When in doubt, open a PR for review
- Don't delete data unless clearly artifacts
- Preserve existing IDs and relationships

### Source of Truth
- `WOD/data/` is the canonical dataset
- All processing starts from source files
- `WOD/dist/` contains processed outputs (not canonical)

---

## References

For more detailed information, see:

- **[README.md](README.md)** - User guide and quick start
- **[data_dictionary.md](data_dictionary.md)** - Complete schema documentation
- **[schema.sql](schema.sql)** - Relational database schema
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation details and history

---

## Version History

- **v1.0** (2024-11) - Initial agent rules documentation

---

**Maintained by:** Automated validation system  
**Last Updated:** November 2024  
**Status:** Active
