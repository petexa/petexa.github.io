# n8n Event Workflow with AI Enrichment

This document describes the automated workflow for adding events to the Iron & Ale website via the admin page form and n8n automation.

## Overview

The workflow connects:
1. **Admin Page Form** → Collects event data from admin users
2. **n8n Webhook** → Receives the form submission
3. **AI Enrichment** → Generates descriptions, images, and location data
4. **GitHub Commit** → Adds the enriched JSON to the `/events/` folder

## Event Schema

All events follow this JSON schema:

```json
{
  "name": "Event Name",
  "date": "YYYY-MM-DDTHH:mm:ss",
  "link": "https://event-website.com",
  "image": "images/event.jpg",
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

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name of the event |
| `date` | string | Yes | ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss) |
| `link` | string | No | URL to event's official page or registration |
| `image` | string | No | Path to event image (relative or absolute URL) |
| `description` | string | No | Short description shown on the event card |
| `calendarDetails.location` | string | Yes | Where the event takes place |
| `calendarDetails.description` | string | No | Description for .ics calendar file |
| `calendarDetails.durationHours` | number | Yes | Expected duration of the event |
| `showMoreInfo` | boolean | No | Show/hide "More Info" button |
| `showBookNow` | boolean | No | Show/hide "Book Now" button |
| `showRemindMe` | boolean | No | Show/hide "Remind Me" button |

## n8n Workflow Setup

### Prerequisites

- n8n instance (self-hosted or cloud)
- GitHub Personal Access Token with `repo` scope
- OpenAI API key (or alternative AI provider)

### Node Configuration

#### 1. Webhook Node (Trigger)

Receives POST requests from the admin form.

```json
{
  "node": "Webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "events",
    "responseMode": "onReceived",
    "responseData": "allEntries",
    "options": {
      "responseHeaders": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    }
  }
}
```

**Webhook URL:** `https://n8n.petefox.co.uk/webhook/events`

#### 2. Function Node (Data Transformation)

Transforms and validates the incoming data.

```javascript
// Function Node: Transform Event Data
const input = $input.first().json;

// Generate filename from event name and date
const eventName = input.name.toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const eventDate = input.date.substring(0, 10).replace(/-/g, '');
const filename = `${eventName}-${eventDate}.json`;

// Prepare event object
const event = {
  name: input.name,
  date: input.date,
  link: input.link || null,
  image: input.image || null,
  description: input.description || null,
  calendarDetails: {
    location: input.calendarDetails?.location || '',
    description: input.calendarDetails?.description || null,
    durationHours: input.calendarDetails?.durationHours || 4
  },
  showMoreInfo: input.showMoreInfo ?? true,
  showBookNow: input.showBookNow ?? false,
  showRemindMe: input.showRemindMe ?? true
};

// Fields that need AI enrichment
const needsDescription = !event.description;
const needsCalendarDesc = !event.calendarDetails.description;
const needsImage = !event.image;

return {
  json: {
    event,
    filename,
    needsDescription,
    needsCalendarDesc,
    needsImage
  }
};
```

#### 3. IF Node (Check AI Enrichment Needed)

Routes to AI node if enrichment is needed.

```json
{
  "node": "IF",
  "parameters": {
    "conditions": {
      "boolean": [
        {
          "value1": "={{ $json.needsDescription || $json.needsCalendarDesc }}",
          "operation": "equal",
          "value2": true
        }
      ]
    }
  }
}
```

#### 4. OpenAI Node (AI Enrichment)

Generates motivational descriptions using AI.

```json
{
  "node": "OpenAI",
  "parameters": {
    "operation": "text",
    "model": "gpt-4",
    "prompt": "You are a fitness community event coordinator. Generate content for an event called '{{ $json.event.name }}' happening at '{{ $json.event.calendarDetails.location }}' on {{ $json.event.date }}.\n\nGenerate:\n1. A motivational 1-2 sentence description with an emoji for the event card\n2. A brief calendar description (max 100 characters)\n\nRespond in JSON format:\n{\n  \"description\": \"...\",\n  \"calendarDescription\": \"...\"\n}",
    "options": {
      "temperature": 0.7,
      "maxTokens": 200
    }
  }
}
```

**Alternative prompt for OpenAI:**

```
Create content for a fitness community event:
- Event: {{ $json.event.name }}
- Location: {{ $json.event.calendarDetails.location }}
- Date: {{ $json.event.date }}

Generate a JSON response with:
1. "description": A motivational 1-2 sentence description with an emoji (for the event card)
2. "calendarDescription": A brief calendar description (max 100 chars, for .ics file)

Keep it energetic and community-focused!
```

#### 5. Function Node (Merge AI Results)

Merges AI-generated content with event data.

```javascript
// Function Node: Merge AI Results
const event = $('Transform Event Data').item.json.event;
const filename = $('Transform Event Data').item.json.filename;
const needsDescription = $('Transform Event Data').item.json.needsDescription;
const needsCalendarDesc = $('Transform Event Data').item.json.needsCalendarDesc;

// Parse AI response
let aiContent = {};
try {
  const aiResponse = $input.first().json.text || $input.first().json.message?.content;
  aiContent = JSON.parse(aiResponse);
} catch (e) {
  // Use defaults if AI parsing fails
  aiContent = {
    description: `Join us for ${event.name}! An exciting fitness event.`,
    calendarDescription: `${event.name} at ${event.calendarDetails.location}`
  };
}

// Apply AI content where needed
if (needsDescription && aiContent.description) {
  event.description = aiContent.description;
}
if (needsCalendarDesc && aiContent.calendarDescription) {
  event.calendarDetails.description = aiContent.calendarDescription;
}

// If still missing image, set a default
if (!event.image) {
  event.image = 'images/default-event.jpg';
}

return {
  json: {
    event,
    filename,
    content: JSON.stringify(event, null, 2)
  }
};
```

#### 6. GitHub Node (Create/Update File)

Commits the enriched JSON file to the repository.

```json
{
  "node": "GitHub",
  "parameters": {
    "operation": "file:create",
    "owner": "petexa",
    "repository": "petexa.github.io",
    "path": "events/{{ $json.filename }}",
    "content": "={{ $json.content }}",
    "commitMessage": "Add enriched event: {{ $json.event.name }}"
  }
}
```

**Credentials:** Use a GitHub Personal Access Token with `repo` scope.

#### 7. Function Node (Update Events List)

Updates the events-list.json file.

```javascript
// Function Node: Prepare Events List Update
const filename = $input.first().json.filename;
const newPath = `events/${filename}`;

// This will be used to fetch and update events-list.json
return {
  json: {
    newEventPath: newPath,
    filename: filename
  }
};
```

#### 8. HTTP Request Node (Get Current Events List)

Fetches the current events-list.json.

```json
{
  "node": "HTTP Request",
  "parameters": {
    "method": "GET",
    "url": "https://raw.githubusercontent.com/petexa/petexa.github.io/main/events/events-list.json",
    "responseFormat": "json"
  }
}
```

#### 9. Function Node (Update Events List Array)

Adds the new event to the list.

```javascript
// Function Node: Add New Event to List
const currentList = $input.first().json;
const newPath = $('Prepare Events List Update').item.json.newEventPath;

// Check if already exists
if (!currentList.includes(newPath)) {
  currentList.push(newPath);
}

return {
  json: {
    eventsList: currentList,
    content: JSON.stringify(currentList, null, 2)
  }
};
```

#### 10. GitHub Node (Update Events List)

Commits the updated events-list.json.

```json
{
  "node": "GitHub",
  "parameters": {
    "operation": "file:edit",
    "owner": "petexa",
    "repository": "petexa.github.io",
    "path": "events/events-list.json",
    "content": "={{ $json.content }}",
    "commitMessage": "Update events list: add {{ $('Prepare Events List Update').item.json.filename }}"
  }
}
```

## Complete Workflow JSON

Import this JSON into n8n to get the complete workflow:

```json
{
  "name": "Event Webhook to GitHub",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "events",
        "responseMode": "onReceived",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "const input = $input.first().json;\n\nconst eventName = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');\nconst eventDate = input.date.substring(0, 10).replace(/-/g, '');\nconst filename = `${eventName}-${eventDate}.json`;\n\nconst event = {\n  name: input.name,\n  date: input.date,\n  link: input.link || null,\n  image: input.image || null,\n  description: input.description || null,\n  calendarDetails: {\n    location: input.calendarDetails?.location || '',\n    description: input.calendarDetails?.description || null,\n    durationHours: input.calendarDetails?.durationHours || 4\n  },\n  showMoreInfo: input.showMoreInfo ?? true,\n  showBookNow: input.showBookNow ?? false,\n  showRemindMe: input.showRemindMe ?? true\n};\n\nreturn { json: { event, filename, needsAI: !event.description || !event.calendarDetails.description } };"
      },
      "name": "Transform Data",
      "type": "n8n-nodes-base.function",
      "position": [450, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Transform Data", "type": "main", "index": 0}]]
    }
  }
}
```

## Testing the Workflow

1. **Test via Admin Page:**
   - Navigate to `/admin.html`
   - Enter admin password
   - Fill out the "Add New Event" form
   - Click "Submit Event to Webhook"
   - Check the response and log output

2. **Test via cURL:**

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

3. **Verify the Result:**
   - Check the GitHub repository for the new event file in `/events/`
   - Verify `events-list.json` includes the new file
   - Refresh the events page to see the new event

## Troubleshooting

### Common Issues

1. **CORS Errors:** Ensure the webhook node has CORS headers configured
2. **GitHub 403:** Check that the Personal Access Token has `repo` scope
3. **AI Enrichment Fails:** The workflow should handle this gracefully with default values
4. **Duplicate Events:** The workflow checks for existing files before creating

### Logs

- Check n8n execution logs for detailed error messages
- The admin page shows the webhook response and payload sent

## Security Notes

- The admin page is password-protected
- GitHub tokens should be stored as n8n credentials, not in workflow
- Consider rate limiting on the webhook endpoint
- Validate input data in the Function node before processing
