import requests
import json
from hashlib import sha256
from worker.celery_app import celery
from core.config import settings
from db.session import SessionLocal
import db.base  # This ensures all models (like Summary) are registered!
from models.article import RawArticle, ProcessedArticle
from models.intelligence import Summary, Embedding
from services.ai_service import analyze_article, generate_embedding
import dateutil.parser

# This decorator is like defining a queue worker function in BullMQ.
@celery.task(name="fetch_ai_news")
def fetch_ai_news():
    print("🚀 Starting fetch_ai_news task...")
    
    if not settings.NEWSAPI_KEY:
        print("❌ Error: No NEWSAPI_KEY found.")
        return
        
    url = f"{settings.NEWS_API_BASE}/everything"
    params = {
        "q": "Artificial Intelligence",
        "language": "en",
        "sortBy": "publishedAt",
        "apiKey": settings.NEWSAPI_KEY,
        "pageSize": 10 # Let's fetch just 10 articles for now to test
    }
    
    print(f"📡 Fetching from NewsAPI...")
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch news: {response.text}")
        return
        
    data = response.json()
    articles = data.get("articles", [])
    print(f"✅ Found {len(articles)} articles.")
    
    # Save to database (using Prisma-like interaction via SQLAlchemy)
    db = SessionLocal()
    saved_count = 0
    try:
        for article in articles:
            url = article.get("url")
            if not url:
                continue
                
            # Create a unique hash based on URL to prevent saving duplicates
            content_hash = sha256(url.encode('utf-8')).hexdigest()
            
            # Check if this URL is already in our raw_articles table
            existing = db.query(RawArticle).filter(RawArticle.url == url).first()
            if existing:
                continue # Skip if we already saved it before
                
            # Create a new row in raw_articles
            new_raw_article = RawArticle(
                url=url,
                content_hash=content_hash,
                raw_data=article
            )
            db.add(new_raw_article)
            saved_count += 1
            
        # Commit the transaction (save it permanently to Supabase)
        db.commit()
        print(f"🎉 Successfully saved {saved_count} new raw articles to the database.")
    except Exception as e:
        db.rollback()
        print(f"❌ Database error: {e}")
    finally:
        db.close()
        
    return f"Processed {len(articles)} articles, saved {saved_count}."

@celery.task(name="process_raw_articles")
def process_raw_articles():
    print("🧠 Starting AI processing of raw articles...")
    db = SessionLocal()
    
    try:
        # Find raw articles that haven't been processed yet
        unprocessed = db.query(RawArticle).outerjoin(
            ProcessedArticle, RawArticle.id == ProcessedArticle.raw_article_id
        ).filter(ProcessedArticle.id == None).limit(5).all()
        
        if not unprocessed:
            print("✨ No new articles to process!")
            return "No new articles."
            
        print(f"🔍 Found {len(unprocessed)} unprocessed articles. Sending to Gemini...")
        processed_count = 0
        
        for raw in unprocessed:
            data = raw.raw_data
            
            # Extract basic info
            title = data.get("title", "")
            description = data.get("description", "")
            content_text = data.get("content", "")
            
            # We want to give Gemini as much text as possible
            full_text = f"Title: {title}\n\nDescription: {description}\n\nContent: {content_text}"
            
            if not full_text.strip():
                continue
                
            # 1. AI Analysis
            analysis = analyze_article(full_text)
            
            # 2. Generate Embedding from the summary
            vector = generate_embedding(analysis.get("bullet_points", title))
            
            # Parse date safely
            pub_date_str = data.get("publishedAt")
            try:
                pub_date = dateutil.parser.parse(pub_date_str) if pub_date_str else None
            except:
                pub_date = None
                
            # 3. Save Processed Article
            new_processed = ProcessedArticle(
                raw_article_id=raw.id,
                title=title,
                content=full_text,
                published_date=pub_date,
                author=data.get("author")
            )
            db.add(new_processed)
            db.flush() # Flush so we can get the new_processed.id for the next tables
            
            # 4. Save Summary
            new_summary = Summary(
                processed_article_id=new_processed.id,
                bullet_points=analysis.get("bullet_points", ""),
                technical_impact=analysis.get("technical_impact", ""),
                business_impact=analysis.get("business_impact", ""),
                business_relevant=analysis.get("business_relevant", False)
            )
            db.add(new_summary)
            
            # 5. Save Embedding
            new_embedding = Embedding(
                processed_article_id=new_processed.id,
                embedding=vector
            )
            db.add(new_embedding)
            
            processed_count += 1
            
        # Commit all 5 articles to the database
        db.commit()
        print(f"🎉 Successfully processed, summarized, and embedded {processed_count} articles!")
        return f"Processed {processed_count} articles."
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error during AI processing: {e}")
        return f"Error: {e}"
    finally:
        db.close()
