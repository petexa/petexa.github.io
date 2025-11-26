/**
 * Iron & Ale - Workouts Page JavaScript
 * Handles WOD selection, pinning, and random workout display
 * 
 * WOD Selection Method:
 * The Workout of the Day is determined using a deterministic algorithm:
 * - Take the current UTC date as YYYYMMDD integer
 * - Calculate: index = (dateInt) % totalWorkouts
 * - This ensures the same workout shows all day and changes at midnight UTC
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

  // ========================================
  // State
  // ========================================
  var workouts = [];
  var pinnedIds = [];
  var wodId = null;
  var expandedTileId = null;

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

  // ========================================
  // Workout Rendering
  // ========================================

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
   * Create a workout tile HTML
   * @param {Object} workout - Workout object
   * @param {string} badgeType - Badge type: 'wod', 'pinned', or 'random'
   * @param {boolean} isExpanded - Whether tile is expanded
   * @returns {string} HTML string
   */
  function createWorkoutTile(workout, badgeType, isExpanded) {
    var id = workout.id;
    var name = displayValue(workout.Name, 'Unnamed Workout');
    var category = displayValue(workout.Category);
    var format = displayValue(workout.FormatDuration);
    var instructions = displayValue(workout.Instructions_Clean || workout.Instructions);
    var description = displayValue(workout.Description || workout.Flavor_Text);
    var equipment = displayValue(workout.EquipmentNeeded);
    var muscleGroups = displayValue(workout.MuscleGroups);
    var level = displayValue(workout.Level || workout.DifficultyTier);
    var estimatedTime = displayValue(workout.Estimated_Times_Human);
    var scoreType = displayValue(workout.ScoreType);
    var scalingOptions = displayValue(workout.ScalingOptions);
    var coachNotes = displayValue(workout.CoachNotes || workout.Coaching_Cues);
    var warmup = displayValue(workout.Warmup);
    var isPinned = pinnedIds.indexOf(id) !== -1;

    var badgeHtml = '';
    if (badgeType === 'wod') {
      badgeHtml = '<span class="workout-badge badge-wod">WOD</span>';
    } else if (badgeType === 'pinned') {
      badgeHtml = '<span class="workout-badge badge-pinned">Pinned</span>';
    }

    // Determine short description for tile preview
    var shortDesc = truncate(instructions || description, 140);

    var html = '<article class="workout-tile" ' +
      'role="button" ' +
      'tabindex="0" ' +
      'aria-expanded="' + (isExpanded ? 'true' : 'false') + '" ' +
      'aria-controls="workout-details-' + id + '" ' +
      'data-workout-id="' + id + '">' +
      '<div class="workout-tile-header">' +
        '<div>' +
          badgeHtml +
          '<h3 class="workout-tile-title">' + name + '</h3>' +
          '<div class="workout-tile-meta">' +
            '<span>' + category + '</span>' +
            (format !== '—' ? ' • <span>' + format + '</span>' : '') +
            (level !== '—' ? ' • <span>' + level + '</span>' : '') +
          '</div>' +
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
      '<p class="workout-tile-desc">' + shortDesc + '</p>' +
      '<div class="workout-tile-details" id="workout-details-' + id + '"' + (isExpanded ? '' : ' hidden') + '>' +
        (instructions !== '—' ? '<div class="workout-detail-row"><span class="workout-detail-label">Instructions:</span><span class="workout-detail-value">' + instructions + '</span></div>' : '') +
        (description !== '—' ? '<div class="workout-detail-row"><span class="workout-detail-label">Description:</span><span class="workout-detail-value">' + description + '</span></div>' : '') +
        (equipment !== '—' ? '<div class="workout-detail-row"><span class="workout-detail-label">Equipment:</span><span class="workout-detail-value">' + equipment + '</span></div>' : '') +
        (muscleGroups !== '—' ? '<div class="workout-detail-row"><span class="workout-detail-label">Muscle Groups:</span><span class="workout-detail-value">' + muscleGroups + '</span></div>' : '') +
        (estimatedTime !== '—' ? '<div class="workout-detail-row"><span class="workout-detail-label">Est. Time:</span><span class="workout-detail-value">' + estimatedTime + '</span></div>' : '') +
        (scoreType !== '—' ? '<div class="workout-detail-row"><span class="workout-detail-label">Score Type:</span><span class="workout-detail-value">' + scoreType + '</span></div>' : '') +
        (scalingOptions !== '—' ? '<div class="workout-detail-row"><span class="workout-detail-label">Scaling:</span><span class="workout-detail-value">' + scalingOptions + '</span></div>' : '') +
        (warmup !== '—' ? '<div class="workout-detail-row"><span class="workout-detail-label">Warm-up:</span><span class="workout-detail-value">' + warmup + '</span></div>' : '') +
        (coachNotes !== '—' ? '<div class="workout-detail-row"><span class="workout-detail-label">Coach Notes:</span><span class="workout-detail-value">' + coachNotes + '</span></div>' : '') +
      '</div>' +
    '</article>';

    return html;
  }

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
    var isExpanded = expandedTileId === wodId;
    container.innerHTML = createWorkoutTile(workout, 'wod', isExpanded);
    attachTileEvents(container);
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
        var isExpanded = expandedTileId === pinId;
        html += createWorkoutTile(workout, 'pinned', isExpanded);
      }
    }

    if (html === '') {
      section.style.display = 'none';
    } else {
      container.innerHTML = html;
      attachTileEvents(container);
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
      var isExpanded = expandedTileId === workout.id;
      html += createWorkoutTile(workout, 'random', isExpanded);
    }

    container.innerHTML = html;
    attachTileEvents(container);
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
   * Attach event handlers to tiles in a container
   * @param {Element} container - Container element
   */
  function attachTileEvents(container) {
    // Tile expand/collapse
    var tiles = container.querySelectorAll('.workout-tile');
    tiles.forEach(function(tile) {
      tile.addEventListener('click', function(e) {
        // Don't toggle if clicking pin button
        if (e.target.closest('.pin-btn')) return;
        toggleTileExpanded(tile);
      });

      tile.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          // Don't toggle if focus is on pin button
          if (e.target.closest('.pin-btn')) return;
          e.preventDefault();
          toggleTileExpanded(tile);
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
   * Toggle tile expanded state
   * @param {Element} tile - Tile element
   */
  function toggleTileExpanded(tile) {
    var id = parseInt(tile.dataset.workoutId, 10);
    var isExpanded = tile.getAttribute('aria-expanded') === 'true';
    var details = tile.querySelector('.workout-tile-details');

    if (isExpanded) {
      tile.setAttribute('aria-expanded', 'false');
      if (details) details.hidden = true;
      expandedTileId = null;
    } else {
      // Collapse previously expanded
      if (expandedTileId !== null) {
        var prevTile = document.querySelector('[data-workout-id="' + expandedTileId + '"]');
        if (prevTile) {
          prevTile.setAttribute('aria-expanded', 'false');
          var prevDetails = prevTile.querySelector('.workout-tile-details');
          if (prevDetails) prevDetails.hidden = true;
        }
      }

      tile.setAttribute('aria-expanded', 'true');
      if (details) details.hidden = false;
      expandedTileId = id;
      
      // Update URL for permalink
      updateUrl(id);
    }
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
   * Check URL for workout parameter and expand that workout
   */
  function checkUrlForWorkout() {
    var params = new URLSearchParams(window.location.search);
    var workoutParam = params.get('workout');
    if (workoutParam) {
      var id = parseInt(workoutParam, 10);
      if (!isNaN(id)) {
        expandedTileId = id;
        // Scroll to the workout after rendering
        setTimeout(function() {
          var tile = document.querySelector('[data-workout-id="' + id + '"]');
          if (tile) {
            tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
            tile.focus();
          }
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
    // Check URL for workout parameter first
    var params = new URLSearchParams(window.location.search);
    var workoutParam = params.get('workout');
    if (workoutParam) {
      expandedTileId = parseInt(workoutParam, 10);
    }

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
