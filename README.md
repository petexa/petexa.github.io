# IDFit Events Website

A dynamic events calendar website for fitness and race events. This site displays upcoming events with countdown timers, allows users to book events, and provides calendar reminders.

**Tagline**: *Miles, Mud, Muscle & A Pint*

## 🌟 Features

- **Fixed Header Design**: Static header with torn page effect stays at the top while content scrolls
- **Dynamic Event Loading**: Events are loaded from individual JSON files for easy management with robust error handling
- **Event Countdown**: Real-time countdown timers for upcoming events (updates every minute)
- **Calendar Integration**: Download .ics files with sanitized filenames to add events to your calendar
- **Responsive Design**: Mobile-friendly layout that works on all devices
- **Accessibility**: Skip-to-content link, keyboard navigation, ARIA labels, and screen reader support
- **Past Events Archive**: Browse through previously completed events
- **Event Highlighting**: Next upcoming event is highlighted with a special border
- **Robust Error Handling**: Gracefully handles partial event loading failures
- **Security**: All external links use `rel="noopener noreferrer"` for security

## 📁 Project Structure

```
petexa.github.io/
├── index.html              # Main page showing upcoming events
├── past-events.html        # Archive page for past events
├── assets/                 # Static assets
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   └── js/
│       ├── utils.js        # Utility functions (slugify, ICS generation, etc.)
│       └── main.js         # Main application logic
├── events/                 # Event data directory
│   ├── events-list.json    # List of all event JSON files
│   ├── *.json              # Individual event data files
│   └── README.md           # Guide for adding new events
├── images/                 # Image assets
└── README.md               # This file
```

## 🚀 Getting Started

### Viewing the Website

Simply open `index.html` in a web browser, or visit the live site at: [https://petexa.github.io/](https://petexa.github.io/)

### Local Development and Testing

To test locally with a simple HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000

# Then open http://localhost:8000 in your browser
```

Or use any other static file server like `live-server`, `http-server`, or VS Code's Live Server extension.

### Testing Event Loading

To test the robust error handling:
1. Temporarily rename one of the event JSON files (e.g., add `.disabled` extension)
2. Refresh the page
3. You should see a toast message: "Some events failed to load; showing available events."
4. The other events should still display correctly

### Testing Calendar Downloads

1. Click the "Remind Me" button on any event card
2. A `.ics` file should download with a sanitized filename (e.g., `24-hour-work-out.ics`)
3. Import the file into your calendar app (Google Calendar, Outlook, Apple Calendar, etc.)
4. Verify the event details are correct

### Adding a New Event

1. **Create a new JSON file** in the `events/` directory (e.g., `my-event.json`)

2. **Use this template** for your event data:

```json
{
  "name": "Event Name",
  "date": "2026-12-31T10:00:00",
  "link": "https://event-website.com",
  "image": "https://example.com/image.jpg",
  "description": "Brief description of the event",
  "calendarDetails": {
    "location": "Event Location",
    "description": "Detailed description for calendar",
    "durationHours": 4
  },
  "showMoreInfo": true,
  "showBookNow": false,
  "showRemindMe": true
}
```

3. **Add your event file** to `events/events-list.json`:

```json
[
  "events/existing-event.json",
  "events/my-event.json"
]
```

4. **Refresh the page** - Your event will automatically appear!

For more detailed instructions, see the [events/README.md](events/README.md) file.

## 🎨 Customization

### Header Design

The site features a fixed header with a black background and torn page effect:

- **Header Background**: `#000` (Black)
- **Fixed Positioning**: Header stays at the top while content scrolls beneath it
- **Torn Page Effect**: Uses `images/scratch-black-top-04.svg` below the header for a paper tear visual
- **Tagline**: "Miles, Mud, Muscle & A Pint"

### Styling

All styles are now in `assets/css/styles.css` for easy maintenance. Key style variables:

- **Primary Background**: `#000080` (Navy Blue)
- **Header Background**: `#000` (Black)
- **Highlight Color**: `#23bb57` (Green) - for next event
- **Button Colors**: Various blues and oranges
- **Font**: Montserrat (loaded from Google Fonts)

### Event Display Options

Each event can be customized with these boolean flags:

- `showMoreInfo`: Display "More Info" button (default: true)
- `showBookNow`: Display "Book Now" button (default: false)
- `showRemindMe`: Display calendar download button (default: true)

## 📅 Event Management

### Event States

Events automatically display in different states:

1. **Upcoming Events**: Normal display with countdown timer
2. **Next Event**: Highlighted with green border (closest future event)
3. **Past Events**: Grayed out and filtered on the main page
4. **Past Events Archive**: Available on the separate past-events.html page

### Automatic Features

- Events are automatically sorted by date
- Countdown timers update every second
- Past events are automatically detected
- The next upcoming event is automatically highlighted

## 🛠️ Technical Details

### Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with flexbox and focus-visible support
- **JavaScript (ES6+)**: Modular code with dynamic content loading
- **Font Awesome 6**: Icons
- **Google Fonts**: Roboto font family

### Browser Compatibility

The site works on all modern browsers including:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance & Robustness

- Events loaded asynchronously with `Promise.allSettled()` for fault tolerance
- Images lazy-loaded with `loading="lazy"`
- Countdown updates optimized to run once per minute (not every second)
- Stable event IDs generated from event name and date
- Safe DOM manipulation using `textContent` to prevent XSS
- ICS files generated using Blob API for reliable downloads
- No build tools or dependencies required - pure static site

### Accessibility Features

- **Skip-to-content link**: First focusable element for keyboard users
- **ARIA labels**: Descriptive labels for screen readers
- **Focus-visible**: Clear focus indicators for keyboard navigation
- **Semantic HTML**: Proper use of header, main, footer, section elements
- **Live regions**: Toast notifications announced by screen readers
- **Color contrast**: WCAG compliant button and text colors

## 📱 Pages

### Main Page (index.html)

- Displays all upcoming and recent events
- Shows countdown timers for future events
- Highlights the next upcoming event
- Past events are grayed out but visible
- Link to Past Events archive in footer

### Past Events (past-events.html)

- Archive of all completed events
- Events sorted by date (most recent first)
- Shows "Event Completed" status
- "More Info" button to learn about past events
- Link back to main page

## 🤝 Contributing

To contribute to this project:

1. Add or modify event JSON files in the `events/` directory
2. Update `events/events-list.json` to include new events
3. Test changes locally by opening `index.html` in a browser
4. Commit changes to the repository

## 📄 License

This project is maintained by the IDFit Events team.

## 📞 Contact

Have an event to add? [Contact us](mailto:gym@petefox.co.uk)

Follow us on social media:
- Facebook
- Instagram
- X (Twitter)

---

**Last Updated**: 2025

*Built with ❤️ for the fitness community*
