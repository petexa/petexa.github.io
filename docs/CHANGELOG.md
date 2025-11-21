# Changelog

All notable changes to the Bootcamp Events website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (Phase 2 - In Progress)
- Comprehensive system audit report (AUDIT_REPORT.md)
- Code formatting configuration files (.prettierrc, .eslintrc.json, .stylelintrc.json)
- Python formatting configuration (WOD/pyproject.toml)
- Docker ignore file (WOD/.dockerignore)
- Python requirements with pinned versions (WOD/requirements.txt)
- Contributing guidelines (CONTRIBUTING.md)
- This changelog file

### Changed (Phase 2 - In Progress)
- Formatted all HTML, CSS, and JavaScript files with Prettier for consistency
- Formatted all Python files with Black and isort
- Standardized font family to Montserrat across all pages
- Standardized indentation to 2 spaces across frontend code
- Improved code consistency and readability

---

## [2.0.0] - 2025-01-XX (Previous Major Updates)

### Added
- WOD dataset validation and maintenance system
- Automated GitHub Actions workflow for WOD validation
- Comprehensive data cleaning with artifact removal
- Validation reports and change logs
- Data statistics tracking (JSON format)
- Movement library with 307+ movements
- Equipment catalog with 104+ items
- Relational database schema
- Docker containerization for WOD validator

### Changed
- Enhanced error handling in event loading (Promise.allSettled)
- Improved WOD data quality and normalization
- Updated validation rules for better data integrity

### Documentation
- Created comprehensive WOD system README
- Added data dictionary for WOD schema
- Added schema.sql for database structure
- Improved inline documentation

## [1.5.0] - 2024-12-XX

### Added
- Past events archive page
- Event creation modal (past-events.html)
- Workout timers page (AMRAP and EMOM)
- WODs database with search functionality
- WODs table view
- Global navigation dropdown component
- 24-hour workout schedule page

### Changed
- Fixed header design with torn page effect
- Improved countdown timer efficiency (updates per minute, not per second)
- Enhanced mobile responsiveness
- Better error handling for failed event loads

### Security
- Added rel="noopener noreferrer" to all external links
- Implemented XSS protection using textContent instead of innerHTML
- Secure ICS file generation with Blob API

## [1.0.0] - 2024-XX-XX

### Added
- Initial website launch
- Events calendar with countdown timers
- Calendar integration (.ics downloads)
- Event highlighting (next upcoming event)
- Responsive design
- Accessibility features (ARIA labels, skip links, keyboard navigation)
- Toast notifications for errors
- Dynamic event loading from JSON files
- Individual event JSON file structure
- Font Awesome 6 icons
- Google Fonts integration (Montserrat)

### Features
- Upcoming events display
- Event countdown timers
- "More Info" and "Book Now" buttons
- Calendar reminder downloads
- Mobile-friendly layout
- Semantic HTML5
- Modern CSS with flexbox
- Modular JavaScript (ES6+)

---

## Version History Notes

### Versioning Scheme
- **Major version (X.0.0)**: Breaking changes or major new features
- **Minor version (0.X.0)**: New features, backwards compatible
- **Patch version (0.0.X)**: Bug fixes and minor improvements

### Categories
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

## Future Plans (Roadmap)

### Phase 3: Code Quality (Planned)
- [ ] Reorganize file structure
- [ ] Extract duplicate code (footer/header)
- [ ] Remove unused assets
- [ ] Improve modularity

### Phase 4: Performance (Planned)
- [ ] Minify CSS and JavaScript
- [ ] Optimize images (compression, WebP)
- [ ] Implement asset bundling
- [ ] Add resource preloading

### Phase 5: Security (Planned)
- [ ] Add Content Security Policy headers
- [ ] Add SRI hashes to CDN resources
- [ ] Update dependencies
- [ ] Security audit

### Phase 6: Testing (Planned)
- [ ] Add pytest test suite for Python
- [ ] Add Jest tests for JavaScript
- [ ] Add E2E tests with Playwright
- [ ] Add frontend linting workflow

### Phase 7: Modernization (Planned)
- [ ] Migrate to ES6 modules
- [ ] Optimize Dockerfile (multi-stage build)
- [ ] Add docker-compose for development
- [ ] Consider build tool integration (Vite)

---

For detailed information about changes, see commit history and pull requests on GitHub.

**Last Updated**: 2025-11-21
