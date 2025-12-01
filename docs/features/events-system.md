# Events System

## What it does
Shows upcoming/past events, renders event cards, and surfaces highlights on the homepage.

## Files
- **HTML**: `events.html` (full listing), `index.html` (homepage teaser).
- **JavaScript**: `assets/js/events.js` (fetch + render), `assets/js/app.js` (layout interactions).
- **Data**: `data/production/events.json` (primary feed), `past.html` (archived listings). The repo also keeps a placeholder `events/README.md`.
- **Styles**: Shared theme and component styles from `assets/css/`.

## How it works
- `events.js` fetches the production JSON and renders cards with name, date, location, and description.
- Cards link out to referenced URLs or internal pages.
- Homepage pulls from the same JSON to show a subset (next event).

## Assumptions / Data Dependencies
- Each event object should include `id`, `name`, `date`, `description`, and optional `image` plus `calendarDetails` (location/time/notes).
- Dates are ISO-ish strings and are parsed in the browser; keep them valid and future-friendly.
- Ensure `data/production/events.json` stays in chronological order for predictable “next event” selection.
