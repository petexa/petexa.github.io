/**
 * Global Navigation Menu Component
 * Provides a kettlebell icon that opens a navigation menu
 */

(function() {
    'use strict';

    // Create navigation HTML structure
    function createNavigationHTML() {
        return `
            <!-- Kettlebell Navigation Button -->
            <button id="nav-kettlebell-btn" class="nav-kettlebell-btn" aria-label="Open navigation menu" aria-expanded="false">
                <img src="images/kettlebell-white.svg" alt="" aria-hidden="true">
            </button>

            <!-- Navigation Menu Overlay -->
            <div id="nav-menu-overlay" class="nav-menu-overlay" style="display: none;">
                <div class="nav-menu-content">
                    <div class="nav-menu-header">
                        <h2>Navigation</h2>
                        <button id="nav-close-btn" class="nav-close-btn" aria-label="Close navigation menu">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <nav class="nav-menu-list" role="navigation" aria-label="Main navigation">
                        <a href="index.html" class="nav-menu-item">
                            <i class="fa-solid fa-calendar"></i>
                            <span>Upcoming Events</span>
                        </a>
                        <a href="past-events.html" class="nav-menu-item">
                            <i class="fa-solid fa-calendar-check"></i>
                            <span>Past Events</span>
                        </a>
                        <a href="wods.html" class="nav-menu-item">
                            <i class="fa-solid fa-dumbbell"></i>
                            <span>WODs Database</span>
                        </a>
                        <a href="wods-table.html" class="nav-menu-item">
                            <i class="fa-solid fa-table"></i>
                            <span>WODs Table</span>
                        </a>
                        <a href="timers.html" class="nav-menu-item">
                            <i class="fa-solid fa-stopwatch"></i>
                            <span>Workout Timers</span>
                        </a>
                        <button id="nav-create-event-btn" class="nav-menu-item nav-menu-button">
                            <i class="fa-solid fa-plus"></i>
                            <span>Create Event</span>
                        </button>
                    </nav>
                </div>
            </div>
        `;
    }

    // Create CSS styles for navigation
    function createNavigationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Kettlebell button */
            .nav-kettlebell-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1100;
                width: 50px;
                height: 50px;
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                cursor: pointer;
                padding: 10px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .nav-kettlebell-btn:hover {
                background: rgba(0, 0, 0, 0.9);
                border-color: rgba(255, 255, 255, 0.6);
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
            }

            .nav-kettlebell-btn:focus {
                outline: 3px solid #80affe;
                outline-offset: 2px;
            }

            .nav-kettlebell-btn img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }

            /* Navigation overlay */
            .nav-menu-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                z-index: 1200;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            /* Navigation content */
            .nav-menu-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 2px solid rgba(128, 175, 254, 0.3);
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Navigation header */
            .nav-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid rgba(128, 175, 254, 0.3);
            }

            .nav-menu-header h2 {
                color: #fff;
                margin: 0;
                font-size: 1.8rem;
                font-weight: 600;
            }

            .nav-close-btn {
                background: transparent;
                border: none;
                color: #fff;
                font-size: 1.8rem;
                cursor: pointer;
                padding: 5px 10px;
                transition: all 0.2s ease;
                line-height: 1;
            }

            .nav-close-btn:hover {
                color: #29ffb4;
                transform: scale(1.1);
            }

            .nav-close-btn:focus {
                outline: 3px solid #80affe;
                outline-offset: 2px;
                border-radius: 4px;
            }

            /* Navigation list */
            .nav-menu-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .nav-menu-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px 20px;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(128, 175, 254, 0.2);
                border-radius: 12px;
                color: #fff;
                text-decoration: none;
                font-size: 1.1rem;
                font-weight: 600;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .nav-menu-button {
                width: 100%;
                text-align: left;
            }

            .nav-menu-item:hover {
                background: rgba(128, 175, 254, 0.2);
                border-color: #80affe;
                transform: translateX(5px);
            }

            .nav-menu-item:focus {
                outline: 3px solid #80affe;
                outline-offset: 2px;
            }

            .nav-menu-item i {
                font-size: 1.3rem;
                color: #80affe;
                min-width: 24px;
                text-align: center;
            }

            .nav-menu-item:hover i {
                color: #29ffb4;
            }

            .nav-menu-item.nav-menu-button i {
                color: #29ffb4;
            }

            /* Mobile adjustments */
            @media (max-width: 768px) {
                .nav-kettlebell-btn {
                    width: 45px;
                    height: 45px;
                    top: 15px;
                    right: 15px;
                }

                .nav-menu-content {
                    padding: 20px;
                    width: 95%;
                }

                .nav-menu-header h2 {
                    font-size: 1.5rem;
                }

                .nav-menu-item {
                    padding: 12px 15px;
                    font-size: 1rem;
                }

                .nav-menu-item i {
                    font-size: 1.1rem;
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
        const kettlebellBtn = document.getElementById('nav-kettlebell-btn');
        const overlay = document.getElementById('nav-menu-overlay');
        const closeBtn = document.getElementById('nav-close-btn');
        const createEventBtn = document.getElementById('nav-create-event-btn');

        // Open navigation
        function openNav() {
            overlay.style.display = 'flex';
            kettlebellBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        // Close navigation
        function closeNav() {
            overlay.style.display = 'none';
            kettlebellBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        // Event listeners
        kettlebellBtn.addEventListener('click', openNav);
        closeBtn.addEventListener('click', closeNav);

        // Close when clicking overlay background
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeNav();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.style.display === 'flex') {
                closeNav();
            }
        });

        // Handle Create Event button - only show on past-events.html
        if (window.location.pathname.endsWith('past-events.html')) {
            createEventBtn.addEventListener('click', function() {
                closeNav();
                // Trigger the existing openModal function if it exists
                if (typeof window.openModal === 'function') {
                    window.openModal();
                } else {
                    console.warn('openModal function not found on past-events.html page');
                }
            });
        } else {
            // Hide Create Event button on other pages
            createEventBtn.style.display = 'none';
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
})();
