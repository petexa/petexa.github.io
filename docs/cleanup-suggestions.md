# Cleanup Suggestions

These are non-breaking recommendations to simplify the repo over time. No files have been removed yet.

## Unused or Legacy Files
- `concat('events` directory and nested filename string artifacts — appears to be an accidental folder from a failed script run; safe to remove after confirming nothing references it.
- `backup/` and `archive/` folders — legacy assets/styles; keep for now but consider pruning after verifying they are not linked.
- `agents/` directory — historical content; verify necessity.
- `assets/js/main.js` — mostly utility toggles duplicated elsewhere; confirm active usage before refactoring or removing.

## Naming/Path Inconsistencies
- Mixed casing in `readme` vs `README.md`; prefer a single canonical README.
- Event data lives under `data/production/events.json` while `events/` contains only a README. Align folder naming or update documentation.
- Some utilities use inline scripts while others lean on shared modules; consider consolidating script patterns.

## Centralisation Opportunities
- Navigation/sidebar markup is repeated across utility pages; extract into an include-friendly snippet or shared template if a lightweight include mechanism is acceptable.
- Toast helpers and local storage utilities in `assets/js/app.js` could be reused by utility pages instead of duplicating inline logic.

## Future Refactors
- Adopt a consistent data schema for workouts/events/progress and validate on commit using a simple Node check (without introducing a build step).
- Replace inline timer/calculator scripts with modular JS files under `assets/js/` for easier testing and linting.
- Add a lightweight CI check to validate JSON formatting and schema conformance.
