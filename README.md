# Purrsue 🐾

**Purrsue** is a gamified goal-tracking web app built for the HSC Software Engineering Major Project. It helps users set, schedule, and complete personal goals across areas like study, physical health, sleep, mental health, and leisure — turning the process into a game by raising a virtual pet as a reward for staying on track.

This repository is a static, client-side web app (HTML/CSS/vanilla JS) backed by **Firebase** (Authentication + Firestore) for user accounts and data storage.

## Features

- **Accounts & auth** — email/password sign-up, login, session persistence, and password reset via Firebase Authentication.
- **Task calendar** — create, complete, and delete scheduled events/tasks on an interactive calendar (`tasks.html`), with real-time sync via Firestore `onSnapshot` and automatic detection of overdue tasks.
- **Virtual pet** — a cat companion (`pet.html`) that reacts to your progress: idle, happy, crying, or asleep (based on a user-configurable sleep schedule), plus low-stat notifications nudging you back on track.
- **Stats & leveling** — completing tasks earns XP and levels up your profile; a radar and doughnut chart (Chart.js) on `stats.html` visualize five life stats: Study, Physical Health, Sleep, Mental Health, and Leisure.
- **Leaderboard** — ranks users by level/XP (`dashboard.html` leaderboard view via `leaderboard.js`).
- **Settings** — edit profile details, change password, and choose a sleep schedule (`settings.html`).
- **Theming** — five colour themes (default/blue, purple, green, pink, amber) persisted in `localStorage`.
- **Marketing pages** — a home/landing page (`index.html`) with product demo videos, and an about page (`about.html`).

## Tech stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript (ES modules) — no build step or framework.
- **Backend/data:** [Firebase](https://firebase.google.com/) — Authentication and Cloud Firestore.
- **Libraries (via CDN):** [Chart.js](https://www.chartjs.org/) (stats charts), [Iconify](https://iconify.design/), [Font Awesome](https://fontawesome.com/).

## Project structure

```
HSC_Major/                  Main application (open index.html to run)
├── index.html               Landing page
├── login.html / signup.html Auth pages
├── reset-password.html      Password reset flow
├── dashboard.html            Post-login dashboard + leaderboard
├── tasks.html / tasks.js     Task/event calendar
├── pet.html                  Virtual pet page
├── stats.html / user_stats.js  Stats charts (radar + doughnut)
├── settings.html / settings.js Account settings
├── about.html                 About page
├── app.js                     Shared nav, auth forms, input sanitization, rate limiting
├── auth-state.js              Shared "is a user logged in" guard for protected pages
├── firebase.js                Firebase app initialization/config
├── theme.js                   Colour theme switcher
├── time.js                    Clock widget + pet sleep-schedule logic
├── leaderboard.js              Leaderboard data + rendering
├── pet_stats_notification.js  Low-stat pet notifications
├── userpage.js                 Dashboard user/task/level state
├── styles.css                  Global stylesheet (incl. theme variables)
├── images/, Animation/, Videos/  Static assets and demo videos
└── HSC-Major-Project--Purrsue/  (nested scratch clone — not part of the app)

firebase-web-app/            Firebase Hosting deployment config for the app in public/
```

## Getting started

The app needs no build step — it's static files served over HTTP (ES module imports require a server; opening `index.html` directly via `file://` will not work).

1. Clone the repository.
2. Serve the `HSC_Major` folder with any static file server, e.g.:
   ```bash
   cd HSC_Major
   npx serve .
   ```
3. Open the printed local URL in your browser and start from `index.html`.

Firebase project credentials are already embedded in `firebase.js`/`app.js`/`tasks.js`/etc. (pointing at the `purrsue-login` Firebase project), so sign-up/login work out of the box against that project. To point the app at your own Firebase project instead, replace the `firebaseConfig` object in each of those files and set up **Authentication (Email/Password)** and **Cloud Firestore** in the Firebase console.

### Deploying

The `firebase-web-app/` directory contains a separate Firebase Hosting configuration (`firebase.json`, `.firebaserc`) for deploying a built copy of the site to Firebase Hosting:

```bash
npm install -g firebase-tools
cd firebase-web-app
firebase deploy
```

## Data model (Firestore)

- `users/{uid}` — profile fields (`email`, `fName`, `lName`, `createdAt`), plus gamification fields (`level`, `XP`) used by the leaderboard.
- `users/{uid}/data/sleep-schedule` — the pet's `bedtime`/`wakeup` times.
- Task/event and per-category stat data are stored per user and synced live to the calendar, stats charts, and pet notifications via Firestore listeners.

## Notes

- `HSC_Major/HSC-Major-Project--Purrsue/` is a leftover nested git clone with no tracked files of its own; it isn't part of the app and can be safely ignored or removed.
