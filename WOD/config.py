"""
WOD Dataset Configuration
Shared constants and patterns for validation and cleaning scripts
"""

# Movement keywords for instruction validation
MOVEMENT_KEYWORDS = (
    r"\b(rep|round|minute|meter|calorie|complete|perform|execute|do|amrap|emom|for time)\b"
)

# Regex patterns for detecting movement artifacts
ARTIFACT_PATTERNS = [
    r"^\d+\s+(kg|kgs|kg\)|kgs\)|kg\)\)\.?|lb|lbs)$",  # Weight specifications only
    r"^[\d\s\-/]+$",  # Numbers and dashes only
    r"^\([^\)]*\)\.?$",  # Parentheses content only
    r".*\)\)\.+$",  # Ends with multiple parentheses and periods
    r"^\d+\s+\w+\.$",  # Pattern like "15 Squats." (number + word + period)
]

# Standard movement name capitalizations
MOVEMENT_CAPITALIZATIONS = {
    "pull-up": "Pull-Up",
    "push-up": "Push-Up",
    "sit-up": "Sit-Up",
    "kettlebell swing": "Kettlebell Swing",
    "box jump": "Box Jump",
    "wall ball": "Wall Ball",
    "burpee": "Burpee",
    "thruster": "Thruster",
    "deadlift": "Deadlift",
    "squat": "Squat",
    "row": "Row",
    "run": "Run",
    "clean": "Clean",
    "snatch": "Snatch",
    "press": "Press",
}

# Valid difficulty tiers
VALID_DIFFICULTY_TIERS = {"Beginner", "Intermediate", "Advanced", "Elite", "Moderate", "Hard"}

# Valid movement types
VALID_MOVEMENT_TYPES = {"Weightlifting", "Gymnastics", "Monostructural", "General"}

# Valid movement patterns
VALID_MOVEMENT_PATTERNS = {"Squat", "Hinge", "Push", "Pull", "Locomotion", "General"}

# Valid skill levels
VALID_SKILL_LEVELS = {"Beginner", "Intermediate", "Advanced"}

# Maximum equipment name length (longer entries are likely parsing errors)
MAX_EQUIPMENT_NAME_LENGTH = 100

# Minimum instruction length (shorter entries may be incomplete)
MIN_INSTRUCTION_LENGTH = 20

# File paths
DATA_DIR = "data"
OUT_DIR = "dist"

# Required CSV files
REQUIRED_FILES = [
    "workouts_table.csv",
    "movement_library.csv",
    "workout_movement_map.csv",
    "equipment_library.csv",
    "movement_equipment_map.csv",
]

# Expected columns by table
EXPECTED_WORKOUT_COLUMNS = ["WorkoutID", "Name", "Instructions", "DifficultyTier"]

EXPECTED_MOVEMENT_COLUMNS = ["MovementID", "Movement", "Type", "Pattern"]

EXPECTED_EQUIPMENT_COLUMNS = ["EquipmentID", "Equipment"]
