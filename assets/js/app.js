/**
 * Iron & Ale - Main Application JavaScript
 * Minimal, progressive enhancement focused
 */

(function() {
  'use strict';

  // ========================================
  // Sidebar Navigation
  // ========================================
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');

  function openSidebar() {
    if (sidebar && sidebarOverlay && mobileMenuBtn) {
      sidebar.classList.add('is-open');
      sidebarOverlay.classList.add('is-visible');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      
      // Focus first nav item for accessibility
      const firstNavItem = sidebar.querySelector('.sidebar-nav-item');
      if (firstNavItem) {
        firstNavItem.focus();
      }
    }
  }

  function closeSidebar() {
    if (sidebar && sidebarOverlay && mobileMenuBtn) {
      sidebar.classList.remove('is-open');
      sidebarOverlay.classList.remove('is-visible');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      mobileMenuBtn.focus();
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (sidebar.classList.contains('is-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('is-open')) {
      closeSidebar();
    }
  });

  // Close sidebar when clicking a nav link (mobile)
  if (sidebar) {
    sidebar.querySelectorAll('.sidebar-nav-item').forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth < 1024) {
          closeSidebar();
        }
      });
    });
  }

  // ========================================
  // Utility Functions
  // ========================================
  
  /**
   * Format time in mm:ss format
   * @param {number} seconds - Total seconds
   * @returns {string} Formatted time string
   */
  window.formatTime = function(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  };

  /**
   * Parse time string to seconds
   * @param {string} timeStr - Time string in mm:ss format
   * @returns {number} Total seconds
   */
  window.parseTime = function(timeStr) {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success, error, info)
   */
  window.showToast = function(message, type) {
    type = type || 'info';
    
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(function(toast) { toast.remove(); });

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    const bgColor = type === 'success' ? 'var(--color-success-500)' 
                  : type === 'error' ? 'var(--color-danger-500)' 
                  : 'var(--color-primary-500)';
    
    toast.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;background:' + bgColor + 
                          ';color:white;padding:1rem 1.5rem;border-radius:0.5rem;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1);' +
                          'z-index:9999;animation:slideIn 0.3s ease-out;font-weight:500;';
    toast.textContent = message;

    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(function() {
      toast.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  };

  // Add toast animation styles
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}' +
                        '@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}';
    document.head.appendChild(style);
  }

  // ========================================
  // Local Storage Helpers
  // ========================================
  
  /**
   * Get data from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Stored value or default
   */
  window.getStoredData = function(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
      return defaultValue;
    }
  };

  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  window.setStoredData = function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  };

  // ========================================
  // Image Error Handling
  // ========================================
  document.querySelectorAll('img').forEach(function(img) {
    img.addEventListener('error', function() {
      this.style.display = 'none';
      
      // Create placeholder if doesn't exist
      if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('img-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'img-placeholder';
        placeholder.style.cssText = 'background:var(--color-gray-200);display:flex;align-items:center;justify-content:center;' +
                                    'color:var(--color-gray-400);padding:2rem;border-radius:var(--radius-lg);';
        placeholder.innerHTML = '<span>Image unavailable</span>';
        placeholder.setAttribute('role', 'img');
        placeholder.setAttribute('aria-label', this.alt || 'Image unavailable');
        this.parentNode.insertBefore(placeholder, this.nextSibling);
      }
    });
  });

  // ========================================
  // Lazy Loading Enhancement
  // ========================================
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // ========================================
  // Responsive Tables
  // ========================================
  document.querySelectorAll('table').forEach(function(table) {
    if (!table.parentElement.classList.contains('table-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'overflow-x-auto';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });

  // ========================================
  // Print Year in Footer
  // ========================================
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('[id$="-year"]').forEach(function(el) {
    el.textContent = currentYear;
  });

  console.log('Iron & Ale App initialized');
})();
