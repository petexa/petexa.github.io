# ---------------- CONFIG ----------------

INPUT_PATH = "data/reports/workouts_merged.json"
OUTPUT_PATH = "data/reports/workouts_merged_cleaned.json"

DRY_RUN = False   # you already flipped this

OPENAI_MODEL = "gpt-4.1-mini"

# <--- ADD THIS
MAX_AI_CALLS = 20  # TEMP: stop after 20 workouts that hit OpenAI
