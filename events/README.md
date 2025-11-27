# Events Guide

Welcome! This guide explains how events work on the Iron & Ale website, from start to finish. Whether you're adding an event manually or using our automated system, this document has everything you need.

## Table of Contents

1. [Overview](#overview)
2. [Event JSON Schema](#event-json-schema)
3. [Adding Events](#adding-events)
   - [Option 1: Automated (Recommended)](#option-1-automated-recommended)
   - [Option 2: Manual](#option-2-manual)
4. [n8n Workflow Details](#n8n-workflow-details)
5. [Testing & Troubleshooting](#testing--troubleshooting)

---

## Overview

Events on the Iron & Ale website follow a simple lifecycle:

1. **Create** - An event is created as a JSON file (either manually or via the admin form)
2. **Enrich** - If using automation, AI generates descriptions and images
3. **Commit** - The event file is saved to the `/events/` directory
4. **Display** - The website automatically shows the event on the events page

---

## Event JSON Schema

Events are stored as JSON files in the `/events/` directory.

### Filename Convention

Files must follow this naming pattern: `{event-name}-{YYYYMMDD}.json`

| Part | Description | Example |
|------|-------------|---------|
| `{event-name}` | Event name in lowercase with hyphens | `nuclear-fit`, `deadly-dozen` |
| `{YYYYMMDD}` | Date from the event's `date` field | `20260315` for March 15, 2026 |

**Examples:**
- `nuclear-fit-20260718.json` for Nuclear Fit on July 18, 2026
- `christmas-drinks-20251128.json` for Christmas Drinks on November 28, 2025

> 💡 **Why this format?** It prevents duplicate filenames when the same event occurs on different dates (e.g., Nuclear Fit happens multiple times a year).

### JSON Structure

Every event file uses this structure:

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

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name of the event |
| `date` | string | Yes | ISO 8601 datetime (e.g., `2026-03-15T10:00:00`) |
| `link` | string | No | URL to event's official page or registration |
| `image` | string | No | Path to event image (relative or absolute URL) |
| `description` | string | No | Short description shown on the event card |
| `calendarDetails.location` | string | Yes | Where the event takes place |
| `calendarDetails.description` | string | No | Description for .ics calendar file |
| `calendarDetails.durationHours` | number | Yes | Expected duration of the event in hours |
| `showMoreInfo` | boolean | No | Show/hide "More Info" button (default: true) |
| `showBookNow` | boolean | No | Show/hide "Book Now" button (default: false) |
| `showRemindMe` | boolean | No | Show/hide "Remind Me" button (default: true) |

---

## Adding Events

### Option 1: Automated (Recommended)

The easiest way to add events is through the admin page. The system will automatically:
- Generate AI-powered descriptions
- Create the properly formatted JSON file
- Commit it to the repository

**Steps:**

1. Go to `/admin.html` and enter the admin password
2. Fill out the "Add New Event" form with the event details
3. Click "Submit Event to Webhook"
4. The event will be automatically enriched and committed to GitHub
5. Refresh the events page to see your new event!

### Option 2: Manual

To add an event manually:

**Step 1: Create the JSON file**

Create a new file in the `/events/` directory using the naming convention above.

**Step 2: Add your event data**

Use the JSON template from the [JSON Structure](#json-structure) section. Here's a real example:

```json
{
  "name": "Spring Marathon",
  "date": "2026-03-15T09:00:00",
  "link": "https://springmarathon.com",
  "image": "images/spring-marathon.jpg",
  "description": "🏃 Join us for the annual Spring Marathon! A challenging but rewarding run through scenic countryside.",
  "calendarDetails": {
    "location": "Central Park, London",
    "description": "Spring Marathon 2026 - 26.2 miles of adventure",
    "durationHours": 6
  },
  "showMoreInfo": true,
  "showBookNow": true,
  "showRemindMe": true
}
```

**Step 3: Register the event**

Add your new event file to `events/events-list.json`:

```json
[
  "events/24-hour-work-out-20251122.json",
  "events/christmas-drinks-20251128.json",
  "events/spring-marathon-20260315.json"
]
```

**Step 4: Done!**

Save your changes and refresh the page. Your event will appear automatically, sorted by date.

### Tips for Manual Creation

- ✅ Store images in the `/images/` directory for better organization
- ✅ Use an online JSON validator to check your syntax
- ✅ Events are automatically sorted by date on the page
- ✅ Test locally before committing to ensure everything displays correctly

---

## n8n Workflow Details

The automated event system uses [n8n](https://n8n.io) to process submissions from the admin page. Here's how it works behind the scenes.

### How It Works

```
Admin Form → n8n Webhook → AI Enrichment → GitHub Commit
```

1. **Webhook receives** the form data from the admin page
2. **Data transformation** creates the proper filename and validates fields
3. **AI enrichment** (if needed) generates descriptions using OpenAI
4. **GitHub commit** saves the event file to the repository

### Prerequisites for Setup

- n8n instance (self-hosted or cloud)
- GitHub Personal Access Token with `repo` scope
- OpenAI API key (for AI enrichment)

### Webhook Configuration

The webhook receives POST requests at: `https://n8n.petefox.co.uk/webhook/events`

```json
{
  "httpMethod": "POST",
  "path": "events",
  "responseMode": "onReceived",
  "options": {
    "responseHeaders": {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  }
}
```

### Data Transformation

The workflow transforms incoming data and generates the filename:

```javascript
// Generate filename from event name and date
const eventName = input.name.toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const eventDate = input.date.substring(0, 10).replace(/-/g, '');
const filename = `${eventName}-${eventDate}.json`;
```

### AI Enrichment

When descriptions are missing, the workflow uses OpenAI to generate:
- A motivational 1-2 sentence description with an emoji
- A brief calendar description (max 100 characters)

If AI enrichment fails, sensible defaults are used automatically.

### GitHub Integration

The workflow commits directly to the repository:
- Creates the event JSON file in `/events/`
- Updates `events-list.json` with the new entry

---

## Testing & Troubleshooting

### Testing via Admin Page

1. Navigate to `/admin.html`
2. Enter the admin password
3. Fill out the form with test data
4. Submit and check the response in the page

### Testing via cURL

```bash
curl -X POST https://n8n.petefox.co.uk/webhook/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "date": "2025-12-25T10:00:00",
    "link": "https://example.com",
    "calendarDetails": {
      "location": "London, UK",
      "durationHours": 4
    },
    "showMoreInfo": true,
    "showBookNow": false,
    "showRemindMe": true
  }'
```

### Verifying Results

After adding an event:
1. Check the `/events/` directory for the new JSON file
2. Verify `events-list.json` includes the new file path
3. Refresh the events page to see the new event displayed

### Common Issues

| Problem | Solution |
|---------|----------|
| CORS errors | Ensure webhook has proper CORS headers configured |
| GitHub 403 error | Check that the Personal Access Token has `repo` scope |
| AI enrichment fails | The workflow handles this gracefully with default values |
| Event not showing | Verify the file is listed in `events-list.json` |
| Invalid JSON | Use a JSON validator to check your file syntax |

### Security Notes

- The admin page is password-protected
- GitHub tokens should be stored as n8n credentials (never in the workflow)
- Consider rate limiting on the webhook endpoint
- All input data is validated before processing

---

## Need Help?

If you run into issues:
1. Check the n8n execution logs for detailed error messages
2. The admin page shows the webhook response and payload sent
3. Test your JSON with an online validator before manual commits
