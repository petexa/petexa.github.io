// assets/js/strength-skill-logger.js

const StrengthSkillLogger = (function () {
  // 🔗 Your n8n production webhook URL (NOT the -test one)
  const WEBHOOK_URL = "https://n8n.petefox.co.uk/webhook/strength-skill-progress";

  // ⚠️ This is not truly secret once in the frontend,
  // it just matches the IF check in n8n to block random noise
  const SHARED_SECRET = "SS-2026-Progress-Secret";

  async function logFrameworkProgress(challengeId, value, meta = {}) {
    const payload = {
      secret: SHARED_SECRET,
      challengeId,
      value,
      unit: meta.unit || "session",
      phase: meta.phase ?? null,
      context: meta.context || "unknown",
      note: meta.note || "",
      source: meta.source || "frontend"
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Framework logger error:", res.status, text);
        throw new Error(`Logger HTTP ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      console.log("Framework progress logged:", data);
      return data;
    } catch (err) {
      console.error("Error logging framework progress:", err);
      throw err;
    }
  }

  // Helper: attach click handlers to buttons by selector
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

  return {
    logFrameworkProgress,
    attachClickLogger
  };
})();
