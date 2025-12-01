
This document provides step-by-step instructions for setting up and deploying the Personal Bests Matrix Web App using Google Apps Script. **No coding experience required!**

## What This Does

The PB Matrix Web App reads your workout data from a Google Sheet named **"workout-log"** and automatically generates a Personal Bests leaderboard showing the maximum weight lifted for each member and exercise.

## Prerequisites

- A Google account
- Your existing Google Sheet with workout data (named **"workout-log"**)

## Google Sheet Structure

Your **"workout-log"** sheet should have these columns in this exact order:

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

### Step 1: Open Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Open your spreadsheet that contains the **"workout-log"** sheet
3. Make sure the sheet tab at the bottom is named exactly **"workout-log"** (case-sensitive)

### Step 2: Create the Google Apps Script Project

1. With your spreadsheet open, click **Extensions** in the top menu
2. Click **Apps Script** - a new tab will open
3. You'll see some default code - **select all and delete it**
4. Copy the entire contents of `assets/js/pb-matrix-apps-script.js` from this repository
5. Paste it into the Apps Script editor
6. Click **File** → **Save** (or press Ctrl+S / Cmd+S)
7. When prompted, name your project something like "PB Matrix Web App"

### Step 3: Deploy as a Web App

1. In the Apps Script editor, click the blue **Deploy** button (top right)
2. Click **New deployment**
3. Click the gear icon ⚙️ next to "Select type"
4. Choose **Web app**
5. Fill in the settings:
   - **Description**: "PB Matrix" (optional)
   - **Execute as**: Select **Me** (your email)
   - **Who has access**: Select **Anyone**
6. Click **Deploy**
7. Click **Authorize access** - a popup will appear
8. Choose your Google account
9. You may see "Google hasn't verified this app" - click **Advanced** → **Go to PB Matrix Web App (unsafe)**
10. Click **Allow** to grant permissions
11. **Copy the Web app URL** - it looks like: `https://script.google.com/macros/s/ABC123.../exec`

### Step 4: Test Your Deployment

Open a new browser tab and paste your Web App URL. You should see a table with your Personal Bests!

**To see JSON data:** Add `?format=json` to the end of your URL.

## Using the PB Matrix on Your Website

### Option A: Embedded View (Easiest)

Go to the Utilities page, click on "Personal Bests Matrix", and paste your Web App URL into the input field. Click "Load PB Matrix" to see your data!

### Option B: Dynamic Table

Switch to "Dynamic Table" mode to fetch and display the data with custom styling. Enter your Web App URL and click "Fetch PB Data".

## Updating the Web App

If you need to update the code:

1. Make your changes in the Apps Script editor
2. Click **Deploy** → **Manage deployments**
3. Click the pencil icon ✏️ next to your deployment
4. Under **Version**, select **New version**
5. Click **Deploy**

Your URL stays the same!

## Troubleshooting

### "No workout data found"
- ✓ Ensure your sheet tab is named exactly **"workout-log"** (case-sensitive, no extra spaces)
- ✓ Check that your column headers are in the correct order: Date, Exercise, Sets, Reps, Weight, Unit, Notes, PR, Name
- ✓ Make sure there's at least one row of data below the headers

### "Authorization required"
- ✓ When deploying, make sure to complete the full authorization flow
- ✓ If you see "Google hasn't verified this app", click **Advanced** → **Go to [Project Name]**

### Data not showing or outdated
- ✓ Google caches responses - wait a few minutes and refresh
- ✓ Try deploying a new version (see "Updating the Web App" above)
- ✓ Clear your browser cache and try again

### CORS or Loading Issues
- ✓ Make sure the Web App is deployed with "Anyone" access
- ✓ Check that your URL ends with `/exec` (not `/dev`)

## Security Notes

- The script only **reads** data from your workout-log sheet - it cannot modify it
- All data is escaped to prevent security issues
- Only people with the Web App URL can view the data

## Need Help?

- Open an issue on the GitHub repository
- Contact the Iron & Ale team via Telegram

