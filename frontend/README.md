# EV DSS — Frontend (React + Vite + Leaflet)

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if your backend isn't on localhost:8000
npm run dev            # http://localhost:5173
```

Make sure the backend (`php artisan serve`) is running first, and that
`FRONTEND_URL` in the backend's `.env` matches this app's origin so CORS
allows the requests.

## Pages

- **Dashboard** (`/`) — KPI cards from `/api/dashboard/summary`.
- **Map** (`/map`) — Leaflet map with toggleable layers: existing chargers
  (blue), candidate POIs (grey), optimized stations for a selected scenario
  (green), and a demand heat overlay (orange) from the traffic dataset.
- **Scenarios** (`/scenarios`) — create scenarios, upload the Industrial
  Engineering optimization CSV and EEE simulation CSV per scenario, and
  compare scenarios side by side.

## Still to build

- Auth (the backend has no auth middleware yet — add Sanctum if you need
  multi-user access control).
- Report/PDF export (Objective 7 in the proposal — dashboards exist, export
  doesn't yet).
- Marker clustering on the map once real optimization data pushes station
  counts up (the `leaflet.markercluster` dependency is already listed).
