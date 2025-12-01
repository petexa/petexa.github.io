[![The 2026 Strength & Skill Framework](https://img.shields.io/badge/Strength%20%26%20Skill-Framework%202026-3B82F6?style=for-the-badge)](https://gym.petefox.co.uk/projects/handstand-plan.html)
![300 Micro-Sessions](https://img.shields.io/badge/300-Micro--Sessions-informational?style=flat-square&color=10B981)

# 🍻 Iron & Ale

> **"Sets and Reps. Cheers and Beers. That's the Program."**

A fitness community website built with a Tailwind-inspired technical theme. Clean, modular, and developer-focused with utility-first styling.

---

## 📚 Documentation

All documentation lives in the [`docs/`](./docs/) folder. Below is a quick reference with summaries.

### Getting Started

| Document | Summary |
|----------|---------|
| [Developer Onboarding](docs/developer-onboarding.md) | Quick setup guide for local development and making changes |
| [Repository Structure](docs/repo-structure.md) | Overview of folders, files, and how the site is organized |
| [Contributing Guide](docs/CONTRIBUTING.md) | How to contribute to the project |

### Workflows & Automation

| Document | Summary |
|----------|---------|
| [Events n8n Workflow](docs/workflows/events-n8n.md) | How to add events via n8n automation with optional AI descriptions |
| [PB Matrix Setup](docs/workflows/PB-MATRIX-SETUP.md) | Setting up the Personal Bests leaderboard with Google Apps Script |
| [Workout Data Pipeline](docs/pipeline.md) | Full pipeline for transforming CSV workout data to production JSON |
| [Enrichment Agent](docs/workflows/enrichment-agent.md) | AI-assisted workout metadata enrichment |
| [Workout Data Cleaning](docs/workflows/WORKOUT_DATA_CLEANING.md) | Running the clean_workouts.py script |
| [Strength & Skill Progress Logger](docs/workflows/strength-skill-progress-n8n.md) | n8n workflow for logging progress to GitHub |
| [YouTube Workout Agent](docs/workout-youtube-agent.md) | n8n agent for finding YouTube workout videos |

### Feature Documentation

| Document | Summary |
|----------|---------|
| [CrossFit Timer](docs/features/crossfit-timer.md) | In-browser timers for EMOM, AMRAP, Tabata formats |
| [Plate Calculator](docs/features/plate-calculator.md) | Calculate barbell plates needed for target weight |
| [Events System](docs/features/events-system.md) | How the events calendar and homepage teaser work |
| [WOD System](docs/features/wod-system.md) | Workout of the Day rotation and display |
| [Workout Tracker](docs/features/workout-tracker.md) | Athlete workout submission and logging |
| [Progress Charts](docs/features/progress-charts.md) | Chart.js visualizations for performance trends |
| [2026 Dashboard](docs/features/dashboard-2026.md) | Strength & Skill 2026 progress dashboard |

### Reference

| Document | Summary |
|----------|---------|
| [Repository Overview](docs/repo_overview.md) | Comprehensive technical documentation for the entire repo |
| [Cleanup Suggestions](docs/cleanup-suggestions.md) | Non-breaking recommendations for repo maintenance |
| [Changelog](docs/CHANGELOG.md) | Notable changes and version history |

### Legacy Documentation

Older documents preserved for reference are in [`docs/legacy/`](./docs/legacy/).

---

## 📁 Folder Structure

```
petexa.github.io/
├── index.html                 # Home / Dashboard
├── about/                     # About page
├── utilities/                 # Fitness tools
│   ├── plate-calculator/      # Plate Calculator tool
│   ├── one-rep-max/           # One Rep Max Calculator
│   ├── crossfit-timer/        # CrossFit Timer (EMOM, Tabata, etc.)
│   ├── workout-tracker/       # Workout Tracker
│   ├── progress-chart/        # Progress Chart visualization
│   └── community-tools/       # Community resources
├── projects/                  # Community projects
├── workouts/                  # Workout browser
├── events.html                # Events calendar
├── admin.html                 # Admin panel
├── pb-matrix.html             # Personal Bests leaderboard
├── assets/
│   ├── css/                   # Tailwind-style CSS framework
│   └── js/                    # Core JavaScript modules
├── data/                      # JSON/CSV data files
│   ├── production/            # Production data (events, workouts)
│   └── reports/               # Pipeline outputs
├── scripts/                   # Python data processing pipeline
├── docs/                      # All documentation
└── style-guide/               # UI component examples
```

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/petexa/petexa.github.io.git
cd petexa.github.io

# Start a local server
python -m http.server 8000
# or
npx http-server .
```

Visit `http://localhost:8000` to view the site.

**No build step required** — this is a static site. Edit HTML, CSS, and JS files directly.

---

## 🔗 Links

- **Live Site**: [gym.petefox.co.uk](https://gym.petefox.co.uk)
- **Style Guide**: [/style-guide/](https://gym.petefox.co.uk/style-guide/)
- **Workouts**: [/workouts/](https://gym.petefox.co.uk/workouts/)
- **Events**: [/events.html](https://gym.petefox.co.uk/events.html)
- **Handstand Plan**: [/projects/handstand-plan.html](https://gym.petefox.co.uk/projects/handstand-plan.html)
- **PB Matrix**: [/pb-matrix.html](https://gym.petefox.co.uk/pb-matrix.html)

---

**Made with 💪 by the Iron & Ale Crew**
