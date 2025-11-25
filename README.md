```
==============================
💡 Iron & Ale: Progress + Power
==============================
```

# 🍻 Iron & Ale – Handstand Tracker System

> **"Sets and Reps. Cheers and Beers. That's the Program."**

Welcome to the **Iron & Ale** community accountability system! This project helps our gym crew track fitness milestones (especially handstand progress 🤸) and stay motivated through automated notifications and friendly reminders.

---

## 🎯 Project Overview

**What is this?**  
A gym community accountability system that:
- 📈 Tracks milestones (like handstand progress)  
- 🔔 Automates notifications to keep everyone motivated  
- 🎉 Celebrates wins together!

**How does it work?**  
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   Google    │────▶│     n8n     │────▶│  Telegram   │
│    Pages    │     │   Sheets    │     │  Workflows  │     │     Bot     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     🌐                  📊                  🔄                  🤖
   Website            Database           Automation          Notifications
```

**Tech Stack:**
- 🌐 **GitHub Pages** – Hosts the website  
- 📊 **Google Sheets** – Stores all milestone data (single source of truth)  
- 🔄 **n8n** – Automates workflows (form submissions, updates, notifications)  
- 🤖 **Telegram Bot** – Sends reminders and milestone celebrations  

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Progress Tracker Page** | A web form + display to log and view milestones |
| 📑 **Google Sheet Backend** | Single source of truth for all crew data |
| 🔄 **n8n Automation** | Handles form submissions, sheet updates, and notifications |
| 🤖 **Telegram Bot** | Sends reminders and celebrates milestone achievements |
| 🗂️ **Modular Repos** | Organized into: site frontend, tracker backend, n8n workflows, notifications |

---

## ⚙️ Setup Instructions

Follow these steps to get the Iron & Ale tracker running:

### Step 1: 🔗 Clone the Repo

```bash
git clone https://github.com/petexa/petexa.github.io.git
cd petexa.github.io
```

### Step 2: 🌐 Enable GitHub Pages

1. Go to your repository on GitHub  
2. Click **Settings** → **Pages**  
3. Under "Source", select your branch (usually `main`)  
4. Click **Save**  
5. Your site will be live at `https://yourusername.github.io/your-repo-name/`

### Step 3: 📝 Connect the Site Form to n8n Webhook

1. In n8n, create a new **Webhook** node  
2. Copy the webhook URL  
3. Update your site form's action to point to this webhook URL

### Step 4: 📑 Configure Google Sheets Node in n8n

1. In n8n, add a **Google Sheets** node  
2. Connect your Google account  
3. Select or create a spreadsheet for tracking milestones  
4. Map the form fields to sheet columns

### Step 5: 🤖 Create a Telegram Bot

1. Open Telegram and search for **@BotFather**  
2. Send `/newbot` and follow the prompts  
3. Copy your **bot token**  
4. In n8n, add a **Telegram** node and paste the token  
5. Configure the bot to send messages to your group/channel

### Step 6: ✅ Test End-to-End

1. Submit a test entry via the site form  
2. Check that the entry appears in Google Sheets  
3. Verify the Telegram bot sends a notification  
4. 🎉 Celebrate – you're all set!

---

## 🚀 Usage

Here's how the system works day-to-day:

```
┌──────────────────────────────────────────────────────────────┐
│                      📋 DAILY WORKFLOW                       │
├──────────────────────────────────────────────────────────────┤
│  1. Crew member logs a milestone via the site form  📝       │
│                         ⬇️                                    │
│  2. n8n receives the submission and appends to Google Sheet  │
│                         ⬇️                                    │
│  3. Site displays the updated tracker  🖥️                    │
│                         ⬇️                                    │
│  4. Telegram bot sends reminders and updates  📲             │
└──────────────────────────────────────────────────────────────┘
```

**Quick Actions:**
- 🏋️ Log your handstand progress on the website  
- 📊 Check the tracker to see crew progress  
- 📲 Get Telegram reminders to stay accountable  
- 🎉 Celebrate milestones with the crew!  

---

## 🏆 2026 Goals

Here's what we're aiming for this year:

| Goal | Description |
|------|-------------|
| 🤸 **Handstand Walk** | Walk the full length of the gym by end of year |
| 🏃 **Event Participation** | Compete in Nuclear Races, Gymrace, and Nuclear Fit events |
| 💪 **Strength & Balance** | Improve shoulder strength and balance for pressing movements and handstand stability |
| 🌐 **Community Growth** | Build the gym community site with authentic branding |
| 🔧 **Automation Expansion** | Refine n8n workflows to make accountability visible and frictionless |

```
===============================================
🎯 2026 VISION: Stronger Together, One Rep at a Time
===============================================
```

---

## 📋 Project Management

We use a **GitHub Project Board** to track tasks:

| Column | Purpose |
|--------|---------|
| 📥 **To Do** | Tasks that need to be started |
| 🔄 **In Progress** | Tasks currently being worked on |
| ✅ **Done** | Completed tasks |

**Labels we use:**
- `frontend` – Website and UI tasks  
- `automation` – n8n workflow tasks  
- `accountability` – Community and tracking features  
- `milestone` – Major project milestones  

---

## 📜 License

This project is licensed under the **MIT License** (or similar open-source license).

> 📝 *License details to be added.*

---

```
==============================
🍻 Iron & Ale: Sets and Reps!
==============================
```

**Made with 💪 by the Iron & Ale Crew**

*Have questions? Open an issue or reach out on Telegram!*
