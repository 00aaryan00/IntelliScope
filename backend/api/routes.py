from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_, and_, case
from db.session import SessionLocal
from models.article import ProcessedArticle
from models.intelligence import Summary, Embedding
from models.user_profile import User, UserArticleScore
from api.auth import get_current_user
from models.system import SystemHealth
from services.ai_service import generate_embedding

# This is equivalent to `express.Router()`
router = APIRouter()

from worker.tasks import fetch_ai_news, fetch_hacker_news, process_raw_articles, fetch_arxiv_papers, fetch_github_trending, fetch_huggingface_models, fetch_openalex_research
import time

# Global in-memory caches (user_id -> {"expires": timestamp, "data": data})
dashboard_cache = {}
alerts_cache = {}
stats_cache = {}

# Global cache for heavy O(N^2) calculations (independent of user)
trending_events_cache = {"expires": 0, "data": []}

@router.post("/api/refresh")
def refresh_articles():
    """
    Manually triggers the background worker to fetch and process new articles.
    """
    dashboard_cache.clear()
    alerts_cache.clear()
    stats_cache.clear()
    
    fetch_ai_news.delay()
    fetch_hacker_news.delay()
    fetch_arxiv_papers.delay()
    fetch_github_trending.delay()
    fetch_huggingface_models.delay()
    fetch_openalex_research.delay()
    return {"message": "Started fetching and processing new articles from all sources in the background!"}

@router.post("/api/process_queue")
def process_queue():
    """
    Manually trigger AI processing for any raw articles waiting in the database queue.
    """
    process_raw_articles.delay()
    return {"message": "Triggered Gemini AI processing for the next batch in the queue!"}

# Dependency to get a database session for each request (like generating a Prisma client)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from typing import Optional
from datetime import datetime, timedelta

@router.get("/api/stats/categories")
def get_category_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns the total count and new count (last 24h) for each category.
    """
    user_id = current_user.id if current_user else None
    
    # Check cache
    if user_id in stats_cache and time.time() < stats_cache[user_id]["expires"]:
        return stats_cache[user_id]["data"]
        
    try:
        now = datetime.utcnow()
        twenty_four_hours_ago = now - timedelta(days=1)
        
        user = current_user

        from sqlalchemy import case, or_, and_, func

        results = (
            db.query(
                Summary.category,
                func.count().label('total'),
                func.sum(case((ProcessedArticle.created_at >= twenty_four_hours_ago, 1), else_=0)).label('new_count')
            )
            .join(ProcessedArticle, Summary.processed_article_id == ProcessedArticle.id)
            .outerjoin(UserArticleScore, (ProcessedArticle.id == UserArticleScore.processed_article_id) & (UserArticleScore.user_id == user_id))
            .filter(
                or_(
                    Summary.category != 'news',
                    UserArticleScore.personal_relevance_score >= 30,
                    and_(
                        UserArticleScore.personal_relevance_score == None,
                        ProcessedArticle.created_at >= twenty_four_hours_ago
                    )
                )
            )
            .group_by(Summary.category)
            .all()
        )
        
        stats = {}
        for category, total, new_count in results:
            stats[category] = {
                "total": total,
                "new": new_count if new_count else 0
            }
            
        stats_cache[user_id] = {
            "data": stats,
            "expires": time.time() + 300
        }
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from sqlalchemy import func
import math

def cosine_similarity(v1, v2):
    if v1 is None or v2 is None: return 0
    dot_product = sum(a*b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a*a for a in v1))
    magnitude2 = math.sqrt(sum(b*b for b in v2))
    if magnitude1 * magnitude2 == 0:
        return 0
    return dot_product / (magnitude1 * magnitude2)

@router.get("/api/dashboard")
def get_dashboard_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id if current_user else None

    if user_id in dashboard_cache and time.time() < dashboard_cache[user_id]["expires"]:
        return dashboard_cache[user_id]["data"]
        
    try:
        user = current_user
        
        # 1. Today's AI Brief: Top 3 articles by personal score
        brief_query = (
            db.query(ProcessedArticle, UserArticleScore, Summary)
            .join(Summary, ProcessedArticle.id == Summary.processed_article_id)
            .outerjoin(UserArticleScore, (ProcessedArticle.id == UserArticleScore.processed_article_id) & (UserArticleScore.user_id == user_id))
            .order_by(desc(UserArticleScore.personal_relevance_score), desc(ProcessedArticle.published_date))
            .limit(3)
            .all()
        )
        
        brief = []
        for article, score, summary in brief_query:
            brief.append({
                "id": str(article.id),
                "title": article.title,
                "summary": summary.bullet_points if summary else "No summary available",
                "score": score.personal_relevance_score if score else 0
            })
            
        # 2. Market Pulse: Count new research and models in last 24h
        now = datetime.utcnow()
        if now.tzinfo is not None:
             from datetime import timezone
             now = datetime.now(timezone.utc)
        twenty_four_hours_ago = now - timedelta(days=1)
        
        # We assume published_date or created_at for 24h checks
        pulse_results = (
            db.query(Summary.category)
            .join(ProcessedArticle, Summary.processed_article_id == ProcessedArticle.id)
            .filter(ProcessedArticle.created_at >= twenty_four_hours_ago)
            .all()
        )
        
        new_funding = sum(1 for r in pulse_results if r[0] == 'funding')
        new_papers = sum(1 for r in pulse_results if r[0] == 'research')
        model_releases = sum(1 for r in pulse_results if r[0] == 'models')
        
        pulse = {
            "fundingDeals": new_funding,
            "newPapers": new_papers,
            "modelReleases": model_releases
        }
        
        # 3. Trending Topics: user focus tags
        profile = user.profile if user else None
        trending = profile.focus_tags if profile and profile.focus_tags else ["AI", "Startups", "Technology"]
        
        # 4. Semantic Clustering: Find trending events in last 48h
        # Use a global cache to avoid running O(N^2) math for every user connection
        global trending_events_cache
        if time.time() > trending_events_cache["expires"]:
            forty_eight_hours_ago = now - timedelta(days=2)
            articles_with_embeddings = (
                db.query(ProcessedArticle, Embedding)
                .join(Embedding, ProcessedArticle.id == Embedding.processed_article_id)
                .filter(ProcessedArticle.created_at >= forty_eight_hours_ago)
                .order_by(desc(ProcessedArticle.created_at))
                .limit(50) # Limit to 50 articles to bound O(N^2) calculations (max 2500 iterations instead of millions)
                .all()
            )
            
            clusters = []
            visited = set()
            
            for i, (art1, emb1) in enumerate(articles_with_embeddings):
                if i in visited:
                    continue
                
                current_cluster = [art1]
                visited.add(i)
                
                for j, (art2, emb2) in enumerate(articles_with_embeddings):
                    if j in visited:
                        continue
                    # If embeddings are highly similar, they are the same event
                    sim = cosine_similarity(emb1.embedding, emb2.embedding)
                    if sim > 0.85:
                        current_cluster.append(art2)
                        visited.add(j)
                        
                if len(current_cluster) > 1:
                    clusters.append(current_cluster)
            
            # Format clusters for frontend
            trending_events = []
            for cluster in clusters:
                lead_article = cluster[0]
                sources = list(set([a.author for a in cluster if a.author] + [lead_article.raw_article.url.split('/')[2] if lead_article.raw_article else "Web"]))
                trending_events.append({
                    "id": str(lead_article.id),
                    "title": lead_article.title,
                    "sources": sources,
                    "articleCount": len(cluster)
                })
                
            # Sort by most articles in cluster
            trending_events.sort(key=lambda x: x["articleCount"], reverse=True)
            
            trending_events_cache["data"] = trending_events[:3]
            trending_events_cache["expires"] = time.time() + 600 # Cache for 10 minutes
        
        response_data = {
            "brief": brief,
            "pulse": pulse,
            "trending": trending,
            "trending_events": trending_events_cache["data"]
        }
        
        dashboard_cache[user_id] = {
            "data": response_data,
            "expires": time.time() + 300
        }
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/articles")
def get_articles(category: Optional[str] = None, skip: int = 0, limit: int = 12, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches the most recent processed articles along with their AI summaries.
    """
    try:
        user = current_user
        user_id = user.id if user else None

        query = (
            db.query(ProcessedArticle, UserArticleScore)
            .join(Summary, ProcessedArticle.id == Summary.processed_article_id)
            .outerjoin(UserArticleScore, (ProcessedArticle.id == UserArticleScore.processed_article_id) & (UserArticleScore.user_id == user_id))
        )
        
        if category and category != 'all':
            query = query.filter(Summary.category == category)
            
        # For 'news' specifically, filter out low-relevance items, but ALLOW unscored items (None) 
        # ONLY IF they were fetched in the last 24 hours. This prevents the Cold Start user 
        # from seeing hundreds of old unscored articles, and only shows them the latest day's news.
        if category == 'news':
            from datetime import datetime, timedelta
            now = datetime.utcnow()
            if now.tzinfo is not None:
                 from datetime import timezone
                 now = datetime.now(timezone.utc)
            twenty_four_hours_ago = now - timedelta(days=1)
            
            query = query.filter(
                or_(
                    UserArticleScore.personal_relevance_score >= 30,
                    and_(
                        UserArticleScore.personal_relevance_score == None,
                        ProcessedArticle.created_at >= twenty_four_hours_ago
                    )
                )
            )
            
        results = query.order_by(
            func.date(ProcessedArticle.published_date).desc(), 
            desc(UserArticleScore.personal_relevance_score),
            desc(Summary.business_relevant), 
            desc(ProcessedArticle.published_date)
        ).offset(skip).limit(limit).all()
        
        # Format the response exactly how the React frontend will expect it
        response = []
        for article, score in results:
            # article.summary and article.raw_article are automatically available because we setup relationships in SQLAlchemy!
            response.append({
                "id": article.id,
                "title": article.title,
                "author": article.author,
                "published_date": article.published_date or article.created_at,
                "url": article.raw_article.url if article.raw_article else None,
                "intelligence": {
                    "bullet_points": article.summary.bullet_points if article.summary else None,
                    "business_impact": article.summary.business_impact if article.summary else None,
                    "technical_impact": article.summary.technical_impact if article.summary else None,
                    "business_relevant": article.summary.business_relevant if article.summary else False,
                    "category": article.summary.category if article.summary else "news",
                    "personal_score": score.personal_relevance_score if score else 0,
                    "relevance_category": score.relevance_category if score else None,
                    "relevance_reason": score.relevance_reason if score else None
                }
            })
            
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/search")
def search_articles(q: str = Query(..., description="The semantic search query"), db: Session = Depends(get_db)):
    """
    Performs a vector similarity search across the entire database and generates a RAG answer.
    """
    from services.ai_service import generate_rag_answer
    try:
        # 1. Turn the user's search string into a 768-dimension mathematical vector using Gemini
        query_vector = generate_embedding(q)
        
        # 2. Use pgvector's L2 distance operator (<->) to find the closest vectors in the database
        # We order by distance ascending (closest meaning lowest distance first)
        results = (
            db.query(Embedding, ProcessedArticle)
            .join(ProcessedArticle, Embedding.processed_article_id == ProcessedArticle.id)
            .order_by(Embedding.embedding.l2_distance(query_vector))
            .limit(5)
            .all()
        )
        
        # 3. Format the response and build context for RAG
        response_articles = []
        context_parts = []
        for embedding, article in results:
            response_articles.append({
                "id": article.id,
                "title": article.title,
                "published_date": article.published_date or article.created_at,
                "url": article.raw_article.url if article.raw_article else None,
                "intelligence": {
                    "bullet_points": article.summary.bullet_points if article.summary else None,
                }
            })
            
            # Build context for the LLM
            context_parts.append(f"Title: {article.title}\nContent Snippet: {article.summary.bullet_points if article.summary else ''}")
            
        context = "\n\n".join(context_parts)
        
        # 4. Generate the RAG Answer
        answer = generate_rag_answer(q, context) if context else "I couldn't find any relevant intelligence in the database to answer this question."
            
        return {
            "answer": answer,
            "results": response_articles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/articles/{article_id}")
def get_article_by_id(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches a single article by ID along with its full content and AI summary.
    """
    try:
        article = (
            db.query(ProcessedArticle)
            .filter(ProcessedArticle.id == article_id)
            .first()
        )
        
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
            
        return {
            "id": article.id,
            "title": article.title,
            "author": article.author,
            "published_date": article.published_date or article.created_at,
            "content": article.content,
            "url": article.raw_article.url if article.raw_article else None,
            "intelligence": {
                "bullet_points": article.summary.bullet_points if article.summary else None,
                "business_impact": article.summary.business_impact if article.summary else None,
                "technical_impact": article.summary.technical_impact if article.summary else None,
                "business_relevant": article.summary.business_relevant if article.summary else False
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/articles/{article_id}/similar")
def get_similar_articles(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Finds the top 2 most semantically similar articles using pgvector.
    """
    try:
        # Get the embedding for the current article
        target_embedding = (
            db.query(Embedding)
            .filter(Embedding.processed_article_id == article_id)
            .first()
        )
        
        if not target_embedding:
            return []
            
        # Find closest embeddings (excluding the current article itself)
        results = (
            db.query(Embedding, ProcessedArticle)
            .join(ProcessedArticle, Embedding.processed_article_id == ProcessedArticle.id)
            .filter(Embedding.processed_article_id != article_id)
            .order_by(Embedding.embedding.l2_distance(target_embedding.embedding))
            .limit(2)
            .all()
        )
        
        response = []
        for embedding, article in results:
            response.append({
                "id": article.id,
                "title": article.title,
                "published_date": article.published_date or article.created_at,
                "url": article.raw_article.url if article.raw_article else None,
                "intelligence": {
                    "bullet_points": article.summary.bullet_points if article.summary else None,
                    "business_relevant": article.summary.business_relevant if article.summary else False,
                    "business_impact": article.summary.business_impact if article.summary else None
                }
            })
            
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches high-impact alerts: 
    1. Articles with score >= 80 in last 48h
    2. Trending events (clusters >= 3) in last 48h
    """
    user_id = current_user.id if current_user else None

    if user_id in alerts_cache and time.time() < alerts_cache[user_id]["expires"]:
        return alerts_cache[user_id]["data"]
        
    try:
        user = current_user
        
        now = datetime.utcnow()
        if now.tzinfo is not None:
             from datetime import timezone
             now = datetime.now(timezone.utc)
        forty_eight_hours_ago = now - timedelta(days=2)
        
        alerts = []
        
        # 1. High Score Articles
        high_score_query = (
            db.query(ProcessedArticle, UserArticleScore)
            .join(UserArticleScore, ProcessedArticle.id == UserArticleScore.processed_article_id)
            .filter(ProcessedArticle.created_at >= forty_eight_hours_ago)
            .filter(UserArticleScore.user_id == user_id)
            .filter(UserArticleScore.personal_relevance_score >= 80)
            .order_by(desc(ProcessedArticle.created_at))
            .all()
        )
        
        for article, score in high_score_query:
            alerts.append({
                "id": str(article.id),
                "type": "high_score",
                "title": article.title,
                "score": score.personal_relevance_score,
                "timestamp": (article.published_date or article.created_at).isoformat()
            })
            
        # 2. Trending Clusters
        articles_with_embeddings = (
            db.query(ProcessedArticle, Embedding)
            .join(Embedding, ProcessedArticle.id == Embedding.processed_article_id)
            .filter(ProcessedArticle.created_at >= forty_eight_hours_ago)
            .order_by(desc(ProcessedArticle.created_at))
            .all()
        )
        
        clusters = []
        visited = set()
        
        for i, (art1, emb1) in enumerate(articles_with_embeddings):
            if i in visited: continue
            current_cluster = [art1]
            visited.add(i)
            for j, (art2, emb2) in enumerate(articles_with_embeddings):
                if j in visited: continue
                sim = cosine_similarity(emb1.embedding, emb2.embedding)
                if sim > 0.85:
                    current_cluster.append(art2)
                    visited.add(j)
            
            if len(current_cluster) >= 3:
                clusters.append(current_cluster)
                
        for cluster in clusters:
            lead_article = cluster[0]
            sources = list(set([a.author for a in cluster if a.author] + [lead_article.raw_article.url.split('/')[2] if lead_article.raw_article else "Web"]))
            alerts.append({
                "id": str(lead_article.id),
                "type": "trending_event",
                "title": lead_article.title,
                "articleCount": len(cluster),
                "sources": sources,
                "timestamp": (lead_article.published_date or lead_article.created_at).isoformat()
            })
            
        # Sort combined alerts by recency
        alerts.sort(key=lambda x: x["timestamp"], reverse=True)
        
        alerts_cache[user_id] = {
            "data": alerts,
            "expires": time.time() + 300
        }
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/system/health")
def get_system_health(db: Session = Depends(get_db)):
    """
    Returns the latest health status of all system components.
    """
    try:
        health_records = db.query(SystemHealth).all()
        return [
            {
                "component_name": record.component_name,
                "status": record.status,
                "message": record.message,
                "metrics": record.metrics,
                "last_run": record.last_run.isoformat() if record.last_run else None
            }
            for record in health_records
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
