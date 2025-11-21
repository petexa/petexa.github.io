# Contributing to Bootcamp Events

Thank you for your interest in contributing to the Bootcamp Events website! This document provides guidelines and instructions for contributing to the project.

## 🎯 Ways to Contribute

- Add new event data to the events calendar
- Report bugs or issues
- Suggest new features or improvements
- Improve documentation
- Submit code improvements

## 📋 Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## 🚀 Getting Started

### Prerequisites

- Git
- A modern web browser
- For Python contributions: Python 3.11+
- For frontend work: Basic HTML/CSS/JavaScript knowledge

### Setting Up Your Environment

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/petexa.github.io.git
   cd petexa.github.io
   ```

2. **Install development dependencies (optional)**
   ```bash
   # For Python WOD system
   cd WOD
   pip install -r requirements.txt
   
   # For frontend linting (optional)
   npm install -g prettier eslint stylelint
   ```

3. **Test locally**
   ```bash
   # Start a local web server
   python3 -m http.server 8000
   # Then open http://localhost:8000 in your browser
   ```

## 📝 Code Style Guidelines

### HTML
- Use 2-space indentation
- Use semantic HTML5 elements
- Include ARIA labels for accessibility
- Validate with `prettier --check "*.html"`

### CSS
- Use 2-space indentation
- Follow kebab-case for class names (e.g., `event-card`)
- Prefer CSS custom properties for theming
- Validate with `prettier --check "assets/css/*.css"`

### JavaScript
- Use 2-space indentation
- Use single quotes for strings
- Use camelCase for function and variable names
- Add JSDoc comments for functions
- Prefer `const` over `let`, avoid `var`
- Validate with `prettier --check "assets/js/*.js"`

### Python
- Follow PEP 8 style guide
- Use snake_case for functions and variables
- Use PascalCase for classes
- Add type hints to function signatures
- Include docstrings for all functions and classes
- Format with Black: `black WOD/*.py`
- Sort imports with isort: `isort WOD/*.py`

## 🎨 Adding a New Event

1. **Create a new JSON file** in the `events/` directory:
   ```bash
   # Name format: event-name-YYYYMMDD.json
   events/my-event-20260615.json
   ```

2. **Use this template**:
   ```json
   {
     "name": "Event Name",
     "date": "2026-06-15T10:00:00",
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

3. **Add to events list**:
   ```json
   // In events/events-list.json
   [
     "events/existing-event.json",
     "events/my-event-20260615.json"
   ]
   ```

4. **Test locally** before submitting

See [events/README.md](events/README.md) for detailed instructions.

## 🔧 Adding WOD Data

For contributions to the WOD (Workout of the Day) system:

1. Navigate to `WOD/data/` directory
2. Follow the schema defined in `WOD/data_dictionary.md`
3. Run validation:
   ```bash
   cd WOD
   python validate_and_fix.py
   ```
4. Review the validation report in `WOD/dist/validation_report.txt`

See [WOD/README.md](WOD/README.md) for detailed instructions.

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: How to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Browser/Environment**: Browser version, OS, etc.
6. **Screenshots**: If applicable

## 💡 Suggesting Features

Feature requests are welcome! Please:

1. Check if the feature has already been requested
2. Provide a clear description of the feature
3. Explain why it would be useful
4. Include examples or mockups if applicable

## 📤 Pull Request Process

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**:
   - Follow the code style guidelines
   - Test your changes thoroughly
   - Update documentation if needed

3. **Format your code**:
   ```bash
   # Format frontend code
   prettier --write "*.html" "assets/css/*.css" "assets/js/*.js"
   
   # Format Python code
   cd WOD
   black *.py
   isort *.py
   ```

4. **Run validation** (if applicable):
   ```bash
   # For WOD changes
   cd WOD
   python validate_and_fix.py
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```
   
   Follow conventional commit format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

6. **Push to your fork**:
   ```bash
   git push origin feature/my-new-feature
   ```

7. **Open a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Wait for review and address feedback

## ✅ Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] Code has been formatted (Prettier/Black)
- [ ] Changes have been tested locally
- [ ] Documentation has been updated
- [ ] Commit messages are clear and descriptive
- [ ] No unrelated changes are included
- [ ] WOD validation passes (if applicable)

## 🔍 Review Process

1. A maintainer will review your pull request
2. Feedback may be provided for improvements
3. Make requested changes if needed
4. Once approved, your PR will be merged

## 📚 Additional Resources

- [README.md](README.md) - Project overview
- [events/README.md](events/README.md) - Event management guide
- [WOD/README.md](WOD/README.md) - WOD system documentation
- [AUDIT_REPORT.md](AUDIT_REPORT.md) - System audit findings

## 🆘 Getting Help

If you need help:

1. Check existing documentation
2. Search existing issues on GitHub
3. Open a new issue with your question
4. Contact: gym@petefox.co.uk

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Bootcamp Events! 🎉
