# Bootcamp Events - Fitness Website

A comprehensive fitness website featuring workout timers, one rep max calculator, and an events calendar. Built for fitness enthusiasts who believe in "Sets and reps. Cheers and beers."

**Live Site**: [https://petexa.github.io/](https://petexa.github.io/)

## 🌟 Features

### 🏋️ Workout Timers
- **AMRAP Timer** - As Many Rounds As Possible
- **EMOM Timer** - Every Minute On the Minute
- **TABATA Timer** - 20s work / 10s rest intervals
- **Fullscreen Mode** - Distraction-free timer display
- **Sound Toggle** - Enable/disable countdown beeps
- **Customizable Intervals** - Adjust rounds, duration, and rest periods

### 📊 One Rep Max Calculator
- **Epley Formula** - Industry-standard calculation
- **Live Updates** - Instant calculation as you type
- **Training Percentages** - Auto-calculates 95%, 90%, 85%, 80%, 75%, 70%, 65%, 60%
- **Clean Interface** - Matches timer design aesthetic

### 📅 Events Calendar
- **Dynamic Event Loading** - Events from JSON files
- **Real-time Countdowns** - Days/hours/minutes to next event
- **Calendar Integration** - Download .ics files
- **Past Events Archive** - Browse completed events
- **Responsive Cards** - Mobile-friendly event display

### 🏃 WODs Database
- **500+ Workouts** - Comprehensive CrossFit-style workout library
- **13 Essential Fields** - Name, Category, Format, Instructions, Equipment, etc.
- **Multiple Views** - Cards, table, and advanced search
- **Smart Search** - Web-powered workout discovery
- **Data Management Scripts** - Python tools for database maintenance

## 📁 Project Structure

```
petexa.github.io/
├── index.html              # Main landing page with events
├── timers.html            # Workout timers + One Rep Max calculator
├── past-events.html       # Event archive
├── wods.html              # Random WODs card view
├── wods-table.html        # Sortable WODs table
├── 24hr-workout.html      # Special 24hr event page
├── assets/
│   ├── css/
│   │   ├── styles.css           # Main stylesheet (Poppins font)
│   │   ├── wods.css             # WOD-specific styles
│   │   └── past-events.css      # Event archive styles
│   └── js/
│       ├── main.js              # Events calendar logic
│       ├── timers.js            # Timer + ORM functionality
│       ├── wods.js              # WOD database logic
│       ├── navigation.js        # Site navigation
│       ├── footer.js            # Footer component
│       └── utils.js             # Shared utilities
├── events/
│   ├── events-list.json         # Master event list
│   ├── *.json                   # Individual event files
│   └── README.md                # Events documentation
├── WOD/
│   ├── data/
│   │   ├── workouts_table.csv   # Main workout data (13 columns)
│   │   ├── workouts_table.backup.csv  # Original 42-column backup
│   │   ├── workouts_table_42col.csv   # 42-column version
│   │   ├── movement_library.csv       # Movement definitions
│   │   ├── equipment_library.csv      # Equipment catalog
│   │   └── *_map.csv                  # Relationship tables
│   ├── validate_and_build.py    # Data validation script
│   ├── validate_and_fix.py      # Data repair script
│   ├── clean_and_enhance.py     # Data enhancement
│   └── README.md                # WOD documentation
├── scripts/
│   ├── add_workout.py           # Add new workouts (interactive/batch/web search)
│   ├── update_workout.py        # Modify existing workouts
│   ├── remove_defaults.py       # Clean placeholder data
│   ├── simplify_workouts.py     # Database restructuring (completed)
│   ├── clean_workouts.py        # Legacy cleaning script
│   └── README.md                # Scripts documentation
├── images/                      # Image assets
├── docs/                        # Documentation files
│   ├── ACCESSIBILITY_DESIGN_AUDIT.md
│   ├── AUDIT_REPORT.md
│   ├── CHANGELOG.md
│   ├── CONTRIBUTING.md
│   └── *.md                     # Other documentation
└── .github/                     # GitHub Actions and config

```

## 🚀 Quick Start

### View Live Site
Visit: [https://petexa.github.io/](https://petexa.github.io/)

**Key Pages:**
- **Home**: `/` - Events calendar
- **Timers**: `/timers.html` - Workout timers + One Rep Max calculator
- **WODs**: `/wods.html` - Random workouts
- **WODs Table**: `/wods-table.html` - Full workout database
- **Past Events**: `/past-events.html` - Event archive

### Local Development

```bash
# Clone the repository
git clone https://github.com/petexa/petexa.github.io.git
cd petexa.github.io

# Start a local server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000
```

### Database Management

```bash
# Install Python dependencies
pip install pandas requests

# Add a new workout (interactive mode)
python scripts/add_workout.py

# Add workouts from web search (auto-discover 10 known workouts)
python scripts/add_workout.py --search-add 10

# Update an existing workout
python scripts/update_workout.py --name "Fran" --field "Level" --value "Advanced"

# Remove default placeholder data
python scripts/remove_defaults.py

# View documentation
cat scripts/README.md
```

## 🎯 Workout Database

### Database Structure (13 Columns)
1. **WorkoutID** - Auto-generated unique identifier
2. **Name** - Workout name (e.g., "Fran", "Murph")
3. **Category** - General, Benchmark, Hero WOD, etc.
4. **Format & Duration** - AMRAP 10, For Time, EMOM 16, etc.
5. **Instructions** - Full workout description
6. **Equipment Needed** - Barbell, Pull-up Bar, etc.
7. **Muscle Groups** - Full Body, Upper Body, etc.
8. **Training Goals** - Strength, Endurance, etc.
9. **Level** - Beginner, Intermediate, Advanced
10. **Scaling Options** - Modification suggestions
11. **Score Type** - Time, Reps, Rounds, etc.
12. **Coach Notes** - Tips and guidance
13. **Flavor-Text** - Marketing description

### Current Database Stats
- **511 workouts** in database
- **200+ known workout names** searchable
- **13 essential fields** (simplified from 42)
- **Web search integration** for auto-discovery

### Management Scripts

**add_workout.py** - Add new workouts
- Interactive mode with web auto-fill
- Batch mode (add multiple at once)
- Auto web search for 200+ known workouts
- Random value suggestions
- Complete duplicate prevention

**update_workout.py** - Modify existing workouts
- Find by name or WorkoutID
- Update any field
- View full workout details
- Before/after comparison

**remove_defaults.py** - Clean placeholder data
- Identifies generic defaults
- Optional web search for replacements
- Smart caching (24-hour)
- Statistics reporting

## 🎨 Design

### Typography
- **Font**: Poppins (300, 400, 500, 600, 700 weights)
- Matches Nuclear Fit website aesthetic
- Clean, modern sans-serif

### Color Scheme
- **Primary Green**: `#4CAF50` - Timer controls, accents
- **Success**: `#23bb57` - Event highlights
- **Warning**: `#ff3b3b` - Timer warnings
- **Background**: `#ffffff` - Clean white
- **Secondary**: `#f5f5f5` - Light gray panels

### Timer Design (CrossHero Style)
- Large, centered time display (6rem font)
- Minimal controls - circular buttons
- Clean white aesthetic
- Responsive grid inputs
- Fullscreen support

## 🛠️ Technical Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling, Grid, Flexbox
- **Vanilla JavaScript (ES6+)** - No frameworks
- **Font Awesome 6** - Icons
- **Google Fonts** - Poppins typography

### Backend/Data
- **Python 3.7+** - Data management
- **Pandas** - CSV manipulation
- **Requests** - Web scraping
- **JSON/CSV** - Data storage

### Deployment
- **GitHub Pages** - Static hosting
- **Git** - Version control
- **No build process** - Pure static site

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - ARIA labels
- **Skip Links** - Jump to content
- **Focus Indicators** - Clear visual focus
- **Semantic HTML** - Proper structure
- **Color Contrast** - High contrast ratios

## 📖 Documentation

- **[Events Guide](events/README.md)** - Event management
- **[WOD Guide](WOD/README.md)** - Workout database
- **[Scripts Guide](scripts/README.md)** - Database tools (1000+ lines, comprehensive)
- **[Data Dictionary](WOD/data_dictionary.md)** - Schema reference
- **[Changelog](docs/CHANGELOG.md)** - Version history

## 🤝 Contributing

### Adding Events
1. Create JSON in `events/` directory
2. Add to `events-list.json`
3. Commit and push

### Adding Workouts
```bash
# Interactive mode
python scripts/add_workout.py

# Command-line mode
python scripts/add_workout.py --name "Helen" --instructions "..." --category "Benchmark"
```

### Code Contributions
1. Fork repository
2. Create feature branch
3. Test locally
4. Submit pull request

## 📝 Recent Updates

### Latest Features (Nov 2025)
✅ Tabata timer added
✅ One Rep Max calculator with training percentages
✅ Fullscreen mode for timers
✅ Sound toggle controls
✅ Font updated to Poppins (Nuclear Fit style)
✅ CrossHero-style timer redesign
✅ 200+ workout auto-discovery
✅ Comprehensive scripts documentation

### Database Evolution
✅ Simplified from 42 to 13 columns
✅ 511 workouts (from 499)
✅ Web search integration
✅ Smart default removal
✅ Multi-source checking (CrossFit.com, WODwell, Google)

## 📞 Contact

- **Email**: [gym@petefox.co.uk](mailto:gym@petefox.co.uk)
- **Website**: [https://petexa.github.io/](https://petexa.github.io/)

---

**Last Updated**: November 2025

*Sets and reps. Cheers and beers. That's the program.* 🏋️🍺

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
