# CrossFit Timer

## What it does
Provides in-browser timers for common CrossFit formats (Clock/For Time, EMOM, AMRAP, Tabata) with fullscreen support.

## Files
- **HTML**: `utilities/crossfit-timer/index.html` (timer UI, controls, inline logic).
- **JavaScript**: Inline within the page, plus shared scripts `assets/js/theme.js` and `assets/js/app.js` for layout interactions.
- **Styles**: Shared `assets/css/tailwind.css` stack; timer-specific styles are inline.

## How it works
- Users pick a mode and duration/intervals; the script runs countdowns with visual feedback.
- Uses `window.setInterval` and DOM updates; also supports keyboard toggles for start/pause in some modes.
- Fullscreen toggle leverages the Fullscreen API for gym display.

## Assumptions / Data Dependencies
- Browser must allow audio/visual timers; no external services are required.
- Timing accuracy is browser-based; not suitable for competition-grade timing without further validation.
