# Team Sync Dashboard — Weekly Report Generator & Team Analytics

A full-stack web application that enables team members to submit structured weekly work reports, allows managers to review and approve them through a multi-step correction workflow, and provides a consolidated analytics dashboard with visual insights across the entire team.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Zustand, Recharts, React Hook Form + Zod |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2, JWT Auth |
| **Database** | PostgreSQL 17 (Local) / Neon Serverless PostgreSQL (Production) |
| **AI Assistant** | Google Gemini API (gemini-3.6-flash) with RAG context injection(you will need api key) |
| **Deployment** | Vercel (Frontend), Render (Backend), Neon (Database) |

## Project Structure

```
Team Sync Dashboard/
├── backend/                    # FastAPI Backend (Clean Architecture)
│   ├── app/
│   │   ├── core/               # Config, Security (JWT), Dependencies
│   │   ├── domain/             # Entities, Enums, Repository Interfaces
│   │   ├── infrastructure/     # SQLAlchemy Models, Repositories, DB Session
│   │   ├── application/        # Services (Business Logic), Pydantic Schemas
│   │   └── presentation/       # API Routes (Auth, Users, Reports, Dashboard)
│   ├── main.py                 # FastAPI Application Entry Point
│   ├── requirements.txt
│   └── .env
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── api/                # Axios API Client Layer
│   │   ├── store/              # Zustand State Management
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── components/         # Reusable UI Components
│   │   ├── pages/              # Route-Level Page Components
│   │   ├── routes/             # React Router Configuration
│   │   └── utils/              # Formatters, Validators, Constants
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Prerequisites

- **Python 3.11+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **PostgreSQL 15+** — [Download](https://www.postgresql.org/download/) (or use [Neon.tech](https://neon.tech) for free cloud PostgreSQL)
- **Git** — [Download](https://git-scm.com/)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/S-Nathistan/team-sync-dashboard.git
cd team-sync-dashboard
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Open psql and create the database
psql -U postgres
CREATE DATABASE weekly_reports;
\q
```

#### Option B: Free Cloud PostgreSQL (Neon.tech)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create a .env file in the backend/ directory:
# DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/weekly_reports
# SECRET_KEY=your-secret-key-here
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=1440
# GEMINI_API_KEY=your-gemini-api-key (optional)
# GEMINI_MODEL=gemini-3.6-flash

# Seed the database with test data
python -m app.infrastructure.seed

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000** with interactive docs at **http://localhost:8000/docs**.

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**.

### 5. Running the Full Application

Open **two terminal windows**:

| Terminal | Command | URL |
|----------|---------|-----|
| Terminal 1 (Backend) | `cd backend && .venv\Scripts\activate && uvicorn main:app --reload` | http://localhost:8000 |
| Terminal 2 (Frontend) | `cd frontend && npm run dev` | http://localhost:5173 |

## Demo Accounts

After running the seed script, use these accounts to test:

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| **Admin** | admin@example.com | admin123 | User & role management |
| **Manager** | manager@example.com | manager123 | Team dashboard, report review, projects |
| **Team Member** | alice@example.com | member123 | Create & submit weekly reports |
| **Team Member** | bob@example.com | member123 | Report with "Submitted" status |
| **Team Member** | charlie@example.com | member123 | Report with "Needs Correction" status |
| **Team Member** | diana@example.com | member123 | Report with "Approved" status |
| **Team Member** | evan@example.com | member123 | No report this week (Not Started) |

## Key Features

- **Role-Based Access Control (RBAC):** 3 roles (Team Member, Manager, Admin) with endpoint-level security
- **Report Review Workflow:** Draft → Submitted → Needs Correction → Approved with version history
- **Manager Dashboard:** Real-time charts (tasks trend, submission status, workload, time distribution)
- **Side-by-Side Comparison:** View blockers/achievements across all team members simultaneously
- **AI Chat Assistant:** Google Gemini-powered Q&A with live database context injection
- **Project Management:** CRUD operations with team member assignment
- **Profile Management:** Users can update profile info and change passwords

## Running Tests

```bash
cd backend
.venv\Scripts\activate
pytest -v
```

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://frontend-admin-d925.vercel.app |
| Backend | Render | https://team-sync-dashboard-api.onrender.com |
| Database | Neon | Serverless PostgreSQL |

## License

MIT License
