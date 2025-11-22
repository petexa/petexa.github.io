/**
 * Global Navigation - Dropdown Menu Component
 * Provides a beer mug icon that opens a dropdown menu
 */

(function () {
  'use strict';

  /**
   * Get current page filename
   * @returns {string} Current page filename
   */
  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  }

  /**
   * Create navigation HTML structure
   * @returns {string} HTML string for navigation component
   */
  function createNavigationHTML() {
    const currentPage = getCurrentPage();

    // Define all navigation items with categories
    const navStructure = {
      'Events': [
        { href: 'index.html', icon: 'fa-calendar', label: 'Upcoming Events' },
        { href: 'past-events.html', icon: 'fa-calendar-check', label: 'Past Events' },
      ],
      'Workouts': [
        { href: 'wods.html', icon: 'fa-beer-mug-empty', label: 'WODs Database' },
        { href: 'wods-table.html', icon: 'fa-table', label: 'WODs Table' },
        { href: 'benchmarks.html', icon: 'fa-trophy', label: 'Benchmark WODs' },
        { href: 'wod-generator.html', icon: 'fa-dice', label: 'WOD Generator' },
      ],
      'Tools': [
        { href: 'timers.html', icon: 'fa-stopwatch', label: 'Workout Timers' },
        { href: 'pr-tracker.html', icon: 'fa-chart-line', label: 'PR Tracker' },
        { href: 'leaderboard.html', icon: 'fa-ranking-star', label: 'Leaderboard' },
      ]
    };

    // Build categorized menu HTML
    let menuItemsHTML = '';
    Object.keys(navStructure).forEach(category => {
      menuItemsHTML += `<div class="nav-category">${category}</div>`;
      navStructure[category].forEach(item => {
        const isActive = item.href === currentPage;
        menuItemsHTML += `
          <a href="${item.href}" class="nav-dropdown-item ${isActive ? 'nav-active' : ''}">
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.label}</span>
          </a>
        `;
      });
    });

    return `
            <!-- Navigation Button -->
            <button id="nav-beer-btn" class="nav-beer-btn" aria-label="Open navigation menu" aria-expanded="false">
                <span class="beer-emoji" aria-hidden="true">🍺</span>
            </button>

            <!-- Navigation Dropdown Menu -->
            <nav id="nav-dropdown" class="nav-dropdown" role="navigation" aria-label="Main navigation" style="display: none;">
                ${menuItemsHTML}
            </nav>

            <!-- Dark Mode Toggle -->
            <button id="dark-mode-toggle" class="dark-mode-toggle" aria-label="Toggle dark mode">
                <span class="moon-emoji" aria-hidden="true">🌙</span>
            </button>
        `;
  }

  /**
   * Create CSS styles for navigation
   */
  function createNavigationStyles() {
    const style = document.createElement('style');
    style.textContent = `
            /* Navigation button */
            .nav-beer-btn {
                position: fixed;
                top: 95px; /* Position below the black banner and tear */
                right: 20px;
                z-index: 1100;
                width: 50px;
                height: 50px;
                background: transparent; /* No background circle */
                border: none;
                cursor: pointer;
                padding: 0;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .nav-beer-btn:hover {
                transform: scale(1.1);
            }

            .nav-beer-btn:focus {
                outline: none;
            }

            .beer-emoji {
                font-size: 40px;
                display: inline-block;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
                transition: transform 0.3s ease;
                transform: rotate(0deg);
            }

            .beer-emoji.tipped {
                transform: rotate(-90deg);
            }

            /* Dropdown menu */
            .nav-dropdown {
                position: fixed;
                top: 155px; /* Position below the button */
                right: 20px;
                z-index: 1099;
                background: #ffffff;
                border: 2px solid #e0e0e0;
                border-radius: 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                min-width: 220px;
                overflow: hidden;
                animation: slideDown 0.3s ease;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Reduced Motion Support */
            @media (prefers-reduced-motion: reduce) {
                .nav-dropdown {
                    animation: none;
                }
                .nav-beer-btn:hover {
                    transform: none;
                }
            }

            /* Dropdown items */
            .nav-category {
                padding: 12px 18px 8px 18px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #999;
                background: #fafafa;
                border-bottom: 1px solid #f0f0f0;
            }

            .nav-dropdown-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 18px 14px 28px;
                color: #333;
                text-decoration: none;
                font-size: 1rem;
                font-weight: 600;
                transition: all 0.2s ease;
                cursor: pointer;
                border: none;
                background: transparent;
                width: 100%;
                text-align: left;
                font-family: 'Bai Jamjuree', sans-serif;
                border-bottom: 1px solid #f5f5f5;
            }

            .nav-dropdown-item:last-child {
                border-bottom: none;
            }

            .nav-dropdown-item:hover {
                background: #f5f5f5;
                color: #4CAF50;
            }

            .nav-dropdown-item.nav-active {
                background: #e8f5e9;
                color: #4CAF50;
                font-weight: 700;
            }

            .nav-dropdown-item:focus {
                outline: 2px solid #4CAF50;
                outline-offset: -2px;
                background: #f5f5f5;
            }

            .nav-dropdown-item i {
                font-size: 1.1rem;
                color: #666;
                min-width: 20px;
                text-align: center;
            }

            .nav-dropdown-item:hover i {
                color: #4CAF50;
            }

            .nav-dropdown-item.nav-active i {
                color: #4CAF50;
            }

            /* Dark Mode Toggle */
            .dark-mode-toggle {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 1100;
                width: 50px;
                height: 50px;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .dark-mode-toggle:hover {
                transform: scale(1.1);
            }

            .moon-emoji {
                font-size: 40px;
                display: inline-block;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
                transition: transform 0.3s ease;
            }

            .dark-mode-toggle:hover .moon-emoji {
                transform: rotate(-20deg);
            }

            /* Dark Mode Styles */
            body.dark-mode {
                background: #1a1a1a;
                color: #e0e0e0;
            }

            body.dark-mode header {
                background: #2d2d2d;
                color: #e0e0e0;
            }

            body.dark-mode .nav-dropdown {
                background: #2d2d2d;
                border-color: #444;
            }

            body.dark-mode .nav-category {
                background: #252525;
                color: #888;
                border-bottom-color: #333;
            }

            body.dark-mode .nav-dropdown-item {
                color: #e0e0e0;
                border-bottom-color: #333;
            }

            body.dark-mode .nav-dropdown-item:hover {
                background: #353535;
                color: #4CAF50;
            }

            body.dark-mode .nav-dropdown-item.nav-active {
                background: #1b3a1b;
            }

            body.dark-mode .timer-section,
            body.dark-mode .timer-card,
            body.dark-mode .benchmark-card,
            body.dark-mode .pr-form-card,
            body.dark-mode .pr-card,
            body.dark-mode .wod-display,
            body.dark-mode .saved-wod-card,
            body.dark-mode .leaderboard-form-card,
            body.dark-mode .leaderboard-table-wrapper {
                background: #2d2d2d;
                border-color: #444;
                color: #e0e0e0;
            }

            body.dark-mode .section-title,
            body.dark-mode .benchmark-name,
            body.dark-mode .pr-card-name,
            body.dark-mode .wod-display-name,
            body.dark-mode .saved-wod-name,
            body.dark-mode h2, body.dark-mode h3, body.dark-mode h4 {
                color: #e0e0e0;
            }

            body.dark-mode input,
            body.dark-mode select,
            body.dark-mode textarea {
                background: #252525;
                border-color: #444;
                color: #e0e0e0;
            }

            body.dark-mode .benchmark-movements li,
            body.dark-mode .orm-item,
            body.dark-mode .bs-row {
                background: #252525;
                border-color: #444;
            }

            body.dark-mode .leaderboard-table thead {
                background: #252525;
            }

            body.dark-mode .leaderboard-table td {
                border-bottom-color: #333;
            }

            body.dark-mode .leaderboard-podium {
                background: linear-gradient(to right, #2a2416, #1a1a1a);
            }

            /* Mobile adjustments */
            @media (max-width: 768px) {
                .nav-beer-btn {
                    top: 90px; /* Position below header on mobile */
                    right: 15px;
                    width: 45px;
                    height: 45px;
                }
                
                .nav-beer-btn i {
                    font-size: 36px;
                }

                .nav-dropdown {
                    top: 145px;
                    right: 10px;
                    min-width: 200px;
                }

                .nav-dropdown-item {
                    padding: 10px 15px;
                    font-size: 0.95rem;
                }

                .nav-dropdown-item i {
                    font-size: 1rem;
                }
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Initialize navigation component
   */
  function initNavigation() {
    // Add styles
    createNavigationStyles();

    // Add navigation HTML to body
    const navContainer = document.createElement('div');
    navContainer.innerHTML = createNavigationHTML();
    document.body.appendChild(navContainer);

    // Get elements
    const beerBtn = document.getElementById('nav-beer-btn');
    const dropdown = document.getElementById('nav-dropdown');
    const darkModeBtn = document.getElementById('dark-mode-toggle');

    /**
     * Toggle dropdown open/closed state
     */
    function toggleDropdown() {
      const isOpen = dropdown.style.display === 'block';
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }

    /**
     * Open dropdown menu
     */
    function openDropdown() {
      dropdown.style.display = 'block';
      beerBtn.setAttribute('aria-expanded', 'true');
    }

    /**
     * Close dropdown menu and reset beer mug rotation
     */
    function closeDropdown() {
      dropdown.style.display = 'none';
      beerBtn.setAttribute('aria-expanded', 'false');
      const beerEmoji = beerBtn.querySelector('.beer-emoji');
      if (beerEmoji) {
        beerEmoji.classList.remove('tipped');
      }
    }

    /**
     * Initialize dark mode
     */
    function initDarkMode() {
      // Check for saved preference or system preference
      const savedMode = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedMode === 'enabled' || (!savedMode && prefersDark)) {
        document.body.classList.add('dark-mode');
      }
    }

    /**
     * Toggle dark mode
     */
    function toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      
      // Save preference
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
      } else {
        localStorage.setItem('darkMode', 'disabled');
      }
    }

    // Event listeners
    beerBtn.addEventListener('click', function() {
      const beerEmoji = beerBtn.querySelector('.beer-emoji');
      const isOpen = dropdown.style.display === 'block';
      
      // Toggle tilt based on open/close state
      if (beerEmoji) {
        if (isOpen) {
          beerEmoji.classList.remove('tipped');
        } else {
          beerEmoji.classList.add('tipped');
        }
      }
      toggleDropdown();
    });

    // Dark mode toggle
    if (darkModeBtn) {
      darkModeBtn.addEventListener('click', toggleDarkMode);
    }

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!beerBtn.contains(e.target) && !dropdown.contains(e.target)) {
        closeDropdown();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropdown.style.display === 'block') {
        closeDropdown();
        beerBtn.focus();
      }
    });

    // Initialize dark mode
    initDarkMode();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
