# Workout of the Day (WOD) System

## What it does
Displays a rotating "Workout of the Day" on the homepage and links users to the full workout details.

## Files
- **HTML**: `index.html` (WOD card container with `#homepage-wod-container`).
- **JavaScript**: `assets/js/homepage-wod.js` (fetches data and renders the widget).
- **Data**: `data/production/workouts.json` (workout list; each item requires `id`, `Name`, `Category`, and optional metadata).
- **Styles**: Inline WOD card styles in `index.html` plus shared theme styles from `assets/css/`.

## How it works
- On DOM ready, the script fetches workouts JSON and picks a deterministic workout based on the current date.
- Rendered fields include name, category, difficulty/level, formatted duration, and description snippet.
- Links point to `workouts/?workout=<id>` for deeper context.

## Assumptions / Data Dependencies
- `workouts.json` is an array; selecting by index modulo array length must remain stable.
- Workout objects should provide human-readable strings; missing values fall back to `—` or defaults.
- The page must host an element with `id="homepage-wod-container"`.
