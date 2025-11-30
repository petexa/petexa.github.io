# 🍻 Iron & Ale

> **"Sets and Reps. Cheers and Beers. That's the Program."**

A fitness community website built with a Tailwind-inspired technical theme. Clean, modular, and developer-focused with utility-first styling.

---


## 📚 Documentation & Guides

All documentation is now stored in the [`readme/`](./readme/) folder for better organization.
**See below for guides:**

| Guide | Description |
|-------|-------------|
| [Events n8n Workflow](readme/events.md) | How to add events via n8n automation with optional AI descriptions |
| [PB Matrix Setup](readme/PB-MATRIX-SETUP.md) | Setting up the Personal Bests leaderboard with Google Apps Script |
| [n8n Event Workflow](readme/N8N-EVENT-WORKFLOW.md) | n8n event workflow details |


---


## 📄 Additional Documentation

- [Accessibility & Design Audit Report](readme/ACCESSIBILITY_DESIGN_AUDIT.md)
- [Asset Cleanup Summary](readme/ASSET_CLEANUP_SUMMARY.md)
- [Complete System Audit Report](readme/AUDIT_REPORT.md)
- [Changelog](readme/CHANGELOG.md)
- [Contributing Guide](readme/CONTRIBUTING.md)
- [Workout Data Cleaning Script](readme/WORKOUT_DATA_CLEANING.md)
- [Workout Data Validation Report](readme/WORKOUT_DATA_VALIDATION_REPORT.md)
- [Personal Bests Matrix Setup (legacy)](readme/PB_MATRIX_SETUP_LEGACY.md)
- [Events & n8n Workflow Guide (legacy)](readme/EVENTS_N8N_WORKFLOW_LEGACY.md)
- [Archived CSS Files](readme/ARCHIVED_CSS_FILES.md)

For more, see individual docs in the [`readme/`](./readme/) folder.

---

## 📁 Folder Structure

```
petexa.github.io/
├── index.html                 # Home / Dashboard
├── about/
│   └── index.html            # About page
├── utilities/
│   ├── index.html            # Utilities index (list of all tools)
│   ├── plate-calculator/     # Plate Calculator tool
│   ├── one-rep-max/          # One Rep Max Calculator
│   ├── crossfit-timer/       # CrossFit Timer (EMOM, Tabata, etc.)
│   ├── workout-tracker/      # Workout Tracker
│   ├── progress-chart/       # Progress Chart visualization
│   └── community-tools/      # Community resources
├── projects/
│   ├── handstand-plan.html   # 12-Month Handstand Walk Plan page
│   └── handstand-plan-sessions.json  # Workout data for Handstand Plan
├── style-guide/
│   └── index.html            # Typography, buttons, cards documentation
├── events.html               # Events calendar
├── projects.html             # Community projects
├── assets/
│   ├── css/
│   │   ├── tailwind.css     # Tailwind-style utility CSS framework
│   │   └── style.css        # Legacy styles (preserved for existing pages)
│   ├── js/
│   │   ├── app.js           # Main application JavaScript
│   │   └── main.js          # Legacy scripts
│   └── images/              # Image assets
│       ├── plate-calculator/
│       ├── workout-tracker/
│       └── crossfit-timer/
└── README.md
```

---

## 🎨 Styling Guidelines

### Utility-First CSS

The site uses a custom Tailwind-inspired utility CSS framework (`assets/css/tailwind.css`). Key principles:

- **Atomic classes** for spacing, typography, colors, and layout
- **CSS custom properties** (variables) for consistent theming
- **Mobile-first responsive design**
- **High contrast** for accessibility

### Color Palette

| Color | Variable | Usage |
|-------|----------|-------|
| Primary (Blue) | `--color-primary-*` | Buttons, links, accents |
| Secondary (Amber) | `--color-secondary-*` | Highlights, warnings |
| Success (Green) | `--color-success-*` | Success states |
| Danger (Red) | `--color-danger-*` | Errors, destructive actions |
| Gray | `--color-gray-*` | Text, backgrounds, borders |

### Typography

- **Sans-serif**: System font stack for body text
- **Monospace**: For code and technical content
- **Heading hierarchy**: H1–H4 with clear visual distinction

### Components

See `/style-guide/` for live examples of:
- Buttons (primary, secondary, success, danger, outline)
- Cards (basic, hover, with header/footer)
- Forms (inputs, selects, textareas)
- Alerts (info, success, warning, danger)
- Badges

---

## 🛠️ Adding New Utilities

1. **Create a new folder** under `/utilities/<tool-name>/`

2. **Create `index.html`** with the standard layout:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Tool Name | Iron & Ale</title>
     <meta name="description" content="Description of the tool">
     <link rel="stylesheet" href="../../assets/css/tailwind.css">
   </head>
   <body class="bg-gray-50">
     <!-- Use standard sidebar + main-content layout -->
   </body>
   </html>
   ```

3. **Add to utilities index** (`/utilities/index.html`):
   ```html
   <a href="new-tool/" class="tool-card">
     <div class="tool-card-icon" aria-hidden="true">🔧</div>
     <h3 class="tool-card-title">New Tool</h3>
     <p class="tool-card-desc">Brief description.</p>
   </a>
   ```

4. **Store images** in `assets/images/<tool-name>/` with:
   - Descriptive kebab-case filenames
   - Meaningful alt text
   - WebP format preferred
   - Lazy loading (`loading="lazy"`)

---

## 🖼️ Image Handling

### Guidelines

- **Sources**: Use royalty-free images from Unsplash, Pexels, or Pixabay
- **Storage**: `assets/images/<tool-name>/` with descriptive filenames
- **Alt text**: Always include meaningful descriptions
- **Optimization**: Compress images, use WebP/AVIF when possible
- **Lazy loading**: Add `loading="lazy"` for offscreen images
- **Fallbacks**: Images have error handling to show placeholder text

### Example

```html
<img 
  src="assets/images/plate-calculator/barbell-plates.webp"
  alt="Olympic weight plates arranged on a barbell"
  loading="lazy"
  class="img-responsive rounded-lg"
>
<figcaption class="text-sm text-gray-500 mt-2">
  Source: Unsplash | License: Free to use
</figcaption>
```

---

## ♿ Accessibility

The site follows WCAG guidelines:

- **Skip-to-content links** on every page
- **Semantic HTML** (`<main>`, `<nav>`, `<article>`, etc.)
- **ARIA attributes** where needed
- **Visible keyboard focus** (`:focus-visible` styles)
- **High contrast** text and UI elements
- **Responsive design** that works with zoom

### Testing

- Test with keyboard navigation
- Run Lighthouse accessibility audit
- Check color contrast (minimum 4.5:1)

---

## 🚀 Development

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/petexa/petexa.github.io.git
   cd petexa.github.io
   ```

2. Open `index.html` in a browser or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```

### No Build Required

This is a static site with no build step required. Just edit HTML, CSS, and JavaScript files directly.

### GitHub Actions Workflows

#### Running clean_workouts.py Manually

The `run-clean_workouts` workflow can be triggered manually via GitHub's `workflow_dispatch` feature:

1. Go to the **Actions** tab in the repository
2. Select **"Run clean_workouts"** from the workflow list on the left
3. Click the **"Run workflow"** button (dropdown on the right side)
4. Optionally enter arguments in the `args` input field (e.g., `--dry-run --verbose`)
5. Click the green **"Run workflow"** button to start

**Available Arguments:**
- `--dry-run` - Run without saving output files
- `--verbose` or `-v` - Enable verbose logging
- `--input <path>` - Specify input CSV file path
- `--out <path>` - Specify output file path
- `--help` - Show all available options

### CSS Modifications

To modify the Tailwind-style utilities:

1. Edit `assets/css/tailwind.css`
2. Add new utility classes following the existing patterns
3. Use CSS custom properties for consistent theming

---

## 📋 Technical Requirements

- **No heavy frameworks**: Pure HTML, CSS, and vanilla JavaScript
- **Progressive enhancement**: Site works without JavaScript
- **Minimal dependencies**: Only external dependency is Chart.js for progress charts
- **Mobile-first**: Responsive from 320px and up

---

## 🔗 Links

- **Live Site**: [petexa.github.io](https://petexa.github.io)
- **Style Guide**: [/style-guide/](https://petexa.github.io/style-guide/)
- **Admin Panel**: [/admin.html](https://petexa.github.io/admin.html)
- **Events**: [/events.html](https://petexa.github.io/events.html)
- **PB Matrix**: [/pb-matrix.html](https://petexa.github.io/pb-matrix.html)
- **Handstand Plan**: [/projects/handstand-plan.html](https://petexa.github.io/projects/handstand-plan.html)

---

**Made with 💪 by the Iron & Ale Crew**
