# IDFit Events Website

A dynamic events calendar website for fitness and race events. This site displays upcoming events with countdown timers, allows users to book events, and provides calendar reminders.

## 🌟 Features

- **Dynamic Event Loading**: Events are loaded from individual JSON files for easy management
- **Event Countdown**: Real-time countdown timers for upcoming events
- **Calendar Integration**: Download .ics files to add events to your calendar
- **Responsive Design**: Mobile-friendly layout that works on all devices
- **Past Events Archive**: Browse through previously completed events
- **Event Highlighting**: Next upcoming event is highlighted with a special border
- **Past Event Styling**: Completed events are automatically grayed out

## 📁 Project Structure

```
petexa.github.io/
├── index.html              # Main page showing upcoming events
├── past-events.html        # Archive page for past events
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

### Styling

All styles are contained within the `<style>` tags in `index.html` and `past-events.html`. Key style variables:

- **Primary Background**: `#000080` (Navy Blue)
- **Header Background**: `#001284` (Dark Blue)
- **Highlight Color**: `#23bb57` (Green) - for next event
- **Button Colors**: Various blues and oranges

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

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox
- **JavaScript (ES6+)**: Dynamic content loading and updates
- **Font Awesome 6**: Icons
- **Google Fonts**: Roboto font family

### Browser Compatibility

The site works on all modern browsers including:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance

- Events loaded asynchronously with `Promise.all()`
- Images lazy-loaded with `loading="lazy"`
- Countdown updates optimized with single interval
- No external dependencies beyond CDN resources

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

Have an event to add? [Contact us](images/callme.gif)

Follow us on social media:
- Facebook
- Instagram
- X (Twitter)

---

**Last Updated**: 2025

*Built with ❤️ for the fitness community*
