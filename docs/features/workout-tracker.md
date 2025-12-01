# Workout Tracker

## What it does
Captures workout submissions from athletes and posts them to a configured webhook for logging.

## Files
- **HTML**: `utilities/workout-tracker/index.html` (form and submission feedback).
- **JavaScript**: Inline fetch-based submission logic plus `assets/js/app.js` and `assets/js/theme.js` for layout.
- **Data/Backend**: Expects a live webhook URL (defined within the page) to receive JSON payloads.
- **Styles**: Shared design system via `assets/css/tailwind.css`.

## How it works
- User inputs workout details (name, date, movements, notes). On submit, a POST request is sent to the webhook.
- Responses are handled in-page; success/failure messages are surfaced via form text and toast helpers.

## Assumptions / Data Dependencies
- Webhook URL must be valid; offline/invalid endpoints will surface as submission errors.
- No client-side persistence; history relies on external logging pipeline.
