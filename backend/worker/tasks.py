import requests
import json
from hashlib import sha256
from worker.celery_app import celery
from core.config import settings
from db.session import SessionLocal
import db.base  # This ensures all models (like Summary) are registered!
from models.article import RawArticle, ProcessedArticle
from models.intelligence import Summary, Embedding
from models.user_profile import User, InterestProfile, BusinessEntity, UserArticleScore
from services.ai_service import analyze_article, generate_embedding
import dateutil.parser

# This decorator is like defining a queue worker function in BullMQ.
@celery.task(name="fetch_ai_news")
def fetch_ai_news():
    print("[TASK] Starting fetch_ai_news task...")
    
    if not settings.NEWSAPI_KEY:
        print("[ERROR] Error: No NEWSAPI_KEY found.")
        return
        
    url = f"{settings.NEWS_API_BASE}/everything"
    params = {
        "q": "Artificial Intelligence",
        "language": "en",
        "sortBy": "publishedAt",
        "apiKey": settings.NEWSAPI_KEY,
        "pageSize": 10 # Let's fetch just 10 articles for now to test
    }
    
    print(f"[NETWORK] Fetching from NewsAPI...")
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"[ERROR] Failed to fetch news: {response.text}")
        return
        
    data = response.json()
    articles = data.get("articles", [])
    print(f"[SUCCESS] Found {len(articles)} articles.")
    
    # Save to database (using Prisma-like interaction via SQLAlchemy)
    db = SessionLocal()
    saved_count = 0
    try:
        for article in articles:
            url = article.get("url")
            if not url:
                continue
                
            # Create a unique hash based on title + URL to prevent saving duplicates
            # (as defined in Deliverable 3, Section 6.3)
            title = article.get("title", "")
            content_hash_input = f"{title}-{url}"
            content_hash = sha256(content_hash_input.encode('utf-8')).hexdigest()
            
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
        print(f"[SUCCESS] Successfully saved {saved_count} new raw articles to the database.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database error: {e}")
    finally:
        db.close()
        
    # Automatically trigger the AI processing task now that we have new raw articles!
    if saved_count > 0:
        print(f"[LINK] Triggering process_raw_articles task...")
        process_raw_articles.delay()
        
    return f"Processed {len(articles)} articles, saved {saved_count}."

@celery.task(name="fetch_hacker_news")
def fetch_hacker_news():
    print("[TASK] Starting fetch_hacker_news task...")
    
    if not settings.HACKERNEWS_API_BASE:
        print("[ERROR] Error: No HACKERNEWS_API_BASE found.")
        return
        
    print(f"[NETWORK] Fetching from HackerNews...")
    response = requests.get(f"{settings.HACKERNEWS_API_BASE}/topstories.json")
    
    if response.status_code != 200:
        print(f"[ERROR] Failed to fetch HN top stories: {response.text}")
        return
        
    story_ids = response.json()[:5] # Just top 5 for now
    
    db = SessionLocal()
    saved_count = 0
    try:
        for story_id in story_ids:
            story_res = requests.get(f"{settings.HACKERNEWS_API_BASE}/item/{story_id}.json")
            if story_res.status_code != 200:
                continue
            
            story = story_res.json()
            url = story.get("url")
            # If it's an Ask HN or similar, url might be missing, so use the HN url
            if not url:
                url = f"https://news.ycombinator.com/item?id={story_id}"
                
            # For HN, title is the best deduplication key since multiple URLs might exist for same story
            title = story.get("title", "")
            content_hash_input = f"{title}-{url}"
            content_hash = sha256(content_hash_input.encode('utf-8')).hexdigest()
            
            existing = db.query(RawArticle).filter(RawArticle.url == url).first()
            if existing:
                continue
                
            # For Hacker News, content is often just the title since we can't scrape the full url easily yet.
            new_raw_article = RawArticle(
                url=url,
                content_hash=content_hash,
                raw_data={
                    "title": story.get("title"),
                    "description": f"Trending on Hacker News by {story.get('by')}",
                    "content": story.get("title"), 
                    "publishedAt": None,
                    "author": story.get("by")
                }
            )
            db.add(new_raw_article)
            saved_count += 1
            
        db.commit()
        print(f"[SUCCESS] Successfully saved {saved_count} new raw HN articles to the database.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database error: {e}")
    finally:
        db.close()
        
    if saved_count > 0:
        print(f"[LINK] Triggering process_raw_articles task...")
        process_raw_articles.delay()
        
    return f"Processed {len(story_ids)} HN stories, saved {saved_count}."


@celery.task(name="process_raw_articles")
def process_raw_articles():
    print("[TASK] Starting AI processing of raw articles...")
    db = SessionLocal()
    
    try:
        # Find raw articles that haven't been processed yet
        unprocessed = db.query(RawArticle).outerjoin(
            ProcessedArticle, RawArticle.id == ProcessedArticle.raw_article_id
        ).filter(ProcessedArticle.id == None).limit(5).all()
        
        if not unprocessed:
            print("[INFO] No new articles to process!")
            return "No new articles."
            
        print(f"[SEARCH] Found {len(unprocessed)} unprocessed articles. Sending to Gemini...")
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
                business_relevant=analysis.get("business_relevant", False),
                category=analysis.get("category", "news"),
                entities=analysis.get("entities", []),
                sentiment=analysis.get("sentiment", "Neutral"),
                action_hint=analysis.get("action_hint", "Informational Only")
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
        print(f"[SUCCESS] Successfully processed, summarized, and embedded {processed_count} articles!")
        
        # Enqueue scoring for the processed articles
        for raw in unprocessed:
            # Re-fetch the processed article to get the ID
            processed = db.query(ProcessedArticle).filter(ProcessedArticle.raw_article_id == raw.id).first()
            if processed:
                score_item.delay(processed.id)
                
        return f"Processed {processed_count} articles."
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during AI processing: {e}")
        return f"Error: {e}"
    finally:
        db.close()

@celery.task(name="score_item")
def score_item(processed_article_id: int):
    print(f"[TASK] Scoring article {processed_article_id} for all users...")
    db = SessionLocal()
    try:
        article = db.query(ProcessedArticle).filter(ProcessedArticle.id == processed_article_id).first()
        if not article or not article.summary:
            return
            
        users = db.query(User).all()
        if not users:
            dummy_user = User(email="founder@viorant.com")
            db.add(dummy_user)
            db.flush()
            dummy_profile = InterestProfile(user_id=dummy_user.id, focus_tags=["AI", "Agentic", "LLM", "Robotics"])
            db.add(dummy_profile)
            db.flush()
            dummy_biz = BusinessEntity(profile_id=dummy_profile.id, name="Viorant", competitors=["OpenAI", "Anthropic", "Google"], target_sectors=["Healthcare", "Fintech"])
            db.add(dummy_biz)
            db.commit()
            users = [dummy_user]

        for user in users:
            score_components = {
                "Competitor": 0,
                "Target Sector": 0,
                "Interest Match": 0,
                "Geographic Relevance": 0
            }
            categories = []
            reasons = []
            
            profile = user.profile
            if profile:
                entities_list = article.summary.entities or []
                locations_list = article.summary.locations or []
                text_to_search = f"{article.title} {article.content} {' '.join(entities_list)} {' '.join(locations_list)}".lower()
                
                # Geography (Max 10%)
                preferred_countries = profile.preferred_locations or []
                for location in locations_list:
                    for pref_country in preferred_countries:
                        if pref_country.lower() == location.lower() or pref_country.lower() in location.lower():
                            if score_components["Geographic Relevance"] == 0:
                                score_components["Geographic Relevance"] = 10
                                categories.append("Geographic Relevance")
                                reasons.append(f"Region: {pref_country}")
                
                # Interest Tags (Max 15%)
                for tag in profile.focus_tags:
                    if tag.lower() in text_to_search:
                        if score_components["Interest Match"] == 0:
                            score_components["Interest Match"] = 15
                            categories.append("Interest Match")
                        reasons.append(f"Interest: {tag}")
                        
                # Business Rules
                for biz in profile.entities:
                    # Competitors (Max 45%)
                    for comp in biz.competitors:
                        if comp.lower() in text_to_search:
                            if score_components["Competitor"] == 0:
                                score_components["Competitor"] = 45
                                categories.append("Competitor")
                            reasons.append(f"Competitor: {comp}")
                    
                    # Target Sectors (Max 30%)
                    for sector in biz.target_sectors:
                        if sector.lower() in text_to_search:
                            if score_components["Target Sector"] == 0:
                                score_components["Target Sector"] = 30
                                categories.append("Target Sector")
                            reasons.append(f"Sector: {sector}")
                            
            score = sum(score_components.values())
            
            category = categories[0] if len(categories) == 1 else ("Multiple Matches" if len(categories) > 1 else None)
            reason = " | ".join(reasons) if reasons else None
            
            if article.summary.business_relevant and score == 0:
                score = 20
                category = "General Industry"
                reason = "AI flagged as globally business relevant"
            
            existing_score = db.query(UserArticleScore).filter(
                UserArticleScore.user_id == user.id,
                UserArticleScore.processed_article_id == article.id
            ).first()
            
            if existing_score:
                existing_score.personal_relevance_score = score
                existing_score.relevance_category = category
                existing_score.relevance_reason = reason
            else:
                new_score = UserArticleScore(
                    user_id=user.id,
                    processed_article_id=article.id,
                    personal_relevance_score=score,
                    relevance_category=category,
                    relevance_reason=reason
                )
                db.add(new_score)
            
        db.commit()
        print(f"[SUCCESS] Scored article {processed_article_id}")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error scoring item: {e}")
    finally:
        db.close()
