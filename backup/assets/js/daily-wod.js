/**
 * Daily WOD Modal
 * Shows a random workout that's consistent for the day
 */

(function () {
  'use strict';

  const WOD_DATA_URL = 'WOD/data/workouts_table.csv';
  let allWorkouts = [];

  /**
   * Get today's date as a string (YYYY-MM-DD)
   */
  function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Generate a seed from today's date
   */
  function getTodaySeed() {
    const dateStr = getTodayDateString();
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Seeded random number generator
   */
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Get today's workout (consistent for the day)
   */
  function getTodaysWorkout() {
    const seed = getTodaySeed();
    const index = Math.floor(seededRandom(seed) * allWorkouts.length);
    return allWorkouts[index];
  }

  /**
   * Parse CSV data
   */
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const workouts = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple CSV parsing (handles quoted fields)
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));

      // Create workout object
      const workout = {};
      headers.forEach((header, idx) => {
        workout[header] = values[idx] || '';
      });

      if (workout.workout_name) {
        workouts.push(workout);
      }
    }

    return workouts;
  }

  /**
   * Format workout for display
   */
  function formatWorkout(workout) {
    let html = '<div class="daily-wod-content">';

    // Workout name
    html += `<h3 class="wod-name">${workout.workout_name || 'Unnamed WOD'}</h3>`;

    // Workout type and format
    if (workout.workout_type) {
      html += `<div class="wod-meta"><strong>Type:</strong> ${workout.workout_type}</div>`;
    }
    if (workout.workout_format) {
      html += `<div class="wod-meta"><strong>Format:</strong> ${workout.workout_format}</div>`;
    }

    // Time cap
    if (workout.time_cap_minutes && workout.time_cap_minutes !== '0') {
      html += `<div class="wod-meta"><strong>Time Cap:</strong> ${workout.time_cap_minutes} minutes</div>`;
    }

    // Description
    if (workout.workout_description) {
      html += `<div class="wod-description">${workout.workout_description}</div>`;
    }

    // Equipment
    if (workout.equipment_list) {
      const equipment = workout.equipment_list.split(';').filter(e => e.trim());
      if (equipment.length > 0) {
        html += '<div class="wod-equipment"><strong>Equipment:</strong> ';
        html += equipment.join(', ');
        html += '</div>';
      }
    }

    // Movements
    if (workout.movement_list) {
      const movements = workout.movement_list.split(';').filter(m => m.trim());
      if (movements.length > 0) {
        html += '<div class="wod-movements"><strong>Movements:</strong><ul>';
        movements.forEach(movement => {
          html += `<li>${movement}</li>`;
        });
        html += '</ul></div>';
      }
    }

    html += '</div>';
    return html;
  }

  /**
   * Show the WOD modal
   */
  function showModal(workout) {
    const modal = document.getElementById('wod-modal');
    const modalBody = document.getElementById('wod-modal-body');
    
    if (!modal || !modalBody) return;

    modalBody.innerHTML = formatWorkout(workout);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide the WOD modal
   */
  function hideModal() {
    const modal = document.getElementById('wod-modal');
    if (!modal) return;

    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  /**
   * Load workouts from CSV
   */
  async function loadWorkouts() {
    try {
      const response = await fetch(WOD_DATA_URL);
      if (!response.ok) throw new Error('Failed to load workouts');
      
      const text = await response.text();
      allWorkouts = parseCSV(text);
      
      if (allWorkouts.length === 0) {
        throw new Error('No workouts found');
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      allWorkouts = [{
        workout_name: 'Sample WOD',
        workout_type: 'AMRAP',
        workout_format: 'For Time',
        time_cap_minutes: '20',
        workout_description: 'Complete as many rounds as possible in 20 minutes',
        movement_list: 'Push-ups;Squats;Pull-ups',
        equipment_list: 'Pull-up bar'
      }];
    }
  }

  /**
   * Initialize
   */
  async function init() {
    await loadWorkouts();

    // Today's WOD button
    const todayBtn = document.getElementById('todays-wod-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const workout = getTodaysWorkout();
        showModal(workout);
      });
    }

    // Close button
    const closeBtn = document.querySelector('.wod-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideModal);
    }

    // Click outside modal to close
    const modal = document.getElementById('wod-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          hideModal();
        }
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideModal();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
