// IDFit Events - Main Application Logic

// Global state
let events = [];
let sortedEvents = [];

/**
 * Load events from JSON files using Promise.allSettled for robust error handling
 */
async function loadEvents() {
    try {
        // First, load the list of event files
        const response = await fetch('events/events-list.json');
        if (!response.ok) {
            throw new Error('Failed to load events list');
        }
        const eventFiles = await response.json();
        
        // Load all event files with Promise.allSettled to handle partial failures
        const eventPromises = eventFiles.map(file => 
            fetch(file)
                .then(res => {
                    if (!res.ok) {
                        return Promise.reject(new Error(`Failed to load ${file}`));
                    }
                    return res.json();
                })
        );
        
        const results = await Promise.allSettled(eventPromises);
        
        // Extract successfully loaded events
        events = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
        
        // Check if any events failed to load
        const failedCount = results.filter(result => result.status === 'rejected').length;
        if (failedCount > 0) {
            showToast('Some events failed to load; showing available events.');
        }
        
        // Generate stable IDs for each event
        events = events.map(ev => {
            ev._id = ev.id || slugify(`${ev.name}-${ev.date}`);
            return ev;
        });
        
        // Sort events by date
        const now = new Date();
        sortedEvents = events.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Render the events
        renderEvents();
        updateCountdowns();
        
        // Update countdowns every minute
        setInterval(updateCountdowns, 60000);
        
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById("events-list").innerHTML = 
            `<div class="empty-events" role="alert">Unable to load events. Please try again later.</div>`;
    }
}

/**
 * Render event cards using template and safe DOM manipulation
 */
function renderEvents() {
    const now = new Date();
    const upcomingEvents = sortedEvents.filter(ev => new Date(ev.date) >= now);
    const eventsList = document.getElementById('events-list');
    const template = document.getElementById('event-card-template');
    
    // Clear existing content
    eventsList.innerHTML = '';
    
    if (sortedEvents.length === 0) {
        eventsList.innerHTML = 
            `<div class="empty-events" role="alert">No events are currently scheduled. Please check back soon!</div>`;
        return;
    }
    
    if (upcomingEvents.length === 0) {
        eventsList.innerHTML = 
            `<div class="empty-events" role="alert">There are no upcoming events.<br>Check back soon, or follow us on social for the latest updates!</div>`;
        return;
    }
    
    eventsList.setAttribute('aria-label', 'Upcoming events');
    
    // Render each event using the template
    upcomingEvents.forEach((ev, i) => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.event-card');
        
        // Set data attribute for stable ID
        card.setAttribute('data-event-id', ev._id);
        
        // Highlight next event (first in list)
        if (i === 0) {
            card.classList.add('next');
        }
        
        // Set image
        const img = clone.querySelector('.event-img');
        img.src = ev.image;
        img.alt = `Preview for ${ev.name}`;
        img.id = `event-img-${ev._id}`;
        img.addEventListener('error', () => onImgError(img));
        
        // Set event title
        const title = clone.querySelector('.event-title');
        title.textContent = ev.name;
        
        // Set event date
        const date = clone.querySelector('.event-date');
        date.textContent = formatEventDate(ev.date);
        date.setAttribute('datetime', ev.date);
        
        // Set event description
        const desc = clone.querySelector('.event-desc');
        desc.textContent = ev.description;
        
        // Set countdown ID
        const countdown = clone.querySelector('.countdown');
        countdown.id = `countdown-${ev._id}`;
        
        // Build action buttons
        const actionsContainer = clone.querySelector('.card-actions');
        actionsContainer.innerHTML = ''; // Clear template buttons
        
        const shouldShowMoreInfo = ev.showMoreInfo !== false;
        const shouldShowBookNow = ev.showBookNow !== false;
        const shouldShowRemindMe = ev.showRemindMe !== false;
        
        if (shouldShowMoreInfo) {
            const moreInfoBtn = document.createElement('a');
            moreInfoBtn.className = 'button info';
            moreInfoBtn.href = ev.link;
            moreInfoBtn.target = '_blank';
            moreInfoBtn.rel = 'noopener noreferrer';
            moreInfoBtn.setAttribute('aria-label', `More information about ${ev.name} (opens in new tab)`);
            moreInfoBtn.textContent = 'More Info';
            actionsContainer.appendChild(moreInfoBtn);
        }
        
        if (shouldShowBookNow) {
            const bookBtn = document.createElement('a');
            bookBtn.className = 'button';
            bookBtn.href = ev.link;
            bookBtn.target = '_blank';
            bookBtn.rel = 'noopener noreferrer';
            bookBtn.setAttribute('aria-label', `Book now for ${ev.name} (opens in new tab)`);
            bookBtn.textContent = 'Book Now';
            actionsContainer.appendChild(bookBtn);
        }
        
        if (shouldShowRemindMe) {
            const calendarLink = document.createElement('a');
            calendarLink.className = 'calendar-link';
            calendarLink.setAttribute('aria-label', `Add a reminder for ${ev.name} to your calendar`);
            calendarLink.title = 'Add to calendar';
            
            // Create icon
            const icon = document.createElement('i');
            icon.className = 'fa-regular fa-calendar-plus';
            calendarLink.appendChild(icon);
            
            // Add text
            const text = document.createTextNode(' Remind Me');
            calendarLink.appendChild(text);
            
            // Handle calendar download
            calendarLink.addEventListener('click', (e) => {
                e.preventDefault();
                const blob = generateIcsBlob(ev);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = sanitizeFilename(ev.name);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast(`Calendar event for "${ev.name}" downloaded!`);
            });
            
            actionsContainer.appendChild(calendarLink);
        }
        
        eventsList.appendChild(clone);
    });
}

/**
 * Handle image loading errors by showing placeholder
 * @param {HTMLImageElement} img - The image element that failed to load
 */
function onImgError(img) {
    const placeholder = document.createElement('div');
    placeholder.className = 'event-img placeholder';
    placeholder.title = 'Preview image unavailable';
    placeholder.textContent = 'Image unavailable';
    img.replaceWith(placeholder);
}

/**
 * Update countdown timers for all events
 */
function updateCountdowns() {
    const now = new Date().getTime();
    
    // Query all event cards by their data attribute
    const eventCards = document.querySelectorAll('[data-event-id]');
    
    eventCards.forEach(card => {
        const eventId = card.getAttribute('data-event-id');
        const event = events.find(ev => ev._id === eventId);
        
        if (!event) return;
        
        const countdownEl = card.querySelector('.countdown span');
        if (!countdownEl) return;
        
        const evDate = new Date(event.date).getTime();
        let distance = evDate - now;
        
        if (distance <= 0) {
            countdownEl.textContent = 'Event has started!';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        
        // For events less than 2 days away, show more detail
        if (days < 2) {
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            
            if (days === 1) {
                countdownEl.innerHTML = `<b>1</b> day, <b>${hours}</b> hour${hours !== 1 ? 's' : ''} left`;
            } else if (hours > 0) {
                countdownEl.innerHTML = `<b>${hours}</b> hour${hours !== 1 ? 's' : ''}, <b>${minutes}</b> min${minutes !== 1 ? 's' : ''} left`;
            } else {
                countdownEl.innerHTML = `<b>${minutes}</b> minute${minutes !== 1 ? 's' : ''} left`;
            }
        } else {
            countdownEl.innerHTML = `<b>${days}</b> day${days !== 1 ? 's' : ''} left`;
        }
    });
}

// Initialize: Update footer year
document.addEventListener('DOMContentLoaded', () => {
    const footerYear = document.getElementById('footerYear');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
    
    // Load events on page load
    loadEvents();
});
