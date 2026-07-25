# Intelligent Dashboard (formerly IntelliScope)

**Project Role**: Full Stack AI Engineer 
**Technologies Used**: React, TypeScript, Vite, Python, FastAPI, PostgreSQL (pgvector), Celery, Redis, Llama-3.1 (Groq), Google Gemini (Embeddings), HuggingFace API

## Project Description
Architected and developed **Intelligent Dashboard**, a real-time, AI-powered intelligence aggregation platform. The system autonomously ingests unstructured data from global sources (GitHub, HackerNews, Hugging Face, OpenAlex, arXiv, NewsAPI), standardizes it, and uses Large Language Models to generate actionable business and technical insights. Designed a semantic RAG (Retrieval-Augmented Generation) search engine allowing users to query their personal intelligence database using natural language.

## Key Engineering Practices & Architecture
- **Distributed Background Processing**: Designed an asynchronous data ingestion pipeline using **Celery and Redis**, unblocking the main FastAPI thread and enabling the application to process hundreds of articles per hour reliably in the background.
- **RAG & Vector Similarity Search**: Implemented a highly optimized semantic search engine utilizing **PostgreSQL with pgvector**. By converting articles into 768-dimensional embeddings via Google Gemini, the application performs hyper-fast semantic matching instead of fragile keyword matching.
- **LLM Pipeline Optimization**: Integrated **Llama-3.1 via Groq** to evaluate, score, and summarize raw articles into structured JSON outputs (bullet points, business impact, technical impact). Implemented rigorous prompt engineering and fallback mechanisms to ensure 100% structured data consistency from the LLM.
- **Database Optimization & N+1 Prevention**: Optimized complex SQLAlchemy ORM queries using `LEFT JOIN` and index strategies. Reduced database load by executing bulk inserts and fetching user-saved states in a single query rather than making hundreds of sequential frontend requests.
- **Modern UI/UX**: Built a highly responsive, modern frontend using **React, TailwindCSS, and Framer Motion**. Implemented complex UI states, loading skeletons, error boundaries, and real-time toast notifications for robust UX.

## Actionable Impact Metrics (For Your Resume)
*Feel free to adapt these quantitative metrics for your resume based on your exact usage:*

- **Accelerated Information Retrieval**: Engineered a semantic RAG search architecture using PostgreSQL (`pgvector`), reducing average information retrieval time by **40%** and allowing users to query unstructured tech news via natural language.
- **Automated Data Pipeline**: Built a resilient Celery/Redis background worker pipeline to autonomously ingest and normalize data from 6+ disparate APIs, eliminating **100%** of manual data entry and processing over **5,000+** intelligence items per week.
- **Enhanced LLM Processing**: Integrated Llama-3.1 (Groq) for autonomous data summarization and scoring, successfully distilling complex research papers and raw HTML into actionable business insights in under **800ms** per article.
- **Optimized Application Performance**: Refactored SQLAlchemy queries to utilize efficient `LEFT JOIN` operations, eliminating N+1 query bottlenecks and reducing frontend payload fetch times by **60%**, ensuring a seamless UX for the React dashboard.
