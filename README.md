# IDFit Events & WODs Database

A comprehensive fitness website featuring an events calendar and a searchable workout (WODs) database. The site displays upcoming fitness events with countdown timers and provides access to hundreds of CrossFit-style workouts with detailed information.

**Tagline**: *Sets and reps. Cheers and beers. That's the program*

## 🌟 Features

### Events Calendar
- **Dynamic Event Loading**: Events loaded from individual JSON files for easy management
- **Event Countdown**: Real-time countdown timers for upcoming events
- **Calendar Integration**: Download .ics files to add events to your calendar
- **Past Events Archive**: Browse previously completed events
- **Event Highlighting**: Next upcoming event highlighted with special border

### WODs Database
- **500+ Workouts**: Comprehensive database of CrossFit-style workouts
- **Multiple Views**: Card view, table view, and advanced search interface
- **Detailed Information**: Coach notes, descriptions, scaling options, equipment needed
- **Random Workouts**: Get 6 random workouts in card view, refresh for more
- **Advanced Search**: Filter by workout type, duration, equipment, movements, and more
- **Sortable Table**: Sort by name, type, duration, or rounds
- **Equipment Tracking**: See required equipment for each workout
- **Movement Library**: Browse all movements used across workouts

### Technical Features
- **Fixed Compact Header**: Minimal header with torn page effect stays at top
- **Responsive Design**: Mobile-friendly layout for all devices
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Security**: All external links use `rel="noopener noreferrer"`
- **Robust Error Handling**: Gracefully handles loading failures

## 📁 Project Structure

```
petexa.github.io/
├── index.html              # Main events calendar page
├── past-events.html        # Archive of past events
├── wods.html              # Random WODs card view
├── wods-table.html        # Sortable WODs table view
├── timers.html            # Workout timers page
├── 24hr-workout.html      # Special 24-hour workout event
├── assets/                # Static assets
│   ├── css/
│   │   ├── styles.css     # Main stylesheet
│   │   ├── wods.css       # WODs-specific styles
│   │   └── past-events.css
│   └── js/
│       ├── main.js        # Events page logic
│       ├── wods.js        # WODs database logic
│       ├── timers.js      # Timer functionality
│       ├── navigation.js  # Site navigation
│       ├── footer.js      # Footer component
│       └── utils.js       # Shared utilities
├── events/                # Event data
│   ├── events-list.json   # Master event list
│   ├── *.json             # Individual event files
│   └── README.md          # Events documentation
├── WOD/                   # Workout database
│   ├── data/
│   │   ├── workouts_table.csv      # Main workout data
│   │   ├── movement_library.csv    # Movement definitions
│   │   ├── equipment_library.csv   # Equipment catalog
│   │   └── *_map.csv              # Relationship tables
│   ├── dist/              # Generated web data
│   ├── scripts/
│   │   └── validate_and_build.py  # Data validation
│   ├── search.html        # Advanced workout search
│   └── README.md          # WODs documentation
├── scripts/               # Data management scripts
│   ├── clean_workouts.py  # Workout data cleaning with web search
│   └── README.md          # Scripts documentation
└── images/                # Image assets
```

## 🚀 Getting Started

### Viewing the Website

Visit the live site at: [https://gym.petefox.co.uk/](https://gym.petefox.co.uk/)

**Pages:**
- **Events Calendar**: `/index.html` - Upcoming fitness events
- **Past Events**: `/past-events.html` - Event archive
- **Random WODs**: `/wods.html` - 6 random workouts (refresh for more)
- **WODs Table**: `/wods-table.html` - Sortable workout database
- **Advanced Search**: `/WOD/search.html` - Filter and search workouts
- **Timers**: `/timers.html` - EMOM, Tabata, and AMRAP timers

### Local Development

To test locally with a simple HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000

# Then open http://localhost:8000 in your browser
```

### WODs Database Management

The workout database uses Python scripts for data cleaning and validation:

```bash
# Clean and enhance workout data (includes web search for missing info)
python3 scripts/clean_workouts.py --web-search

# Validate and build the database
python3 WOD/validate_and_fix.py

# View detailed documentation
cat WOD/README.md
cat scripts/README.md
```

### Adding a New Event

See [events/README.md](events/README.md) for detailed instructions on adding events.

### Adding or Editing Workouts

See [WOD/README.md](WOD/README.md) for comprehensive documentation on the workout database structure and management.

## 🏋️ WODs Database Details

### Database Structure

The workout database is built on a relational model with CSV files:

- **workouts_table.csv**: Main workout data (499 workouts)
- **movement_library.csv**: All movements/exercises used
- **equipment_library.csv**: Equipment catalog
- **workout_movement_map.csv**: Links workouts to movements
- **movement_equipment_map.csv**: Links movements to equipment

### Data Cleaning & Web Search

The `scripts/clean_workouts.py` script provides:
- Automated data cleaning (double parentheses, whitespace, etc.)
- Web search functionality to find missing workout details
- Intelligent prioritization (benchmark workouts first)
- 24-hour caching to avoid re-searching
- Processes up to 50 workouts per run

### Workout Information

Each workout includes:
- **Name**: Workout title (e.g., "Murph", "Fran")
- **Type**: Benchmark, Hero, Girls, For Time, AMRAP, EMOM, etc.
- **Description**: What the workout entails
- **Coach Notes**: Tips and guidance
- **Scaling Options**: Modifications for different skill levels
- **Equipment Needed**: Required gear
- **Movements**: Exercises included
- **Duration/Rounds**: Time or round specifications

## 🎨 Design

### Header Design

- **Compact Fixed Header**: 32px height (30px mobile) with minimal padding
- **Black Background**: `#202023`
- **Torn Page Effect**: SVG tear effect positioned directly below header
- **Typography**: 1.25rem header font (1.1rem mobile)

### Color Scheme

- **Primary Red**: `#d32f2f` - Buttons and accents
- **Success Green**: `#23bb57` - Next event highlight
- **Accent Blue**: `#80affe` - Secondary accents
- **Dark Background**: `#202023` - Header and footer
- **Light Background**: `#f8f9fa` - Page background

### Typography

- **Font Family**: Montserrat (Google Fonts)
- **Header**: 1.25rem, weight 600
- **Body**: 1rem, weight 400
- **Compact Design**: Minimal line-height for tight spacing

## 📅 Site Pages

### Events Calendar (index.html)
- Displays upcoming fitness and race events
- Real-time countdown timers
- Next event highlighted with green border
- Calendar download (.ics) for reminders
- Links to event booking pages

### Past Events Archive (past-events.html)
- Historical event archive
- Sorted by date (most recent first)
- "Event Completed" status indicators
- Links to event information

### Random WODs (wods.html)
- Shows 6 random workouts from the database
- Refresh page to see different workouts
- Card-based layout with full workout details
- Equipment and movement information

### WODs Table (wods-table.html)
- Complete workout database in sortable table format
- Click column headers to sort
- View all 499+ workouts at once
- Quick scanning and comparison

### Advanced Search (WOD/search.html)
- Filter by workout type (Benchmark, Hero, Girls, etc.)
- Filter by duration or rounds
- Search by equipment needed
- Search by movement/exercise
- Text search across all fields

### Timers (timers.html)
- EMOM (Every Minute On the Minute) timer
- Tabata timer (20s work / 10s rest)
- AMRAP (As Many Rounds As Possible) timer
- Customizable intervals

## 🛠️ Technical Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS custom properties, flexbox, grid
- **JavaScript (ES6+)**: Modular code with dynamic content loading
- **Font Awesome 6**: Icon library
- **Google Fonts**: Montserrat typography

### Backend/Data
- **Python 3**: Data processing and validation scripts
- **Pandas**: CSV data manipulation
- **Requests**: Web scraping for missing workout data
- **JSON/CSV**: Data storage formats

### Deployment
- **GitHub Pages**: Static site hosting
- **Git**: Version control
- **No build tools required**: Pure static site for simplicity

### Key Technologies
- `Promise.allSettled()` for fault-tolerant data loading
- Blob API for calendar file generation
- LocalStorage for timer preferences
- CSS Grid and Flexbox for responsive layouts
- Intersection Observer for performance optimization

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**: Meets accessibility standards
- **Keyboard Navigation**: Full site accessible via keyboard
- **Screen Reader Support**: ARIA labels and live regions
- **Skip Links**: Jump to main content
- **Focus Indicators**: Clear visual focus states
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Color Contrast**: AAA compliant text contrast ratios
- **Alt Text**: Descriptive alternative text for images

## 🤝 Contributing

### Adding Events
1. Create event JSON file in `events/` directory
2. Add to `events/events-list.json`
3. Commit and push changes

### Managing Workouts
1. Edit CSV files in `WOD/data/`
2. Run validation: `python3 WOD/validate_and_fix.py`
3. Clean data: `python3 scripts/clean_workouts.py --web-search`
4. Review validation report and commit changes

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Test changes locally
4. Submit a pull request

## 📝 Documentation

- **[Events README](events/README.md)**: Event management guide
- **[WOD README](WOD/README.md)**: Workout database documentation
- **[Scripts README](scripts/README.md)**: Data cleaning script guide
- **[Data Dictionary](WOD/data_dictionary.md)**: Database schema reference

## 📄 License

This project is maintained by IDFit / Pete Fox.

## 📞 Contact

- **Email**: [gym@petefox.co.uk](mailto:gym@petefox.co.uk)
- **Website**: [https://gym.petefox.co.uk/](https://gym.petefox.co.uk/)

---

**Last Updated**: November 2025

*Built with ❤️ for the fitness community*
