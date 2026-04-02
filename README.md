# AlertIQ — Incident Intelligence Platform

## What it does
AlertIQ lets engineering teams paste production alerts/logs and get instant AI analysis — root cause, severity, and fix steps. The key differentiator is **team memory**: every new incident is compared against your historical incidents before calling the AI, so the LLM knows if this has happened before.

## Stack
- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Frontend**: React Vite + TypeScript
- **AI**: OpenAI GPT-4o-mini via REST API

---

## Setup

### 1. Database
- Open PGAdmin, create a database named `AlertIQ`
- Open Query Tool and run `init_db.sql`
- Copy the UUID from the `users` table (dev@alertiq.com) for the next step

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Edit `.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/AlertIQ
OPENAI_API_KEY=sk-your-key-here
DEFAULT_USER_ID=paste-uuid-from-users-table
```
Run:
```bash
uvicorn app.main:app --reload
```
API runs at http://localhost:8000
Swagger docs at http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at http://localhost:5173

---

## How the differentiator works
When you submit a new incident, the backend:
1. Queries PostgreSQL for past incidents with similar keywords
2. Injects up to 3 similar past incidents into the LLM prompt
3. The AI can now say "this looks like the DB connection issue from 2 weeks ago"
4. Everything is saved — analysis, chat history, and the full prompt sent (for observability)

This is what ChatGPT cannot do — it has no memory of your team's incidents.
