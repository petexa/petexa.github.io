# Workout YouTube Agent – Full Specification

This document defines the behaviour, prompts, and data flow for the
“Workout YouTube Agent” implemented in n8n.

The agent takes workout JSON (skill, level, duration, focus, equipment),
generates a precise YouTube search query, retrieves YouTube API results,
filters & ranks videos using OpenAI, and returns a clean JSON object
containing 3–5 high-quality training videos.

This document is the source of truth for rebuilding or improving the agent.

=====================================================================
## 1. Workflow Overview
=====================================================================

Webhook (POST /workout-youtube-agent)
  → Node 1: OpenAI Build Search Query
  → Node 2: HTTP – YouTube Search
  → Node 3: OpenAI Rank & Format Videos
  → Node 4: Code – Parse JSON (final output)

Webhook returns the output of the final Code node.

=====================================================================
## 2. Node Roles
=====================================================================

### NODE 1 — “OpenAI Build Search Query”
Purpose:
Turn workout JSON into ONE effective, natural-language YouTube
search query string.

Model:
OpenAI Text (“Message a Model”), GPT-4.1 or GPT-4.1-mini

Output path:
output[0].content[0].text

Messages:
SYSTEM → Build Search Query System Prompt (see section 4)
USER → {{ JSON.stringify($json, null, 2) }}

------------------------------------------------------------

### NODE 2 — “HTTP – YouTube Search”
Purpose:
Query the YouTube Search API using Node 1’s query string.

Key parameter:
q = {{ $node["OpenAI Build Search Query"].json["output"][0]["content"][0]["text"] }}

Returns:
youtubeResponse.items[]

------------------------------------------------------------

### NODE 3 — “OpenAI Rank & Format Videos”
Purpose:
Analyse YouTube results + original search query → select
the top 5 most relevant training videos → output clean JSON.

Model:
OpenAI Text (“Message a Model”), GPT-4.1

Output path:
output[0].content[0].text

Messages:
SYSTEM → Rank & Format System Prompt (see section 5)
USER → JSON.stringify({ searchQuery, youtubeResponse })

------------------------------------------------------------

### NODE 4 — “Code in JavaScript”
Purpose:
Parse the JSON string from Node 3 → return a real JSON object.

Logic:
- Extract output[0].content[0].text
- JSON.parse it
- Return parsed object to webhook

=====================================================================
## 3. Input → Output Contract
=====================================================================

### INPUT BODY (from webhook)
{
  "workout": "handstand wall holds",
  "level": "beginner",
  "duration": "10 minutes",
  "equipment": "wall",
  "focus": "balance and shoulder endurance"
}

### OUTPUT BODY (returned by workflow)
{
  "queryUsed": "<exact query string>",
  "videos": [
    {
      "title": "<string>",
      "url": "<full YouTube URL>",
      "channel": "<string>",
      "publishedAt": "<ISO time or null>",
      "reason": "<short reason>"
    }
  ]
}

=====================================================================
## 4. SYSTEM PROMPT (Node 1: Build Search Query)
=====================================================================

You generate smart YouTube search queries for workout videos.

You will receive a JSON object describing a workout. Your job is to convert this into ONE highly effective YouTube search query string.

Use the fields when present:
- workout name or skill
- level (beginner/intermediate/advanced)
- duration (“10 minutes”, “20 minutes”)
- equipment (wall, dumbbells, barbell, rings)
- focus (balance, strength, mobility, endurance)

Rules:
- Always include the skill/workout name.
- Include level when useful.
- If duration exists, include “10 minute”, “15 minute”, etc.
- Prefer terms like: tutorial, drills, progression, follow along.
- Avoid noisy terms: vlog, podcast, reaction, challenge.
- Output ONLY the raw query string. No explanation, no JSON, no backticks.

=====================================================================
## 5. SYSTEM PROMPT (Node 3: Rank & Format Videos)
=====================================================================

You analyze YouTube Search API results and output high-quality workout video recommendations.

Input:
- searchQuery: the EXACT YouTube search string (never modify it)
- youtubeResponse: raw YouTube Search API JSON

Task:
1. Read youtubeResponse.items[]
2. Select ONLY the best 5 videos matching the training intent.

Prefer:
- Tutorials, drills, progressions
- Follow-alongs
- Skill technique breakdowns
- Coaching explanations
- Videos matching duration hints in searchQuery
- Videos published in the last 5 years

Exclude:
- YouTube Shorts
- Vertical videos
- Reaction videos
- Vlogs or lifestyle content
- Challenges
- Kids content
- Anything older than 2015 unless extremely high quality

Output EXACTLY this JSON:
{
  "queryUsed": "<string>",
  "videos": [
    {
      "title": "<string>",
      "url": "<string>",
      "channel": "<string>",
      "publishedAt": "<string or null>",
      "reason": "<string>"
    }
  ]
}

Rules:
- Set "queryUsed" EXACTLY to searchQuery.
- Build URLs as https://www.youtube.com/watch?v=VIDEO_ID
- If any field is missing, use null.
- Output ONLY valid JSON. No commentary. No backticks.

=====================================================================
## 6. FINAL PARSER (Node 4: Code)
=====================================================================

const root = $json;
let content = root.output?.[0]?.content?.[0]?.text || null;

if (!content && (root.queryUsed || root.videos)) {
  return [{ json: root }];
}

if (!content) {
  return [{ json: { error: "No text found in OpenAI response.", original: root } }];
}

let parsed;
try {
  parsed = JSON.parse(content);
} catch (e) {
  return [{ json: { error: "Failed to parse JSON.", message: e.message, rawContent: content } }];
}

return [{ json: parsed }];

=====================================================================
## 7. Notes
=====================================================================

- This is a stateless agent.
- All filtering happens in OpenAI Node 3.
- The workflow returns only clean JSON objects.
- Ideal for embedding inside the 2026 Strength & Skill Dashboard.

