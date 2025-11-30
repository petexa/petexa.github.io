// assets/js/strength-skill-logger.js
const StrengthSkillLogger = (function () {
  const WEBHOOK_URL = "https://n8n.petefox.co.uk/webhook/strength-skill-progress";
  const SHARED_SECRET = "SS-2026-Progress-Secret"; // Must match n8n IF node

  async function logFrameworkProgress(challengeId, value, meta = {}) {
    const payload = {
      secret: SHARED_SECRET,
      challengeId,
      value,
      unit: meta.unit || "session",
      phase: meta.phase ?? null,
      context: meta.context || "unknown",
      note: meta.note || "",
      source: meta.source || "framework-dashboard"
    };

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Framework logger error:", res.status, text);
      throw new Error(`Logger HTTP ${res.status}`);
    }

    return res.json().catch((err) => {
      console.warn("Framework logger: could not parse JSON response", err);
      return {};
    });
  }

  function attachClickLogger(selector, challengeId, value, meta = {}) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.addEventListener("click", async () => {
        el.disabled = true;
        const originalText = el.innerText;
        el.innerText = "Logging...";

        try {
          await logFrameworkProgress(challengeId, value, meta);
          el.innerText = "Logged ✅";
          el.dataset.logged = "true";
          setTimeout(() => {
            el.innerText = originalText;
            el.disabled = false;
          }, 1200);
        } catch {
          el.innerText = "Error ❌";
          setTimeout(() => {
            el.innerText = originalText;
            el.disabled = false;
          }, 1500);
        }
      });
    });
  }

  return { logFrameworkProgress, attachClickLogger };
})();
