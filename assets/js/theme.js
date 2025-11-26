/**
 * Theme Toggle Helper
 * Iron & Ale - Theme Management
 * 
 * Features:
 * - Toggles .theme-dark class on <html>
 * - Persists preference to localStorage
 * - Respects prefers-color-scheme when no preference saved
 * - Updates meta[name="theme-color"] for mobile browsers
 * - Announces theme changes for screen readers
 */

(function() {
  'use strict';

  const THEME_KEY = 'ironale-theme';
  const DARK_CLASS = 'theme-dark';
  const LIGHT_CLASS = 'theme-light';
  const THEME_COLORS = {
    light: '#ffffff',
    dark: '#111827'
  };

  /**
   * Get the current system preference for color scheme
   * @returns {'dark' | 'light'}
   */
  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Get stored theme preference from localStorage
   * @returns {'dark' | 'light' | null}
   */
  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      console.warn('Could not access localStorage:', e);
      return null;
    }
  }

  /**
   * Store theme preference to localStorage
   * @param {'dark' | 'light'} theme
   */
  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  /**
   * Get the current effective theme
   * @returns {'dark' | 'light'}
   */
  function getCurrentTheme() {
    const stored = getStoredTheme();
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return getSystemPreference();
  }

  /**
   * Apply theme to the document
   * @param {'dark' | 'light'} theme
   * @param {boolean} [announce=true] - Whether to announce change to screen readers
   */
  function applyTheme(theme, announce = true) {
    const html = document.documentElement;
    const isDark = theme === 'dark';

    // Add transition class for smooth theme change
    html.classList.add('theme-transitioning');

    // Update classes
    if (isDark) {
      html.classList.add(DARK_CLASS);
      html.classList.remove(LIGHT_CLASS);
    } else {
      html.classList.remove(DARK_CLASS);
      html.classList.add(LIGHT_CLASS);
    }

    // Update theme-color meta tag for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', THEME_COLORS[theme]);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = THEME_COLORS[theme];
      document.head.appendChild(meta);
    }

    // Update toggle button icons
    updateToggleButtons(isDark);

    // Announce to screen readers
    if (announce) {
      announceThemeChange(theme);
    }

    // Remove transition class after animation completes
    setTimeout(function() {
      html.classList.remove('theme-transitioning');
    }, 200);
  }

  /**
   * Update all theme toggle buttons on the page
   * @param {boolean} isDark
   */
  function updateToggleButtons(isDark) {
    const toggleButtons = document.querySelectorAll('.theme-toggle, [data-theme-toggle]');
    toggleButtons.forEach(function(btn) {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  /**
   * Announce theme change to screen readers
   * @param {'dark' | 'light'} theme
   */
  function announceThemeChange(theme) {
    let announcement = document.getElementById('theme-announcement');
    
    if (!announcement) {
      announcement = document.createElement('div');
      announcement.id = 'theme-announcement';
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      document.body.appendChild(announcement);
    }

    // Clear and set new announcement
    announcement.textContent = '';
    setTimeout(function() {
      announcement.textContent = theme === 'dark' 
        ? 'Dark theme activated' 
        : 'Light theme activated';
    }, 100);
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const current = getCurrentTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setStoredTheme(newTheme);
    applyTheme(newTheme);
    return newTheme;
  }

  /**
   * Set a specific theme
   * @param {'dark' | 'light' | 'system'} theme
   */
  function setTheme(theme) {
    if (theme === 'system') {
      // Remove stored preference, use system
      try {
        localStorage.removeItem(THEME_KEY);
      } catch (e) {
        // Ignore
      }
      applyTheme(getSystemPreference());
    } else if (theme === 'dark' || theme === 'light') {
      setStoredTheme(theme);
      applyTheme(theme);
    }
  }

  /**
   * Initialize theme on page load
   */
  function initTheme() {
    const theme = getCurrentTheme();
    applyTheme(theme, false); // Don't announce on initial load
  }

  /**
   * Set up event listeners
   */
  function setupListeners() {
    // Listen for toggle button clicks
    document.addEventListener('click', function(e) {
      const toggle = e.target.closest('.theme-toggle, [data-theme-toggle]');
      if (toggle) {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Listen for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', function(e) {
          // Only auto-switch if no stored preference
          if (!getStoredTheme()) {
            applyTheme(e.matches ? 'dark' : 'light');
          }
        });
      } else if (mediaQuery.addListener) {
        // Fallback for older browsers
        mediaQuery.addListener(function(e) {
          if (!getStoredTheme()) {
            applyTheme(e.matches ? 'dark' : 'light');
          }
        });
      }
    }

    // Listen for storage changes (sync across tabs)
    window.addEventListener('storage', function(e) {
      if (e.key === THEME_KEY && e.newValue) {
        applyTheme(e.newValue, false);
      }
    });
  }

  // Initialize immediately (before DOMContentLoaded to prevent flash)
  initTheme();

  // Set up listeners when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupListeners);
  } else {
    setupListeners();
  }

  // Expose API globally
  window.IronAleTheme = {
    toggle: toggleTheme,
    set: setTheme,
    get: getCurrentTheme,
    getSystemPreference: getSystemPreference
  };
})();
