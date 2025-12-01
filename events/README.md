
---

## 📍 Data Location

**Note:** Event data is stored at `data/production/events.json`, not in this directory. This folder contains documentation and n8n workflow configuration files only.

---

## 🚀 Quick Start: Simplified Single-File Approach (Recommended)

The simplest way to manage events is using a **single `events.json` file** that contains all events. The n8n workflow receives new events from the admin form, optionally generates AI descriptions, and merges them into this file.

### How It Works

1. **Admin Form** submits event data to n8n webhook
2. **n8n Workflow** validates the data, optionally generates AI description, fetches existing events, merges the new event, and saves back to GitHub
3. **Website** loads all events from `data/production/events.json`

### Setup Steps

1. Download [`n8n-workflow-simple.json`](./n8n-workflow-simple.json)
2. In n8n, go to **Workflows** > **Import from File**
3. Select the downloaded JSON file
4. Update credentials:
   - **GitHub**: Click on "Get Events File" and "Save Events File" nodes → Edit credentials
   - **OpenAI** (optional): Click on "AI Generate Description" node → Edit credentials
5. Activate the workflow!

### Workflow Nodes

| Node | Purpose |
|------|---------|
| **Webhook Trigger** | Receives POST at `/webhook/events` |
| **Validate Event** | Checks required fields, generates event ID, checks if AI needed |
| **Needs AI?** | Routes to AI node if description is empty or `useAI=true` |
| **AI Generate Description** | Uses OpenAI to generate engaging description (optional) |
| **Apply AI Description** | Adds AI text to event object |
| **Skip AI** | Passes through unchanged when description provided |
| **Merge Paths** | Combines AI and non-AI paths |
| **Get Events File** | Fetches `events/events.json` from GitHub |
| **Merge Event** | Adds/updates event in array, preserves SHA |
| **Save Events File** | Commits updated `events.json` to GitHub |
| **Send Response** | Returns success/failure to admin form |

---

## 🤖 AI Feature (Optional)

The workflow includes an **optional AI description generator** using OpenAI. It triggers automatically when:

- The `description` field is empty or missing
- You explicitly set `useAI: true` in the request

### AI Setup

1. Add your OpenAI API key to n8n credentials
2. Click on "AI Generate Description" node
3. Select your OpenAI credential
4. The AI uses `gpt-4o-mini` by default (fast and cheap)

### AI Prompt

The AI generates a 1-2 sentence motivational description with an emoji, perfect for fitness events. Example output:

> 💪 Get ready to push your limits at Nuclear Fit! An epic day of strength circuits and camaraderie awaits.

### Disable AI

If you don't want AI descriptions:
- Always provide a `description` in your form submission
- Or delete the AI nodes from the workflow (keep the "Skip AI" path)

---

## 📁 File Structure

```
events/
├── events.json              # All events in one file (used by website)
├── n8n-workflow-simple.json # n8n workflow with optional AI
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

### Optional Fields

| Field | Description |
|-------|-------------|
| `description` | Event description (AI generates if empty) |
| `useAI` | Set to `true` to force AI description generation |

---

## 🧪 Testing

### Via Admin Page

1. Go to `/admin.html`
2. Enter the admin password
3. Fill out the "Add New Event" form
4. Leave description blank to use AI, or fill it in to skip AI
5. Click "Submit Event to Webhook"
6. Check the response - should show success and `usedAI: true/false`
7. Refresh the Events page to see your new event!

### Via cURL (with AI)

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

### Via cURL (without AI)

```bash
curl -X POST https://n8n.petefox.co.uk/webhook/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "date": "2026-06-15T10:00:00",
    "description": "My custom description",
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
| AI not working | Check OpenAI credentials are set and have API credits |
| Duplicate events | Events with same ID (name + date) will be updated, not duplicated |

---

## Legacy Files

The following files are from the old multi-file approach and can be removed:

- Individual event JSON files (`nuclear-fit-20260718.json`, etc.)
- `events-list.json`
- `n8n-workflow.json`
- `n8n-workflow-1-create-event.json`
- `n8n-workflow-2-update-list.json`

