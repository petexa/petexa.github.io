# Progress Charts

## What it does
Visualises performance trends over time using Chart.js, focusing on lifts and conditioning progress.

## Files
- **HTML**: `utilities/progress-chart/index.html` (chart canvas and controls).
- **JavaScript**: Inline chart setup within the page plus `assets/js/app.js`, `assets/js/theme.js`, and `assets/js/strength-skill-progress.js` (shared helpers for strength/skill visualisations).
- **Data**: Expects JSON data sources referenced in the page (e.g., progress logs) or manual entry.
- **Styles**: Shared design system via `assets/css/tailwind.css`.

## How it works
- Chart.js renders line/bar charts based on supplied datasets.
- The page loads movements/entries from configured JSON, then maps them into Chart.js datasets with labels/series.

## Assumptions / Data Dependencies
- Chart.js must be available via CDN or bundled script reference in the page.
- Data arrays must contain numeric values and timestamps/labels; invalid entries will render as gaps.
