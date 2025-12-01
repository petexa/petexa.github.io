
This folder is for archiving CSS files that are no longer part of the main theme system.

## Deleted Files
- `style.css` - Legacy neon styling, deleted as part of theme cleanup. The `utilities.html` page now redirects to `/utilities/` which uses the new theme system.

## Current CSS Structure
See `assets/css/` for the new modular CSS system:
- `variables.css` - Theme tokens (light/dark)
- `theme.css` - Base styles and resets
- `utilities.css` - Utility classes
- `components.css` - Component styles
- `tailwind.css` - Main entry point (imports all modules)
