# AI Intelligence Dashboard - Feature Workflows & Logic

This document outlines the internal logic for the platform's core AI and search features.

## 1. The Intelligence Scoring System (Priority Ranking)
Instead of showing a chronological firehose, every incoming "Intelligence Object" is scored by Gemini during ingestion and categorized into one of five buckets: **Critical, High, Worth Reading, Low Priority, Noise**.

**The Scoring Prompt Logic:**
The LLM evaluates the text based on:
*   *Technical Innovation:* Is this a major version release (GPT-5) or a minor patch?
*   *Market Impact:* Did a top-tier startup raise >$50M, or is it a small angel round?
*   *Source Credibility:* Is this directly from OpenAI's blog, or a random medium post?
*   *Output:* Gemini returns an integer score (0-100) and a Priority Category.
*   *Action:* If categorized as "Noise", it is hidden from the main feed entirely.

## 2. Business Relevance Engine
The dashboard is personalized for your specific businesses (e.g., Viorant, Miraya).

**The Workflow:**
1.  During ingestion, a system prompt is injected into the Gemini call: *"The user operates 'Viorant' (an AI agency) and 'Miraya' (an e-commerce brand). Evaluate if this article impacts either business."*
2.  Gemini returns a structured JSON:
    ```json
    {
      "business_relevant": true,
      "entities_affected": ["Viorant"],
      "relevance_reason": "The release of advanced reasoning models allows Viorant to build more autonomous agents for their clients."
    }
    ```
3.  This data powers the "Business Relevance" badge and filter in the UI.

## 3. The Daily AI Brief Generator
Every morning at 8:00 AM, the system generates an executive summary.

**The Workflow:**
1.  A Celery task runs a query: `SELECT * FROM processed_articles WHERE priority IN ('Critical', 'High') AND created_at >= [yesterday]`.
2.  All matching articles are combined into a single large prompt.
3.  Gemini is instructed: *"Write a 1-minute executive morning brief summarizing these events. Group similar events together. Highlight the business impact."*
4.  The output is saved and displayed at the very top of the Dashboard.

## 4. Global Semantic Search (pgvector)
When a user uses the search bar, they aren't restricted to exact keyword matches.

**The Workflow:**
1.  User searches: *"Which AI infrastructure startups raised funding recently?"*
2.  The Frontend sends the query to the FastAPI backend.
3.  FastAPI sends the query to Gemini to generate a Search Embedding Vector.
4.  FastAPI runs a SQL query using `pgvector`: `SELECT * FROM embeddings ORDER BY embedding <=> [Search Vector] LIMIT 10;`
5.  The database instantly returns the mathematically closest articles (e.g., it will return an article about "CoreWeave securing $1B", even if the words "infrastructure" or "raised funding" aren't explicitly in the title).

## 5. The "Why It Matters" Pipeline
For every single article, paper, or funding round, the user should never have to guess the impact.

**The Workflow:**
During the initial extraction, Gemini is forced (via Structured Output/JSON Schema) to provide three specific fields alongside the summary:
1.  `summary_bullets` (max 5)
2.  `technical_impact` (1 sentence)
3.  `business_impact` (1 sentence)

These fields map directly to the "Intelligence Detail Page" UI components described in the UI/UX Plan.
