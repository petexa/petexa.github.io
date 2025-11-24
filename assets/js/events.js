// Iron & Ale Events Page Logic
// Loads all event JSON files, sorts, and renders neon event cards

const EVENTS_PATH = 'events/';
const EVENT_FILES = [
  '24-hour-work-out-20251122.json',
  'christmas-drinks-20251128.json',
  'deadly-dozen-20260425.json',
  'epping-wildwood-trail-10k-20251025.json',
  'gymrace-20260321.json',
  'lee-valley-half-marathon-20250621.json',
  'northstowe-running-festival-20250830.json',
  'nuclear-fit-20250725.json',
  'nuclear-fit-20250920.json',
  'nuclear-fit-20260718.json',
  'nuclear-races-20250511.json',
  'nuclear-races-20260510.json',
  'richmond-20250914.json',
  'thai-night-20251003.json',
  'white-water-rafting-20251018.json'
];

function fetchEvent(file) {
  return fetch(EVENTS_PATH + file)
    .then(res => res.json())
    .catch(() => null);
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
  const img = document.createElement('img');
  img.className = 'event-banner';
  img.src = event.image || '';
  img.alt = event.name;
  img.loading = 'lazy';
  card.appendChild(img);

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
  date.textContent = new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    countdown.textContent = `Starts in ${daysUntil(event.date)} days`;
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
  if (event.showBookNow && event.link) {
    const bookBtn = document.createElement('a');
    bookBtn.className = 'event-btn yellow';
    bookBtn.textContent = 'Book Now';
    bookBtn.href = event.link;
    bookBtn.target = '_blank';
    bookBtn.rel = 'noopener noreferrer';
    bookBtn.setAttribute('aria-label', `Book ${event.name} now (opens in new tab)`);
    btns.appendChild(bookBtn);
  }
  if (event.showMoreInfo && event.link) {
    const infoBtn = document.createElement('a');
    infoBtn.className = 'event-btn';
    infoBtn.textContent = 'More Info';
    infoBtn.href = event.link;
    infoBtn.target = '_blank';
    infoBtn.rel = 'noopener noreferrer';
    infoBtn.setAttribute('aria-label', `More information about ${event.name} (opens in new tab)`);
    btns.appendChild(infoBtn);
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
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  
  // Show loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'events-loading';
  loadingDiv.innerHTML = '<div class="loading-spinner"></div><p>Loading events...</p>';
  grid.innerHTML = '';
  grid.appendChild(loadingDiv);
  
  try {
    const now = new Date();
    const events = (await Promise.all(EVENT_FILES.map(fetchEvent))).filter(e => e && e.date);
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    const upcoming = events.filter(e => new Date(e.date) >= now);
    const past = events.filter(e => new Date(e.date) < now);

    // Clear loading state
    grid.innerHTML = '';
    
    // Upcoming first
    upcoming.forEach((e, i) => {
      const card = createEventCard(e, false);
      if (i === 0) card.classList.add('next-event');
      grid.appendChild(card);
    });
    // Past events greyed out
    past.forEach(e => grid.appendChild(createEventCard(e, true)));
    
    if (events.length === 0) {
      const emptyDiv = document.createElement('p');
      emptyDiv.className = 'events-empty';
      emptyDiv.textContent = 'No events found.';
      grid.appendChild(emptyDiv);
    }
  } catch (error) {
    const errorDiv = document.createElement('p');
    errorDiv.className = 'events-error';
    errorDiv.textContent = 'Error loading events. Please try again later.';
    grid.innerHTML = '';
    grid.appendChild(errorDiv);
    console.error('Error loading events:', error);
  }
}
