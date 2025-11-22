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
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();
