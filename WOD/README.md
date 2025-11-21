# WOD Dataset Maintenance System

Comprehensive validation, cleaning, and maintenance automation for the Workout of the Day (WOD) dataset.

## 📋 Overview

This system maintains a relational database of 500+ CrossFit-style workouts with:
- **Workouts**: Detailed workout specifications and metadata
- **Movements**: 307+ standardized movement definitions  
- **Equipment**: 104+ equipment item catalog
- **Relationships**: Workout-movement and movement-equipment mappings

## 🗂️ Dataset Structure

### Core Data Files (`data/`)
1. `workouts_table.csv` - Primary workout catalog (500+ workouts)
2. `movement_library.csv` - Movement definitions (307+ movements)
3. `equipment_library.csv` - Equipment catalog (104+ items)
4. `workout_movement_map.csv` - Workout → Movement relationships
5. `movement_equipment_map.csv` - Movement → Equipment relationships

### Output Directory (`dist/`)
- Cleaned and validated CSV exports
- `validation_report.txt` - Comprehensive validation results
- `cleaning_changes.log` - Record of automated fixes
- `data_stats.json` - Dataset statistics

## 🚀 Usage

### Automated Validation (GitHub Actions)
The system automatically runs on any changes to the `WOD/` folder:
- Cleans and normalizes data
- Validates referential integrity
- Generates reports
- Auto-commits safe fixes

### Manual Validation

```bash
cd WOD

# Step 1: Clean data (removes artifacts, deduplicates)
python clean_and_enhance.py

# Step 2: Validate and normalize
python validate_and_fix.py

# Review outputs in dist/
cat dist/validation_report.txt
cat dist/cleaning_changes.log
```

### Legacy Script
The original basic validator is preserved:
```bash
python validate_and_build.py  # Basic checks only
```

## 🛠️ Maintenance Scripts

### `clean_and_enhance.py`
Advanced data cleaning:
- Removes parsing artifacts from movement library
- Deduplicates movements (case-insensitive)
- Cleans equipment entries
- Maintains referential integrity

**Capabilities:**
- Detects weight-only entries like "45 Kgs))."
- Removes overly long equipment descriptions
- Preserves foreign key relationships
- Logs all changes for review

### `validate_and_fix.py`
Comprehensive validation and auto-fix:
- **Schema validation** - Required columns present
- **Duplicate detection** - IDs and names
- **Foreign key integrity** - Valid references
- **Text normalization** - Whitespace, capitalization, punctuation
- **Instruction quality** - Completeness and formatting
- **Movement library** - Artifact detection
- **Difficulty tiers** - Valid tier assignments

**Auto-Fixes:**
- Normalizes whitespace in all text fields
- Standardizes movement name capitalization
- Adds proper punctuation to instructions
- Collapses multiple spaces

**Validation Rules:**
- Every workout must have ≥1 movement
- All foreign keys must be valid
- Movement names must be unique (case-insensitive)
- Difficulty tiers: Beginner, Intermediate, Advanced, Elite, Moderate, Hard

## 📊 Data Quality Standards

### Automatic Fixes
✅ Whitespace trimming and normalization  
✅ Capitalization standardization  
✅ Instruction punctuation  
✅ Duplicate removal  
✅ Artifact cleanup  

### Manual Review Required
⚠️ Orphaned foreign keys  
⚠️ Suspiciously short instructions  
⚠️ Invalid difficulty tiers  
⚠️ Missing movement keywords  

## 📖 Documentation

- **`data_dictionary.md`** - Complete data schema and field definitions
- **`schema.sql`** - Relational database schema with constraints
- **`.github/workflows/wod-validation.yml`** - CI/CD automation

## 🔄 Workflow

### When Changes Are Made to WOD/

1. **Trigger**: Push or PR modifying `WOD/data/` or `WOD/*.py`
2. **Clean**: `clean_and_enhance.py` removes artifacts
3. **Validate**: `validate_and_fix.py` checks integrity and normalizes
4. **Report**: Validation report generated in `dist/`
5. **Auto-commit**: Safe fixes are committed automatically
6. **PR Comment**: Validation results posted on pull requests

### Adding New Workouts

1. Assign next available `WorkoutID`
2. Fill required fields: `Name`, `Instructions`, `DifficultyTier`
3. Add entries to `workout_movement_map.csv`
4. Ensure movements exist in `movement_library.csv`
5. Run validation: `python validate_and_fix.py`
6. Review and commit changes

### Adding New Movements

1. Assign next available `MovementID`
2. Set unique `Movement` name (title case)
3. Classify `Type`, `Pattern`, `Skill_Level`
4. Add equipment mappings to `movement_equipment_map.csv`
5. Run validation

## 🎯 Key Features

### Referential Integrity
- All workout-movement relationships validated
- All movement-equipment relationships validated
- Orphaned references detected and reported
- Cascade delete support in schema

### Data Normalization
- Consistent text formatting across all tables
- Standardized movement names
- Normalized equipment descriptions
- Proper capitalization and punctuation

### Artifact Detection
- Removes weight-only movement entries
- Cleans up parsing errors
- Detects overly long equipment descriptions
- Identifies duplicate movements

### Comprehensive Reporting
- Detailed validation reports
- Change logs for all cleaning operations
- Dataset statistics (JSON format)
- Error/warning categorization

## 📈 Statistics (Current)

- **Workouts**: 500
- **Movements**: 307 (after cleaning)
- **Equipment**: 104 (after cleaning)
- **Workout-Movement Mappings**: 1,491
- **Movement-Equipment Mappings**: 806

## 🤖 Automation Principles

1. **Maintain data integrity** - Never break relationships
2. **Prefer automated fixes** - When safe and reversible
3. **Generate clear reports** - All changes logged
4. **Open PRs for review** - Manual approval for structural changes
5. **Never delete data** - Unless explicitly artifacts
6. **WOD/ is source of truth** - All processing starts here

## 🔧 Requirements

- Python 3.11+
- pandas library
- Git (for automation)

## 📝 Version History

- **v1.0** - Initial dataset and basic validation
- **v1.1** - Enhanced cleaning and artifact removal
- **v2.0** (Current) - Comprehensive automation system with GitHub Actions

## 🆘 Troubleshooting

### Validation Fails
1. Check `dist/validation_report.txt` for specific errors
2. Review `dist/cleaning_changes.log` for changes made
3. Fix reported errors in source data files
4. Re-run validation

### Foreign Key Errors
1. Ensure all WorkoutIDs exist in workouts_table.csv
2. Ensure all MovementIDs exist in movement_library.csv
3. Ensure all EquipmentIDs exist in equipment_library.csv
4. Run cleaner to remove orphaned mappings

### Duplicate Movements
1. Review case-insensitive duplicates
2. Choose canonical name
3. Manually merge or use cleaner's auto-deduplication

## 📧 Support

For issues or questions, refer to the repository documentation or open an issue.
