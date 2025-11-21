# WOD Dataset Data Dictionary

## Overview
The WOD (Workout of the Day) dataset is a comprehensive relational database of CrossFit-style workouts, movements, and equipment requirements. The dataset consists of 5 core CSV files that maintain referential integrity through ID-based relationships.

## File Structure

### 1. workouts_table.csv
The primary workout catalog containing detailed information about each workout.

**Key Columns:**
- `WorkoutID` (INTEGER): Unique identifier for each workout. Primary key.
- `Name` (TEXT): Human-readable workout name (e.g., "Fran", "Helen", "Murph").
- `Category` (TEXT): Workout classification (e.g., "Benchmark (girl/classic)", "AMRAP", "EMOM").
- `Instructions` (TEXT): Detailed workout instructions describing the movements, reps, and format.
- `Instructions_Clean` (TEXT): Normalized version of instructions with standardized formatting.
- `DifficultyTier` (TEXT): Classification of workout difficulty. Valid values: `Beginner`, `Intermediate`, `Advanced`, `Elite`, `Moderate`, `Hard`.
- `Primary_Category` (TEXT): Main workout type category (e.g., "Weightlifting", "Gymnastics", "Monostructural").
- `Difficulty_Score` (REAL): Numerical difficulty rating (0-10 scale).
- `Equipment_Needed` (TEXT): Comma-separated list of required equipment.
- `Score_Type` (TEXT): How the workout is scored (e.g., "Time", "Rounds", "Load").
- `Movement_Patterns` (TEXT): Primary movement patterns involved (e.g., "Push, Pull, Squat").
- `Stimulus` (TEXT): Intended physiological effect of the workout.
- `Scaling_Options` (TEXT): Recommended modifications for different fitness levels.
- `Coaching_Cues` (TEXT): Technical coaching points for execution.

**Additional Metadata:**
- `Format`: Workout structure (e.g., "For Time", "AMRAP 20 Minutes")
- `Time_Domain`: Expected completion time range
- `Energy_System`: Primary metabolic pathway (e.g., "Anaerobic", "Aerobic")
- `Training_Goals`: Fitness attributes targeted
- `Warmup`: Recommended warm-up routine
- `Coach_Notes`: Strategy and pacing guidance

**Total Workouts:** ~500 entries

---

### 2. movement_library.csv
Catalog of all movements referenced in workouts.

**Columns:**
- `MovementID` (INTEGER): Unique identifier. Primary key.
- `Movement` (TEXT): Movement name (e.g., "Pull-Up", "Thruster", "Kettlebell Swing"). Must be unique.
- `Type` (TEXT): Movement category. Valid values:
  - `Weightlifting`: Barbell/dumbbell exercises (e.g., Clean, Snatch, Deadlift)
  - `Gymnastics`: Bodyweight skills (e.g., Pull-Up, Handstand Push-Up)
  - `Monostructural`: Cardio exercises (e.g., Run, Row, Bike)
  - `General`: Uncategorized or mixed movements
- `Pattern` (TEXT): Primary movement pattern. Valid values:
  - `Squat`: Knee-dominant lower body
  - `Hinge`: Hip-dominant lower body
  - `Push`: Pressing movements
  - `Pull`: Pulling movements
  - `Locomotion`: Running, rowing, biking
  - `General`: Mixed or other patterns
- `Skill_Level` (TEXT): Technical difficulty. Valid values: `Beginner`, `Intermediate`, `Advanced`.

**Data Quality Notes:**
- Movement names are standardized with title case capitalization
- Parsing artifacts (e.g., weight specifications like "45 Kgs)).") have been removed
- Duplicate movements (case-insensitive) are deduplicated

**Total Movements:** ~307 unique movements (after cleaning)

---

### 3. equipment_library.csv
Catalog of all equipment items used in workouts.

**Columns:**
- `EquipmentID` (INTEGER): Unique identifier. Primary key.
- `Equipment` (TEXT): Equipment name (e.g., "Barbell", "Pull-up Bar", "Kettlebell"). Must be unique.

**Examples:**
- Barbell
- Dumbbells
- Kettlebell
- Pull-up Bar
- Rowing Machine
- Assault Bike
- Box (for box jumps)
- Wall Ball
- Jump Rope
- GHD Machine
- Rings

**Data Quality Notes:**
- Equipment names are normalized and trimmed
- Overly long entries (>100 characters) indicating parsing errors are removed
- Weight specifications may be included in the name (e.g., "Barbell (60/45 kgs)")

**Total Equipment:** ~104 unique items (after cleaning)

---

### 4. workout_movement_map.csv
Many-to-many relationship table linking workouts to movements.

**Columns:**
- `WorkoutID` (INTEGER): Foreign key to workouts_table. Part of composite primary key.
- `MovementID` (INTEGER): Foreign key to movement_library. Part of composite primary key.
- `Reps` (TEXT): Rep scheme or distance for this movement in this workout (e.g., "21-15-9", "400m", "AMRAP").

**Relationship Rules:**
- Each workout must have at least one movement
- A workout can have multiple movements
- A movement can appear in multiple workouts
- The same movement can appear in a workout multiple times with different rep schemes

**Example:**
```
WorkoutID=1 (Fran), MovementID=1 (Thruster), Reps="21-15-9"
WorkoutID=1 (Fran), MovementID=2 (Pull-Up), Reps="21-15-9"
```

**Total Mappings:** ~1,491 relationships (after cleaning)

---

### 5. movement_equipment_map.csv
Many-to-many relationship table linking movements to required equipment.

**Columns:**
- `MovementID` (INTEGER): Foreign key to movement_library. Part of composite primary key.
- `EquipmentID` (INTEGER): Foreign key to equipment_library. Part of composite primary key.

**Relationship Rules:**
- Most movements require at least one equipment item
- Bodyweight movements may have zero equipment mappings
- A movement can require multiple equipment items
- An equipment item can be used by multiple movements

**Example:**
```
MovementID=1 (Thruster), EquipmentID=15 (Barbell)
MovementID=2 (Pull-Up), EquipmentID=69 (Pull-up Bar)
```

**Total Mappings:** ~806 relationships (after cleaning)

---

## Data Integrity Rules

### Primary Keys
- All ID columns must be unique and non-null
- IDs are stable and should not change once assigned

### Foreign Keys
- All references must point to existing entities
- Orphaned references are validation errors
- Cascade deletes maintain referential integrity

### Difficulty Tiers
Difficulty tiers follow a progressive scale:
1. **Beginner**: Reduced volume, lighter loads, movement modifications
2. **Intermediate**: Standard scaling, moderate loads
3. **Moderate**: Similar to Intermediate with mixed complexity
4. **Advanced**: Rx standards, higher volume
5. **Hard**: Demanding volume or technical requirements
6. **Elite**: Championship-level standards, maximum difficulty

### Movement Types
- **Weightlifting**: External load movements (barbells, dumbbells, kettlebells)
- **Gymnastics**: Bodyweight skills requiring coordination/strength
- **Monostructural**: Cyclical cardio movements
- **General**: Mixed or uncategorized

### Movement Patterns
- **Squat**: Knee-dominant (Squat, Thruster, Wall Ball)
- **Hinge**: Hip-dominant (Deadlift, Kettlebell Swing, Clean)
- **Push**: Pressing (Push-Up, Bench Press, Handstand Push-Up)
- **Pull**: Pulling (Pull-Up, Row, Toes-to-Bar)
- **Locomotion**: Travel (Run, Row, Bike)
- **General**: Mixed or other

---

## Data Quality Standards

### Text Formatting
- All text fields are trimmed of leading/trailing whitespace
- Multiple spaces are collapsed to single spaces
- Instructions end with proper punctuation
- Movement names use title case
- Equipment names are normalized

### Validation Checks
1. **Schema validation**: All required columns present
2. **Duplicate detection**: No duplicate IDs or names (case-insensitive)
3. **Foreign key integrity**: All references valid
4. **Instruction quality**: Non-empty, reasonable length, contains movement keywords
5. **Movement library**: No parsing artifacts or weight-only entries
6. **Equipment library**: No overly long entries (>100 chars)
7. **Difficulty consistency**: All tiers use valid values

### Auto-Fix Capabilities
The validation system automatically fixes:
- Whitespace normalization
- Text capitalization for standard movements
- Instruction punctuation
- Multiple spaces in text fields

### Manual Review Required
- Orphaned foreign keys
- Duplicate movement/equipment names
- Suspiciously short instructions
- Invalid difficulty tiers
- Missing required fields

---

## File Locations

### Source Data (Canonical)
- `WOD/data/` - Original, maintained CSV files
  - `workouts_table.csv`
  - `movement_library.csv`
  - `equipment_library.csv`
  - `workout_movement_map.csv`
  - `movement_equipment_map.csv`

### Processed Outputs
- `WOD/dist/` - Validated and cleaned versions
  - `workouts_table.csv` - Normalized version
  - `movement_library.csv` - Cleaned version
  - `equipment_library.csv` - Cleaned version
  - `workout_movement_map.csv` - Valid mappings
  - `movement_equipment_map.csv` - Valid mappings
  - `validation_report.txt` - Validation results
  - `data_stats.json` - Dataset statistics
  - `cleaning_changes.log` - Record of cleaning operations

---

## Usage Examples

### Finding Beginner Workouts
```sql
SELECT Name, Instructions_Clean, Equipment_Needed
FROM workouts_table
WHERE DifficultyTier = 'Beginner'
ORDER BY Name;
```

### Listing Movements by Type
```sql
SELECT Movement, Type, Pattern, Skill_Level
FROM movement_library
WHERE Type = 'Gymnastics'
ORDER BY Skill_Level, Movement;
```

### Finding Workouts with Specific Movement
```sql
SELECT w.Name, w.Instructions_Clean
FROM workouts_table w
JOIN workout_movement_map wm ON w.WorkoutID = wm.WorkoutID
JOIN movement_library m ON wm.MovementID = m.MovementID
WHERE m.Movement = 'Pull-Up';
```

### Equipment Requirements for Movement
```sql
SELECT m.Movement, e.Equipment
FROM movement_library m
JOIN movement_equipment_map me ON m.MovementID = me.MovementID
JOIN equipment_library e ON me.EquipmentID = e.EquipmentID
WHERE m.Movement = 'Thruster';
```

---

## Maintenance Procedures

### Adding New Workouts
1. Assign next available WorkoutID
2. Fill all required fields (Name, Instructions, DifficultyTier)
3. Create workout_movement_map entries for all movements
4. Ensure movements exist in movement_library
5. Ensure equipment mappings exist
6. Run validation: `python validate_and_fix.py`

### Adding New Movements
1. Assign next available MovementID
2. Set Movement name (unique, title case)
3. Classify Type and Pattern
4. Set Skill_Level
5. Create movement_equipment_map entries
6. Run validation

### Data Cleaning
1. Run cleaner: `python clean_and_enhance.py`
2. Review `dist/cleaning_changes.log`
3. Run validation: `python validate_and_fix.py`
4. Check `dist/validation_report.txt`

---

## Version History
- **v1.0** (2024): Initial dataset structure and validation
- **v1.1** (Current): Enhanced cleaning, artifact removal, comprehensive validation

## Maintainers
This dataset is maintained by automated validation scripts and manual curation.

For issues or questions, see the repository documentation.\n