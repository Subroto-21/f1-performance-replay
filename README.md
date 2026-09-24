# F1 Performance Replay

Compare F1 session results, lap times, tyre strategy, and per-lap telemetry (speed, throttle,
brake, gear, DRS, and time delta) across multiple drivers, session by session.

- **Backend**: FastAPI service that pulls and shapes data from [FastF1](https://docs.fastf1.dev/).
- **Frontend**: Next.js app for browsing seasons → races → sessions and comparing drivers.

## Features

- **Season/race browser** — `/races/[year]` → `/races/[year]/[round]` → session picker, with
  the year list generated from the current year down to 2018 (FastF1's telemetry floor).
- **Session results** with qualifying times, race classification, points, and each driver's
  fastest lap.
- **Driver comparison** — select up to 6 drivers at once; selection, lap picks, and the active
  tab are all synced to the URL so a comparison view is shareable as a link.
- **Telemetry** — speed, throttle, brake, gear, and DRS (hidden automatically for 2026+
  sessions, where the classic wing-flap DRS no longer exists) traces per driver, plus a
  time-delta-to-reference chart when comparing more than one driver.
- **Track map** — the lap drawn as an SVG line colored by speed, throttle, or braking zones,
  switchable per driver, with corner markers (e.g. "T4") placed off to the side so they never
  cover the data.
- **Corner-labeled distance axis** — every telemetry chart gets dashed reference lines at each
  corner, and the bottom chart's axis reads real corner numbers instead of raw meters.
- **Pace chart** — lap time per lap per driver, with Safety Car / Virtual Safety Car / yellow
  flag / red flag periods shaded and labeled directly on the chart (derived from FastF1's
  per-lap track status).
- **Flagged-lap indicators** — laps run under VSC/SC/yellow/red are marked with a small colored
  dot in the lap picker and a badge in the telemetry legend, so an anomalous trace isn't
  mistaken for a driving quirk.
- **Strategy chart** and **laps table** for tyre stints, pit stops, and per-lap sector times.
- **CSV export** for telemetry and pace data.
- **Recent sessions** remembered locally for quick access.

## Prerequisites

- Python 3.11+
- Node.js 20+

## Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

The API listens on `http://127.0.0.1:8000` (docs at `/docs`). FastF1 responses are cached on
disk under `backend/cache/` (git-ignored) — the first load for a given session can take
30-60s while it downloads from the F1 timing API; subsequent loads are fast.

Run backend tests:

```bash
cd backend
pytest
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000` and expects the backend at `http://127.0.0.1:8000`
by default. Override with a `NEXT_PUBLIC_API_URL` env var (e.g. in `.env.local`) if your
backend runs elsewhere.

Run frontend tests:

```bash
cd frontend
npm test
```

## Project structure

```
backend/
  app/api/        FastAPI routers (races, sessions)
  app/services/    FastF1 data-fetching + shaping logic
  app/models/      Pydantic models
  tests/           pytest suite
frontend/
  src/app/         Next.js routes: /races/[year]/[round]/[session]
  src/components/  UI components (driver table, telemetry/pace/strategy charts, laps table)
  src/lib/         Formatting, driver colors, CSV export, local "recent sessions" helpers
  src/services/    API client functions
```
