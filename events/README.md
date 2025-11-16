# Events Directory

This directory contains individual event data files that are loaded dynamically by the main index.html page.

## Adding a New Event

To add a new event, follow these steps:

1. **Create a new JSON file** in the `events/` directory with a descriptive filename (e.g., `my-new-event.json`)

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
  "events/24-hour-work-out.json",
  "events/christmas-drinks.json",
  "events/gymrace.json",
  "events/deadly-dozen.json",
  "events/nuclear-races.json",
  "events/nuclear-fit.json",
  "events/my-new-event.json"  // <-- Add your new event here
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

- Use descriptive filenames with hyphens (e.g., `spring-marathon-2026.json`)
- Keep images in the `images/` directory for better organization
- Test your JSON syntax using an online validator
- Events are automatically sorted by date on the page
