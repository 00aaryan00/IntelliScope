from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from db.session import SessionLocal
from models.article import ProcessedArticle
from models.intelligence import Summary, Embedding
from services.ai_service import generate_embedding

# This is equivalent to `express.Router()`
router = APIRouter()

# Dependency to get a database session for each request (like generating a Prisma client)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/articles")
def get_articles(db: Session = Depends(get_db)):
    """
    Fetches the 10 most recent processed articles along with their AI summaries.
    """
    try:
        articles = (
            db.query(ProcessedArticle)
            .join(Summary, ProcessedArticle.id == Summary.processed_article_id)
            .order_by(desc(ProcessedArticle.published_date))
            .limit(10)
            .all()
        )
        
        # Format the response exactly how the React frontend will expect it
        response = []
        for article in articles:
            # article.summary and article.raw_article are automatically available because we setup relationships in SQLAlchemy!
            response.append({
                "id": article.id,
                "title": article.title,
                "author": article.author,
                "published_date": article.published_date,
                "url": article.raw_article.url if article.raw_article else None,
                "intelligence": {
                    "bullet_points": article.summary.bullet_points if article.summary else None,
                    "business_impact": article.summary.business_impact if article.summary else None,
                    "technical_impact": article.summary.technical_impact if article.summary else None,
                    "business_relevant": article.summary.business_relevant if article.summary else False
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
                "published_date": article.published_date,
                "url": article.raw_article.url if article.raw_article else None,
                "intelligence": {
                    "bullet_points": article.summary.bullet_points if article.summary else None,
                }
            })
            
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
