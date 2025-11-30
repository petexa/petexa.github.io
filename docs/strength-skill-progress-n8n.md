# Strength & Skill 2026 – n8n → GitHub Progress Logger

This document describes how to set up an n8n workflow that logs progress events from a front-end dashboard to JSON files stored in this GitHub repository.

## Overview

The logging system works as follows:

1. **Front-end sends POST requests** to an n8n Webhook when a user logs progress.
2. **n8n workflow**:
   - Validates a shared secret to prevent spam.
   - Loads `data/progress-2026.json` and `data/progress-2026-events.json` from this GitHub repo.
   - Merges the new event into the event log.
   - Updates aggregate counts (micro-sessions completed, challenge progress).
   - Writes both files back to GitHub via the GitHub node.
3. **Static dashboard** reads `data/progress-2026.json` to display the latest progress.

---

## Webhook URL & Payload Format

### Suggested Webhook Path

```
/webhook/strength-skill-progress
```

Full URL example: `https://YOUR_N8N_URL/webhook/strength-skill-progress`

### Expected JSON Payload

```json
{
  "secret": "YOUR_SHARED_SECRET",
  "challengeId": "micro_300",
  "value": 1,
  "unit": "session",
  "phase": 1,
  "context": "gym",
  "note": "10-min micro-session before class",
  "source": "web-dashboard"
}
```

### Field Descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `secret` | **Yes** | Shared secret string to prevent random spam. Must match the value configured in n8n. |
| `challengeId` | **Yes** | Identifier for the challenge or activity. See valid IDs below. |
| `value` | **Yes** | Numeric value (e.g., 1 session, 3 metres, 10 seconds, 2 reps). |
| `unit` | No | Unit of measurement (e.g., "session", "metres", "seconds", "reps"). |
| `phase` | No | Phase number for the training program (1–6). |
| `context` | No | Where the activity was performed (e.g., "gym", "home", "outdoor"). |
| `note` | No | Free-text note about the session. |
| `source` | No | Source of the log entry (e.g., "web-dashboard", "curl", "mobile-app"). |

### Valid Challenge IDs

| ID | Description |
|----|-------------|
| `micro_300` | 10-minute micro-session (increments the 300-session goal) |
| `hs_walk_gym` | Handstand walk across the gym (metres) |
| `freestand_10s` | Freestanding handstand hold (seconds) |
| `ctw_60s` | Chest-to-wall handstand hold (seconds) |
| `pullups_5` | Strict pull-ups (reps) |
| `pressups_10` | Strict press-ups (reps) |
| `dips_5` | Strict dips (reps) |

---

## n8n Workflow Structure

Build the following node sequence in n8n:

### 1. Webhook (Trigger)

- **Method:** POST
- **Path:** `/strength-skill-progress`
- **Response Mode:** Respond when last node finishes (or use a Respond to Webhook node)
- **Response:** Return `{ "status": "ok" }` after success

### 2. IF – Validate Secret

Create an IF node to validate the shared secret:

- **Condition:** `{{ $json["secret"] }}` equals your shared secret string
- **True branch:** Continue to GitHub Get nodes
- **False branch:** Return early with `{ "status": "denied" }`

### 3. GitHub – Get progress-2026.json

- **Credential:** Your GitHub credential (with repo write access)
- **Resource:** File
- **Operation:** Get
- **Repository Owner:** `petexa`
- **Repository Name:** `petexa.github.io`
- **File Path:** `data/progress-2026.json`

**Output will contain:**
- `content` (file content, may be base64 encoded)
- `sha` (required for updating the file)

### 4. GitHub – Get progress-2026-events.json

- **Credential:** Your GitHub credential
- **Resource:** File
- **Operation:** Get
- **Repository Owner:** `petexa`
- **Repository Name:** `petexa.github.io`
- **File Path:** `data/progress-2026-events.json`

**Output will contain:**
- `content` (file content)
- `sha` (required for updating the file)

### 5. Merge Node (Optional)

If using separate GitHub Get nodes, use a Merge node to combine:
- Webhook data
- progress-2026.json content + sha
- progress-2026-events.json content + sha

Alternatively, use a Set node or Function node to map the outputs into a single item.

### 6. Function Node – Build Updated Progress

**Name:** Build Updated Progress

This node merges the new event and updates aggregate counts.

**Inputs Expected:**
- Webhook JSON (the original event payload)
- `progressContent`: content from progress-2026.json (string or object)
- `progressSha`: sha from progress-2026.json
- `eventsContent`: content from progress-2026-events.json (string or object)
- `eventsSha`: sha from progress-2026-events.json

**Code:**

```js
// Expect:
//  - $json.body or top-level fields from the webhook
//  - progressFile: content + sha for progress-2026.json
//  - eventsFile: content + sha for progress-2026-events.json

function safeParse(jsonLike, fallback) {
  if (!jsonLike) return fallback;
  if (typeof jsonLike === 'string') {
    try { return JSON.parse(jsonLike); } catch (e) { return fallback; }
  }
  if (typeof jsonLike === 'object') return jsonLike;
  return fallback;
}

const now = new Date().toISOString();
const body = $json.body || $json;

const challengeId = body.challengeId || 'unknown';
const value = Number(body.value || 0);
const unit = body.unit || '';
const phase = body.phase ?? null;
const context = body.context || null;
const note = body.note || '';
const source = body.source || 'unknown';

// These will be provided via a previous GitHub Get File step
const progressContent = $json.progressContent;   // string or object
const progressSha = $json.progressSha || null;

const eventsContent = $json.eventsContent;
const eventsSha = $json.eventsSha || null;

// Parse or seed defaults
let progress = safeParse(progressContent, {
  updatedAt: now,
  microSessions: { completed: 0, goal: 300 },
  challenges: {},
  events: []
});

let eventsLog = safeParse(eventsContent, { events: [] });

if (!Array.isArray(eventsLog.events)) eventsLog.events = [];

// Append new event
const newEvent = {
  timestamp: now,
  challengeId,
  value,
  unit,
  phase,
  context,
  note,
  source
};
eventsLog.events.push(newEvent);

// Update aggregates
// Micro-sessions: treat challengeId === "micro_300" as +value sessions
if (!progress.microSessions) {
  progress.microSessions = { completed: 0, goal: 300 };
}
if (challengeId === 'micro_300' && value > 0) {
  progress.microSessions.completed += value;
}

// Ensure challenges object exists
if (!progress.challenges || typeof progress.challenges !== 'object') {
  progress.challenges = {};
}

// Helper to update a challenge
function bumpChallenge(id, label, unit, target, stretchTarget = null) {
  if (!progress.challenges[id]) {
    const challenge = {
      id,
      name: label,
      unit,
      target,
      current: 0
    };
    // Only add stretchTarget if provided
    if (stretchTarget !== null) {
      challenge.stretchTarget = stretchTarget;
    }
    progress.challenges[id] = challenge;
  }
  // For most metrics, we interpret value as "add" (sessions, reps).
  // For distances/time we can optionally track max, but keep it simple: add.
  if (value > 0 && challengeId === id) {
    progress.challenges[id].current += value;
  }
}

bumpChallenge('hs_walk_gym', 'Handstand walk across the gym', 'metres', 3, 5);
bumpChallenge('freestand_10s', 'Freestanding handstand hold', 'seconds', 10);
bumpChallenge('ctw_60s', 'Chest-to-wall handstand hold', 'seconds', 60);
bumpChallenge('pullups_5', 'Strict pull-ups', 'reps', 5);
bumpChallenge('pressups_10', 'Strict press-ups', 'reps', 10);
bumpChallenge('dips_5', 'Strict dips', 'reps', 5);

progress.updatedAt = now;

// Return new JSON + shas for GitHub
return [
  {
    json: {
      progressJson: JSON.stringify(progress, null, 2),
      progressSha,
      eventsJson: JSON.stringify(eventsLog, null, 2),
      eventsSha
    }
  }
];
```

**Notes on mapping inputs:**

The `progressContent`, `progressSha`, `eventsContent`, and `eventsSha` fields must be mapped from the outputs of the previous GitHub Get File nodes. You can do this via:

1. **Merge node:** Combine outputs from Webhook + both GitHub nodes, then use Set node to rename fields.
2. **Set node:** After each GitHub Get, add fields like `progressContent = {{ $json.content }}` and `progressSha = {{ $json.sha }}`.
3. **Function node inputs:** Reference multiple inputs using `$('GitHub Get Progress').item.json.content` syntax.

### 7. GitHub – Update progress-2026.json

- **Credential:** Your GitHub credential
- **Resource:** File
- **Operation:** Edit (or "Create or Update" depending on n8n version)
- **Repository Owner:** `petexa`
- **Repository Name:** `petexa.github.io`
- **File Path:** `data/progress-2026.json`
- **File Content:** `{{ $json.progressJson }}`
- **SHA:** `{{ $json.progressSha }}`
- **Commit Message:** `chore: update progress-2026.json from n8n`

### 8. GitHub – Update progress-2026-events.json

- **Credential:** Your GitHub credential
- **Resource:** File
- **Operation:** Edit (or "Create or Update")
- **Repository Owner:** `petexa`
- **Repository Name:** `petexa.github.io`
- **File Path:** `data/progress-2026-events.json`
- **File Content:** `{{ $json.eventsJson }}`
- **SHA:** `{{ $json.eventsSha }}`
- **Commit Message:** `chore: append progress event (2026 framework)`

### 9. Respond to Webhook (Optional)

If using "Respond when last node finishes" doesn't work well, add a Respond to Webhook node:

- **Response Code:** 200
- **Response Body:** `{ "status": "ok" }`

---

## curl Example

Test the workflow with this curl command:

```bash
curl -X POST "https://YOUR_N8N_URL/webhook/strength-skill-progress" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SHARED_SECRET",
    "challengeId": "micro_300",
    "value": 1,
    "unit": "session",
    "phase": 1,
    "context": "gym",
    "note": "Test micro-session from curl",
    "source": "curl"
  }'
```

**Expected response:** `{ "status": "ok" }`

---

## Front-End Helper Function

Use this JavaScript function to log progress from your web dashboard:

```js
/**
 * Log progress to the n8n webhook.
 * @param {Object} options - The progress event options.
 * @param {string} options.challengeId - Challenge ID (e.g., "micro_300", "pullups_5").
 * @param {number} options.value - Numeric value to log.
 * @param {string} [options.unit] - Unit of measurement.
 * @param {number} [options.phase] - Training phase (1–6).
 * @param {string} [options.context] - Where performed (e.g., "gym").
 * @param {string} [options.note] - Free-text note.
 * @param {string} [options.source="web-dashboard"] - Source identifier.
 * @returns {Promise<{status: string}>} - The response from n8n.
 */
async function logProgress({
  challengeId,
  value,
  unit = '',
  phase = null,
  context = null,
  note = '',
  source = 'web-dashboard'
}) {
  const N8N_WEBHOOK_URL = 'https://YOUR_N8N_URL/webhook/strength-skill-progress';
  const SHARED_SECRET = 'YOUR_SHARED_SECRET';

  const payload = {
    secret: SHARED_SECRET,
    challengeId,
    value,
    unit,
    phase,
    context,
    note,
    source
  };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to log progress:', error);
    throw error;
  }
}

// Example usage:
// await logProgress({
//   challengeId: 'micro_300',
//   value: 1,
//   unit: 'session',
//   phase: 1,
//   context: 'gym',
//   note: 'Morning handstand practice'
// });
```

---

## Data File Schemas

### data/progress-2026.json

This is the aggregated progress file that the dashboard reads.

```json
{
  "updatedAt": "2025-11-30T00:00:00Z",
  "microSessions": {
    "completed": 0,
    "goal": 300
  },
  "challenges": {
    "hs_walk_gym": {
      "id": "hs_walk_gym",
      "name": "Handstand walk across the gym",
      "unit": "metres",
      "target": 3,
      "stretchTarget": 5,
      "current": 0
    }
    // ... other challenges
  },
  "events": []
}
```

### data/progress-2026-events.json

This is the raw event log file with all historical events.

```json
{
  "events": [
    {
      "timestamp": "2025-11-30T12:30:00Z",
      "challengeId": "micro_300",
      "value": 1,
      "unit": "session",
      "phase": 1,
      "context": "gym",
      "note": "Morning practice",
      "source": "web-dashboard"
    }
  ]
}
```

---

## Security Considerations

1. **Shared Secret:** Use a strong, random secret (e.g., 32+ character string). Never commit the actual secret to the repository.
2. **Rate Limiting:** Consider adding rate limiting in n8n or at the network level.
3. **GitHub Token:** Use a Personal Access Token (PAT) or GitHub App with minimal required permissions (repo read/write for content).
4. **HTTPS:** Ensure your n8n instance uses HTTPS.

---

## Troubleshooting

### "status": "denied" response
- Check that the `secret` in your request matches the one configured in the n8n IF node.

### GitHub update fails with 409 Conflict
- The SHA is stale. This can happen if two requests arrive simultaneously. Retry the request.

### File content appears as base64
- Some n8n versions return GitHub file content as base64. Decode it in the Function node:
  ```js
  const decoded = Buffer.from($json.content, 'base64').toString('utf8');
  ```

### Events not appearing
- Check that the Function node is correctly receiving all inputs.
- Verify the Merge node is combining data correctly.
- Check n8n execution logs for errors.
