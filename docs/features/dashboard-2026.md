# 2026 Strength & Skill Dashboard

## What it does
Dedicated dashboard (to be served from `dashboard/2026/`) that visualises 2026 micro-sessions, handstand goals, and challenge progress.

## Files
- **HTML**: `dashboard/2026/index.html` (UI shell and layout).
- **JavaScript**: `dashboard/2026/dashboard.js` (reads JSON, renders cards/bars) plus shared helpers from `assets/js/theme.js`/`app.js` if imported.
- **CSS**: `dashboard/2026/dashboard.css` for responsive cards and progress bars.
- **Data**: `data/progress-2026.json` (micro-sessions + challenges) and `data/progress-2026-events.json` (timeline entries).

## How it works
- JS fetches the two JSON files and builds sections for micro-sessions, handstand-specific goals, and chronological events/milestones.
- Progress values are rendered as counts and progress bars against targets.

## Assumptions / Data Dependencies
- `progress-2026.json` retains `microSessions` and `challenges` structures with `target`/`current` values.
- Event entries should carry `timestamp` and optional metadata; missing fields will be labelled as "Unknown" in the feed.
