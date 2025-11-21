/**
 * Global Navigation Dropdown Component
 * Provides a dumbbell icon that opens a dropdown menu
 */

(function () {
  'use strict';

  // Get current page filename
  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  }

  // Create navigation HTML structure
  function createNavigationHTML() {
    const currentPage = getCurrentPage();

    // Define all navigation items
    const navItems = [
      { href: 'index.html', icon: 'fa-calendar', label: 'Upcoming Events' },
      { href: 'past-events.html', icon: 'fa-calendar-check', label: 'Past Events' },
      { href: 'wods.html', icon: 'fa-dumbbell', label: 'WODs Database' },
      { href: 'wods-table.html', icon: 'fa-table', label: 'WODs Table' },
      { href: 'timers.html', icon: 'fa-stopwatch', label: 'Workout Timers' },
    ];

    // Build menu items HTML, excluding current page
    let menuItemsHTML = '';
    navItems.forEach(item => {
      if (item.href !== currentPage) {
        menuItemsHTML += `
                    <a href="${item.href}" class="nav-dropdown-item">
                        <i class="fa-solid ${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                `;
      }
    });

    return `
            <!-- Navigation Button -->
            <button id="nav-dumbbell-btn" class="nav-dumbbell-btn" aria-label="Open navigation menu" aria-expanded="false">
                <i class="fa-solid fa-dumbbell" aria-hidden="true"></i>
            </button>

            <!-- Navigation Dropdown Menu -->
            <nav id="nav-dropdown" class="nav-dropdown" role="navigation" aria-label="Main navigation" style="display: none;">
                ${menuItemsHTML}
            </nav>
        `;
  }

  // Create CSS styles for navigation
  function createNavigationStyles() {
    const style = document.createElement('style');
    style.textContent = `
            /* Navigation button */
            .nav-dumbbell-btn {
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

            .nav-dumbbell-btn:hover {
                transform: scale(1.1);
            }

            .nav-dumbbell-btn:focus {
                outline: 3px solid #80affe;
                outline-offset: 2px;
            }

            .nav-dumbbell-btn i {
                font-size: 40px;
                color: #dc3545; /* Red dumbbell icon */
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }

            /* Dropdown menu */
            .nav-dropdown {
                position: fixed;
                top: 155px; /* Position below the button */
                right: 20px;
                z-index: 1099;
                background: #202023;
                border: 2px solid rgba(128, 175, 254, 0.3);
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
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
                .nav-dumbbell-btn:hover {
                    transform: none;
                }
            }

            /* Dropdown items */
            .nav-dropdown-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 18px;
                color: #fff;
                text-decoration: none;
                font-size: 1rem;
                font-weight: 600;
                transition: all 0.2s ease;
                cursor: pointer;
                border: none;
                background: transparent;
                width: 100%;
                text-align: left;
                font-family: 'Montserrat', sans-serif;
                border-bottom: 1px solid rgba(128, 175, 254, 0.1);
            }

            .nav-dropdown-item:last-child {
                border-bottom: none;
            }

            .nav-dropdown-item:hover {
                background: rgba(128, 175, 254, 0.15);
                color: #29ffb4;
            }

            .nav-dropdown-item:focus {
                outline: 2px solid #80affe;
                outline-offset: -2px;
                background: rgba(128, 175, 254, 0.1);
            }

            .nav-dropdown-item i {
                font-size: 1.1rem;
                color: #80affe;
                min-width: 20px;
                text-align: center;
            }

            .nav-dropdown-item:hover i {
                color: #29ffb4;
            }

            .nav-dropdown-button i {
                color: #29ffb4;
            }

            /* Mobile adjustments */
            @media (max-width: 768px) {
                .nav-dumbbell-btn {
                    top: 90px; /* Position below header on mobile */
                    right: 15px;
                    width: 45px;
                    height: 45px;
                }
                
                .nav-dumbbell-btn i {
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

  // Initialize navigation
  function initNavigation() {
    // Add styles
    createNavigationStyles();

    // Add navigation HTML to body
    const navContainer = document.createElement('div');
    navContainer.innerHTML = createNavigationHTML();
    document.body.appendChild(navContainer);

    // Get elements
    const dumbbellBtn = document.getElementById('nav-dumbbell-btn');
    const dropdown = document.getElementById('nav-dropdown');

    // Toggle dropdown
    function toggleDropdown() {
      const isOpen = dropdown.style.display === 'block';
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }

    // Open dropdown
    function openDropdown() {
      dropdown.style.display = 'block';
      dumbbellBtn.setAttribute('aria-expanded', 'true');
    }

    // Close dropdown
    function closeDropdown() {
      dropdown.style.display = 'none';
      dumbbellBtn.setAttribute('aria-expanded', 'false');
    }

    // Event listeners
    dumbbellBtn.addEventListener('click', toggleDropdown);

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!dumbbellBtn.contains(e.target) && !dropdown.contains(e.target)) {
        closeDropdown();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropdown.style.display === 'block') {
        closeDropdown();
        dumbbellBtn.focus();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
