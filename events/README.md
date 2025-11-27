# Beginner’s Tutorial: Setting Up the Iron & Ale Events n8n Workflow

---

## 🛠️ Step-by-Step: Setting Up the Iron & Ale Events n8n Workflow

### 1. Create Your n8n Instance
- Use [n8n cloud](https://n8n.io/cloud) or self-host (Docker, desktop app, or server)
- Follow the official [n8n installation guide](https://docs.n8n.io/hosting/installation/).

### 2. Set Up Credentials
- Go to **Credentials** in n8n.
- Add a **GitHub** credential (Personal Access Token with `repo` scope).
- Add an **OpenAI** credential (API key, if you want AI enrichment).

### 3. Create a New Workflow
- Click **Workflows** > **New Workflow**.

### 4. Add a Webhook Trigger
- Drag in a **Webhook** node.
- Set **HTTP Method** to `POST`.
- Set **Path** to `events` (your webhook will be `/webhook/events`).
- Enable **Response Mode**: `onReceived`.
- Set **CORS Headers** (see README for recommended settings).

### 5. Add a Validation Node
- Drag in a **Function** node after the webhook.
- Paste the validation code from the README:
  ```javascript
  const required = ['name', 'date', 'filename'];
  const missing = required.filter(field => !items[0].json[field]);
  if (missing.length > 0) throw new Error(`Missing required fields: ${missing.join(', ')}`);
  if (!items[0].json.calendarDetails?.location) throw new Error('Missing required field: calendarDetails.location');
  const filenameRegex = /^[a-z0-9-]+-\d{8}\.json$/;
  if (!filenameRegex.test(items[0].json.filename)) throw new Error('Invalid filename format.');
  return items;
  ```

### 6. (Optional) Add AI Enrichment
- Drag in an **OpenAI** node (if you want to auto-generate descriptions).
- Use the event name and details as input.
- Set output fields for `description` and `calendarDetails.description`.
- Connect this node after validation.

### 7. Add a GitHub Node to Create the Event File
- Drag in a **GitHub** node.
- Set **Operation** to `Create or Update File`.
- Set **Repository** to your repo (e.g., `petexa.github.io`).
- Set **File Path** to `events/{{ $json.filename }}`.
- Set **File Content** to the event JSON (use n8n’s expression editor).
- Set **Commit Message** (e.g., `Add new event: {{$json.name}}`).

### 8. Update `events-list.json`
- Add another **GitHub** node.
- Set **Operation** to `Get File` (to fetch the current list and SHA).
- Use a **Function** node to add the new filename to the array.
- Add a **GitHub** node to **Update File** (include the SHA from the previous step).

### 9. Set Up Error Handling
- Add an **IF** node after validation and GitHub nodes.
- On error, send a notification (Slack, Email, etc.) or return a clear error response.

### 10. Test Your Workflow
- Click **Execute Workflow**.
- Use the admin page or cURL to POST a test event.
- Check the `/events/` directory and `events-list.json` for updates.

### 11. Deploy and Enable
- Save and activate your workflow.
- Your webhook is now live at:  `https://<your-n8n-domain>/webhook/events`

---

## 📝 Tips
- Use the n8n **expression editor** (`{{ }}`) to reference fields dynamically.
- Always validate your JSON before committing.
- Check n8n’s **execution logs** for troubleshooting.

---

**You’re done!**
Your Iron & Ale events workflow is now automated and ready for use.
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
  "filename": "spring-marathon-20260315.json",
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
| `filename` | string | Yes | Filename for the event file (format: `{event-name}-{YYYYMMDD}.json`) |
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

> 💡 **n8n Optimization:** The `filename` field is included in the JSON so n8n can directly use it for the GitHub commit path without recalculating it.

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
  "filename": "spring-marathon-20260315.json",
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
Admin Form → n8n Webhook → Validation → AI Enrichment → GitHub Commit
```

1. **Webhook receives** the form data (including pre-generated `filename`) from the admin page
2. **Validation** checks required fields and sanitizes input
3. **AI enrichment** (if needed) generates descriptions using OpenAI
4. **GitHub commit** uses the `filename` field directly for the file path

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

### Data Transformation (Simplified)

Since the admin form now sends the `filename` field, n8n can use it directly:

```javascript
// The filename is already provided in the input
const filename = input.filename;  // e.g., "spring-marathon-20260315.json"
const filePath = `events/${filename}`;

// Use directly for GitHub commit - no transformation needed!
```

> 💡 **Optimization:** By including `filename` in the JSON payload, you eliminate the need for string manipulation in n8n, reducing complexity and potential errors.

### AI Enrichment

When descriptions are missing, the workflow uses OpenAI to generate:
- A motivational 1-2 sentence description with an emoji
- A brief calendar description (max 100 characters)

If AI enrichment fails, sensible defaults are used automatically.

### GitHub Integration

The workflow commits directly to the repository:
- Creates the event JSON file in `/events/` using the provided `filename`
- Updates `events-list.json` with the new entry

### Recommended n8n Optimizations

To bulletproof your n8n workflow, consider these optimizations:

| Optimization | Description |
|--------------|-------------|
| **Input validation** | Add an IF node to check required fields (`name`, `date`, `filename`, `calendarDetails.location`) before processing |
| **Duplicate detection** | Use HTTP Request to check if `events/{filename}` already exists before creating |
| **Error notifications** | Add a Slack/Email node on the error branch to alert on failures |
| **Idempotency key** | Use `filename` as an idempotency key to prevent duplicate submissions |
| **Rate limiting** | Configure webhook to reject rapid successive calls (e.g., 1 per 5 seconds) |
| **Fallback defaults** | Set default values for optional fields (`showMoreInfo: true`, `showBookNow: false`, etc.) |
| **Response feedback** | Return the created filename and status in the webhook response for admin page confirmation |

### Example Validation Node

```javascript
// Validation check for required fields
const required = ['name', 'date', 'filename'];
const missing = required.filter(field => !input[field]);

if (missing.length > 0) {
  throw new Error(`Missing required fields: ${missing.join(', ')}`);
}

if (!input.calendarDetails?.location) {
  throw new Error('Missing required field: calendarDetails.location');
}

// Validate filename format (lowercase letters, numbers, hyphens, and 8-digit date)
const filenameRegex = /^[a-z0-9-]+-\d{8}\.json$/;
if (!filenameRegex.test(input.filename)) {
  throw new Error('Invalid filename format. Expected: {event-name}-{YYYYMMDD}.json (lowercase, hyphens only)');
}

return input;
```

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
    "filename": "test-event-20251225.json",
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
