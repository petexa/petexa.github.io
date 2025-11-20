// WODs Database JavaScript
(function() {
    'use strict';
    
    let allWorkouts = [];
    let filteredWorkouts = [];
    
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const equipmentFilter = document.getElementById('equipment-filter');
    const resetBtn = document.getElementById('reset-filters');
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
        searchInput.addEventListener('input', debounce(applyFilters, 300));
        categoryFilter.addEventListener('change', applyFilters);
        difficultyFilter.addEventListener('change', applyFilters);
        equipmentFilter.addEventListener('change', applyFilters);
        resetBtn.addEventListener('click', resetFilters);
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
    
    async function loadWorkouts() {
        try {
            wodsGrid.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner"></i><p>Loading workouts...</p></div>';
            
            const response = await fetch('wods/wods-database.json');
            if (!response.ok) throw new Error('Failed to load workouts');
            
            allWorkouts = await response.json();
            filteredWorkouts = [...allWorkouts];
            
            displayWorkouts();
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
    
    function displayWorkouts() {
        if (filteredWorkouts.length === 0) {
            wodsGrid.innerHTML = `
                <div class="empty-wods">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <h3>No Workouts Found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            `;
            return;
        }
        
        wodsGrid.innerHTML = '';
        
        filteredWorkouts.forEach(workout => {
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
        
        const difficultyClass = workout.difficulty.toLowerCase();
        const categoryBadge = workout.category.toUpperCase();
        
        // Format equipment list
        const equipmentText = workout.equipment.length > 0 
            ? workout.equipment.join(', ') 
            : 'No equipment';
        
        // Format muscle groups
        const musclesText = workout.muscleGroups.slice(0, 3).join(', ');
        const moreMuscles = workout.muscleGroups.length > 3 ? ` +${workout.muscleGroups.length - 3}` : '';
        
        // Format
        const format = workout.setsRepsOrDuration.format;
        const duration = workout.setsRepsOrDuration.duration || 'N/A';
        
        // Tags
        const tagsHTML = workout.tags.length > 0 
            ? `<div class="wod-tags">
                ${workout.tags.map(tag => `<span class="tag tag-${tag.toLowerCase()}">${tag}</span>`).join('')}
               </div>`
            : '';
        
        card.innerHTML = `
            <div class="wod-header">
                <h3 class="wod-title">${escapeHtml(workout.name)}</h3>
                <div class="wod-badges">
                    <span class="badge badge-category">${categoryBadge}</span>
                    <span class="badge badge-difficulty ${difficultyClass}">${workout.difficulty}</span>
                </div>
            </div>
            <div class="wod-info">
                <div class="wod-info-row">
                    <i class="fa-solid fa-dumbbell"></i>
                    <span>${escapeHtml(equipmentText)}</span>
                </div>
                <div class="wod-info-row">
                    <i class="fa-solid fa-heart-pulse"></i>
                    <span>${escapeHtml(musclesText)}${moreMuscles}</span>
                </div>
                <div class="wod-format">
                    <strong>${escapeHtml(format)}</strong>${duration !== 'N/A' ? ` - ${duration}` : ''}
                </div>
                ${tagsHTML}
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
        const difficultyClass = workout.difficulty.toLowerCase();
        const categoryBadge = workout.category.toUpperCase();
        
        // Instructions
        const instructionsHTML = workout.instructions.length > 0
            ? `<div class="modal-section">
                <h3><i class="fa-solid fa-list-ol"></i> Instructions</h3>
                <ul>
                    ${workout.instructions.map(inst => `<li>${escapeHtml(inst)}</li>`).join('')}
                </ul>
               </div>`
            : '';
        
        // Format details
        const formatDetails = workout.setsRepsOrDuration;
        const formatHTML = `
            <div class="modal-section">
                <h3><i class="fa-solid fa-clock"></i> Format & Duration</h3>
                <div class="format-grid">
                    <div class="format-item">
                        <span class="format-label">Format</span>
                        <span class="format-value">${escapeHtml(formatDetails.format)}</span>
                    </div>
                    ${formatDetails.sets ? `
                    <div class="format-item">
                        <span class="format-label">Sets</span>
                        <span class="format-value">${formatDetails.sets}</span>
                    </div>` : ''}
                    ${formatDetails.reps ? `
                    <div class="format-item">
                        <span class="format-label">Reps</span>
                        <span class="format-value">${escapeHtml(formatDetails.reps)}</span>
                    </div>` : ''}
                    ${formatDetails.duration ? `
                    <div class="format-item">
                        <span class="format-label">Duration</span>
                        <span class="format-value">${escapeHtml(formatDetails.duration)}</span>
                    </div>` : ''}
                    ${formatDetails.rest ? `
                    <div class="format-item">
                        <span class="format-label">Rest</span>
                        <span class="format-value">${escapeHtml(formatDetails.rest)}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
        
        // Equipment
        const equipmentHTML = `
            <div class="modal-section">
                <h3><i class="fa-solid fa-dumbbell"></i> Equipment Needed</h3>
                <div class="equipment-list">
                    ${workout.equipment.map(eq => `<span class="equipment-tag">${escapeHtml(eq)}</span>`).join('')}
                </div>
            </div>
        `;
        
        // Muscle Groups
        const musclesHTML = `
            <div class="modal-section">
                <h3><i class="fa-solid fa-heart-pulse"></i> Muscle Groups</h3>
                <div class="muscle-groups-list">
                    ${workout.muscleGroups.map(m => `<span class="muscle-tag">${escapeHtml(m)}</span>`).join('')}
                </div>
            </div>
        `;
        
        // Goals
        const goalsHTML = `
            <div class="modal-section">
                <h3><i class="fa-solid fa-bullseye"></i> Training Goals</h3>
                <div class="goals-list">
                    ${workout.goal.map(g => `<span class="goal-tag">${escapeHtml(g)}</span>`).join('')}
                </div>
            </div>
        `;
        
        // Safety tips
        const safetyHTML = workout.safety.length > 0
            ? `<div class="modal-section">
                <h3><i class="fa-solid fa-shield-halved"></i> Safety Tips</h3>
                <ul>
                    ${workout.safety.map(tip => `<li>${escapeHtml(tip)}</li>`).join('')}
                </ul>
               </div>`
            : '';
        
        // Variations
        const variationsHTML = workout.variations.length > 0
            ? `<div class="modal-section">
                <h3><i class="fa-solid fa-shuffle"></i> Variations</h3>
                <div class="variations-list">
                    ${workout.variations.map(v => `
                        <div class="variation-item">
                            <div class="variation-name">${escapeHtml(v.name)}</div>
                            <div class="variation-details">
                                Difficulty: ${escapeHtml(v.difficulty)} | 
                                Equipment: ${v.equipment.join(', ')}
                            </div>
                        </div>
                    `).join('')}
                </div>
               </div>`
            : '';
        
        // Source
        const sourceHTML = workout.source
            ? `<div class="modal-section">
                <div class="source-info">
                    <i class="fa-solid fa-circle-info"></i> Source: ${escapeHtml(workout.source)}
                </div>
               </div>`
            : '';
        
        // Tags
        const tagsHTML = workout.tags.length > 0
            ? `<div class="wod-tags">
                ${workout.tags.map(tag => `<span class="tag tag-${tag.toLowerCase()}">${escapeHtml(tag)}</span>`).join('')}
               </div>`
            : '';
        
        modalBody.innerHTML = `
            <h2>${escapeHtml(workout.name)}</h2>
            <div class="modal-badges">
                <span class="badge badge-category">${categoryBadge}</span>
                <span class="badge badge-difficulty ${difficultyClass}">${workout.difficulty}</span>
            </div>
            ${tagsHTML}
            ${instructionsHTML}
            ${formatHTML}
            ${equipmentHTML}
            ${musclesHTML}
            ${goalsHTML}
            ${safetyHTML}
            ${variationsHTML}
            ${sourceHTML}
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        modalClose.focus();
    }
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const category = categoryFilter.value.toLowerCase();
        const difficulty = difficultyFilter.value.toLowerCase();
        const equipment = equipmentFilter.value.toLowerCase();
        
        filteredWorkouts = allWorkouts.filter(workout => {
            // Search filter
            if (searchTerm) {
                const matchesSearch = 
                    workout.name.toLowerCase().includes(searchTerm) ||
                    workout.instructions.some(inst => inst.toLowerCase().includes(searchTerm)) ||
                    workout.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                
                if (!matchesSearch) return false;
            }
            
            // Category filter
            if (category && workout.category.toLowerCase() !== category) {
                return false;
            }
            
            // Difficulty filter
            if (difficulty && workout.difficulty.toLowerCase() !== difficulty) {
                return false;
            }
            
            // Equipment filter
            if (equipment) {
                const hasEquipment = workout.equipment.some(eq => 
                    eq.toLowerCase().includes(equipment)
                );
                if (!hasEquipment) return false;
            }
            
            return true;
        });
        
        displayWorkouts();
        updateResultsCount();
    }
    
    function resetFilters() {
        searchInput.value = '';
        categoryFilter.value = '';
        difficultyFilter.value = '';
        equipmentFilter.value = '';
        
        filteredWorkouts = [...allWorkouts];
        displayWorkouts();
        updateResultsCount();
    }
    
    function updateResultsCount() {
        const count = filteredWorkouts.length;
        const total = allWorkouts.length;
        
        if (count === total) {
            resultsCount.textContent = `Showing all ${total} workouts`;
        } else {
            resultsCount.textContent = `Showing ${count} of ${total} workouts`;
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
