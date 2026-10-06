# TrackNTune — Car & Bike Maintenance Tracker

A simple full-stack app to log service history, track mileage, and see
when your car or bike's next service is due.

## Tech stack

- **Frontend:** Plain HTML, CSS, JavaScript (no build step needed)
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)

## Features

- Add unlimited vehicles — cars and bikes, each with their own default
  service interval (km + months)
- Log service entries: date, odometer, service type, cost, garage, notes
- Service type list automatically changes for cars vs bikes
- Automatic "next service due" calculation, with a status badge:
  - 🟢 On Track
  - 🟡 Due Soon (within 500 km or 14 days)
  - 🔴 Overdue
- Dashboard with tabs to filter All / Cars / Bikes
- Vehicle detail page: full service history + total money spent
- Personal and garage-owner account registration and login
- AI Mechanic with built-in offline responses and optional Gemini integration

## Folder structure

```
vehicle-tracker/
├── server.js              # Express app entry point
├── package.json
├── .env.example            # copy to .env and fill in your MongoDB URI
├── models/
│   ├── Vehicle.js
│   └── Service.js
├── routes/
│   ├── vehicles.js
│   └── services.js
└── public/                 # frontend (served by Express)
    ├── index.html
    ├── style.css
    └── script.js
```

## How to run it locally

**1. Install dependencies**
```bash
cd vehicle-tracker
npm install
```

**2. Set up MongoDB**

Option A — Local MongoDB (if you have it installed):
```bash
# make sure mongod is running, then:
cp .env.example .env
# .env already points to mongodb://127.0.0.1:27017/vehicle-tracker — no changes needed
```

Option B — MongoDB Atlas (free cloud database, no local install needed):
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string (Connect → Drivers)
3. Copy `.env.example` to `.env` and paste your connection string into `MONGODB_URI`

**3. Start the server**
```bash
npm start
```
On Windows PowerShell, if script execution policy blocks `npm`, run `npm.cmd start`.

**4. Open the app**

Visit **http://localhost:5000** in your browser. That's it — Express
serves both the API and the frontend from the same server.

### Login and AI Mechanic

The local JSON database includes demo accounts:

- Personal: `user@trackntune.com` / `password123`
- Garage owner: `garage@apex.com` / `password123`

The AI Mechanic uses built-in offline automotive responses by default. To enable
live Gemini-generated answers, add your own `GEMINI_API_KEY` to `.env` and
restart the server. Keep `.env` private and never commit API keys or database
credentials.

## How the "next service due" logic works

Each vehicle has a default interval (e.g. every 5,000 km / 6 months).
Each service entry can optionally override that interval. The app
looks at your most recent service entry and calculates:

```
next due (km)    = last service odometer + interval km
next due (date)  = last service date + interval months
```

If either of those is close (within 500 km / 14 days) it shows **Due
Soon**; if either has already passed, it shows **Overdue**.

## Extending it later

Some natural next additions, if you want to keep building:
- Secure authentication (password hashing, sessions, and per-user data access)
- Fuel log + mileage (km/l) tracking
- Document storage: insurance, PUC/emission certificate, RC book, with
  expiry reminders
- Email/browser notifications when a service is due
- Export service history to PDF/CSV
- Convert the frontend to React if you want a more app-like feel
