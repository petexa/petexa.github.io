# Cleanup Suggestions

These are non-breaking recommendations to simplify the repo over time.

## Completed Items ✅
- ~~`concat('events` directory and nested filename string artifacts~~ — **Removed** (was an accidental folder from a failed script run).
- ~~`agents/` directory~~ — **Moved** content to `docs/workout-youtube-agent.md` for better organization.
- ~~Documentation scattered across `readme/`, `docs/`, and root~~ — **Consolidated** all documentation into `docs/` with organized subfolders:
  - `docs/workflows/` — n8n workflows, data pipeline, enrichment agent
  - `docs/features/` — Feature-specific documentation
  - `docs/legacy/` — Archived historical documentation
- ~~Root-level duplicate `.md` files~~ — **Removed** `PB-MATRIX-SETUP.md`, `README_fix_workouts.md`, `validation_report.md`
- ~~Main README lacks clear navigation~~ — **Updated** `README.md` with comprehensive documentation index and summaries
- ~~`assets/js/main.js`~~ — **Removed** as it was only referenced from `backup/` files and not used by any active pages.
- ~~Root-level `csvToJsonWorkouts.js`~~ — **Moved** to `scripts/csvToJsonWorkouts.js` for better organization.
- ~~Inline timer/calculator scripts~~ — **Extracted** to modular JS files under `assets/js/`:
  - `assets/js/one-rep-max.js` — One Rep Max Calculator logic
  - `assets/js/crossfit-timer.js` — CrossFit Timer logic (Clock, EMOM, Tabata, AMRAP, For Time)
  - `assets/js/plate-calculator.js` — Plate Calculator logic

## Unused or Legacy Files
- `backup/` and `archive/` folders — legacy assets/styles; keep for now but consider pruning after verifying they are not linked. Both are gitignored.

## Naming/Path Inconsistencies
- ~~Mixed casing in `readme/` folder vs `README.md` file~~ — **Resolved**: The `readme/` folder has been consolidated into `docs/` with proper organization into subfolders (workflows, features, legacy).
- ~~Event data lives under `data/production/events.json` while `events/` contains only a README~~ — **Updated** `events/README.md` to document the actual data location.
- ~~Some utilities use inline scripts while others lean on shared modules~~ — **Resolved**: Utility page scripts have been extracted to modular JS files under `assets/js/`.

## Centralisation Opportunities
- Navigation/sidebar markup is repeated across utility pages; extract into an include-friendly snippet or shared template if a lightweight include mechanism is acceptable.
- Toast helpers and local storage utilities in `assets/js/app.js` could be reused by utility pages instead of duplicating inline logic.

## Future Refactors
- Adopt a consistent data schema for workouts/events/progress and validate on commit using a simple Node check (without introducing a build step).
- Add a lightweight CI check to validate JSON formatting and schema conformance.
