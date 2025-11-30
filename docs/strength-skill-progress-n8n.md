# Strength & Skill 2026 – n8n → GitHub Progress Logger

## Overview
- Front-end pages send POST requests to an n8n webhook whenever a Strength & Skill Framework event is logged.
- n8n validates a shared secret, reads `data/progress-2026.json` and `data/progress-2026-events.json` from GitHub, merges the new event, updates aggregate counts, and writes both files back through the GitHub node.
- Static dashboard/plan pages fetch `data/progress-2026.json` directly from this repo to render the latest progress.

## Webhook URL & payload format
- Suggested webhook path: `/webhook/strength-skill-progress`
- Expected JSON payload example:

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

Field notes:
- `secret`: shared string to prevent random spam.
- `challengeId`:
  - `micro_300` for each 10-min micro-session.
  - `hs_walk_gym`, `freestand_10s`, `ctw_60s`, `pullups_5`, `pressups_10`, `dips_5`, etc. for specific challenges.
- `value`: numeric value (e.g., 1 session, 3 metres, 10 seconds, 2 reps).
- `unit`, `phase`, `context`, `note`, `source`: optional metadata for richer logging.

## n8n workflow structure

1. **Webhook (Trigger)**
   - Method: POST
   - Path: `/strength-skill-progress`
   - Respond with JSON `{ "status": "ok" }` after success.

2. **IF – validate secret**
   - Condition: `{{$json["secret"]}}` equals the shared secret.
   - If false: return early with `{ "status": "denied" }`.

3. **GitHub – Get progress-2026.json**
   - Resource: File
   - Operation: Get
   - File Path: `data/progress-2026.json`
   - Output provides `fileContent` (base64 or string, depending on n8n version) and `sha`.

4. **GitHub – Get progress-2026-events.json**
   - Resource: File
   - Operation: Get
   - File Path: `data/progress-2026-events.json`

5. **Function node – Merge event and update aggregates**
   - Name: Build Updated Progress
   - Inputs: webhook JSON plus file content/sha from both GitHub nodes (use a Merge node or Additional Fields to pass `progressContent`, `progressSha`, `eventsContent`, and `eventsSha`).
   - Code:

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
function bumpChallenge(id, label, unit, target) {
  if (!progress.challenges[id]) {
    progress.challenges[id] = {
      id,
      name: label,
      unit,
      target,
      current: 0
    };
  }
  // For most metrics, we interpret value as "add" (sessions, reps).
  // For distances/time we can optionally track max, but keep it simple: add.
  if (value > 0 && challengeId === id) {
    progress.challenges[id].current += value;
  }
}

bumpChallenge('hs_walk_gym', 'Handstand walk across the gym', 'metres', 3);
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

   - Map `progressContent`/`progressSha` and `eventsContent`/`eventsSha` from the GitHub Get File nodes into this Function node using a Merge + Set pattern or Additional Fields so they are available on `$json`.

6. **GitHub – Update progress-2026.json**
   - Resource: File
   - Operation: Update (or Create/Update depending on n8n version)
   - File Path: `data/progress-2026.json`
   - Content: `{{ $json.progressJson }}`
   - SHA: `{{ $json.progressSha }}`
   - Commit message: `"chore: update progress-2026.json from n8n"`

7. **GitHub – Update progress-2026-events.json**
   - Resource: File
   - Operation: Update (Create or Update)
   - File Path: `data/progress-2026-events.json`
   - Content: `{{ $json.eventsJson }}`
   - SHA: `{{ $json.eventsSha }}`
   - Commit message: `"chore: append progress event (2026 framework)"`

## curl example

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
