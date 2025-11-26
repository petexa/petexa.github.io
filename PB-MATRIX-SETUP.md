# Personal Bests (PB) Matrix - Google Apps Script Web App

This document provides instructions for setting up and deploying the Personal Bests Matrix Web App using Google Apps Script.

## Overview

The PB Matrix Web App reads workout data from a Google Sheet named "Logs" and generates a Personal Bests matrix showing the maximum weight lifted for each (Name, Exercise) combination.

## Prerequisites

- A Google account
- A Google Sheet with workout data

## Google Sheet Structure

Use the existing Google Sheet named **"workout-log"** containing the following columns (in order):

| Column | Description | Example |
|--------|-------------|---------|
| Date | Workout date | "2024-01-15" |
| Exercise | Exercise name | "Bench Press" |
| Sets | Number of sets | 3 |
| Reps | Number of reps | 10 |
| Weight | Weight lifted | 100 |
| Unit | Weight unit (kg/lbs) | "kg" |
| Notes | Optional notes | "Good form" |
| PR | Personal Record flag | "YES" |
| Name | Member name (unique identifier) | "John Doe" |

**Important:** The `Name` column is the unique identifier. Personal Bests are displayed with each member name as a row, and their PBs for each exercise go along that row.

## Setup Instructions

### Step 1: Create the Google Apps Script Project

1. Open your Google Sheet with the workout data
2. Click **Extensions** → **Apps Script**
3. Delete any existing code in the editor
4. Copy and paste the entire contents of `assets/js/pb-matrix-apps-script.js` into the editor
5. Click **File** → **Save** (or Ctrl+S)
6. Name your project (e.g., "PB Matrix Web App")

### Step 2: Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description**: "PB Matrix Web App" (optional)
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** when prompted
6. Review and grant the required permissions
7. Copy the **Web app URL** (it ends with `/exec`)

### Step 3: Test the Deployment

- **HTML Table View**: Visit the Web App URL directly
  ```
  https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
  ```

- **JSON Data View**: Add `?format=json` to the URL
  ```
  https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?format=json
  ```

## Front-End Integration

### Option A: iframe Embed (Simplest)

Add this HTML snippet to your website to embed the PB table directly:

```html
<!-- PB Matrix iframe Embed -->
<div class="pb-matrix-container">
  <iframe 
    src="YOUR_WEB_APP_URL"
    style="width: 100%; min-height: 400px; border: none; border-radius: 8px;"
    title="Personal Bests Matrix"
    loading="lazy">
  </iframe>
</div>
```

Replace `YOUR_WEB_APP_URL` with your actual Web App URL.

### Option B: Fetch JSON and Render Dynamically

For more control over styling and behavior, fetch the JSON data and render the table with JavaScript:

```html
<!-- PB Matrix Dynamic Table -->
<div id="pb-matrix-container">
  <div id="pb-matrix-loading" style="text-align: center; padding: 20px; color: #888;">
    Loading Personal Bests...
  </div>
  <div id="pb-matrix-table"></div>
</div>

<script>
  (function() {
    const WEB_APP_URL = 'YOUR_WEB_APP_URL?format=json';
    const container = document.getElementById('pb-matrix-table');
    const loading = document.getElementById('pb-matrix-loading');

    fetch(WEB_APP_URL)
      .then(response => response.json())
      .then(data => {
        loading.style.display = 'none';
        renderPBMatrix(data);
      })
      .catch(error => {
        loading.innerHTML = '<span style="color: #ff5555;">Failed to load PB data. Please try again later.</span>';
        console.error('PB Matrix Error:', error);
      });

    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function renderPBMatrix(data) {
      if (!data.exercises || data.exercises.length === 0 || !data.rows || data.rows.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No workout data found.</p>';
        return;
      }

      let html = '<table class="pb-matrix-table"><thead><tr><th>Name</th>';
      data.exercises.forEach(ex => {
        html += '<th>' + escapeHtml(ex) + '</th>';
      });
      html += '</tr></thead><tbody>';

      data.rows.forEach(row => {
        html += '<tr>';
        row.forEach((cell, idx) => {
          if (idx === 0) {
            html += '<td class="pb-name">' + escapeHtml(cell) + '</td>';
          } else {
            if (cell !== null && cell !== undefined) {
              html += '<td class="pb-value">' + escapeHtml(cell) + ' kg</td>';
            } else {
              html += '<td class="pb-empty">—</td>';
            }
          }
        });
        html += '</tr>';
      });

      html += '</tbody></table>';
      html += '<p class="pb-note">All weights normalized to kilograms (kg)</p>';
      container.innerHTML = html;
    }
  })();
</script>
```

Replace `YOUR_WEB_APP_URL` with your actual Web App URL.

## Updating the Web App

If you make changes to the Apps Script code:

1. Go to **Deploy** → **Manage deployments**
2. Click the pencil icon (Edit) next to your deployment
3. Under **Version**, select **New version**
4. Click **Deploy**

The URL remains the same; only the code is updated.

## Troubleshooting

### "No workout data found"
- Ensure your sheet is named exactly "Logs" (case-sensitive)
- Verify the column headers match: Name, Date, Exercise, Sets, Reps, Weight, Unit, Notes, PR
- Check that there is data in the sheet (at least one row below headers)

### "Authorization required"
- When deploying, make sure to complete the authorization flow
- If you see a "Google hasn't verified this app" warning, click "Advanced" → "Go to [Project Name]"

### CORS Issues
- The Web App is configured to allow embedding in iframes
- If using fetch(), ensure the Web App is deployed with "Anyone" access

### Data not updating
- Google Apps Script caches responses for performance
- Wait a few minutes or deploy a new version to see updated data

## Security Notes

- The script escapes all HTML output to prevent XSS attacks
- The Web App runs with your permissions but only reads the Logs sheet
- Consider limiting access if your data is sensitive

## Support

For issues or questions:
- Open an issue on the GitHub repository
- Contact the Iron & Ale team via Telegram
