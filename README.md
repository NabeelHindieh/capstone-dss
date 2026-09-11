# Capstone DSS

**Decision Support System for Mobile Renewable Energy Charging Station Planning**

This repository contains the Software Engineering contribution to a multidisciplinary capstone project focused on planning mobile renewable energy charging stations in Istanbul.

The software is a web-based Decision Support System (DSS) that imports structured engineering data, validates and stores it, and presents planning results through interactive maps, dashboards, and scenario comparison tools.

## Software Team

- Nabeel Hindieh
- Jawad Alatassi
- Elif Yildirim
- Advisor: Asst. Prof. Dr. Serkan Simsek

## Technology Stack

- **Frontend:** React 18 with Vite
- **Backend:** Laravel REST API
- **Database:** MySQL 8
- **Mapping:** OpenStreetMap with Leaflet / React Leaflet
- **Charts:** Recharts
- **HTTP client:** Axios
- **Data formats:** CSV and JSON
- **Containerization:** Docker / Docker Compose
- **Version control:** Git and GitHub

## Implemented Features

- Import and validation of structured project datasets
- Import history tracking and dataset clearing
- Candidate charging-station location management
- Existing charging-station and socket data import
- Traffic-demand data import and visualization
- Optimization-result import
- Electrical simulation-result import
- Interactive map layers and demand visualization
- Dashboard summary and KPI views
- Scenario creation, retrieval, deletion, and comparison
- Structured database storage through Laravel models and migrations

## REST API

The Laravel backend currently exposes endpoints for:

- Dashboard summary
- Map layers and demand data
- Scenario management and comparison
- Import history
- Candidate POIs
- Existing chargers
- Socket data
- Traffic demand
- Optimization results
- Simulation results

## System Architecture

The software follows a three-tier architecture:

1. **Presentation Layer** — React frontend for maps, dashboards, scenario views, data import, and visualization.
2. **Application Layer** — Laravel REST API for validation, data import, scenario handling, and business logic.
3. **Data Layer** — MySQL database for scenarios, charging stations, sockets, demand points, optimization results, simulation results, and import records.

Structured outputs from the Industrial Engineering and Electrical and Electronics Engineering teams are imported through the data ingestion and validation layer before being stored and visualized in the DSS.

## Repository Structure

```text
capstone-dss/
├── frontend/              # React / Vite application
├── backend/               # Laravel REST API
├── database/              # Database documentation
├── datasets/
│   └── sample/            # Non-sensitive sample datasets
├── docs/
│   ├── architecture/      # Architecture diagrams and design notes
│   ├── api/               # API documentation
│   └── testing/           # Test plans and results
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Data Sources

The DSS is designed to consume structured project data such as:

- Candidate charging-station locations
- Existing charging stations
- Charging socket information
- Traffic-density and demand data
- Planning and optimization outputs
- Electrical feasibility and simulation outputs

## Project Scope

The Software Engineering component focuses on data management, validation, visualization, integration, and decision support. Optimization models and electrical simulations are developed by their respective engineering sub-teams and are consumed by the DSS as structured outputs.

## Repository Purpose

GitHub is used for source-code management, version control, documentation, collaboration, and final project sharing.

## Status

Core DSS prototype implemented. Final integration, verification, and project delivery are in progress.
