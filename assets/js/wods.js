// WODs Database JavaScript
(function () {
  'use strict';

  let allWorkouts = [];
  let displayedWorkouts = [];

  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const wodsGrid = document.getElementById('wods-grid');
  const resultsCount = document.getElementById('results-count');
  const modal = document.getElementById('workout-modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.querySelector('.modal-close');

  // Initialize
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    loadWorkouts();
    setupEventListeners();
  }

  function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
      }
    });
  }

  function parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length === 0 || !lines[0].trim()) {
      console.error('CSV file is empty');
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const workouts = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line handling quoted fields
      const fields = [];
      let currentField = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '"') {
          if (inQuotes && line[j + 1] === '"') {
            // Handle escaped quotes
            currentField += '"';
            j++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim());

      // Map fields to headers
      const workout = {};
      headers.forEach((header, index) => {
        if (index < fields.length) {
          workout[header] = fields[index].replace(/^"+|"+$/g, '');
        }
      });

      // Only add if we have the essential fields
      if (workout.Name && workout.Instructions) {
        workouts.push(workout);
      }
    }

    return workouts;
  }

  async function loadWorkouts() {
    try {
      wodsGrid.innerHTML =
        '<div class="loading"><i class="fa-solid fa-spinner"></i><p>Loading workouts...</p></div>';

      const response = await fetch('WOD/data/workouts_table.csv');
      if (!response.ok) throw new Error('Failed to load workouts');

      const csvText = await response.text();
      allWorkouts = parseCSV(csvText);

      // Display 6 random workouts on initial load
      displayRandomWorkouts();
      updateResultsCount();
    } catch (error) {
      console.error('Error loading workouts:', error);
      wodsGrid.innerHTML = `
                <div class="empty-wods">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>Error Loading Workouts</h3>
                    <p>Unable to load the workouts database. Please try refreshing the page.</p>
                </div>
            `;
    }
  }

  function displayRandomWorkouts() {
    // Select 6 random workouts using Fisher-Yates shuffle
    const shuffled = [...allWorkouts];
    const RANDOM_WORKOUT_COUNT = 6;

    // Fisher-Yates shuffle for proper randomization
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    displayedWorkouts = shuffled.slice(0, RANDOM_WORKOUT_COUNT);
    displayWorkouts();
  }

  function displayWorkouts() {
    if (displayedWorkouts.length === 0) {
      wodsGrid.innerHTML = `
                <div class="empty-wods">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <h3>No Workouts Found</h3>
                    <p>Try adjusting your search.</p>
                </div>
            `;
      return;
    }

    wodsGrid.innerHTML = '';

    displayedWorkouts.forEach(workout => {
      const card = createWorkoutCard(workout);
      wodsGrid.appendChild(card);
    });
  }

  function createWorkoutCard(workout) {
    const card = document.createElement('div');
    card.className = 'wod-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${workout.Name}`);

    // Get difficulty label with proper fallback
    const difficultyLabel = workout['Difficulty-Label'] || workout.DifficultyTier || 'Moderate';
    const difficultyClass = difficultyLabel.toLowerCase().replace(/\s+/g, '-');

    // Get description with fallback
    const description = workout.Description || workout['Flavor-Text'] || '';
    const descriptionPreview = description.length > 120 ? description.substring(0, 120) + '...' : description;

    // Get training goals
    const trainingGoals = workout['Training Goals'] || workout.trainingGoals || '';

    card.innerHTML = `
            <div class="wod-header">
                <h3 class="wod-title">${escapeHtml(workout.Name)}</h3>
                <div class="wod-badges">
                    <span class="badge badge-category">🏷️ ${escapeHtml(workout.Category)}</span>
                    <span class="badge badge-difficulty ${difficultyClass}">🔥 ${escapeHtml(difficultyLabel)}</span>
                </div>
            </div>
            <div class="wod-info">
                <div class="wod-info-row">
                    <span class="emoji-icon">⏱️</span>
                    <span><strong>Format:</strong> ${escapeHtml(workout['Format & Duration'])}</span>
                </div>
                ${trainingGoals ? `
                <div class="wod-info-row">
                    <span class="emoji-icon">🎯</span>
                    <span><strong>Goals:</strong> ${escapeHtml(trainingGoals)}</span>
                </div>
                ` : ''}
                ${description ? `
                <div class="wod-description">
                    <span class="emoji-icon">💪</span>
                    <span>${escapeHtml(descriptionPreview)}</span>
                </div>
                ` : ''}
            </div>
        `;

    card.addEventListener('click', () => openModal(workout));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(workout);
      }
    });

    return card;
  }

  function openModal(workout) {
    // Store the currently focused element to return focus later
    modal.dataset.previousFocus = document.activeElement?.id || '';

    // Get difficulty label with proper fallback
    const difficultyLabel = workout['Difficulty-Label'] || workout.DifficultyTier || 'Moderate';
    const difficultyClass = difficultyLabel.toLowerCase().replace(/\s+/g, '-');

    // Parse scaling tiers if it's a JSON string
    let scalingOptions = workout['Scaling Options'] || workout['Scaling-Tiers'] || '';
    try {
      if (scalingOptions && scalingOptions.startsWith('{')) {
        const parsed = JSON.parse(scalingOptions);
        scalingOptions = Object.entries(parsed)
          .map(([level, desc]) => `<div class="scaling-item"><strong>${escapeHtml(level)}:</strong> ${escapeHtml(desc)}</div>`)
          .join('');
      } else {
        scalingOptions = escapeHtml(scalingOptions);
      }
    } catch (e) {
      // Keep as plain text if not JSON
      scalingOptions = escapeHtml(scalingOptions);
    }

    // Parse estimated times if it's a JSON string
    let estimatedTimes = workout['Estimated-Times-Human'] || '';
    if (!estimatedTimes) {
      try {
        const timesJson = workout['Estimated-Times'];
        if (timesJson && timesJson.startsWith('{')) {
          const parsed = JSON.parse(timesJson);
          estimatedTimes = Object.entries(parsed)
            .map(([level, seconds]) => {
              const mins = Math.floor(seconds / 60);
              const secs = seconds % 60;
              return `${escapeHtml(level)}: ${mins}m ${secs}s`;
            })
            .join(', ');
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    modalBody.innerHTML = `
            <h2>${escapeHtml(workout.Name)}</h2>
            <div class="modal-badges">
                <span class="badge badge-category">${escapeHtml(workout.Category)}</span>
                <span class="badge badge-difficulty ${difficultyClass}">${escapeHtml(difficultyLabel)}</span>
            </div>
            
            <!-- Workout Essentials Section -->
            <div class="modal-section-header">
                <h3>💪 Workout Essentials</h3>
            </div>
            
            <div class="modal-section">
                <h4><span class="emoji-icon">📋</span> Instructions</h4>
                <p>${escapeHtml(workout.Instructions || workout.Instructions_Clean || '')}</p>
            </div>
            
            ${workout['Equipment Needed'] ? `
            <div class="modal-section">
                <h4><span class="emoji-icon">🧰</span> Equipment Needed</h4>
                <p>${escapeHtml(workout['Equipment Needed'])}</p>
            </div>
            ` : ''}
            
            ${workout['Movement Types'] ? `
            <div class="modal-section">
                <h4><span class="emoji-icon">🧠</span> Movement Types</h4>
                <p>${escapeHtml(workout['Movement Types'])}</p>
            </div>
            ` : ''}
            
            ${workout['Target Stimulus'] || workout.Stimulus ? `
            <div class="modal-section">
                <h4><span class="emoji-icon">⚡</span> Target Stimulus</h4>
                <p>${escapeHtml(workout['Target Stimulus'] || workout.Stimulus)}</p>
            </div>
            ` : ''}
            
            ${scalingOptions ? `
            <div class="modal-section">
                <h4><span class="emoji-icon">🔧</span> Scaling Options</h4>
                <div class="scaling-content">${scalingOptions}</div>
            </div>
            ` : ''}
            
            ${workout['Score Type'] ? `
            <div class="modal-section">
                <h4><span class="emoji-icon">🧮</span> Score Type</h4>
                <p>${escapeHtml(workout['Score Type'])}</p>
            </div>
            ` : ''}
            
            <!-- Additional Info Section (Expandable) -->
            <div class="additional-info-section">
                <button class="expand-button" id="expand-additional-info" aria-expanded="false">
                    <span class="expand-icon">▶</span>
                    <span class="expand-text">Show Additional Info</span>
                </button>
                
                <div class="additional-info-content" id="additional-info-content" style="display: none;">
                    ${workout.Warmup ? `
                    <div class="modal-section">
                        <h4><span class="emoji-icon">🔥</span> Warmup</h4>
                        <p>${escapeHtml(workout.Warmup)}</p>
                    </div>
                    ` : ''}
                    
                    ${workout['Coaching-Cues'] || workout['Coach Notes'] ? `
                    <div class="modal-section">
                        <h4><span class="emoji-icon">🎓</span> Coaching Cues</h4>
                        <p>${escapeHtml(workout['Coaching-Cues'] || workout['Coach Notes'])}</p>
                    </div>
                    ` : ''}
                    
                    ${estimatedTimes ? `
                    <div class="modal-section">
                        <h4><span class="emoji-icon">⏳</span> Estimated Times</h4>
                        <p>${escapeHtml(estimatedTimes)}</p>
                    </div>
                    ` : ''}
                    
                    ${workout.Environment ? `
                    <div class="modal-section">
                        <h4><span class="emoji-icon">🏟️</span> Environment</h4>
                        <p>${escapeHtml(workout.Environment)}</p>
                    </div>
                    ` : ''}
                    
                    ${workout['Flavor-Text'] ? `
                    <div class="modal-section">
                        <h4><span class="emoji-icon">🧠</span> About This Workout</h4>
                        <p>${escapeHtml(workout['Flavor-Text'])}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

    // Setup expand/collapse functionality
    const expandButton = document.getElementById('expand-additional-info');
    const additionalContent = document.getElementById('additional-info-content');
    
    if (expandButton && additionalContent) {
      expandButton.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        additionalContent.style.display = isExpanded ? 'none' : 'block';
        
        const icon = this.querySelector('.expand-icon');
        const text = this.querySelector('.expand-text');
        if (isExpanded) {
          icon.textContent = '▶';
          text.textContent = 'Show Additional Info';
        } else {
          icon.textContent = '▼';
          text.textContent = 'Hide Additional Info';
        }
      });
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Return focus to the element that opened the modal
    const previousFocusId = modal.dataset.previousFocus;
    if (previousFocusId) {
      const element = document.getElementById(previousFocusId);
      if (element) element.focus();
    }
  }

  function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (!searchTerm) {
      // If search is cleared, show 6 random workouts again
      displayRandomWorkouts();
    } else {
      // Filter workouts based on search term
      displayedWorkouts = allWorkouts.filter(workout => {
        return (
          workout.Name?.toLowerCase().includes(searchTerm) ||
          workout.Instructions?.toLowerCase().includes(searchTerm) ||
          workout['Equipment Needed']?.toLowerCase().includes(searchTerm) ||
          workout['Muscle Groups']?.toLowerCase().includes(searchTerm) ||
          workout['Training Goals']?.toLowerCase().includes(searchTerm) ||
          workout['Format & Duration']?.toLowerCase().includes(searchTerm) ||
          workout.Category?.toLowerCase().includes(searchTerm)
        );
      });
      displayWorkouts();
    }

    updateResultsCount();
  }

  function updateResultsCount() {
    const count = displayedWorkouts.length;
    const total = allWorkouts.length;

    if (searchInput.value.trim()) {
      resultsCount.textContent = `Showing ${count} of ${total} workouts`;
    } else {
      resultsCount.textContent = `Showing 6 random workouts (${total} total available)`;
    }
  }

  // Utility functions
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
})();
