/**
 * Shared Footer Component
 * Generates and inserts the footer HTML dynamically to avoid duplication
 */

(function () {
  'use strict';

  /**
   * Initialize and render the footer
   */
  function initFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    // Set current year
    const currentYear = new Date().getFullYear();
    const footerYearSpan = footer.querySelector('#footerYear');
    if (footerYearSpan) {
      footerYearSpan.textContent = currentYear;
    }

    // Add dark mode toggle to footer links
    const footerLinks = footer.querySelector('.footer-links');
    if (footerLinks && !document.getElementById('dark-mode-toggle')) {
      const darkModeBtn = document.createElement('button');
      darkModeBtn.id = 'dark-mode-toggle';
      darkModeBtn.setAttribute('aria-label', 'Toggle dark mode');
      darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
      footerLinks.appendChild(darkModeBtn);
    }
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();
