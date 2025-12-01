# Developer Onboarding

Welcome to the Iron & Ale static site. Use this guide to get productive quickly without breaking GitHub Pages.

## Prerequisites
- Git and Node.js (for running small helper scripts; no build step needed).
- A simple static server for local preview (e.g., `npx http-server .` or Python `python -m http.server`).

## Run the site locally
```bash
# clone
git clone https://github.com/petexa/petexa.github.io.git
cd petexa.github.io

# install optional deps (only needed for CSV→JSON helpers)
npm install

# serve
npx http-server .
# or
python -m http.server 8000
```
Visit `http://localhost:8080` or the port your server prints.

## Adding or editing content
### Add a new utility page
1. Copy an existing utility folder under `utilities/` (e.g., `plate-calculator`) to preserve navigation/layout.
2. Update the page title, description, and inline script for your tool. Import shared CSS via `../../assets/css/tailwind.css` and shared JS (`app.js`, `theme.js`).
3. Link the new tool from `utilities/index.html`.

### Add a new event JSON entry
1. Open `data/production/events.json` and append a new object with `id`, `name`, `date`, `description`, and optional `image`/`calendarDetails` fields.
2. Keep ISO-style dates (`YYYY-MM-DDTHH:mm:ss`) for parsing.
3. Commit changes; the static pages will automatically render the new event via `assets/js/events.js`.

### Add a new progress JSON entry
- **Strength & Skill 2026**: update `data/progress-2026.json` (`microSessions` and `challenges`) and append event entries to `data/progress-2026-events.json`.
- **Workout progress charts**: ensure new JSON follows the structures described in `docs/data-schemas.md` once added. Link the file from the relevant utility page or dashboard.

## Common pitfalls
- **No build step**: keep assets loadable directly from GitHub Pages (avoid bundlers/transpilers).
- **Relative paths**: navigation expects relative links (`../../`) from utilities; verify paths after moving/copying pages.
- **Data shape**: `assets/js/` scripts assume specific fields; validate JSON updates against the schemas in `docs/data-schemas.md`.
- **Caching**: browsers may cache JSON; hard refresh when testing data changes.
