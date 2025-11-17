// IDFit Events - Utility Functions

/**
 * Generate a URL-safe slug from a string
 * @param {string} input - The string to slugify
 * @returns {string} A URL-safe slug
 */
function slugify(input) {
    return input.toString()
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
    let s = ["th", "st", "nd", "rd"];
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
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    let pieces = [`${day} ${month} ${year}`];
    
    if (d.getHours() + d.getMinutes() > 0) {
        let mins = String(d.getMinutes()).padStart(2, "0");
        pieces.push(`${d.getHours()}:${mins}`);
    }
    
    return pieces.join(", ");
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
    
    let pad = n => String(n).padStart(2, "0");
    let fmt = dt => `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
    
    let icsText = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `DTSTART:${fmt(d)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:${event.name}`,
        `LOCATION:${event.calendarDetails?.location || ""}`,
        `DESCRIPTION:${event.calendarDetails?.description || ""}`,
        'END:VEVENT',
        'END:VCALENDAR'
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
    const toast = document.getElementById("toast");
    if (!toast) return;
    
    toast.textContent = msg;
    toast.style.display = "block";
    
    // Remove after animation completes (2.8s)
    setTimeout(() => toast.style.display = "none", 2800);
}
