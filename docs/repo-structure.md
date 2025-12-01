# Repository Structure

This document maps the key folders and files that power **gym.petefox.co.uk** as a static GitHub Pages site. Use it as a quick orientation guide before making changes.

## Top-Level Layout

- `/assets/` — Shared CSS and JavaScript used across pages.
- `/data/` — JSON and CSV data powering workouts, events, and 2026 progress tracking.
- `/events/` — Event-facing assets and documentation (currently a stub README).
- `/workouts/` — Workout browser page and templates.
- `/utilities/` — Standalone utility tools (calculators, timers, trackers, charts).
- `/projects/` & `projects.html` — Community and personal project listings.
- `/about/` — About page content.
- `/images/` — Static image assets referenced by pages and JSON.
- `/scripts/` — Data-processing utilities and automation helpers.
- `/docs/` — Documentation (architecture, pipeline notes, onboarding, feature guides).
- `/style-guide/` — UI reference and component examples.
- `/archive/`, `/backup/`, `/agents/` — Legacy or experimental assets retained for reference.
- Root HTML pages (`index.html`, `events.html`, `utilities.html`, `admin.html`, `pb-matrix.html`, `past.html`) — Entry points for the main site areas.

## Key Directories

### assets/
- **css/**: `tailwind.css` entry point plus utility/component/theme layers for the site’s design system.
- **js/**: Core JavaScript modules (navigation, theme, workouts/events fetching, strength & skill progress, PB Matrix helpers).

### data/
- Production JSON under `data/production/` (events and workouts feeds used on pages).
- Progress tracking (`progress-2026.json`, `progress-2026-events.json`), handstand sessions, and movement metadata.
- Reports from the workout pipeline in `data/reports/` plus CSV source (`workouts_table.csv`).
- New reports will be written under `data/reports/` to avoid mutating source data.

### events/
- Contains `README.md` placeholder for the events system. Event JSON currently lives under `data/production/events.json` and progress event feeds under `data/progress-2026-events.json`.

### utilities/
- Individual tools as folders (`plate-calculator/`, `crossfit-timer/`, `workout-tracker/`, `progress-chart/`, `one-rep-max/`, `community-tools/`).
- Each contains its own `index.html` with inline logic plus shared CSS/JS imports from `assets/`.

### projects/
- `projects.html` and `/projects/` host project listings and supporting assets.

### scripts/
- Assorted helper scripts (e.g., data conversion). New data-fix utilities live under `scripts/data-fixes/`.

### archive/, backup/, agents/
- Legacy styles and historical experiments preserved for reference; not loaded by the live site.

### Root HTML Pages
- **index.html**: Homepage with navigation, Workout of the Day widget, events teaser, and feature highlights.
- **events.html**: Events listing sourced from production JSON.
- **utilities.html**: Directory page linking to the utility tools.
- **admin.html**: Logging/testing interface with webhook links.
- **pb-matrix.html**: Personal bests matrix powered by Google Apps Script data.
- **past.html**: Archive of previous events.

### Page Purposes & Dependencies
- **index.html** — Homepage shell; loads `assets/css/tailwind.css`, `assets/js/homepage-wod.js`, `assets/js/events.js`, `assets/js/app.js`, and `assets/js/theme.js`.
- **events.html** — Full events listing; loads `assets/css/tailwind.css`, `assets/js/events.js`, `assets/js/app.js`, and `assets/js/theme.js`.
- **projects.html** — Project listings; uses shared CSS plus `assets/js/app.js` and `assets/js/theme.js` for navigation/theme only.
- **utilities/index.html** — Utility directory; uses shared CSS/JS and links to individual tools with inline descriptions.
- **utilities/*/index.html** — Each tool page imports `assets/css/tailwind.css`, `assets/js/app.js`, and `assets/js/theme.js`, then layers tool-specific inline scripts (calculators, timers, trackers, charts).
- **workouts/index.html** — Workout browser; depends on `assets/js/workouts.js` and `assets/js/app.js`/`theme.js` for filtering and navigation.

## How the Site Uses These Folders
- Pages load shared styling and behavior from `assets/css/` and `assets/js/`.
- Workout and event data are fetched directly from JSON under `data/production/` and progress files under `data/`.
- Utility tools are self-contained but rely on shared theme/navigation scripts.
- Documentation under `docs/` explains pipelines, feature behavior, and maintenance workflows.
