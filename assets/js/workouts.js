/**
 * Iron & Ale - Workouts Page JavaScript
 * Handles WOD selection, pinning, modal display, and random workout display
 * 
 * WOD Selection Method:
 * The Workout of the Day is determined using a deterministic algorithm:
 * - Take the current UTC date as YYYYMMDD integer
 * - Calculate: index = (dateInt) % totalWorkouts
 * - This ensures the same workout shows all day and changes at midnight UTC
 * 
 * Card Structure:
 * - Card Preview: Name, Category, Difficulty, Format & Duration, Training Goals, Description (truncated)
 * - Modal Essentials: Instructions, Equipment, Movement Types, Stimulus, Scaling, Score Type
 * - Expandable Section: Warmup, Coaching Cues, Estimated Times, Environment, Flavor Text
 */

(function() {
  'use strict';

  // ========================================
  // Constants & Configuration
  // ========================================
  var STORAGE_KEY = 'pfx:pinnedWorkouts';
  var MAX_PINS = 3;
  var RANDOM_COUNT = 6;
  var DATA_URL = '../data/workouts_table.json';
  var DESC_TRUNCATE_LENGTH = 120;

  // ========================================
  // State
  // ========================================
  var workouts = [];
  var pinnedIds = [];
  var wodId = null;
  var currentModalWorkoutId = null;

  // ========================================
  // Utility Functions
  // ========================================

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /**
   * Truncate text to specified length
   * @param {string} str - String to truncate
   * @param {number} len - Maximum length
   * @returns {string} Truncated string
   */
  function truncate(str, len) {
    if (!str) return '';
    str = String(str);
    return str.length > len ? str.substring(0, len) + '...' : str;
  }

  /**
   * Get current UTC date as YYYYMMDD integer
   * @returns {number} Date integer
   */
  function getDateInt() {
    var now = new Date();
    var year = now.getUTCFullYear();
    var month = now.getUTCMonth() + 1;
    var day = now.getUTCDate();
    return year * 10000 + month * 100 + day;
  }

  /**
   * Get WOD index deterministically based on date
   * @param {number} totalWorkouts - Total number of workouts
   * @returns {number} Index of WOD
   */
  function getWodIndex(totalWorkouts) {
    if (totalWorkouts === 0) return 0;
    var dateInt = getDateInt();
    return dateInt % totalWorkouts;
  }

  /**
   * Shuffle array using Fisher-Yates
   * @param {Array} arr - Array to shuffle
   * @returns {Array} Shuffled array (new array)
   */
  function shuffle(arr) {
    var result = arr.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  /**
   * Get pinned IDs from localStorage
   * @returns {Array} Array of pinned workout IDs
   */
  function getPinnedIds() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        var parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn('Error reading pinned workouts:', e);
    }
    return [];
  }

  /**
   * Save pinned IDs to localStorage
   * @param {Array} ids - Array of workout IDs to save
   */
  function savePinnedIds(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.warn('Error saving pinned workouts:', e);
    }
  }

  /**
   * Announce message for screen readers
   * @param {string} message - Message to announce
   */
  function announce(message) {
    var container = document.getElementById('alert-container');
    if (container) {
      container.textContent = message;
      setTimeout(function() {
        container.textContent = '';
      }, 1000);
    }
  }

  /**
   * Get display value for a field, or fallback
   * @param {*} value - Field value
   * @param {string} fallback - Fallback text
   * @returns {string} Display value
   */
  function displayValue(value, fallback) {
    fallback = fallback || '—';
    if (value === null || value === undefined || value === '' || value === 'Unknown') {
      return fallback;
    }
    return escapeHtml(String(value));
  }

  /**
   * Format text as bullet list by splitting on semicolons and commas
   * @param {string} text - Text to format
   * @returns {string} HTML string with bullet list
   */
  function formatAsBulletList(text) {
    if (!text || text === '—') return text;
    // Split by semicolons first, then by commas if no semicolons
    var items = text.indexOf(';') !== -1 
      ? text.split(/\s*;\s*/)
      : text.split(/\s*,\s*/);
    // Filter empty items
    items = items.filter(function(item) { return item.trim(); });
    if (items.length <= 1) return escapeHtml(text);
    
    var html = '<ul class="modal-bullet-list">';
    for (var i = 0; i < items.length; i++) {
      html += '<li>' + escapeHtml(items[i].trim()) + '</li>';
    }
    html += '</ul>';
    return html;
  }

  /**
   * Parse JSON-formatted scaling tiers into structured HTML
   * @param {string} scalingData - JSON string or plain text
   * @returns {string} HTML string
   */
  function parseScalingTiers(scalingData) {
    if (!scalingData || scalingData === '—') return scalingData;
    
    // Try to parse as JSON-like object (handling the pseudo-JSON format in the data)
    try {
      // The data format is like: {Beginner: ..., Intermediate: ..., Advanced: ...}
      // It's not valid JSON, so we parse it manually
      var tierRegex = /(Beginner|Intermediate|Advanced|Limited Equipment):\s*([^,}]+(?:,\s*[^:}]+)?)/gi;
      var match;
      var tiers = [];
      
      while ((match = tierRegex.exec(scalingData)) !== null) {
        tiers.push({
          level: match[1],
          description: match[2].trim().replace(/\.$/, '')
        });
      }
      
      if (tiers.length > 0) {
        var html = '<div class="scaling-tiers">';
        for (var i = 0; i < tiers.length; i++) {
          var tierClass = tiers[i].level.toLowerCase().replace(/\s+/g, '-');
          html += '<div class="scaling-tier scaling-tier-' + tierClass + '">' +
            '<span class="scaling-tier-label">' + escapeHtml(tiers[i].level) + ':</span> ' +
            '<span class="scaling-tier-desc">' + escapeHtml(tiers[i].description) + '</span>' +
          '</div>';
        }
        html += '</div>';
        return html;
      }
    } catch (e) {
      console.warn('Error parsing scaling tiers:', e);
    }
    
    // Fallback to plain text
    return escapeHtml(scalingData);
  }

  /**
   * Parse estimated times JSON into human-readable format
   * @param {string} timesData - JSON string or plain text
   * @returns {string} HTML string
   */
  function parseEstimatedTimes(timesData) {
    if (!timesData || timesData === '—') return timesData;
    
    try {
      // Format: {RX: 420, Intermediate: 588, Beginner: 840}
      var timeRegex = /(RX|Intermediate|Beginner):\s*(\d+)/gi;
      var match;
      var times = [];
      
      while ((match = timeRegex.exec(timesData)) !== null) {
        var seconds = parseInt(match[2], 10);
        var minutes = Math.floor(seconds / 60);
        var secs = seconds % 60;
        var timeStr = minutes + 'm ' + secs + 's';
        times.push({
          level: match[1],
          time: timeStr
        });
      }
      
      if (times.length > 0) {
        var html = '<div class="estimated-times">';
        for (var i = 0; i < times.length; i++) {
          html += '<span class="est-time-item">' +
            '<span class="est-time-label">' + escapeHtml(times[i].level) + ':</span> ' +
            '<span class="est-time-value">' + times[i].time + '</span>' +
          '</span>';
          if (i < times.length - 1) html += ' • ';
        }
        html += '</div>';
        return html;
      }
    } catch (e) {
      console.warn('Error parsing estimated times:', e);
    }
    
    return escapeHtml(timesData);
  }

  // ========================================
  // Workout Card Rendering
  // ========================================

  /**
   * Create a workout card HTML (preview only - no inline expansion)
   * Card Preview: Name, Category, Difficulty, Format & Duration, Training Goals, Description
   * @param {Object} workout - Workout object
   * @param {string} badgeType - Badge type: 'wod', 'pinned', or 'random'
   * @returns {string} HTML string
   */
  function createWorkoutCard(workout, badgeType) {
    var id = workout.id;
    var name = displayValue(workout.Name, 'Unnamed Workout');
    var category = displayValue(workout.Category);
    var level = displayValue(workout.Level || workout.DifficultyTier);
    var format = displayValue(workout.FormatDuration);
    var goals = displayValue(workout.TrainingGoals);
    var description = displayValue(workout.Description || workout.Flavor_Text);
    var isPinned = pinnedIds.indexOf(id) !== -1;

    var badgeHtml = '';
    if (badgeType === 'wod') {
      badgeHtml = '<span class="workout-badge badge-wod">WOD</span>';
    } else if (badgeType === 'pinned') {
      badgeHtml = '<span class="workout-badge badge-pinned">Pinned</span>';
    }

    // Truncate description at 120 characters
    var shortDesc = truncate(description, DESC_TRUNCATE_LENGTH);

    var html = '<article class="workout-card" ' +
      'tabindex="0" ' +
      'data-workout-id="' + id + '" ' +
      'role="button" ' +
      'aria-label="View details for ' + name + '">' +
      '<div class="workout-card-header">' +
        '<div class="workout-card-title-area">' +
          badgeHtml +
          '<h3 class="workout-card-title">' + name + '</h3>' +
        '</div>' +
        '<button type="button" class="pin-btn" ' +
          'aria-pressed="' + (isPinned ? 'true' : 'false') + '" ' +
          'aria-label="' + (isPinned ? 'Unpin' : 'Pin') + ' ' + name + '" ' +
          'data-pin-id="' + id + '" ' +
          'title="' + (isPinned ? 'Unpin workout' : 'Pin workout (max 3)') + '">' +
          '<svg class="w-5 h-5" fill="' + (isPinned ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="workout-card-meta">' +
        '<span class="workout-meta-item" title="Category">🏷️ ' + category + '</span>' +
        (level !== '—' ? '<span class="workout-meta-item" title="Difficulty">🔥 ' + level + '</span>' : '') +
      '</div>' +
      '<div class="workout-card-meta">' +
        (format !== '—' ? '<span class="workout-meta-item" title="Format & Duration">⏱️ ' + format + '</span>' : '') +
      '</div>' +
      (goals !== '—' ? '<div class="workout-card-meta"><span class="workout-meta-item" title="Training Goals">🎯 ' + goals + '</span></div>' : '') +
      '<p class="workout-card-desc" title="Description">💪 ' + shortDesc + '</p>' +
      '<div class="workout-card-footer">' +
        '<span class="view-details-hint">Click to view details</span>' +
      '</div>' +
    '</article>';

    return html;
  }

  // ========================================
  // Modal Rendering
  // ========================================

  /**
   * Create workout modal HTML
   * Modal Essentials: Instructions, Equipment, Movement Types, Stimulus, Scaling, Score Type
   * Expandable: Warmup, Coaching Cues, Estimated Times, Environment, Flavor Text
   * @param {Object} workout - Workout object
   * @returns {string} HTML string
   */
  function createWorkoutModal(workout) {
    var id = workout.id;
    var name = displayValue(workout.Name, 'Unnamed Workout');
    var category = displayValue(workout.Category);
    var level = displayValue(workout.Level || workout.DifficultyTier);
    var format = displayValue(workout.FormatDuration);
    var isPinned = pinnedIds.indexOf(id) !== -1;

    // Modal Essentials fields
    var instructions = displayValue(workout.Instructions_Clean || workout.Instructions);
    var equipment = displayValue(workout.EquipmentNeeded);
    var movementTypes = displayValue(workout.MovementTypes);
    var stimulus = displayValue(workout.Stimulus || workout.TargetStimulus);
    var scaling = workout.Scaling_Tiers || workout.ScalingOptions;
    var scoreType = displayValue(workout.ScoreType);

    // Expandable Additional Info fields
    var warmup = displayValue(workout.Warmup);
    var coachingCues = displayValue(workout.Coaching_Cues || workout.CoachNotes);
    var estimatedTimes = workout.Estimated_Times || workout.Estimated_Times_Human;
    var environment = displayValue(workout.Environment);
    var flavorText = displayValue(workout.Flavor_Text);

    var html = '<div class="workout-modal-overlay" id="workout-modal-overlay">' +
      '<div class="workout-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title-' + id + '">' +
        '<div class="workout-modal-header">' +
          '<div class="workout-modal-title-area">' +
            '<h2 id="modal-title-' + id + '" class="workout-modal-title">' + name + '</h2>' +
            '<div class="workout-modal-badges">' +
              '<span class="workout-meta-item">🏷️ ' + category + '</span>' +
              (level !== '—' ? '<span class="workout-meta-item">🔥 ' + level + '</span>' : '') +
              (format !== '—' ? '<span class="workout-meta-item">⏱️ ' + format + '</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="workout-modal-actions">' +
            '<button type="button" class="pin-btn modal-pin-btn" ' +
              'aria-pressed="' + (isPinned ? 'true' : 'false') + '" ' +
              'aria-label="' + (isPinned ? 'Unpin' : 'Pin') + ' ' + name + '" ' +
              'data-pin-id="' + id + '" ' +
              'title="' + (isPinned ? 'Unpin workout' : 'Pin workout (max 3)') + '">' +
              '<svg class="w-5 h-5" fill="' + (isPinned ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">' +
                '<path stroke-linecap="round" stroke-linejoin="round" d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>' +
              '</svg>' +
            '</button>' +
            '<button type="button" class="modal-close-btn" aria-label="Close modal">' +
              '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>' +
              '</svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="workout-modal-body">' +
          // Workout Essentials Section
          '<section class="modal-section modal-essentials">' +
            '<h3 class="modal-section-title">Workout Essentials</h3>' +
            (instructions !== '—' ? '<div class="modal-row"><span class="modal-icon">📋</span><span class="modal-label">Instructions</span><div class="modal-value">' + formatAsBulletList(instructions) + '</div></div>' : '') +
            (equipment !== '—' ? '<div class="modal-row"><span class="modal-icon">🧰</span><span class="modal-label">Equipment</span><div class="modal-value">' + formatAsBulletList(equipment) + '</div></div>' : '') +
            (movementTypes !== '—' ? '<div class="modal-row"><span class="modal-icon">🧠</span><span class="modal-label">Movements</span><div class="modal-value">' + escapeHtml(movementTypes) + '</div></div>' : '') +
            (stimulus !== '—' ? '<div class="modal-row"><span class="modal-icon">⚡</span><span class="modal-label">Stimulus</span><div class="modal-value">' + escapeHtml(stimulus) + '</div></div>' : '') +
            (scaling ? '<div class="modal-row"><span class="modal-icon">🔧</span><span class="modal-label">Scaling</span><div class="modal-value">' + parseScalingTiers(scaling) + '</div></div>' : '') +
            (scoreType !== '—' ? '<div class="modal-row"><span class="modal-icon">🧮</span><span class="modal-label">Score Type</span><div class="modal-value">' + escapeHtml(scoreType) + '</div></div>' : '') +
          '</section>' +
          // Expandable Additional Info Section
          '<section class="modal-section modal-additional">' +
            '<button type="button" class="modal-expand-btn" aria-expanded="false" aria-controls="additional-info-' + id + '">' +
              '<span class="expand-icon">▶</span>' +
              '<span>Additional Info</span>' +
            '</button>' +
            '<div class="modal-expandable-content" id="additional-info-' + id + '" hidden>' +
              (warmup !== '—' ? '<div class="modal-row"><span class="modal-icon">🔥</span><span class="modal-label">Warmup</span><div class="modal-value">' + formatAsBulletList(warmup) + '</div></div>' : '') +
              (coachingCues !== '—' ? '<div class="modal-row"><span class="modal-icon">🎓</span><span class="modal-label">Coaching Cues</span><div class="modal-value">' + escapeHtml(coachingCues) + '</div></div>' : '') +
              (estimatedTimes ? '<div class="modal-row"><span class="modal-icon">⏳</span><span class="modal-label">Estimated Times</span><div class="modal-value">' + parseEstimatedTimes(estimatedTimes) + '</div></div>' : '') +
              (environment !== '—' ? '<div class="modal-row"><span class="modal-icon">🏟️</span><span class="modal-label">Environment</span><div class="modal-value">' + escapeHtml(environment) + '</div></div>' : '') +
              (flavorText !== '—' ? '<div class="modal-row"><span class="modal-icon">🧠</span><span class="modal-label">Flavor</span><div class="modal-value flavor-text">' + escapeHtml(flavorText) + '</div></div>' : '') +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>' +
    '</div>';

    return html;
  }

  /**
   * Open workout modal
   * @param {number} workoutId - Workout ID
   */
  function openModal(workoutId) {
    var workout = findWorkoutById(workoutId);
    if (!workout) return;

    // Remove any existing modal
    closeModal();

    currentModalWorkoutId = workoutId;
    var modalHtml = createWorkoutModal(workout);
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Add event listeners
    var overlay = document.getElementById('workout-modal-overlay');
    if (overlay) {
      // Close on overlay click
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closeModal();
        }
      });

      // Close button
      var closeBtn = overlay.querySelector('.modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }

      // Pin button in modal
      var pinBtn = overlay.querySelector('.modal-pin-btn');
      if (pinBtn) {
        pinBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          handlePinClick(pinBtn);
          // Update pin button state in modal
          var isPinned = pinnedIds.indexOf(workoutId) !== -1;
          pinBtn.setAttribute('aria-pressed', isPinned ? 'true' : 'false');
          pinBtn.querySelector('svg').setAttribute('fill', isPinned ? 'currentColor' : 'none');
        });
      }

      // Expand button for additional info
      var expandBtn = overlay.querySelector('.modal-expand-btn');
      if (expandBtn) {
        expandBtn.addEventListener('click', function() {
          var isExpanded = expandBtn.getAttribute('aria-expanded') === 'true';
          var content = overlay.querySelector('.modal-expandable-content');
          var icon = expandBtn.querySelector('.expand-icon');
          
          if (isExpanded) {
            expandBtn.setAttribute('aria-expanded', 'false');
            if (content) {
              content.style.maxHeight = '0';
              setTimeout(function() { content.hidden = true; }, 300);
            }
            if (icon) icon.textContent = '▶';
          } else {
            expandBtn.setAttribute('aria-expanded', 'true');
            if (content) {
              content.hidden = false;
              content.style.maxHeight = content.scrollHeight + 'px';
            }
            if (icon) icon.textContent = '▼';
          }
        });
      }

      // Focus trap and escape key
      document.addEventListener('keydown', handleModalKeydown);

      // Focus the close button
      if (closeBtn) closeBtn.focus();

      // Animate in
      requestAnimationFrame(function() {
        overlay.classList.add('is-open');
      });
    }

    // Update URL
    updateUrl(workoutId);
    announce('Opened workout details for ' + workout.Name);
  }

  /**
   * Close workout modal
   */
  function closeModal() {
    var overlay = document.getElementById('workout-modal-overlay');
    if (overlay) {
      overlay.classList.remove('is-open');
      setTimeout(function() {
        overlay.remove();
      }, 200);
    }
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleModalKeydown);
    currentModalWorkoutId = null;

    // Clear URL parameter
    if (window.history && window.history.replaceState) {
      var url = new URL(window.location);
      url.searchParams.delete('workout');
      window.history.replaceState({}, '', url);
    }
  }

  /**
   * Handle keydown in modal
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleModalKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  // ========================================
  // Section Rendering
  // ========================================

  /**
   * Render WOD section
   */
  function renderWod() {
    var container = document.getElementById('wod-container');
    if (!container || workouts.length === 0) return;

    var wodIndex = getWodIndex(workouts.length);
    var workout = workouts[wodIndex];
    if (!workout) return;

    wodId = workout.id;
    container.innerHTML = createWorkoutCard(workout, 'wod');
    attachCardEvents(container);
  }

  /**
   * Render pinned section
   */
  function renderPinned() {
    var section = document.getElementById('pinned-section');
    var container = document.getElementById('pinned-container');
    var countBadge = document.getElementById('pinned-count');
    
    if (!section || !container) return;

    pinnedIds = getPinnedIds();
    
    // Update count badge
    if (countBadge) {
      countBadge.textContent = pinnedIds.length + '/' + MAX_PINS;
    }

    if (pinnedIds.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    var html = '';
    for (var i = 0; i < pinnedIds.length; i++) {
      var pinId = pinnedIds[i];
      var workout = findWorkoutById(pinId);
      if (workout && workout.id !== wodId) {
        html += createWorkoutCard(workout, 'pinned');
      }
    }

    if (html === '') {
      section.style.display = 'none';
    } else {
      container.innerHTML = html;
      attachCardEvents(container);
    }
  }

  /**
   * Render random workouts section
   */
  function renderRandom() {
    var container = document.getElementById('random-container');
    if (!container) return;

    // Get IDs to exclude (WOD + pinned)
    var excludeIds = pinnedIds.slice();
    if (wodId !== null) {
      excludeIds.push(wodId);
    }

    // Filter available workouts
    var available = [];
    for (var i = 0; i < workouts.length; i++) {
      if (excludeIds.indexOf(workouts[i].id) === -1) {
        available.push(workouts[i]);
      }
    }

    // Shuffle and take RANDOM_COUNT
    var shuffled = shuffle(available);
    var randomWorkouts = shuffled.slice(0, RANDOM_COUNT);

    if (randomWorkouts.length === 0) {
      container.innerHTML = '<div class="empty-state">No additional workouts available</div>';
      return;
    }

    var html = '';
    for (var j = 0; j < randomWorkouts.length; j++) {
      var workout = randomWorkouts[j];
      html += createWorkoutCard(workout, 'random');
    }

    container.innerHTML = html;
    attachCardEvents(container);
  }

  /**
   * Find workout by ID
   * @param {number} id - Workout ID
   * @returns {Object|null} Workout object or null
   */
  function findWorkoutById(id) {
    for (var i = 0; i < workouts.length; i++) {
      if (workouts[i].id === id) {
        return workouts[i];
      }
    }
    return null;
  }

  // ========================================
  // Event Handlers
  // ========================================

  /**
   * Attach event handlers to cards in a container
   * @param {Element} container - Container element
   */
  function attachCardEvents(container) {
    // Card click to open modal
    var cards = container.querySelectorAll('.workout-card');
    cards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        // Don't open modal if clicking pin button
        if (e.target.closest('.pin-btn')) return;
        var workoutId = parseInt(card.dataset.workoutId, 10);
        openModal(workoutId);
      });

      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          // Don't open modal if focus is on pin button
          if (e.target.closest('.pin-btn')) return;
          e.preventDefault();
          var workoutId = parseInt(card.dataset.workoutId, 10);
          openModal(workoutId);
        }
      });
    });

    // Pin buttons
    var pinBtns = container.querySelectorAll('.pin-btn');
    pinBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        handlePinClick(btn);
      });

      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          handlePinClick(btn);
        }
      });
    });
  }

  /**
   * Handle pin button click
   * @param {Element} btn - Pin button element
   */
  function handlePinClick(btn) {
    var id = parseInt(btn.dataset.pinId, 10);
    var isPinned = btn.getAttribute('aria-pressed') === 'true';
    var workout = findWorkoutById(id);
    var workoutName = workout ? workout.Name : 'workout';

    if (isPinned) {
      // Unpin
      var idx = pinnedIds.indexOf(id);
      if (idx !== -1) {
        pinnedIds.splice(idx, 1);
        savePinnedIds(pinnedIds);
        announce('Unpinned ' + workoutName);
        refresh();
      }
    } else {
      // Pin
      if (pinnedIds.length >= MAX_PINS) {
        showPinLimitAlert();
        announce('Maximum ' + MAX_PINS + ' workouts can be pinned');
        return;
      }
      if (pinnedIds.indexOf(id) === -1) {
        pinnedIds.push(id);
        savePinnedIds(pinnedIds);
        announce('Pinned ' + workoutName);
        refresh();
      }
    }
  }

  /**
   * Show pin limit alert
   */
  function showPinLimitAlert() {
    // Remove existing alert
    var existing = document.querySelector('.pin-limit-alert');
    if (existing) existing.remove();

    var alert = document.createElement('div');
    alert.className = 'pin-limit-alert';
    alert.setAttribute('role', 'alert');
    alert.innerHTML = '<strong>Pin limit reached</strong><br>You can pin up to ' + MAX_PINS + ' workouts. Unpin one to add another.';
    document.body.appendChild(alert);

    setTimeout(function() {
      if (alert.parentNode) {
        alert.style.animation = 'slideIn 0.3s ease-in reverse forwards';
        setTimeout(function() { alert.remove(); }, 300);
      }
    }, 4000);
  }

  /**
   * Clear all pins
   */
  function clearAllPins() {
    pinnedIds = [];
    savePinnedIds(pinnedIds);
    announce('All pins cleared');
    refresh();
  }

  /**
   * Update URL with workout ID for permalink
   * @param {number} id - Workout ID
   */
  function updateUrl(id) {
    if (window.history && window.history.replaceState) {
      var url = new URL(window.location);
      url.searchParams.set('workout', id);
      window.history.replaceState({}, '', url);
    }
  }

  /**
   * Check URL for workout parameter and open modal for that workout
   */
  function checkUrlForWorkout() {
    var params = new URLSearchParams(window.location.search);
    var workoutParam = params.get('workout');
    if (workoutParam) {
      var id = parseInt(workoutParam, 10);
      if (!isNaN(id)) {
        // Open modal after a short delay to ensure cards are rendered
        setTimeout(function() {
          openModal(id);
        }, 100);
      }
    }
  }

  /**
   * Refresh all rendered sections
   */
  function refresh() {
    renderWod();
    renderPinned();
    renderRandom();
  }

  // ========================================
  // Initialization
  // ========================================

  /**
   * Fetch and initialize workouts data
   */
  function init() {
    // Load pinned IDs
    pinnedIds = getPinnedIds();

    // Fetch workouts data
    fetch(DATA_URL)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to load workouts data');
        }
        return response.json();
      })
      .then(function(data) {
        workouts = data;
        refresh();
        checkUrlForWorkout();
      })
      .catch(function(error) {
        console.error('Error loading workouts:', error);
        var container = document.getElementById('wod-container');
        if (container) {
          container.innerHTML = '<div class="empty-state alert alert-danger">Failed to load workouts. Please refresh the page.</div>';
        }
      });

    // Clear pins button
    var clearBtn = document.getElementById('clear-pins-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Clear all pinned workouts?')) {
          clearAllPins();
        }
      });
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('Workouts module loaded');
})();
