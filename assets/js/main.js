// Neon mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});
// Highlight current page
const currentPath = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.setAttribute('aria-current', 'page');
  }
});
// Render events (for events.html and past.html)
async function renderEvents() {
  const isPast = document.body.classList.contains('past');
  const container = document.getElementById(isPast ? 'past-events-list' : 'events-list');
  if (!container) return;
  let res = await fetch('events/events.json');
  let events = await res.json();
  const now = new Date();
  events = events.filter(ev => {
    const evDate = new Date(ev.date);
    return isPast ? evDate < now : evDate >= now;
  });
  container.innerHTML = events.map(ev => `
    <article class="event-card${isPast ? ' past' : ''}">
      <img src="${ev.image}" class="event-img" alt="${ev.name}" loading="lazy" />
      <div class="event-content">
        <h2 class="event-title">${ev.name}</h2>
        <time class="event-date" datetime="${ev.date}">${new Date(ev.date).toLocaleString()}</time>
        <div class="event-desc">${ev.description}</div>
        <div class="event-location">${ev.location || ''}</div>
        <div class="card-actions">
          ${ev.showMoreInfo ? `<a href="${ev.link}" class="neon-button">More Info</a>` : ''}
          ${ev.showBookNow ? `<a href="${ev.bookUrl || '#'}" class="neon-button">Book Now</a>` : ''}
          ${ev.showRemindMe ? `<a href="#" class="neon-button">Remind Me</a>` : ''}
        </div>
      </div>
    </article>
  `).join('');
}
if (document.getElementById('events-list') || document.getElementById('past-events-list')) {
  renderEvents();
}
