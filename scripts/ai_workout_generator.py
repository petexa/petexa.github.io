"""
AI-Powered Workout Generator
---------------------------
Generates custom CrossFit workouts based on user preferences using OpenAI.

Usage:
    python ai_workout_generator.py --goal cardio --equipment bodyweight --difficulty beginner

Environment:
    OPENAI_API_KEY must be set in your environment.

Dependencies:
    openai
"""

import argparse
import os

import openai

# Parse command-line arguments
def parse_args():
    parser = argparse.ArgumentParser(description="Generate a custom CrossFit workout using OpenAI.")
    parser.add_argument('--goal', default='general fitness', help='Training goal (e.g., strength, cardio, endurance)')
    parser.add_argument('--equipment', default='bodyweight', help='Equipment available (e.g., dumbbells, barbell, kettlebell, bodyweight)')
    parser.add_argument('--difficulty', default='intermediate', help='Difficulty level (beginner, intermediate, advanced)')
    return parser.parse_args()

# Main generator function


def generate_workout(goal, equipment, difficulty):
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set.")
        return
    client = openai.OpenAI(api_key=api_key)
    prompt = (
        f"Generate a {difficulty} CrossFit workout for {goal} using {equipment}. "
        "Include a workout name, format (e.g., AMRAP, For Time), instructions, and scaling options."
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7
        )
        print("\n--- Generated Workout ---\n")
        print(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"Error generating workout: {e}")

if __name__ == "__main__":
    args = parse_args()
    generate_workout(args.goal, args.equipment, args.difficulty)
