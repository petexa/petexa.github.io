# Beginner's Tutorial: Setting Up the Iron & Ale Events n8n Workflow

---

## 🚀 Quick Start: Import the Workflow

**Want to skip the manual setup?** Import the pre-built workflow directly into n8n:

1. Download [`n8n-workflow.json`](./n8n-workflow.json)
2. In n8n, go to **Workflows** > **Import from File**
3. Select the downloaded JSON file
4. Update the GitHub credentials with your own (search for `YOUR_GITHUB_CREDENTIAL_ID_FROM_N8N_CREDENTIALS_PAGE`)
5. Activate the workflow!

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

### 4. Add a Webhook Trigger Node
- Drag in a **Webhook** node.
- Set **HTTP Method** to `POST`.
- Set **Path** to `events` (your webhook will be `/webhook/events`).
- Enable **Response Mode**: `onReceived`.
- Set **CORS Headers** (see recommended settings below).

The webhook will receive a JSON body like this:
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
  "showMoreInfo": true
}
```

### 5. Add a Validation and Normalization Function Node
- Drag in a **Function** node after the webhook.
- Name it "Validate & Normalize Input".
- This node validates required fields, normalizes the filename and date, and prepares the payload for downstream nodes.
- Paste the validation code:
  ```javascript
  // n8n Function node: validation + normalization for incoming webhook
  // Works when webhook payload is at items[0].json.body OR items[0].json

  const filenameRegex = /^[a-z0-9-]+-\d{8}\.json$/; // e.g. spring-marathon-20260315.json
  const required = ['name','date','filename'];

  // Helper: convert ISO datetime -> YYYY-MM-DD
  function toIsoDateOnly(val){
    if (typeof val !== 'string') return null;
    // already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // try full ISO or other date strings
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0,10);
    return null;
  }

  // Get the payload: prefer items[0].json.body if present (webhook structure), else items[0].json
  const root = items[0].json && typeof items[0].json === 'object' ? items[0].json : {};
  const payload = (root.body && typeof root.body === 'object' && Object.keys(root.body).length > 0) ? root.body : root;

  // Basic required-field check
  const missing = required.filter(f => payload[f] === undefined || payload[f] === null || (typeof payload[f] === 'string' && payload[f].trim() === ''));
  if (missing.length > 0) {
    throw new Error(`Missing required field(s): ${missing.join(', ')}`);
  }

  // Normalise filename
  if (typeof payload.filename === 'string') {
    payload.filename = payload.filename.trim().toLowerCase();
    // reject path traversal characters just in case
    if (payload.filename.includes('..') || payload.filename.includes('/') || payload.filename.includes('\\')) {
      throw new Error('Invalid filename: path traversal characters are not allowed.');
    }
  } else {
    throw new Error('filename must be a string.');
  }

  // Validate filename format
  if (!filenameRegex.test(payload.filename)) {
    throw new Error('Invalid filename format. Expect lower-case, hyphens, date YYYYMMDD. Example: event-name-20260315.json');
  }

  // Normalize date to YYYY-MM-DD
  const isoDate = toIsoDateOnly(payload.date);
  if (!isoDate) {
    throw new Error('Invalid date format. Use ISO date or ISO datetime (e.g. 2026-03-15 or 2026-03-15T09:00:00).');
  }
  payload.date = isoDate;

  // calendarDetails.location required
  if (!payload.calendarDetails || !payload.calendarDetails.location || String(payload.calendarDetails.location).trim() === '') {
    throw new Error('Missing required field: calendarDetails.location');
  }

  // Optionally coerce booleans/ints, trim strings you care about
  if (typeof payload.name === 'string') payload.name = payload.name.trim();

  // Replace the item's json with the validated payload so downstream nodes use direct keys
  items[0].json = payload;

  // Return items so the workflow continues
  return items;
  ```

### 6. (Optional) Add an OpenAI Enrichment Node
- Drag in an **OpenAI** node (if you want to auto-generate descriptions).
- Name it "AI Enrichment".
- Use the event name and details as input.
- Set output fields for `description` and `calendarDetails.description`.
- Connect this node after validation.

### 7. Add a Set Node for Event Data Preparation
- Drag in a **Set** node after validation (or after AI Enrichment if used).
- Name it "Prepare Event Data".
- Configure it to structure the event JSON with all required fields.
- Set default values for optional fields (`showMoreInfo: true`, `showBookNow: false`, `showRemindMe: true`).

### 8. Add a GitHub Node to Create the Event File
- Drag in a **GitHub** node.
- Name it "Create Event File".
- Set **Operation** to `Create or Update File`.
- Set **Repository Owner** to your GitHub username (e.g., `petexa`).
- Set **Repository Name** to your repo (e.g., `petexa.github.io`).
- Set **File Path** to `events/{{ $json.filename }}`.
- Set **File Content** to the event JSON (use n8n's expression editor).
- Set **Commit Message** (e.g., `Add new event: {{ $json.name }}`).

### 9. Add a GitHub Node to Get events-list.json
- Drag in another **GitHub** node.
- Name it "Get Events List".
- Set **Operation** to `Get File`.
- Set **Repository Owner** to your GitHub username.
- Set **Repository Name** to your repo.
- Set **File Path** to `events/events-list.json`.
- This fetches the current list and provides the SHA needed for updates.

### 10. Add a Function Node to Update the Events Array
- Drag in a **Function** node.
- Name it "Add Event to List".
- Add the new event filename to the array:
  ```javascript
  // Parse the current events list (GitHub returns base64 encoded content)
  const content = items[0].json.content;
  const currentList = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
  
  // Get the filename from the previous validated data
  const eventData = $('Prepare Event Data').first().json;
  const newFilename = `events/${eventData.filename}`;
  
  // Add the new filename if it doesn't already exist
  if (!currentList.includes(newFilename)) {
    currentList.push(newFilename);
  }
  
  // Store the updated list and SHA for the next node
  items[0].json.updatedList = JSON.stringify(currentList, null, 2);
  items[0].json.eventFilename = eventData.filename;
  items[0].json.eventName = eventData.name;
  
  return items;
  ```

### 11. Add a GitHub Node to Update events-list.json
- Drag in another **GitHub** node.
- Name it "Update Events List".
- Set **Operation** to `Update File`.
- Set **Repository Owner** to your GitHub username.
- Set **Repository Name** to your repo.
- Set **File Path** to `events/events-list.json`.
- Set **File Content** to `{{ $json.updatedList }}`.
- Set **SHA** to `{{ $('Get Events List').first().json.sha }}` (from step 9).
- Set **Commit Message** (e.g., `Update events list with {{ $json.eventName }}`).

### 12. Add an IF Node for Error Handling
- Drag in an **IF** node.
- Name it "Check for Errors".
- Configure conditions to check if any previous steps failed.
- Connect success path to the response node.
- Connect error path to notification node.

### 13. (Optional) Add a Notification Node for Errors
- Drag in a **Slack**, **Email**, or other notification node on the error branch.
- Name it "Send Error Notification".
- Configure it to alert you when event creation fails.

### 14. Add a Respond to Webhook Node
- Drag in a **Respond to Webhook** node.
- Name it "Send Response".
- Configure it to return success status and created filename.
- Example response: `{ "success": true, "filename": "{{ $json.filename }}" }`.

### 15. Test Your Workflow
- Click **Execute Workflow**.
- Use the admin page or cURL to POST a test event.
- Check the `/events/` directory and `events-list.json` for updates.

### 16. Deploy and Enable
- Save and activate your workflow.
- Your webhook is now live at: `https://<your-n8n-domain>/webhook/events`

---

## 📝 Tips
- Use the n8n **expression editor** (`{{ }}`) to reference fields dynamically.
- Always validate your JSON before committing.
- Check n8n's **execution logs** for troubleshooting.

---

**You're done!**
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
2. **Validation** checks required fields, normalizes filename and date, and sanitizes input
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
// n8n Function node: validation + normalization for incoming webhook
// Works when webhook payload is at items[0].json.body OR items[0].json

const filenameRegex = /^[a-z0-9-]+-\d{8}\.json$/; // e.g. spring-marathon-20260315.json
const required = ['name','date','filename'];

// Helper: convert ISO datetime -> YYYY-MM-DD
function toIsoDateOnly(val){
  if (typeof val !== 'string') return null;
  // already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // try full ISO or other date strings
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0,10);
  return null;
}

// Get the payload: prefer items[0].json.body if present (webhook structure), else items[0].json
const root = items[0].json && typeof items[0].json === 'object' ? items[0].json : {};
const payload = (root.body && typeof root.body === 'object' && Object.keys(root.body).length > 0) ? root.body : root;

// Basic required-field check
const missing = required.filter(f => payload[f] === undefined || payload[f] === null || (typeof payload[f] === 'string' && payload[f].trim() === ''));
if (missing.length > 0) {
  throw new Error(`Missing required field(s): ${missing.join(', ')}`);
}

// Normalise filename
if (typeof payload.filename === 'string') {
  payload.filename = payload.filename.trim().toLowerCase();
  // reject path traversal characters just in case
  if (payload.filename.includes('..') || payload.filename.includes('/') || payload.filename.includes('\\')) {
    throw new Error('Invalid filename: path traversal characters are not allowed.');
  }
} else {
  throw new Error('filename must be a string.');
}

// Validate filename format
if (!filenameRegex.test(payload.filename)) {
  throw new Error('Invalid filename format. Expect lower-case, hyphens, date YYYYMMDD. Example: event-name-20260315.json');
}

// Normalize date to YYYY-MM-DD
const isoDate = toIsoDateOnly(payload.date);
if (!isoDate) {
  throw new Error('Invalid date format. Use ISO date or ISO datetime (e.g. 2026-03-15 or 2026-03-15T09:00:00).');
}
payload.date = isoDate;

// calendarDetails.location required
if (!payload.calendarDetails || !payload.calendarDetails.location || String(payload.calendarDetails.location).trim() === '') {
  throw new Error('Missing required field: calendarDetails.location');
}

// Optionally coerce booleans/ints, trim strings you care about
if (typeof payload.name === 'string') payload.name = payload.name.trim();

// Replace the item's json with the validated payload so downstream nodes use direct keys
items[0].json = payload;

// Return items so the workflow continues
return items;
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
