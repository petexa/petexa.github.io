/**
 * Iron & Ale - Homepage WOD Widget
 * Displays the Workout of the Day on the homepage
 */

(function() {
  'use strict';

  var DATA_URL = '/data/production/workouts.json';

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /**
   * Truncate text to specified length
   */
  function truncate(str, len) {
    if (!str) return '';
    str = String(str);
    return str.length > len ? str.substring(0, len) + '...' : str;
  }

  /**
   * Get current UTC date as YYYYMMDD integer
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
   */
  function getWodIndex(totalWorkouts) {
    if (totalWorkouts === 0) return 0;
    var dateInt = getDateInt();
    return dateInt % totalWorkouts;
  }

  /**
   * Get display value for a field, or fallback
   */
  function displayValue(value, fallback) {
    fallback = fallback || '—';
    if (value === null || value === undefined || value === '' || value === 'Unknown') {
      return fallback;
    }
    return escapeHtml(String(value));
  }

  /**
   * Render the WOD widget
   */
  function renderWod(workout) {
    var container = document.getElementById('homepage-wod-container');
    if (!container || !workout) return;

    var name = displayValue(workout.Name, 'Unnamed Workout');
    var category = displayValue(workout.Category);
    var level = displayValue(workout.Level || workout.DifficultyTier);
    var format = displayValue(workout.FormatDuration);
    var description = displayValue(workout.Description || workout.Flavor_Text);
    var shortDesc = truncate(description, 150);

    var html = 
      '<div class="wod-widget-card">' +
        '<div class="wod-widget-header">' +
          '<span class="wod-badge" title="Workout of the Day">⭐ WOD</span>' +
          '<h3 class="wod-widget-title">' + name + '</h3>' +
        '</div>' +
        '<div class="wod-widget-meta">' +
          '<span class="wod-meta-item" title="Category">🏷️ ' + category + '</span>' +
          (level !== '—' ? '<span class="wod-meta-item" title="Difficulty">🔥 ' + level + '</span>' : '') +
          (format !== '—' ? '<span class="wod-meta-item" title="Format">⏱️ ' + format + '</span>' : '') +
        '</div>' +
        '<p class="wod-widget-desc">' + shortDesc + '</p>' +
        '<a href="workouts/?workout=' + workout.id + '" class="btn btn-primary btn-sm mt-4">' +
          'View Full Workout →' +
        '</a>' +
      '</div>';

    container.innerHTML = html;
  }

  /**
   * Initialize the homepage WOD widget
   */
  function init() {
    var container = document.getElementById('homepage-wod-container');
    if (!container) return;

    fetch(DATA_URL)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to load workouts data');
        }
        return response.json();
      })
      .then(function(workouts) {
        if (workouts.length === 0) {
          container.innerHTML = '<p class="text-muted">No workouts available</p>';
          return;
        }
        var wodIndex = getWodIndex(workouts.length);
        var wod = workouts[wodIndex];
        renderWod(wod);
      })
      .catch(function(error) {
        console.error('Error loading WOD:', error);
        container.innerHTML = '<p class="text-muted">Unable to load workout</p>';
      });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
