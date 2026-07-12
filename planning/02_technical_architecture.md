# AI Intelligence Dashboard - Technical Architecture Plan

## 1. System Overview & Tech Stack
To build a highly scalable, "Bloomberg Terminal for AI" that handles continuous data ingestion, AI processing, and rapid search, we will use a modern, decoupled tech stack:

*   **Frontend:** React (Vite) + TypeScript + Tailwind CSS + Shadcn UI. (A fast, lightweight Single Page Application since we don't need SEO. Hosted as static files, making deployment incredibly easy).
*   **Backend API:** FastAPI (Python). (Python is far superior to Node.js for AI projects. It has better libraries for data scraping, text processing, and AI integrations).
*   **Background Jobs:** Celery + Celery Beat. (The most robust way to schedule tasks in Python. It will handle waking up every 15 minutes to fetch RSS feeds).
*   **Database (Primary & Vector):** PostgreSQL + `pgvector` extension.
*   **Cache / Queue:** Redis (Used by Celery to manage the task queues and by FastAPI to cache API responses).
*   **AI Integration:** Google Gemini API.
*   **Storage & Monitoring:** Supabase Storage (for any files/images) and Prometheus/Grafana (for tracking system health).

## 2. The Data Ingestion Pipeline (The Engine)
As outlined in the PRD, we must separate data fetching from user reading. The UI will *never* wait for an RSS feed or LLM call.

1.  **Scheduler (Cron):** A background worker wakes up every 15 minutes.
2.  **Fetch & Raw Storage:** Pulls RSS/APIs (OpenAI, Arxiv, TechCrunch, etc.) and saves the exact raw JSON/HTML into a `raw_articles` table.
3.  **Deduplication (3 Layers):**
    *   *Layer 1 (URL):* Same URL? Skip.
    *   *Layer 2 (Content Hash):* Same SHA256 body? Skip.
    *   *Layer 3 (Semantic AI):* Generates embeddings. If Cosine Similarity > 0.95 with an existing event, merge it into a single "Event" record rather than creating a new article.
4.  **AI Processing:** Sends cleaned text to Gemini to extract:
    *   Category, Companies, Tags.
    *   Generate a 5-bullet summary.
    *   Calculate Business Relevance & Intelligence Score.
5.  **Final Storage:** Saves the processed data into `processed_articles`, `summaries`, and `embeddings` tables.

## 3. Database Schema Strategy
Beginners put everything in one `articles` table. We will use a production-grade relational model:

*   `rss_sources`: Defines where data comes from (URL, frequency, category).
*   `raw_articles`: The messy, original fetched data.
*   `processed_articles`: Cleaned text with ads/footers removed.
*   `events`: The core entity. Multiple articles about the "GPT-5 Release" link to one single Event.
*   `embeddings`: Stores the vector math for the semantic search.
*   `summaries`: The AI-generated bullet points.
*   `entities` (Companies, People, Tags): For building relationships (e.g., linking a founder to a startup and a news article).

## 4. Frontend Architecture
*   **State Management:** React Context or Zustand for lightweight global state (User Preferences, Active Filters, Saved Items).
*   **Data Fetching:** SWR or React Query to ensure the dashboard feels instantaneous and caches data locally on the client.
*   **Component Architecture:** highly modular. We will build an `IntelligenceObjectCard` that accepts a standardized JSON prop, allowing it to render a News item, a Research Paper, or a Funding Round seamlessly.

## 5. Caching Strategy
*   **LLM Cost Control:** Users read from the Database, *never* directly from the LLM. The LLM runs exactly once per article during ingestion.
*   **Dashboard Cache:** The "Today's AI Brief" and "Trending" sections are heavily cached in Redis and invalidated only when a new "Critical" or "High" priority item is processed.

## 6. Global Semantic Search
When a user searches "Which Indian startups raised money?", it doesn't do a slow SQL `LIKE` query. It converts the query into an embedding using Gemini, and uses `pgvector` to find the mathematically closest matches in the database across all modules instantly.
