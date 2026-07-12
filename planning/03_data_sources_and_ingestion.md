# AI Intelligence Dashboard - Data Sources & Ingestion Plan

## 1. Source Evaluation Strategy
Before writing any code to fetch a source, we evaluate it in this specific order to ensure reliability and minimize maintenance:
1.  **Official API:** (e.g., GitHub API, arXiv API) - Most reliable, structured JSON.
2.  **RSS Feeds:** (e.g., OpenAI Blog, TechCrunch) - Excellent for news and blogs, standardized XML.
3.  **Web Scraping / Crawling:** (e.g., specific VC websites) - Last resort. High maintenance, requires DOM parsing and handling rate limits/Cloudflare blocks.

## 2. Key Intelligence Categories & Sources
*   **AI News:** 
    *   *Sources:* OpenAI Blog, Anthropic News, TechCrunch (AI tag), DeepMind Blog. 
    *   *Method:* RSS Feeds.
*   **Research Papers:**
    *   *Sources:* arXiv (cs.AI, cs.CL, cs.LG).
    *   *Method:* arXiv API.
*   **Startup Funding:**
    *   *Sources:* TechCrunch (Fundings), Crunchbase (if paid API is available), specific VC RSS feeds.
    *   *Method:* RSS / API.
*   **Open Source & Models:**
    *   *Sources:* GitHub Trending API, Hugging Face API.
    *   *Method:* Official REST APIs.
*   **Social & Developer Ecosystem:**
    *   *Sources:* Hacker News (Firebase API), X/Twitter (via specialized APIs or Apify to avoid enormous official API costs).

## 3. Ingestion Workflow (Celery Background Jobs)
The backend uses **Celery Beat** (the Python task scheduler) to manage ingestion. The frontend never triggers a fetch.

1.  **The Scheduler:** Celery Beat wakes up every 15 minutes.
2.  **Task Dispatch:** It looks at the `rss_sources` table and dispatches individual Celery worker tasks for any source that is due for an update.
3.  **The Fetcher:** A Python worker runs `requests.get()` or an API client.
4.  **Error Handling (Crucial):** If a source fails (e.g., 429 Too Many Requests), the task is *not* abandoned. Celery places it in a retry queue with exponential backoff (retry in 1 min, then 5 mins, then 15 mins).
5.  **Standardization:** The worker parses the JSON or XML and dumps exactly 5 fields into the `raw_articles` database table: `source_id`, `original_url`, `raw_title`, `raw_body`, `published_at`.

## 4. Bypassing Scrape Protection
For sites that do not have RSS or APIs, we must be careful not to get IP-banned.
*   **User-Agent Rotation:** Python scripts will rotate standard browser User-Agents.
*   **Respecting robots.txt:** The ingestion engine will check crawl delays to avoid hammering servers.
*   **External Proxies:** If necessary for specific difficult targets, we can route Python `requests` through a rotating proxy service (like BrightData or ScraperAPI).

## 5. The Handoff to AI
Once the data is safely written to the `raw_articles` table, the Fetcher task ends. It triggers a secondary Celery task (`process_raw_article`) which picks up the text, strips out HTML tags (using BeautifulSoup), and sends the clean text to the Gemini API for the intelligence extraction outlined in the Technical Architecture plan.
