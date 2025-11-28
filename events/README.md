# Iron & Ale Events - n8n Workflow Guide

---

## 🚀 Quick Start: Simplified Single-File Approach (Recommended)

The simplest way to manage events is using a **single `events.json` file** that contains all events. The n8n workflow receives new events from the admin form and merges them into this file.

### How It Works

1. **Admin Form** submits event data to n8n webhook
2. **n8n Workflow** validates the data, fetches existing events, merges the new event, and saves back to GitHub
3. **Website** loads all events from `events/events.json`

### Setup Steps

1. Download [`n8n-workflow-simple.json`](./n8n-workflow-simple.json)
2. In n8n, go to **Workflows** > **Import from File**
3. Select the downloaded JSON file
4. Update the GitHub credentials:
   - Click on "Get Events File" node → Edit credentials
   - Click on "Save Events File" node → Edit credentials
5. Activate the workflow!

### Workflow Nodes

| Node | Purpose |
|------|---------|
| **Webhook Trigger** | Receives POST at `/webhook/events` |
| **Validate Event** | Checks required fields, generates event ID |
| **Get Events File** | Fetches `events/events.json` from GitHub |
| **Merge Event** | Adds/updates event in array, preserves SHA |
| **Save Events File** | Commits updated `events.json` to GitHub |
| **Send Response** | Returns success/failure to admin form |

---

## 📁 File Structure

```
events/
├── events.json              # All events in one file (used by website)
├── n8n-workflow-simple.json # Simplified n8n workflow
└── README.md                # This guide
```

---

## 📝 Event JSON Schema

Each event in `events.json` has this structure:

```json
{
  "id": "event-name-20260315",
  "name": "Event Name",
  "date": "2026-03-15T09:00:00",
  "link": "https://event-website.com",
  "image": "images/event.jpg",
  "description": "Brief description of the event",
  "calendarDetails": {
    "location": "Event Location",
    "description": "Calendar description",
    "durationHours": 4
  },
  "showMoreInfo": true,
  "showBookNow": false,
  "showRemindMe": true
}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Event name |
| `date` | ISO 8601 datetime |
| `calendarDetails.location` | Event location |

---

## 🧪 Testing

### Via Admin Page

1. Go to `/admin.html`
2. Enter the admin password
3. Fill out the "Add New Event" form
4. Click "Submit Event to Webhook"
5. Check the response - should show success
6. Refresh the Events page to see your new event!

### Via cURL

```bash
curl -X POST https://n8n.petefox.co.uk/webhook/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "date": "2026-06-15T10:00:00",
    "link": "https://example.com",
    "calendarDetails": {
      "location": "London, UK",
      "durationHours": 4
    }
  }'
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing required field" error | Ensure name, date, and calendarDetails.location are provided |
| Event not appearing | Check the Events page loads `events/events.json` (check browser console) |
| n8n shows error | Check GitHub credentials have `repo` scope |
| Duplicate events | Events with same ID (name + date) will be updated, not duplicated |

---

## Legacy Files

The following files are from the old multi-file approach and can be removed:

- Individual event JSON files (`nuclear-fit-20260718.json`, etc.)
- `events-list.json`
- `n8n-workflow.json`
- `n8n-workflow-1-create-event.json`
- `n8n-workflow-2-update-list.json`
