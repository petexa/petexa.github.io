/**
 * Workout Prompt Builder Widget
 * Generates a structured, copy-pasteable prompt for an AI coach to design a personalized workout session.
 */
(function () {
  'use strict';

  const form = document.getElementById('workoutPromptForm');
  const promptBox = document.getElementById('generatedPrompt');
  const copyBtn = document.getElementById('copyPromptBtn');
  const copyStatus = document.getElementById('copyStatus');

  if (!form || !promptBox) return; // page safety guard

  /**
   * Intensity mappings: comedic label → serious training intent
   */
  const intensityDescriptions = {
    'warm-hug': 'Warm Hug 🤗 – very gentle, low-stress session',
    'try-harder-chad': 'Try Harder, Chad 💪 – moderate challenge',
    'beast-mode': 'Beast Mode Activated 🦁 – hard work, but sustainable',
    'chosen-violence': 'I Have Chosen Violence 🔥 – very demanding but still safe',
    'call-ambulance': 'Call an Ambulance (But Not for Me) 🚑 – maximal effort, only if appropriate'
  };

  /**
   * Readiness guidance based on Garmin readiness levels
   */
  const readinessGuidance = {
    high: 'Training readiness is high – allow full volume and intensity within the chosen intensity label.',
    moderate: 'Training readiness is moderate – use sensible, moderate volume.',
    low: 'Training readiness is low – reduce volume and/or intensity accordingly.'
  };

  /**
   * Build the final structured prompt for another AI coach
   */
  function buildPrompt(values) {
    const {
      duration,
      warmup,
      sessionType,
      targetArea,
      location,
      readiness,
      intensity,
      equipment,
      notes,
      includeVideos,
      generatePdf
    } = values;

    const lines = [];

    // Opening statement addressing the AI coach
    lines.push('You are an experienced coach and workout programmer.');
    lines.push('Please design a custom training session based on the following details:');
    lines.push('');

    // Duration
    if (duration) {
      lines.push(`⏱ Duration: ${duration} minutes`);
      lines.push('');
    }

    // Warm-up
    if (warmup) {
      lines.push(`🚀 Warm-Up Included: ${warmup === 'yes' ? 'Yes' : 'No'}`);
      lines.push('');
    }

    // Intensity with explanation
    if (intensity && intensityDescriptions[intensity]) {
      lines.push(`🔥 Intensity: ${intensityDescriptions[intensity]}`);
      lines.push('');
    }

    // Session type
    if (sessionType) {
      lines.push(`🎯 Session Type: ${sessionType}`);
      lines.push('');
    }

    // Target area
    if (targetArea) {
      lines.push(`🧩 Target Area: ${targetArea}`);
      lines.push('');
    }

    // Location
    if (location) {
      lines.push(`📍 Location: ${location}`);
      lines.push('');
    }

    // Training readiness (only if not skipped)
    if (readiness && readiness !== 'skip' && readinessGuidance[readiness]) {
      lines.push(`📊 Training Readiness: ${readiness.charAt(0).toUpperCase() + readiness.slice(1)}`);
      lines.push(`   ${readinessGuidance[readiness]}`);
      lines.push('');
    }

    // Equipment
    if (equipment && equipment.trim().length > 0) {
      lines.push(`🛠 Equipment Available: ${equipment.trim()}`);
      lines.push('');
    }

    // Notes
    if (notes && notes.trim().length > 0) {
      lines.push(`📝 Notes: ${notes.trim()}`);
      lines.push('');
    }

    // Requirements section
    lines.push('Requirements:');
    lines.push('');
    lines.push('- Use clear section headings (Warm-Up, Main Session, Optional Finisher, Cool-Down).');
    lines.push('- Provide sets, reps, and/or work/rest intervals for each exercise.');
    lines.push('- Match overall difficulty to the combination of intensity and readiness.');
    lines.push('- Only include movements that respect the location and available equipment.');
    lines.push('- Ensure the entire session fits within the stated duration.');

    // Video requirement (conditional)
    if (includeVideos === 'true' || includeVideos === true) {
      lines.push('');
      lines.push("🎥 For each exercise, include a short demonstration video link or a clear search term (e.g. \"search: '[exercise name] tutorial'\").");
    }

    // PDF requirement (conditional)
    if (generatePdf === 'true' || generatePdf === true) {
      lines.push('');
      lines.push('📄 After designing the workout, also provide a compact, single-page printable version of the session with minimal extra commentary, suitable for exporting as a PDF.');
    }

    return lines.join('\n');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const values = {
      duration: formData.get('duration') || '',
      warmup: formData.get('warmup') || '',
      sessionType: formData.get('sessionType') || '',
      targetArea: formData.get('targetArea') || '',
      location: formData.get('location') || '',
      readiness: formData.get('readiness') || 'skip',
      intensity: formData.get('intensity') || '',
      equipment: formData.get('equipment') || '',
      notes: formData.get('notes') || '',
      includeVideos: formData.get('includeVideos') || 'false',
      generatePdf: formData.get('generatePdf') || 'false'
    };

    const prompt = buildPrompt(values);
    promptBox.value = prompt;
    if (copyStatus) copyStatus.textContent = '';
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', async function () {
      const text = (promptBox.value || '').trim();
      if (!text) {
        if (copyStatus) copyStatus.textContent = 'Generate a prompt first.';
        return;
      }

      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        // Fallback: select the text so user can copy manually
        promptBox.select();
        promptBox.setSelectionRange(0, promptBox.value.length);
        if (copyStatus) {
          copyStatus.textContent = 'Clipboard not available – text selected, use Ctrl+C / Cmd+C to copy.';
        }
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        if (copyStatus) copyStatus.textContent = 'Prompt copied to clipboard.';
      } catch (err) {
        // Fallback: select the text so user can copy manually
        promptBox.select();
        promptBox.setSelectionRange(0, promptBox.value.length);
        if (copyStatus) {
          copyStatus.textContent =
            'Could not copy – text selected, use Ctrl+C / Cmd+C to copy.';
        }
      }
    });
  }
})();
