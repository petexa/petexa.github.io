/**
 * Leaderboard
 * Track and display workout results using localStorage
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'leaderboard_results';
  let results = [];

  /**
   * Initialize leaderboard
   */
  function init() {
    loadResults();
    setupEventListeners();
    setTodayDate();
    updateWorkoutFilter();
    renderLeaderboard();
  }

  /**
   * Set today's date as default
   */
  function setTodayDate() {
    const dateInput = document.getElementById('result-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }
  }

  /**
   * Load results from localStorage
   */
  function loadResults() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      results = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading results:', error);
      results = [];
    }
  }

  /**
   * Save results to localStorage
   */
  function saveResults() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (error) {
      console.error('Error saving results:', error);
      alert('Failed to save result.');
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    const form = document.getElementById('leaderboard-form');
    const filterSelect = document.getElementById('filter-workout');
    const clearBtn = document.getElementById('clear-leaderboard');

    if (form) {
      form.addEventListener('submit', handleAddResult);
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', renderLeaderboard);
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', handleClearAll);
    }
  }

  /**
   * Handle add result form submission
   */
  function handleAddResult(e) {
    e.preventDefault();

    const name = document.getElementById('result-name').value.trim();
    const workout = document.getElementById('result-workout').value.trim();
    const score = document.getElementById('result-score').value.trim();
    const date = document.getElementById('result-date').value;

    if (!name || !workout || !score || !date) {
      alert('Please fill in all fields');
      return;
    }

    const result = {
      id: Date.now(),
      name,
      workout,
      score,
      date,
      createdAt: new Date().toISOString()
    };

    results.push(result);
    saveResults();
    updateWorkoutFilter();
    renderLeaderboard();

    // Reset form
    e.target.reset();
    setTodayDate();

    showToast(`Result added for ${name}!`);
  }

  /**
   * Handle delete result
   */
  function handleDeleteResult(id) {
    if (!confirm('Are you sure you want to delete this result?')) {
      return;
    }

    results = results.filter(r => r.id !== id);
    saveResults();
    updateWorkoutFilter();
    renderLeaderboard();
    showToast('Result deleted');
  }

  /**
   * Handle clear all results
   */
  function handleClearAll() {
    if (!confirm('Are you sure you want to delete ALL results? This cannot be undone!')) {
      return;
    }

    results = [];
    saveResults();
    updateWorkoutFilter();
    renderLeaderboard();
    showToast('All results cleared');
  }

  /**
   * Update workout filter dropdown
   */
  function updateWorkoutFilter() {
    const filterSelect = document.getElementById('filter-workout');
    if (!filterSelect) return;

    const workouts = [...new Set(results.map(r => r.workout))].sort();
    
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">All Workouts</option>';
    
    workouts.forEach(workout => {
      const option = document.createElement('option');
      option.value = workout;
      option.textContent = workout;
      filterSelect.appendChild(option);
    });

    // Restore selection if it still exists
    if (workouts.includes(currentValue)) {
      filterSelect.value = currentValue;
    }
  }

  /**
   * Get filtered results
   */
  function getFilteredResults() {
    const filterWorkout = document.getElementById('filter-workout')?.value || 'all';

    let filtered = results;
    if (filterWorkout !== 'all') {
      filtered = results.filter(r => r.workout === filterWorkout);
    }

    // Sort by date (newest first)
    return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Render leaderboard
   */
  function renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    const filtered = getFilteredResults();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="leaderboard-empty-state">
          <i class="fa-solid fa-ranking-star"></i>
          <p>No results ${document.getElementById('filter-workout')?.value !== 'all' ? 'for this workout' : 'yet'}!</p>
          <p class="leaderboard-empty-hint">Be the first to add your result above.</p>
        </div>
      `;
      return;
    }

    // Group by workout
    const grouped = {};
    filtered.forEach(result => {
      if (!grouped[result.workout]) {
        grouped[result.workout] = [];
      }
      grouped[result.workout].push(result);
    });

    let html = '';
    Object.keys(grouped).sort().forEach(workout => {
      html += createWorkoutTable(workout, grouped[workout]);
    });

    container.innerHTML = html;

    // Add delete event listeners
    container.querySelectorAll('.leaderboard-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        handleDeleteResult(id);
      });
    });
  }

  /**
   * Create workout table
   */
  function createWorkoutTable(workout, results) {
    const rows = results.map((result, index) => createResultRow(result, index + 1)).join('');

    return `
      <div class="leaderboard-table-wrapper">
        <h3 class="leaderboard-workout-title">
          <i class="fa-solid fa-trophy"></i> ${escapeHtml(workout)}
        </h3>
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Create result row
   */
  function createResultRow(result, rank) {
    const formattedDate = new Date(result.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const medalIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

    return `
      <tr class="${rank <= 3 ? 'leaderboard-podium' : ''}">
        <td class="leaderboard-rank">${medalIcon} ${rank}</td>
        <td class="leaderboard-name">${escapeHtml(result.name)}</td>
        <td class="leaderboard-score">${escapeHtml(result.score)}</td>
        <td class="leaderboard-date">${formattedDate}</td>
        <td class="leaderboard-action">
          <button class="leaderboard-delete-btn" data-id="${result.id}" title="Delete result">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show toast notification
   */
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
