/**
 * Personal Records Tracker
 * Uses localStorage to persist PR data
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'crossfit_prs';
  let prs = [];

  /**
   * Initialize PR tracker
   */
  function init() {
    loadPRs();
    setupEventListeners();
    setTodayDate();
    renderPRs();
  }

  /**
   * Set today's date as default
   */
  function setTodayDate() {
    const dateInput = document.getElementById('pr-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }
  }

  /**
   * Load PRs from localStorage
   */
  function loadPRs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      prs = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading PRs:', error);
      prs = [];
    }
  }

  /**
   * Save PRs to localStorage
   */
  function savePRs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prs));
    } catch (error) {
      console.error('Error saving PRs:', error);
      alert('Failed to save PR. Your browser storage might be full.');
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    const form = document.getElementById('pr-form');
    const filterSelect = document.getElementById('filter-category');
    const sortSelect = document.getElementById('sort-by');
    const clearBtn = document.getElementById('clear-all-prs');

    if (form) {
      form.addEventListener('submit', handleAddPR);
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', renderPRs);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', renderPRs);
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', handleClearAll);
    }
  }

  /**
   * Handle add PR form submission
   */
  function handleAddPR(e) {
    e.preventDefault();

    const category = document.getElementById('pr-category').value;
    const name = document.getElementById('pr-name').value.trim();
    const value = document.getElementById('pr-value').value.trim();
    const date = document.getElementById('pr-date').value;
    const notes = document.getElementById('pr-notes').value.trim();

    if (!category || !name || !value || !date) {
      alert('Please fill in all required fields');
      return;
    }

    const pr = {
      id: Date.now(),
      category,
      name,
      value,
      date,
      notes,
      createdAt: new Date().toISOString()
    };

    prs.push(pr);
    savePRs();
    renderPRs();

    // Reset form
    e.target.reset();
    setTodayDate();

    // Show success message
    showToast(`PR added: ${name} - ${value}`);
  }

  /**
   * Handle delete PR
   */
  function handleDeletePR(id) {
    if (!confirm('Are you sure you want to delete this PR?')) {
      return;
    }

    prs = prs.filter(pr => pr.id !== id);
    savePRs();
    renderPRs();
    showToast('PR deleted');
  }

  /**
   * Handle clear all PRs
   */
  function handleClearAll() {
    if (!confirm('Are you sure you want to delete ALL personal records? This cannot be undone!')) {
      return;
    }

    prs = [];
    savePRs();
    renderPRs();
    showToast('All PRs cleared');
  }

  /**
   * Get filtered and sorted PRs
   */
  function getFilteredSortedPRs() {
    const filterCategory = document.getElementById('filter-category')?.value || 'all';
    const sortBy = document.getElementById('sort-by')?.value || 'date-desc';

    // Filter
    let filtered = prs;
    if (filterCategory !== 'all') {
      filtered = prs.filter(pr => pr.category === filterCategory);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }

  /**
   * Render PRs list
   */
  function renderPRs() {
    const container = document.getElementById('prs-container');
    if (!container) return;

    const filtered = getFilteredSortedPRs();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="pr-empty-state">
          <i class="fa-solid fa-chart-line"></i>
          <p>No personal records ${document.getElementById('filter-category')?.value !== 'all' ? 'in this category' : 'yet'}!</p>
          <p class="pr-empty-hint">Start tracking your progress by adding your first PR above.</p>
        </div>
      `;
      return;
    }

    const html = filtered.map(pr => createPRCard(pr)).join('');
    container.innerHTML = html;

    // Add delete event listeners
    container.querySelectorAll('.pr-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        handleDeletePR(id);
      });
    });
  }

  /**
   * Create PR card HTML
   */
  function createPRCard(pr) {
    const categoryIcon = {
      lift: 'fa-dumbbell',
      benchmark: 'fa-trophy',
      other: 'fa-star'
    }[pr.category] || 'fa-star';

    const categoryColor = {
      lift: '#4CAF50',
      benchmark: '#FF9800',
      other: '#2196F3'
    }[pr.category] || '#666';

    const formattedDate = new Date(pr.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return `
      <div class="pr-card" data-category="${pr.category}">
        <div class="pr-card-header">
          <div class="pr-card-icon" style="background: ${categoryColor};">
            <i class="fa-solid ${categoryIcon}"></i>
          </div>
          <div class="pr-card-title">
            <h4 class="pr-card-name">${escapeHtml(pr.name)}</h4>
            <span class="pr-card-category">${pr.category}</span>
          </div>
          <button class="pr-delete-btn" data-id="${pr.id}" title="Delete PR">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="pr-card-body">
          <div class="pr-card-value">
            <i class="fa-solid fa-chart-line"></i>
            <span>${escapeHtml(pr.value)}</span>
          </div>
          <div class="pr-card-date">
            <i class="fa-solid fa-calendar"></i>
            <span>${formattedDate}</span>
          </div>
          ${pr.notes ? `
            <div class="pr-card-notes">
              <i class="fa-solid fa-note-sticky"></i>
              <span>${escapeHtml(pr.notes)}</span>
            </div>
          ` : ''}
        </div>
      </div>
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
