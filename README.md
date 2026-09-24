# F1 Performance Replay

Compare F1 session results, lap times, tyre strategy, and per-lap telemetry (speed, throttle,
brake, gear, DRS, and time delta) across multiple drivers, session by session.

- **Backend**: FastAPI service that pulls and shapes data from [FastF1](https://docs.fastf1.dev/).
- **Frontend**: Next.js app for browsing seasons → races → sessions and comparing drivers.

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
