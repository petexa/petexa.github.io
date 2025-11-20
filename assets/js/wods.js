// WODs Database JavaScript
(function() {
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
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
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
        const REQUIRED_FIELD_COUNT = 7; // Name, Category, Format & Duration, Instructions, Equipment, Muscle Groups, Training Goals
        
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
            
            if (fields.length >= REQUIRED_FIELD_COUNT) {
                const workout = {
                    name: fields[0].replace(/^"+|"+$/g, ''),
                    category: fields[1],
                    formatDuration: fields[2],
                    instructions: fields[3],
                    equipment: fields[4],
                    muscleGroups: fields[5],
                    trainingGoals: fields[6]
                };
                workouts.push(workout);
            }
        }
        
        return workouts;
    }
    
    async function loadWorkouts() {
        try {
            wodsGrid.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner"></i><p>Loading workouts...</p></div>';
            
            const response = await fetch('wods/wods-table.csv');
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
        card.setAttribute('aria-label', `View details for ${workout.name}`);
        
        // Truncate instructions for preview
        const instructionsPreview = workout.instructions.length > 100 
            ? workout.instructions.substring(0, 100) + '...' 
            : workout.instructions;
        
        card.innerHTML = `
            <div class="wod-header">
                <h3 class="wod-title">${escapeHtml(workout.name)}</h3>
                <div class="wod-badges">
                    <span class="badge badge-category">${workout.category}</span>
                </div>
            </div>
            <div class="wod-info">
                <div class="wod-info-row">
                    <i class="fa-solid fa-clock"></i>
                    <span><strong>Format:</strong> ${escapeHtml(workout.formatDuration)}</span>
                </div>
                <div class="wod-info-row">
                    <i class="fa-solid fa-dumbbell"></i>
                    <span><strong>Equipment:</strong> ${escapeHtml(workout.equipment)}</span>
                </div>
                <div class="wod-info-row">
                    <i class="fa-solid fa-heart-pulse"></i>
                    <span><strong>Muscles:</strong> ${escapeHtml(workout.muscleGroups)}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(workout));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(workout);
            }
        });
        
        return card;
    }
    
    function openModal(workout) {
        modalBody.innerHTML = `
            <h2>${escapeHtml(workout.name)}</h2>
            <div class="modal-badges">
                <span class="badge badge-category">${workout.category}</span>
            </div>
            
            <div class="modal-section">
                <h3><i class="fa-solid fa-clock"></i> Format & Duration</h3>
                <p>${escapeHtml(workout.formatDuration)}</p>
            </div>
            
            <div class="modal-section">
                <h3><i class="fa-solid fa-list-ol"></i> Instructions</h3>
                <p>${escapeHtml(workout.instructions)}</p>
            </div>
            
            <div class="modal-section">
                <h3><i class="fa-solid fa-dumbbell"></i> Equipment Needed</h3>
                <p>${escapeHtml(workout.equipment)}</p>
            </div>
            
            <div class="modal-section">
                <h3><i class="fa-solid fa-heart-pulse"></i> Muscle Groups</h3>
                <p>${escapeHtml(workout.muscleGroups)}</p>
            </div>
            
            <div class="modal-section">
                <h3><i class="fa-solid fa-bullseye"></i> Training Goals</h3>
                <p>${escapeHtml(workout.trainingGoals)}</p>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        modalClose.focus();
    }
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            // If search is cleared, show 6 random workouts again
            displayRandomWorkouts();
        } else {
            // Filter workouts based on search term
            displayedWorkouts = allWorkouts.filter(workout => {
                return workout.name.toLowerCase().includes(searchTerm) ||
                       workout.instructions.toLowerCase().includes(searchTerm) ||
                       workout.equipment.toLowerCase().includes(searchTerm) ||
                       workout.muscleGroups.toLowerCase().includes(searchTerm) ||
                       workout.trainingGoals.toLowerCase().includes(searchTerm) ||
                       workout.formatDuration.toLowerCase().includes(searchTerm);
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
