/**
 * Workout Shorts Finder Widget
 * Calls the n8n AI agent to find YouTube Shorts-style workout videos.
 */
(function () {
  'use strict';

  const FORM_ID = 'workout-shorts-form';
  const STATUS_ID = 'workout-shorts-status';
  const RESULTS_ID = 'workout-shorts-results';
  const ENDPOINT = 'https://n8n.petefox.co.uk/webhook/workout-youtube-agent';

  /**
   * Initialise the widget if the form exists on the page.
   */
  function init() {
    const form = document.getElementById(FORM_ID);
    if (!form) {
      // Graceful no-op: form not on this page
      return;
    }

    form.addEventListener('submit', handleSubmit);
  }

  /**
   * Handle form submission.
   * @param {Event} event
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const statusEl = document.getElementById(STATUS_ID);
    const resultsEl = document.getElementById(RESULTS_ID);

    // Read form values
    const workout = (document.getElementById('ws-workout')?.value || '').trim();
    const levelSelect = document.getElementById('ws-level');
    const level = levelSelect && levelSelect.value !== 'any' ? levelSelect.value : undefined;
    const duration = (document.getElementById('ws-duration')?.value || '').trim() || undefined;
    const focus = (document.getElementById('ws-focus')?.value || '').trim() || undefined;

    // Basic validation
    if (!workout) {
      setStatus(statusEl, 'Please enter a skill or workout.');
      return;
    }

    // Build payload
    const payload = {
      workout: workout,
      level: level,
      duration: duration,
      equipment: undefined, // reserved for later
      focus: focus
    };

    // Show loading
    setStatus(statusEl, 'Fetching Shorts…');
    clearResults(resultsEl);

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      const data = await response.json();

      if (!data.success) {
        const errMsg = data.error || 'The agent returned an error.';
        setStatus(statusEl, 'Error: ' + errMsg);
        console.error('Agent error:', data);
        return;
      }

      const videos = data.videos || [];
      if (videos.length === 0) {
        setStatus(statusEl, 'No Shorts-style videos found for that query.');
        renderNoResults(resultsEl);
      } else {
        setStatus(statusEl, 'Showing ' + videos.length + ' Shorts-style video' + (videos.length === 1 ? '' : 's') + '.');
        renderResults(resultsEl, videos);
      }
    } catch (err) {
      console.error('Workout Shorts Finder error:', err);
      setStatus(statusEl, 'Something went wrong. Please try again later.');
    }
  }

  /**
   * Set status message.
   * @param {HTMLElement|null} el
   * @param {string} message
   */
  function setStatus(el, message) {
    if (el) {
      el.textContent = message;
    }
  }

  /**
   * Clear results container.
   * @param {HTMLElement|null} el
   */
  function clearResults(el) {
    if (el) {
      el.innerHTML = '';
    }
  }

  /**
   * Render a "no results" message.
   * @param {HTMLElement|null} el
   */
  function renderNoResults(el) {
    if (!el) return;
    el.innerHTML = '<p class="workout-short-empty">No Shorts-style videos found for that query (yet).</p>';
  }

  /**
   * Render video results.
   * @param {HTMLElement|null} el
   * @param {Array} videos
   */
  function renderResults(el, videos) {
    if (!el) return;

    const list = document.createElement('div');
    list.className = 'workout-shorts-list';

    videos.forEach(function (video) {
      const card = document.createElement('article');
      card.className = 'workout-short-card';

      // Title link
      const heading = document.createElement('h3');
      const link = document.createElement('a');
      link.href = video.url || '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = video.title || 'Untitled';
      heading.appendChild(link);

      // Meta line: channel · date
      const meta = document.createElement('p');
      meta.className = 'workout-short-meta';
      let metaText = video.channel || '';
      if (video.publishedAt) {
        const dateStr = formatDate(video.publishedAt);
        if (metaText) {
          metaText += ' · ' + dateStr;
        } else {
          metaText = dateStr;
        }
      }
      meta.textContent = metaText;

      // Reason
      const reason = document.createElement('p');
      reason.className = 'workout-short-reason';
      reason.textContent = video.reason || '';

      card.appendChild(heading);
      if (metaText) {
        card.appendChild(meta);
      }
      if (video.reason) {
        card.appendChild(reason);
      }

      list.appendChild(card);
    });

    el.appendChild(list);
  }

  /**
   * Format a date string to local format (e.g. "25/01/2023").
   * @param {string} dateStr
   * @returns {string}
   */
  function formatDate(dateStr) {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
