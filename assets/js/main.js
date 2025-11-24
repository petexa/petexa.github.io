// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.neon-nav ul');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
      const isExpanded = navMenu.classList.contains('show');
      navMenu.classList.toggle('show');
      menuToggle.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.neon-nav')) {
        navMenu.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close menu when pressing Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });
  }
});
