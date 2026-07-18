from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from db.session import SessionLocal
from models.article import ProcessedArticle
from models.intelligence import Summary, Embedding
from models.user_profile import User, UserArticleScore
from services.ai_service import generate_embedding

# This is equivalent to `express.Router()`
router = APIRouter()

from worker.tasks import fetch_ai_news, fetch_hacker_news, process_raw_articles

@router.post("/api/refresh")
def refresh_articles():
    """
    Manually triggers the background worker to fetch and process new articles.
    """
    fetch_ai_news.delay()
    fetch_hacker_news.delay()
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
def get_category_stats(db: Session = Depends(get_db)):
    """
    Returns the total count and new count (last 24h) for each category.
    """
    try:
        # Get current time and 24 hours ago
        now = datetime.utcnow()
        twenty_four_hours_ago = now - timedelta(days=1)
        
        # Query all summaries with their article creation time and user score
        user = db.query(User).first()
        user_id = user.id if user else None

        results = (
            db.query(Summary.category, ProcessedArticle.created_at, UserArticleScore.personal_relevance_score)
            .join(ProcessedArticle, Summary.processed_article_id == ProcessedArticle.id)
            .outerjoin(UserArticleScore, (ProcessedArticle.id == UserArticleScore.processed_article_id) & (UserArticleScore.user_id == user_id))
            .all()
        )
        
        stats = {}
        for category, created_at, score in results:
            if category == 'news' and (score is None or score < 30):
                continue

            if category not in stats:
                stats[category] = {"total": 0, "new": 0}
                
            stats[category]["total"] += 1
            
            # Use tz-naive comparison if created_at is naive, or convert if timezone-aware
            if created_at:
                # If postgres returns timezone-aware datetime, convert `now` to aware
                if created_at.tzinfo is not None:
                    from datetime import timezone
                    cutoff = datetime.now(timezone.utc) - timedelta(days=1)
                    if created_at >= cutoff:
                        stats[category]["new"] += 1
                else:
                    if created_at >= twenty_four_hours_ago:
                        stats[category]["new"] += 1
                        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from sqlalchemy import func

@router.get("/api/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    try:
        user = db.query(User).first()
        user_id = user.id if user else None
        
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
        
        return {
            "brief": brief,
            "pulse": pulse,
            "trending": trending
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/articles")
def get_articles(category: Optional[str] = None, skip: int = 0, limit: int = 12, db: Session = Depends(get_db)):
    """
    Fetches the most recent processed articles along with their AI summaries.
    """
    try:
        user = db.query(User).first()
        user_id = user.id if user else None

        query = (
            db.query(ProcessedArticle, UserArticleScore)
            .join(Summary, ProcessedArticle.id == Summary.processed_article_id)
            .outerjoin(UserArticleScore, (ProcessedArticle.id == UserArticleScore.processed_article_id) & (UserArticleScore.user_id == user_id))
        )
        
        if category and category != 'all':
            query = query.filter(Summary.category == category)
            
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
    Performs a vector similarity search across the entire database!
    """
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
        
        # 3. Format the response
        response = []
        for embedding, article in results:
            response.append({
                "id": article.id,
                "title": article.title,
                "published_date": article.published_date or article.created_at,
                "url": article.raw_article.url if article.raw_article else None,
                "intelligence": {
                    "bullet_points": article.summary.bullet_points if article.summary else None,
                }
            })
            
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/articles/{article_id}")
def get_article_by_id(article_id: int, db: Session = Depends(get_db)):
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
def get_similar_articles(article_id: int, db: Session = Depends(get_db)):
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
