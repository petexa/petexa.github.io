// Usage example:
// logFrameworkProgress('micro_300', 1, {
//   unit: 'session',
//   phase: 1,
//   context: 'gym',
//   note: '10-min micro-session from handstand page',
//   source: 'handstand-plan'
// });

const STRENGTH_SKILL_PROGRESS = {
  webhookUrl: 'https://YOUR_N8N_URL/webhook/strength-skill-progress',
  secret: 'CHANGE_ME_TO_MATCH_N8N'
};

async function logFrameworkProgress(challengeId, value, options = {}) {
  const payload = {
    secret: STRENGTH_SKILL_PROGRESS.secret,
    challengeId,
    value,
    unit: options.unit || 'count',
    phase: options.phase || null,
    context: options.context || null,
    note: options.note || '',
    source: options.source || 'web'
  };

  try {
    const res = await fetch(STRENGTH_SKILL_PROGRESS.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error('Progress log failed', await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('Progress log error', err);
    return false;
  }
}
