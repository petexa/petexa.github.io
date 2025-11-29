// Iron & Ale Events Page Logic

// Loads events from a single events.json file
// NOTE: The events file is now located at 'data/production/events.json'.
// Do NOT move this file in future, as the events page expects this path.
const EVENTS_FILE = 'data/production/events.json';

function fetchEvents() {
  return fetch(EVENTS_FILE)
    .then(res => res.json())
    .catch(() => []);
}

function daysUntil(dateStr) {
  const now = new Date();
  const eventDate = new Date(dateStr);
  const diff = eventDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function createEventCard(event, isPast) {
  const card = document.createElement('div');
  card.className = 'event-card' + (isPast ? ' past' : '');
  card.setAttribute('role', 'listitem');

  // Banner
  if (event.image) {
    const img = document.createElement('img');
    img.className = 'event-banner';
    img.src = event.image;
    img.alt = event.name;
    img.loading = 'lazy';
    card.appendChild(img);
  } else {
    // Fallback placeholder for events without images
    const placeholder = document.createElement('div');
    placeholder.className = 'event-banner-placeholder';
    placeholder.setAttribute('aria-label', event.name);
    
    // Add calendar icon
    const icon = document.createElement('div');
    icon.className = 'event-placeholder-icon';
    icon.innerHTML = '📅';
    placeholder.appendChild(icon);
    
    // Add event name as text
    const text = document.createElement('div');
    text.className = 'event-placeholder-text';
    text.textContent = event.name;
    placeholder.appendChild(text);
    
    card.appendChild(placeholder);
  }

  // Content
  const content = document.createElement('div');
  content.className = 'event-content';

  // Title
  const title = document.createElement('div');
  title.className = 'event-title';
  title.textContent = event.name;
  content.appendChild(title);

  // Date
  const date = document.createElement('div');
  date.className = 'event-date';
  const eventDate = new Date(event.date);
  // If time is midnight (00:00:00), show only date
  if (
    eventDate.getHours() === 0 &&
    eventDate.getMinutes() === 0 &&
    eventDate.getSeconds() === 0
  ) {
    date.textContent = eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } else {
    date.textContent = eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  content.appendChild(date);

  // Description
  const desc = document.createElement('div');
  desc.className = 'event-desc';
  desc.textContent = event.description;
  content.appendChild(desc);

  // Countdown or Complete
  if (isPast) {
    const complete = document.createElement('div');
    complete.className = 'event-complete';
    complete.textContent = 'Event Complete';
    content.appendChild(complete);
  } else {
    const countdown = document.createElement('div');
    countdown.className = 'event-countdown';
    const days = daysUntil(event.date);
    if (days === 0) {
      countdown.textContent = 'Today!';
    } else if (days === 1) {
      countdown.textContent = 'Tomorrow!';
    } else {
      countdown.textContent = `Starts in ${days} days`;
    }
    content.appendChild(countdown);
  }

  // Buttons
  const btns = document.createElement('div');
  btns.className = 'event-buttons';

  if (event.showRemindMe && !isPast) {
    const remindBtn = document.createElement('a');
    remindBtn.className = 'event-btn';
    remindBtn.textContent = 'Remind Me';
    remindBtn.href = createICSLink(event);
    remindBtn.download = `${event.name.replace(/\s+/g, '_')}.ics`;
    remindBtn.setAttribute('aria-label', `Add ${event.name} to calendar`);
    remindBtn.addEventListener('click', function(e) {
      showToast('Event added to your calendar!');
    });
    btns.appendChild(remindBtn);
  }
  
  // Show either "View Details" or "More Info" (not both) - only one link button
  if (event.link) {
    const linkBtn = document.createElement('a');
    linkBtn.className = 'event-btn';
    // Use "More Info" text if showMoreInfo is true, otherwise "View Details"
    linkBtn.textContent = event.showMoreInfo ? 'More Info' : 'View Details';
    linkBtn.href = event.link;
    linkBtn.target = '_blank';
    linkBtn.rel = 'noopener noreferrer';
    linkBtn.setAttribute('aria-label', `${event.showMoreInfo ? 'More information about' : 'View details for'} ${event.name} (opens in new tab)`);
    btns.appendChild(linkBtn);
  }
  
  if (event.showBookNow && event.link && !isPast) {
    const bookBtn = document.createElement('a');
    bookBtn.className = 'event-btn yellow';
    bookBtn.textContent = 'Book Now';
    bookBtn.href = event.link;
    bookBtn.target = '_blank';
    bookBtn.rel = 'noopener noreferrer';
    bookBtn.setAttribute('aria-label', `Book ${event.name} now (opens in new tab)`);
    btns.appendChild(bookBtn);
  }
  if (btns.childElementCount > 0) content.appendChild(btns);

  card.appendChild(content);
  return card;
}

function createICSLink(event) {
  if (!event.calendarDetails) return '#';
  const dtStart = new Date(event.date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const dtEnd = new Date(new Date(event.date).getTime() + (event.calendarDetails.durationHours || 1) * 3600000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.name}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nLOCATION:${event.calendarDetails.location || ''}\nDESCRIPTION:${event.calendarDetails.description || ''}\nEND:VEVENT\nEND:VCALENDAR`;
  return 'data:text/calendar;charset=utf8,' + encodeURIComponent(ics);
}


document.addEventListener('DOMContentLoaded', renderEvents);

// Toast notification function
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

// Show loading indicator while events load
async function renderEvents() {
  // Check for separate grids (new layout) or single grid (legacy)
  const upcomingGrid = document.getElementById('upcoming-events-grid');
  const pastGrid = document.getElementById('past-events-grid');
  const legacyGrid = document.getElementById('events-grid');
  
  const useSeparateGrids = upcomingGrid && pastGrid;
  const targetGrid = useSeparateGrids ? upcomingGrid : legacyGrid;
  
  if (!targetGrid) return;
  
  // Show loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'events-loading';
  loadingDiv.innerHTML = '<div class="loading-spinner"></div><p>Loading events...</p>';
  targetGrid.innerHTML = '';
  targetGrid.appendChild(loadingDiv);
  
  try {
    const now = new Date();
    const events = (await fetchEvents()).filter(e => e && e.date);
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    const upcoming = events.filter(e => new Date(e.date) >= now);
    const past = events.filter(e => new Date(e.date) < now).reverse(); // Most recent first for past

    // Clear loading state
    targetGrid.innerHTML = '';
    
    if (useSeparateGrids) {
      // New layout with separate sections
      
      // Upcoming events
      if (upcoming.length === 0) {
        const emptyDiv = document.createElement('p');
        emptyDiv.className = 'events-empty';
        emptyDiv.textContent = 'No upcoming events. Check back soon!';
        upcomingGrid.appendChild(emptyDiv);
      } else {
        upcoming.forEach((e, i) => {
          const card = createEventCard(e, false);
          if (i === 0) card.classList.add('next-event');
          upcomingGrid.appendChild(card);
        });
      }
      
      // Past events (in accordion)
      if (past.length === 0) {
        const emptyDiv = document.createElement('p');
        emptyDiv.className = 'events-empty';
        emptyDiv.textContent = 'No past events yet.';
        pastGrid.appendChild(emptyDiv);
      } else {
        past.forEach(e => pastGrid.appendChild(createEventCard(e, true)));
      }
      
      // Update accordion header with count
      const accordionToggle = document.getElementById('past-events-toggle');
      if (accordionToggle) {
        const countSpan = accordionToggle.querySelector('span:first-child');
        if (countSpan) {
          countSpan.textContent = `Past Events (${past.length})`;
        }
      }
    } else {
      // Legacy single grid layout
      upcoming.forEach((e, i) => {
        const card = createEventCard(e, false);
        if (i === 0) card.classList.add('next-event');
        targetGrid.appendChild(card);
      });
      past.forEach(e => targetGrid.appendChild(createEventCard(e, true)));
      
      if (events.length === 0) {
        const emptyDiv = document.createElement('p');
        emptyDiv.className = 'events-empty';
        emptyDiv.textContent = 'No events found.';
        targetGrid.appendChild(emptyDiv);
      }
    }
  } catch (error) {
    const errorDiv = document.createElement('p');
    errorDiv.className = 'events-error';
    errorDiv.textContent = 'Error loading events. Please try again later.';
    targetGrid.innerHTML = '';
    targetGrid.appendChild(errorDiv);
    console.error('Error loading events:', error);
  }
}
