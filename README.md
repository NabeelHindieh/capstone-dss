# Capstone DSS

**Decision Support System for Mobile Renewable Energy Charging Station Planning**

This repository contains the Software Engineering contribution to a multidisciplinary capstone project focused on planning mobile renewable energy charging stations in Istanbul.

The Software Engineering team develops a web-based Decision Support System (DSS) that receives structured engineering data, validates and stores it, and presents the results through maps, dashboards, station views, scenario comparison, and reports.

## Software Team

- Nabeel Hindieh
- Jawad Alatassi
- Elif Yildirim
- Advisor: Asst. Prof. Dr. Serkan Simsek

## Technology Stack

- **Frontend:** React
- **Backend:** Laravel REST API
- **Database:** MySQL
- **Mapping:** OpenStreetMap with Leaflet / React Leaflet
- **Data formats:** CSV and JSON
- **Version control and documentation:** Git and GitHub

## Main Features

- User authentication and role-based access
- Dataset upload and management
- CSV / JSON validation
- Structured database storage
- Interactive charging-station map
- Dashboard and KPI views
- Station-level details
- Scenario management
- Scenario comparison
- Report generation and export

## System Architecture

The software follows a three-tier architecture:

1. **Presentation Layer** — React frontend for forms, maps, dashboards, tables, scenarios, and reports.
2. **Application Layer** — Laravel REST API for authentication, validation, business logic, data import, scenario handling, and reporting.
3. **Data Layer** — MySQL database for users, datasets, stations, scenarios, results, and reports.

Structured outputs from the Industrial Engineering and Electrical and Electronics Engineering teams are imported through the data ingestion and validation layer before being stored and visualized in the DSS.

## Planned Repository Structure

```text
capstone-dss/
├── frontend/              # React application
├── backend/               # Laravel API
├── database/              # Schema, migrations, and database documentation
├── datasets/
│   └── sample/            # Non-sensitive sample datasets
├── docs/
│   ├── architecture/      # Architecture diagrams and design notes
│   ├── api/               # API documentation
│   └── testing/           # Test plans and results
├── README.md
└── .gitignore
```

## Data Sources

The DSS is designed to consume structured project data such as:

- Candidate charging-station locations
- Existing charging stations
- Charging socket information
- Traffic-density data
- Planning and optimization outputs
- Electrical feasibility and performance indicators, when available

## Project Scope

The Software Engineering component focuses on data management, validation, visualization, integration, and decision support. The optimization models and electrical simulations are developed by their respective engineering sub-teams and are consumed by the DSS as structured outputs.

## Repository Purpose

GitHub is used for repository organization, version control, documentation, and final project sharing. This repository also provides a central location for the software source code, architecture documentation, testing materials, and installation instructions.

## Status

Capstone 2 development in progress.
