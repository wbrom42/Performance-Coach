# Performance Coach

A mobile-optimized training app for youth athletes and their coaches. Tracks sessions, check-ins, training load, readiness flags, and test results — all from a single-page web app that lives on your phone's home screen.

Built for parents coaching their kids. One coach, multiple athletes. Works offline-friendly, zero configuration.

## Features

- **Daily check-in** — athlete reports readiness (sleep, soreness, motivation, stress)
- **Session logging** — log exercises with RPE, track volume and duration
- **Training load** — auto-computed acute:chronic workload ratio from session history
- **Readiness flags** — fatigue, sleep debt, soreness, stress, motivation — all derived from check-in data
- **Testing** — log and track performance tests over time
- **Coach dashboard** — overview of all athletes with alert indicators
- **Session builder** — create reusable training sessions for quick assignment

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python / FastAPI |
| Database | SQLite (via SQLModel) |
| Frontend | React / JSX (no build step — raw JSX via htmx-style inline) |
| Auth | Bearer token (env var or file) |
| Mobile | Viewport-fit, overscroll behavior, iOS home screen `apple-mobile-web-app-capable` |

## Quick Start

```bash
# Clone
git clone https://github.com/wbrom42/Performance-Coach.git
cd Performance-Coach

# Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # or pip install fastapi uvicorn sqlmodel

# Auth token (optional — no token = open access during dev)
echo "my-secret-token" > .coach_token

# Run
uvicorn app:app --host 0.0.0.0 --port 8081
```

Open `http://localhost:8081` in a browser. Add to home screen for the app-like experience.

## Project Structure

```
├── app.py                  # FastAPI entry point + static file serving
├── auth.py                 # Bearer token auth
├── database.py             # SQLite init
├── models.py               # SQLModel tables (Athlete, Session, Checkin, etc.)
├── schemas.py              # Pydantic request/response schemas
├── static/                 # Frontend (no build step)
│   ├── index.html          # Landing / athlete selection
│   ├── coach.html          # Coach dashboard
│   ├── checkin.html        # Daily check-in form
│   ├── session.html        # Session logger
│   ├── week.html           # Weekly view
│   ├── athlete-detail.html # Athlete profile
│   ├── session-builder.html# Create reusable sessions
│   ├── app.jsx             # Main React app
│   ├── data.jsx            # Data utilities
│   ├── flags.jsx           # Readiness flag display
│   ├── ios-frame.jsx       # iOS PWA frame component
│   ├── profile.jsx         # Profile components
│   ├── screens.jsx         # Screen components
│   ├── tweaks-panel.jsx    # Training tweaks UI
│   ├── api.js              # API client
│   ├── style.css           # Mobile-first CSS
│   ├── tests.jsx           # Performance test logger
│   └── ...                 # Plus session-specific HTML pages
├── routers/                # FastAPI route modules
│   ├── athletes.py         # GET /api/v1/athletes
│   ├── sessions.py         # Session CRUD
│   ├── checkins.py         # Check-in CRUD
│   ├── tests.py            # Performance tests
│   ├── load.py             # Training load computation
│   ├── flags.py            # Readiness flag computation
│   └── ingest.py           # Data import
└── design/                 # Design prototypes (gitignored on deploy)
```

## API Endpoints

All routes are under `/api/v1/`. Key endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/athletes` | List all athletes |
| GET | `/api/v1/athletes/{id}` | Single athlete detail |
| GET/POST | `/api/v1/athletes/{id}/checkins` | Daily check-ins |
| GET/POST | `/api/v1/athletes/{id}/tests` | Performance tests |
| GET | `/api/v1/athletes/{id}/load` | Training load history |
| GET | `/api/v1/athletes/{id}/flags` | Computed readiness flags |
| POST | `/api/v1/sessions` | Log a session |
| POST | `/api/v1/ingest` | Bulk data import |

## Motivation

Built to replace spreadsheets and post-it notes for tracking a youth athlete's training. One parent coaching their kids needed something that worked on a phone, required zero setup, and didn't need accounts or cloud dependencies.

## License

MIT
