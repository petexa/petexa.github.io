-- WOD Dataset Schema
-- Relational schema for workout dataset

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts_table (
    WorkoutID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    Category TEXT,
    Format TEXT,
    Instructions TEXT NOT NULL,
    Instructions_Clean TEXT,
    Equipment_Needed TEXT,
    Muscle_Groups TEXT,
    Training_Goals TEXT,
    Time_Domain TEXT,
    Scaling_Options TEXT,
    Movement_Types TEXT,
    Workout_Complexity TEXT,
    Target_Stimulus TEXT,
    RX_Standards TEXT,
    Score_Type TEXT,
    Level TEXT,
    Environment TEXT,
    Equipment_Alternatives TEXT,
    Energy_System TEXT,
    Coach_Notes TEXT,
    Movement_Count INTEGER,
    Primary_Category TEXT,
    Difficulty_Score REAL,
    Movement_Patterns TEXT,
    Stimulus TEXT,
    Structure_Type TEXT,
    Description TEXT,
    DifficultyTier TEXT CHECK(DifficultyTier IN ('Beginner', 'Intermediate', 'Advanced', 'Elite', 'Moderate', 'Hard')),
    Estimated_Times TEXT,
    Warmup TEXT,
    Coaching_Cues TEXT,
    Scaling_Tiers TEXT,
    Training_Adaptation_Tags TEXT,
    Equipment_Footprint TEXT,
    Flavor_Text TEXT
);

-- Movement library
CREATE TABLE IF NOT EXISTS movement_library (
    MovementID INTEGER PRIMARY KEY,
    Movement TEXT NOT NULL UNIQUE,
    Type TEXT CHECK(Type IN ('Weightlifting', 'Gymnastics', 'Monostructural', 'General')),
    Pattern TEXT CHECK(Pattern IN ('Squat', 'Hinge', 'Push', 'Pull', 'Locomotion', 'General')),
    Skill_Level TEXT CHECK(Skill_Level IN ('Beginner', 'Intermediate', 'Advanced'))
);

-- Equipment library
CREATE TABLE IF NOT EXISTS equipment_library (
    EquipmentID INTEGER PRIMARY KEY,
    Equipment TEXT NOT NULL UNIQUE
);

-- Workout-Movement mapping (many-to-many)
CREATE TABLE IF NOT EXISTS workout_movement_map (
    WorkoutID INTEGER NOT NULL,
    MovementID INTEGER NOT NULL,
    Reps TEXT,
    PRIMARY KEY (WorkoutID, MovementID),
    FOREIGN KEY (WorkoutID) REFERENCES workouts_table(WorkoutID) ON DELETE CASCADE,
    FOREIGN KEY (MovementID) REFERENCES movement_library(MovementID) ON DELETE CASCADE
);

-- Movement-Equipment mapping (many-to-many)
CREATE TABLE IF NOT EXISTS movement_equipment_map (
    MovementID INTEGER NOT NULL,
    EquipmentID INTEGER NOT NULL,
    PRIMARY KEY (MovementID, EquipmentID),
    FOREIGN KEY (MovementID) REFERENCES movement_library(MovementID) ON DELETE CASCADE,
    FOREIGN KEY (EquipmentID) REFERENCES equipment_library(EquipmentID) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_difficulty ON workouts_table(DifficultyTier);
CREATE INDEX IF NOT EXISTS idx_workout_category ON workouts_table(Primary_Category);
CREATE INDEX IF NOT EXISTS idx_movement_type ON movement_library(Type);
CREATE INDEX IF NOT EXISTS idx_movement_pattern ON movement_library(Pattern);
CREATE INDEX IF NOT EXISTS idx_wm_workout ON workout_movement_map(WorkoutID);
CREATE INDEX IF NOT EXISTS idx_wm_movement ON workout_movement_map(MovementID);
CREATE INDEX IF NOT EXISTS idx_me_movement ON movement_equipment_map(MovementID);
CREATE INDEX IF NOT EXISTS idx_me_equipment ON movement_equipment_map(EquipmentID);\n