/**
 * Workout Prompt Builder Widget
 * Generates a ChatGPT prompt for building a personalized workout session.
 */
(function () {
  'use strict';

  const form = document.getElementById('workoutPromptForm');
  const promptBox = document.getElementById('generatedPrompt');
  const copyBtn = document.getElementById('copyPromptBtn');
  const copyStatus = document.getElementById('copyStatus');

  if (!form || !promptBox) return; // page safety guard

  function buildPrompt(values) {
    const {
      duration,
      includeWarmup,
      sessionType,
      difficulty,
      focusArea,
      location,
      trainingReadiness,
      extraNotes,
    } = values;

    const lines = [];

    lines.push(
      'You are an experienced coach and workout programmer. Design a single training session for me.'
    );

    lines.push(
      `Session details: I have about ${duration} minutes for a ${sessionType} session at ${location}.`
    );

    lines.push(`Primary focus: ${focusArea}.`);

    lines.push(
      `Difficulty level: ${difficulty}. Scale the intensity and exercise selection accordingly.`
    );

    if (includeWarmup === 'yes') {
      lines.push(
        'Include a short warm-up at the start (5–10 minutes) that prepares me for the main work.'
      );
    } else {
      lines.push(
        'Skip any dedicated warm-up block and go straight into the main work.'
      );
    }

    if (trainingReadiness !== 'skip') {
      lines.push(
        `My Garmin training readiness is ${trainingReadiness}. Adjust intensity and volume to match that readiness level.`
      );
    }

    if (extraNotes && extraNotes.trim().length > 0) {
      lines.push(`Additional context / constraints: ${extraNotes.trim()}`);
    }

    lines.push(
      'Output format: use clear section headings (Warm-up, Main Session, Optional Finisher, Cool-down), with bullet points, sets/reps or time, and brief coaching cues where helpful.'
    );

    return lines.join('\n\n');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const values = {
      duration: formData.get('duration') || '45',
      includeWarmup: formData.get('includeWarmup') || 'yes',
      sessionType: formData.get('sessionType') || 'strength',
      difficulty: formData.get('difficulty') || 'feeling human today',
      focusArea: formData.get('focusArea') || 'full body',
      location: formData.get('location') || 'home',
      trainingReadiness: formData.get('trainingReadiness') || 'skip',
      extraNotes: formData.get('extraNotes') || '',
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
