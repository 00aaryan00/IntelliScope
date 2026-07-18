# IntelliScope

IntelliScope is an AI-powered Market Intelligence and OSINT (Open Source Intelligence) dashboard. It aggregates news, funding deals, and research papers from various sources, uses Google Gemini to generate executive summaries and score their relevance, and provides a sleek React-based UI for users to track semantic "Trending Events".

## Technology Stack

- **Frontend:** React 18, Vite, TypeScript, TailwindCSS, Framer Motion
- **Backend:** Python (FastAPI), SQLAlchemy (ORM)
- **Database:** PostgreSQL with `pgvector` (for semantic clustering and search)
- **Background Jobs:** Celery & Redis (for asynchronous scraping and AI processing)
- **AI Engine:** Google Gemini API

---

## Prerequisites

Before running the project, ensure you have the following installed on your machine (specifically configured for Windows):

2. **Python** (v3.10+)
3. **PostgreSQL** (v15+) with the `pgvector` extension installed.
4. **Redis Server** (running locally on default port 6379, or via WSL/Docker on Windows)

---

## 1. Backend Setup

The backend relies on FastAPI and Celery.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend/` directory with the following variables:
   ```ini
   # PostgreSQL Connection String (Update with your local credentials)
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/intelliscope

   # Redis Connection for Celery
   REDIS_URL=redis://localhost:6379/0

   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Database Initialization:**
   Ensure your PostgreSQL server is running and you have created a database named `intelliscope`. Then run the Alembic migrations to build the tables:
   ```bash
   alembic upgrade head
   ```

---

## 2. Running the Application (Windows)

The application requires multiple processes to run simultaneously. You should open **4 separate terminal windows**.

### Terminal 1: The Backend API (FastAPI)
This runs the main web server that serves the frontend.
```bash
cd backend
.\start_api.bat 
# (Or manually: .\venv\Scripts\uvicorn main:app --reload)
```

### Terminal 2: Celery Worker
This background worker executes the web scraping and calls the Gemini API to generate summaries. It requires Redis to be running.
```bash
cd backend
.\start_worker.bat 
# (Or manually: .\venv\Scripts\celery -A worker.celery_app worker --loglevel=info --pool=solo)
```

### Terminal 3: Celery Beat (Scheduler)
This scheduler triggers the periodic scraping jobs (e.g., fetching new articles every hour).
```bash
cd backend
.\venv\Scripts\celery -A worker.celery_app beat --loglevel=info
```

### Terminal 4: The Frontend (React)
This runs the Vite development server for the UI.
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API documentation will be available at `http://localhost:8000/docs`.

---

## Architecture Notes for Developers

- **Vector Clustering:** The system uses `pgvector` and cosine similarity mathematics in `backend/api/routes.py` to cluster articles that discuss the same underlying event (e.g., matching a TechCrunch article with a HackerNews post).
- **Authentication:** Currently, the system uses a "dummy user" bypass in the API endpoints (`user = db.query(User).first()`). It is designed to easily swap in Clerk or Firebase authentication in the future without restructuring the PostgreSQL schema.
- **Background Jobs:** All long-running tasks (scraping, AI summaries) are offloaded to `worker/tasks.py` so the FastAPI endpoints remain lightning-fast.
