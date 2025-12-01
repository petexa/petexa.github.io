# Plate Calculator

## What it does
Helps lifters calculate required barbell plates for a target weight or derive total bar weight from entered plates.

## Files
- **HTML**: `utilities/plate-calculator/index.html` (UI + inline scripts).
- **JavaScript**: Inline calculator logic within the page plus shared helpers from `assets/js/app.js` and `assets/js/theme.js` for navigation/theme.
- **Styles**: Shared `assets/css/tailwind.css` stack.

## How it works
- Two modes: _Calculate Plates Needed_ and _Calculate Total Weight_.
- Uses quick-add buttons for common KG plates; calculations are performed client-side with simple arithmetic.
- Results are rendered into `#plate-result` with descriptive breakdowns.

## Assumptions / Data Dependencies
- All weights are **kilograms** (no lbs support). Standard bar defaults to 20kg but can be overridden.
- Input sanitation is minimal; keep values numeric to avoid `NaN` results.
