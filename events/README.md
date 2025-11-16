# Events Directory

This directory contains individual event data files that are loaded dynamically by the main index.html page.

## Adding a New Event

To add a new event, follow these steps:

1. **Create a new JSON file** in the `events/` directory following the naming convention: `{event-name}-{YYYYMMDD}.json` (e.g., `spring-marathon-20260315.json`)

2. **Use this template** for your event data:

```json
{
  "name": "Event Name",
  "date": "YYYY-MM-DDTHH:mm:ss",
  "link": "https://event-website.com",
  "image": "path/to/image.jpg",
  "description": "Brief description of the event",
  "calendarDetails": {
    "location": "Event Location",
    "description": "Detailed description for calendar",
    "durationHours": 4
  },
  "showMoreInfo": true,
  "showBookNow": false,
  "showRemindMe": true
}
```

3. **Add your event file** to the `events/events-list.json` file:

```json
[
  "events/24-hour-work-out-20251122.json",
  "events/christmas-drinks-20251128.json",
  "events/gymrace-20260321.json",
  "events/deadly-dozen-20260425.json",
  "events/nuclear-races-20260510.json",
  "events/nuclear-fit-20260718.json",
  "events/spring-marathon-20260315.json"  // <-- Add your new event here
]
```

4. **Save and refresh** - Your new event will automatically appear on the page!

## Field Descriptions

- **name**: The display name of the event
- **date**: ISO 8601 format datetime (YYYY-MM-DDTHH:mm:ss)
- **link**: URL to the event's official page or registration
- **image**: Path to event image (relative or absolute URL)
- **description**: Short description shown on the event card
- **calendarDetails**: Information for the calendar download
  - **location**: Where the event takes place
  - **description**: Description for the .ics calendar file
  - **durationHours**: Expected duration of the event
- **showMoreInfo**: Show/hide the "More Info" button (true/false)
- **showBookNow**: Show/hide the "Book Now" button (true/false)
- **showRemindMe**: Show/hide the "Remind Me" button (true/false)

## Tips

- **Naming convention**: Use the format `{event-name}-{YYYYMMDD}.json` where:
  - `{event-name}` is the event name in lowercase with hyphens (e.g., `nuclear-fit`, `deadly-dozen`)
  - `{YYYYMMDD}` is the date from the event's date field (e.g., `20260315` for March 15, 2026)
  - Example: `nuclear-fit-20260718.json` for Nuclear Fit on July 18, 2026
- This naming convention prevents duplicate filenames when the same event occurs on different dates
- Keep images in the `images/` directory for better organization
- Test your JSON syntax using an online validator
- Events are automatically sorted by date on the page
