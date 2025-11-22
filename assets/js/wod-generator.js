/**
 * WOD Generator
 * Generates random workouts and saves favorites to localStorage
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'saved_wods';
  let savedWods = [];
  let currentWod = null;

  // Sample WOD database (simplified from your workout database)
  const WODS = [
    {
      name: "Fran",
      type: "For Time",
      description: "21-15-9 reps for time of:\n• Thrusters (43kg/30kg)\n• Pull-ups",
      timeCap: "10 minutes"
    },
    {
      name: "Cindy",
      type: "AMRAP",
      description: "20 minute AMRAP:\n• 5 Pull-ups\n• 10 Push-ups\n• 15 Air Squats",
      timeCap: "20 minutes"
    },
    {
      name: "Murph",
      type: "For Time",
      description: "For time:\n• 1 Mile Run\n• 100 Pull-ups\n• 200 Push-ups\n• 300 Air Squats\n• 1 Mile Run\n\n(Partition the pull-ups, push-ups, and squats as needed. Performed with 9kg/6kg weight vest)",
      timeCap: "60 minutes"
    },
    {
      name: "Grace",
      type: "For Time",
      description: "30 Clean & Jerks (60kg/40kg) for time",
      timeCap: "10 minutes"
    },
    {
      name: "Annie",
      type: "For Time",
      description: "50-40-30-20-10 reps for time of:\n• Double Unders\n• Sit-ups",
      timeCap: "15 minutes"
    },
    {
      name: "Helen",
      type: "For Time",
      description: "3 rounds for time:\n• 400m Run\n• 21 KB Swings (24kg/16kg)\n• 12 Pull-ups",
      timeCap: "20 minutes"
    },
    {
      name: "Karen",
      type: "For Time",
      description: "150 Wall Balls (9kg/6kg) for time",
      timeCap: "15 minutes"
    },
    {
      name: "The Filthy Fifty",
      type: "For Time",
      description: "50 reps each, for time:\n• Box Jumps (24\"/20\")\n• Jumping Pull-ups\n• KB Swings (16kg)\n• Walking Lunges\n• Knees to Elbows\n• Push Press (20kg)\n• Back Extensions\n• Wall Balls (9kg/6kg)\n• Burpees\n• Double Unders",
      timeCap: "40 minutes"
    },
    {
      name: "DT",
      type: "For Time",
      description: "5 rounds for time:\n• 12 Deadlifts (70kg/50kg)\n• 9 Hang Power Cleans\n• 6 Push Jerks\n\n(Same barbell, no resting on ground during round)",
      timeCap: "20 minutes"
    },
    {
      name: "Fight Gone Bad",
      type: "AMRAP",
      description: "3 rounds, 1 min each station:\n• Wall Balls (9kg/6kg)\n• SDHP (35kg/25kg)\n• Box Jumps (20\")\n• Push Press (35kg/25kg)\n• Row (Calories)\n• 1 min Rest\n\nScore is total reps",
      timeCap: "17 minutes"
    },
    {
      name: "Death by Burpees",
      type: "EMOM",
      description: "Minute 1: 1 Burpee\nMinute 2: 2 Burpees\nMinute 3: 3 Burpees\n...\nContinue until you cannot complete the required burpees within the minute",
      timeCap: "Until failure"
    },
    {
      name: "The Seven",
      type: "For Time",
      description: "7 rounds for time:\n• 7 Thrusters (43kg/30kg)\n• 7 Knees to Elbows\n• 7 Deadlifts (111kg/75kg)\n• 7 Burpees\n• 7 KB Swings (24kg/16kg)\n• 7 Pull-ups",
      timeCap: "30 minutes"
    },
    {
      name: "Tabata Something Else",
      type: "Tabata",
      description: "Tabata Interval (20s on, 10s off) x 8 rounds of:\n• Pull-ups\n• Push-ups\n• Sit-ups\n• Air Squats\n\nRest 1 minute between exercises",
      timeCap: "20 minutes"
    },
    {
      name: "Jackie",
      type: "For Time",
      description: "For time:\n• 1000m Row\n• 50 Thrusters (20kg/15kg)\n• 30 Pull-ups",
      timeCap: "15 minutes"
    },
    {
      name: "Chelsea",
      type: "EMOM",
      description: "EMOM 30 minutes:\n• 5 Pull-ups\n• 10 Push-ups\n• 15 Air Squats",
      timeCap: "30 minutes"
    },
    {
      name: "Baseline",
      type: "For Time",
      description: "For time:\n• 500m Row\n• 40 Air Squats\n• 30 Sit-ups\n• 20 Push-ups\n• 10 Pull-ups",
      timeCap: "10 minutes"
    },
    {
      name: "Randy",
      type: "For Time",
      description: "75 Snatches (35kg/25kg) for time",
      timeCap: "15 minutes"
    },
    {
      name: "Double Trouble",
      type: "AMRAP",
      description: "15 minute AMRAP:\n• 10 Box Jumps (24\"/20\")\n• 10 KB Swings (24kg/16kg)\n• 10 Double Unders",
      timeCap: "15 minutes"
    },
    {
      name: "Deadlift Ladder",
      type: "For Time",
      description: "21-18-15-12-9-6-3 reps for time:\n• Deadlifts (100kg/70kg)\n• Burpees",
      timeCap: "20 minutes"
    },
    {
      name: "Push Pull Grind",
      type: "AMRAP",
      description: "20 minute AMRAP:\n• 5 Strict Pull-ups\n• 10 Push-ups\n• 15 KB Swings (24kg/16kg)\n• 20 Air Squats",
      timeCap: "20 minutes"
    }
  ];

  /**
   * Initialize generator
   */
  function init() {
    loadSavedWods();
    setupEventListeners();
    renderSavedWods();
  }

  /**
   * Load saved WODs from localStorage
   */
  function loadSavedWods() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      savedWods = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading saved WODs:', error);
      savedWods = [];
    }
  }

  /**
   * Save WODs to localStorage
   */
  function saveSavedWods() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedWods));
    } catch (error) {
      console.error('Error saving WODs:', error);
      alert('Failed to save WOD.');
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    const generateBtn = document.getElementById('generate-wod-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const saveBtn = document.getElementById('save-wod-btn');

    if (generateBtn) {
      generateBtn.addEventListener('click', generateWod);
    }

    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', generateWod);
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', saveCurrentWod);
    }
  }

  /**
   * Generate random WOD
   */
  function generateWod() {
    const typeFilter = document.getElementById('wod-type-filter')?.value || 'all';
    
    let filteredWods = WODS;
    if (typeFilter !== 'all') {
      filteredWods = WODS.filter(wod => wod.type === typeFilter);
    }

    if (filteredWods.length === 0) {
      alert('No WODs found for this type. Try another filter!');
      return;
    }

    // Get random WOD
    const randomIndex = Math.floor(Math.random() * filteredWods.length);
    currentWod = filteredWods[randomIndex];

    displayWod(currentWod);
  }

  /**
   * Display WOD
   */
  function displayWod(wod) {
    const display = document.getElementById('wod-display');
    const nameEl = document.getElementById('wod-name');
    const badgeEl = document.getElementById('wod-type-badge');
    const detailsEl = document.getElementById('wod-details');

    if (!display || !nameEl || !badgeEl || !detailsEl) return;

    nameEl.textContent = wod.name;
    badgeEl.textContent = wod.type;
    badgeEl.className = `wod-type-badge ${wod.type.toLowerCase().replace(' ', '-')}`;

    const descriptionHtml = wod.description.split('\n').map(line => 
      line ? `<p>${escapeHtml(line)}</p>` : ''
    ).join('');

    detailsEl.innerHTML = `
      ${descriptionHtml}
      ${wod.timeCap ? `<p class="wod-time-cap"><i class="fa-solid fa-clock"></i> Time Cap: ${escapeHtml(wod.timeCap)}</p>` : ''}
    `;

    display.style.display = 'block';
    display.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Save current WOD
   */
  function saveCurrentWod() {
    if (!currentWod) return;

    // Check if already saved
    const exists = savedWods.some(w => w.name === currentWod.name);
    if (exists) {
      alert('This WOD is already in your favorites!');
      return;
    }

    savedWods.push({
      ...currentWod,
      savedAt: new Date().toISOString()
    });

    saveSavedWods();
    renderSavedWods();
    showToast('WOD saved to favorites!');
  }

  /**
   * Remove saved WOD
   */
  function removeSavedWod(name) {
    if (!confirm('Remove this WOD from favorites?')) {
      return;
    }

    savedWods = savedWods.filter(w => w.name !== name);
    saveSavedWods();
    renderSavedWods();
    showToast('WOD removed from favorites');
  }

  /**
   * Render saved WODs
   */
  function renderSavedWods() {
    const container = document.getElementById('saved-wods-container');
    if (!container) return;

    if (savedWods.length === 0) {
      container.innerHTML = `
        <div class="saved-wods-empty">
          <i class="fa-regular fa-bookmark"></i>
          <p>No saved WODs yet</p>
          <p class="saved-wods-hint">Generate a WOD and save it to your favorites!</p>
        </div>
      `;
      return;
    }

    const html = savedWods.map(wod => createSavedWodCard(wod)).join('');
    container.innerHTML = html;

    // Add remove listeners
    container.querySelectorAll('.saved-wod-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeSavedWod(btn.dataset.name);
      });
    });
  }

  /**
   * Create saved WOD card
   */
  function createSavedWodCard(wod) {
    const descriptionPreview = wod.description.split('\n')[0] || wod.description;
    
    return `
      <div class="saved-wod-card">
        <div class="saved-wod-header">
          <h4 class="saved-wod-name">${escapeHtml(wod.name)}</h4>
          <span class="wod-type-badge ${wod.type.toLowerCase().replace(' ', '-')}">${escapeHtml(wod.type)}</span>
        </div>
        <p class="saved-wod-preview">${escapeHtml(descriptionPreview)}</p>
        <button class="saved-wod-remove" data-name="${escapeHtml(wod.name)}">
          <i class="fa-solid fa-trash"></i> Remove
        </button>
      </div>
    `;
  }

  /**
   * Escape HTML
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
