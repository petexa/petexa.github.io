// IDFit Events - Utility Functions

/**
 * Generate a URL-safe slug from a string
 * @param {string} input - The string to slugify
 * @returns {string} A URL-safe slug
 */
function slugify(input) {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 * @param {number} n - The number
 * @returns {string} The number with ordinal suffix
 */
function getOrdinal(n) {
  let s = ['th', 'st', 'nd', 'rd'];
  let v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format event date with ordinal and optional time
 * @param {string} dateString - ISO 8601 date string
 * @returns {string} Formatted date (e.g., "22nd Nov 2025, 12:00")
 */
function formatEventDate(dateString) {
  const d = new Date(dateString);
  const day = getOrdinal(d.getDate());
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  let pieces = [`${day} ${month} ${year}`];

  if (d.getHours() + d.getMinutes() > 0) {
    let mins = String(d.getMinutes()).padStart(2, '0');
    pieces.push(`${d.getHours()}:${mins}`);
  }

  return pieces.join(', ');
}

/**
 * Generate ICS (iCalendar) blob for calendar download
 * @param {Object} event - Event object with date, name, and calendarDetails
 * @returns {Blob} Blob containing ICS file data
 */
function generateIcsBlob(event) {
  let d = new Date(event.date);
  let durationHours = event.calendarDetails?.durationHours || 4;
  let end = new Date(d.getTime() + 60000 * 60 * durationHours);

  let pad = n => String(n).padStart(2, '0');
  let fmt = dt =>
    `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(
      dt.getUTCHours()
    )}${pad(dt.getUTCMinutes())}00Z`;

  let icsText = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(d)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${event.name}`,
    `LOCATION:${event.calendarDetails?.location || ''}`,
    `DESCRIPTION:${event.calendarDetails?.description || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
}

/**
 * Sanitize a filename for safe download
 * @param {string} name - The event name
 * @returns {string} Sanitized filename with .ics extension
 */
function sanitizeFilename(name) {
  return slugify(name) + '.ics';
}

/**
 * Show a toast notification message
 * @param {string} msg - Message to display
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.remove('hidden');

  // Remove after animation completes (2.8s)
  setTimeout(() => toast.classList.add('hidden'), 2800);
}

/**
 * Position the header tear effect below the header dynamically
 * This ensures the tear is visible regardless of header height
 */
function positionHeaderTear() {
  const header = document.querySelector('body > header');
  const headerTear = document.querySelector('.header-tear');

  if (!header || !headerTear) return;

  // Get the actual height of the header
  const headerHeight = header.offsetHeight;

  // Position the tear directly below the header
  headerTear.style.top = `${headerHeight}px`;
}

/**
 * Debounce function to limit resize event frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
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

// Initialize header tear positioning on DOM load and debounced window resize
document.addEventListener('DOMContentLoaded', positionHeaderTear);
window.addEventListener('resize', debounce(positionHeaderTear, 250));
