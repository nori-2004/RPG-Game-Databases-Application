# Team 30 — RPG Game Database Application

A full-stack web application built for **CPSC 304** that models and manages an RPG game database. Users can manage players, save files, items, characters, achievements, and objectives through an interactive React frontend backed by a Node.js/Express API and an Oracle database.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)

---

## Tech Stack

| Layer    | Technology                  |
| -------- | --------------------------- |
| Frontend | React 19, Vite 7            |
| Backend  | Node.js, Express 4          |
| Database | Oracle (via `oracledb` 6.7) |
| Other    | CORS, ESLint                |

---

## Project Structure

```
team_30/
├── SQL_schema.sql              # Full Oracle DDL + seed INSERT statements
├── milestone4/
│   ├── server.js               # Express entry point (seeds DB, serves API + SPA)
│   ├── appController.js        # Root router — mounts route modules
│   ├── appService.js           # Demo-table service helpers
│   ├── package.json            # Backend dependencies
│   ├── local-start.cmd         # Windows quick-start script
│   ├── remote-start.sh         # Linux/Mac quick-start script
│   ├── backend/
│   │   ├── db.js               # Oracle connection-pool manager
│   │   ├── seedData.js         # Auto-seeds all tables on server start
│   │   └── routes/
│   │       ├── ketan-routes.js     # INSERT, SELECTION, PROJECTION, GROUP BY, NESTED AGG
│   │       └── samarth-routes.js   # DELETE, UPDATE, JOIN, HAVING, DIVISION
│   ├── frontend/
│   │   ├── package.json        # Frontend dependencies (React, Vite)
│   │   └── src/
│   │       ├── App.jsx         # Page router & layout
│   │       ├── Components/     # Layout, LoadingSpinner, Notification
│   │       ├── pages/          # One page per feature (11 pages)
│   │       └── services/
│   │           └── api.js      # Fetch wrapper for all API calls
│   ├── public/                 # Legacy static frontend (HTML/CSS/JS)
│   ├── scripts/                # SSH tunnel & Instant Client helpers
│   └── utils/
│       └── envUtil.js          # .env file loader
```

---

## Database Schema

The Oracle schema (`SQL_schema.sql`) models an RPG game world with **15 tables**:

| Table                  | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `Users`                | Player accounts (username, name, email)              |
| `SaveFiles_IsAt`       | Save files tied to a user and difficulty              |
| `Difficulty`           | Difficulty levels with HP / damage multipliers        |
| `Locations`            | Game world locations (biome, landmark, story)         |
| `Items`                | In-game items with rarity and type                    |
| `ItemSaleValue`        | Sale value derived from item rarity                   |
| `ItemBoost`            | Stat boosts derived from rarity + type                |
| `CharTypes`            | Character archetypes (base HP, base damage)           |
| `PCs`                  | Playable characters                                   |
| `NPCs_IsAt`            | Non-playable characters tied to a location            |
| `Objectives`           | Quests / tasks at locations with optional item rewards |
| `Checkpoints_IsAt`     | Story checkpoints at locations                        |
| `Achievements_monitors`| Achievements linked to objectives and users           |
| `Earned`               | Tracks which users earned which achievements          |
| `Completes`            | Tracks which users completed which objectives         |
| `Contains`             | Items contained in a save file (inventory)            |
| `Current`              | Current PC selection per save file                    |
| `HasAPrerequisite`     | Prerequisite objectives for checkpoints               |

---

## Features

Each feature maps to a specific SQL operation required by the course:

| Page               | SQL Operation        | Description                                                        |
| ------------------ | -------------------- | ------------------------------------------------------------------ |
| **Add User**       | INSERT               | Create a new user with username, name, and email                   |
| **Add Save File**  | INSERT               | Create a save file for an existing user with a chosen difficulty    |
| **Delete User**    | DELETE (cascade)     | Delete a user and all related save files, achievements, completions |
| **Update Item**    | UPDATE               | Change an item's rarity and/or type (validated against `ItemBoost`) |
| **Character Search** | SELECTION          | Search NPCs/PCs with dynamic AND/OR filter conditions              |
| **User Report**    | PROJECTION           | Generate a custom report by selecting which user columns to display |
| **Achievements**   | JOIN                 | View achievement details joined across 4 tables, filterable by user |
| **Item Stats**     | GROUP BY             | Aggregate items by rarity showing count, sale value, total value   |
| **Active Users**   | HAVING               | Find users with at least *N* save files                            |
| **Save File Analysis** | Nested Aggregation | Stats per difficulty plus overall averages (nested GROUP BY)      |
| **Completionists** | DIVISION             | Find users who completed **all** objectives at a given location    |

---

## Prerequisites

- **Node.js** ≥ 18
- **Oracle Instant Client** (Basic or Basic Lite) — must be on your `PATH`
- Access to an Oracle database (e.g. UBC CS department server or local Oracle XE)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd team_30/milestone4
```

### 2. Set up environment variables

Create a `.env` file inside `milestone4/`:

```env
ORACLE_USER=ora_<cwl>
ORACLE_PASS=a<student_number>
ORACLE_HOST=dbhost.students.cs.ubc.ca
ORACLE_PORT=1522
ORACLE_DBNAME=stu
PORT=3001
```

### 3. Install dependencies

```bash
# Backend
cd milestone4
npm install

# Frontend
cd frontend
npm install
```

### 4. Build the frontend

```bash
cd milestone4/frontend
npm run build
```

This outputs a production build to `frontend/dist/`, which the Express server serves automatically.

### 5. Start the server

**Windows (quick-start):**

```cmd
local-start.cmd
```

**Manual:**

```bash
cd milestone4
node server.js
```

The server will:
1. Seed all tables with sample data on startup.
2. Serve the API at `http://localhost:3001/api/`.
3. Serve the React frontend at `http://localhost:3001/`.

### 6. (Optional) Run the frontend in development mode

```bash
cd milestone4/frontend
npm run dev
```

> **Note:** In dev mode the Vite dev server runs on a separate port. Make sure the `API_BASE` in `frontend/src/services/api.js` points to your backend (`http://localhost:3001/api`).

---

## Environment Variables

| Variable                | Description                                |
| ----------------------- | ------------------------------------------ |
| `ORACLE_USER`           | Oracle DB username                         |
| `ORACLE_PASS`           | Oracle DB password                         |
| `ORACLE_HOST`           | Oracle DB host                             |
| `ORACLE_PORT`           | Oracle DB port                             |
| `ORACLE_DBNAME`         | Oracle DB service/SID name                 |
| `ORACLE_CONNECT_STRING` | Full connect string (overrides host/port)  |
| `PORT`                  | Express server port (default `3001`)       |

---

## API Endpoints

### Users

| Method   | Endpoint                      | Description                             |
| -------- | ----------------------------- | --------------------------------------- |
| `GET`    | `/api/users`                  | List all users                          |
| `POST`   | `/api/users`                  | Create a new user                       |
| `DELETE` | `/api/users/:username`        | Delete a user (cascades related data)   |
| `GET`    | `/api/users/report?fields=…`  | Projection — select specific columns    |
| `GET`    | `/api/users/active?min_savefiles=N` | Users with ≥ N save files (HAVING) |
| `GET`    | `/api/users/completionists?location_name=…` | Division — full completionists |

### Save Files

| Method | Endpoint                  | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| `POST` | `/api/savefiles`          | Create a save file for a user      |
| `GET`  | `/api/savefiles/analysis` | Nested aggregation stats           |

### Characters

| Method | Endpoint                   | Description                                 |
| ------ | -------------------------- | ------------------------------------------- |
| `POST` | `/api/characters/search`   | Selection — search NPCs/PCs with conditions |

### Items

| Method | Endpoint                       | Description                         |
| ------ | ------------------------------ | ----------------------------------- |
| `GET`  | `/api/items`                   | List all items                      |
| `PUT`  | `/api/items/:item_name`        | Update item rarity / type           |
| `GET`  | `/api/items/stats/by-rarity`   | Group By — items per rarity         |

### Achievements

| Method | Endpoint                              | Description                                      |
| ------ | ------------------------------------- | ------------------------------------------------ |
| `GET`  | `/api/achievements/details?username=…`| Join — achievements with objectives & users       |

### Reference Data

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| `GET`  | `/api/difficulties`  | List difficulty levels   |
| `GET`  | `/api/chartypes`     | List character types     |
| `GET`  | `/api/locations`     | List locations           |
