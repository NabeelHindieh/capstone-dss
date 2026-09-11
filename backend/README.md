# EV DSS — Backend (Laravel)

This folder contains the application-specific code (models, migrations,
controllers, routes, console command) for the Decision Support System
backend described in the capstone proposal. It is **not** a full Laravel
install — you need to scaffold a fresh Laravel 11 project and drop these
files in, because `composer`/PHP aren't available in the sandbox this was
written in.

## Setup

```bash
# 1. Create a fresh Laravel app somewhere else
composer create-project laravel/laravel ev-dss-backend
cd ev-dss-backend

# 2. Copy these files over the fresh install (overwrite where they collide)
#    - app/Models/*
#    - app/Http/Controllers/Api/*
#    - app/Http/Controllers/Controller.php
#    - app/Console/Commands/*
#    - database/migrations/2026_01_01_*
#    - routes/api.php
#    - config/cors.php
#    - storage/app/seed_data/*.csv   <-- the real project datasets, already cleaned

# 3. Install the one extra dependency used for CSV parsing
composer require league/csv

# 4. Configure environment
cp .env.example .env      # or merge the DB_* / FRONTEND_URL values into your existing .env
php artisan key:generate

# 5. Create the MySQL database (name matches DB_DATABASE in .env), then:
php artisan migrate

# 6. Load the real candidate POIs, existing chargers, sockets, and traffic
#    demand data (this is the base map layer — optimization/simulation
#    results get imported later via the API endpoints once those teams
#    deliver their CSVs)
php artisan import:base-datasets

# 7. Run the API
php artisan serve   # http://localhost:8000
```

## What's here vs. what's still a gap

- **Implemented & seedable now:** existing chargers (2,933, coordinates
  cleaned), candidate POIs (2,258), socket-level detail (38,950), traffic
  demand grid (2,031 geohash cells). These populate `charging_stations`,
  `sockets`, and `demand_points`.
- **Schema ready, data pending:** `optimization_results` and
  `simulation_results` — these are filled in via
  `POST /api/import/optimization-results` and
  `POST /api/import/simulation-results` once the Industrial Engineering and
  EEE teams deliver their CSVs. Until then, scenarios can exist and the map
  will show existing + candidate layers, but the "optimized station" layer
  and dashboard KPIs that depend on cost/coverage/emissions will be empty.

## API summary

| Method | Endpoint                              | Purpose                                   |
|--------|----------------------------------------|--------------------------------------------|
| GET    | /api/dashboard/summary                 | KPI counts for the landing dashboard      |
| GET    | /api/map/layers?scenario_id=&category= | Stations for the Leaflet map              |
| GET    | /api/map/demand?min_score=             | Demand heat-map points                    |
| GET    | /api/scenarios                         | List scenarios                            |
| POST   | /api/scenarios                         | Create scenario                           |
| GET    | /api/scenarios/{id}                    | Scenario + its optimized stations         |
| PUT    | /api/scenarios/{id}                    | Update scenario                           |
| DELETE | /api/scenarios/{id}                    | Delete scenario                           |
| GET    | /api/scenarios/compare?ids=1,2         | Side-by-side scenario comparison          |
| POST   | /api/import/optimization-results       | Upload IE optimization CSV for a scenario |
| POST   | /api/import/simulation-results         | Upload EEE simulation CSV for a scenario  |
