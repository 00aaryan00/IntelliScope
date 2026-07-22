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
from models.system import SystemHealth
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func

def update_health_status(component: str, status: str, message: str = None, metrics: dict = None):
    db = SessionLocal()
    try:
        stmt = insert(SystemHealth).values(
            component_name=component,
            status=status,
            message=message,
            metrics=metrics
        ).on_conflict_do_update(
            index_elements=['component_name'],
            set_={
                'status': status,
                'message': message,
                'metrics': metrics,
                'last_run': func.now()
            }
        )
        db.execute(stmt)
        db.commit()
    except Exception as e:
        print(f"[ERROR] Could not update system health for {component}: {e}")
    finally:
        db.close()

# This decorator is like defining a queue worker function in BullMQ.
@celery.task(name="fetch_ai_news")
def fetch_ai_news():
    print("[TASK] Starting fetch_ai_news task...")
    update_health_status("NewsAPI", "running", "Fetching latest AI news...")
    
    if not settings.NEWSAPI_KEY:
        print("[ERROR] Error: No NEWSAPI_KEY found.")
        update_health_status("NewsAPI", "error", "No NEWSAPI_KEY found")
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
        update_health_status("NewsAPI", "error", f"API Error: {response.text}")
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
        
    update_health_status(
        "NewsAPI", 
        "healthy", 
        f"Processed {len(articles)} articles, saved {saved_count}.",
        metrics={"Fetched": len(articles), "Saved": saved_count}
    )
    return f"Processed {len(articles)} articles, saved {saved_count}."

@celery.task(name="fetch_hacker_news")
def fetch_hacker_news():
    print("[TASK] Starting fetch_hacker_news task...")
    update_health_status("HackerNews", "running", "Fetching top stories...")
    
    if not settings.HACKERNEWS_API_BASE:
        print("[ERROR] Error: No HACKERNEWS_API_BASE found.")
        update_health_status("HackerNews", "error", "No HACKERNEWS_API_BASE found")
        return
        
    print(f"[NETWORK] Fetching from HackerNews...")
    response = requests.get(f"{settings.HACKERNEWS_API_BASE}/topstories.json")
    
    if response.status_code != 200:
        print(f"[ERROR] Failed to fetch HN top stories: {response.text}")
        update_health_status("HackerNews", "error", f"API Error: {response.text}")
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
        saved_count = 0
        print(f"[ERROR] Database error: {e}")
    finally:
        db.close()
        
    if saved_count > 0:
        print(f"[LINK] Triggering process_raw_articles task...")
        process_raw_articles.delay()
        
    update_health_status(
        "HackerNews", 
        "healthy", 
        f"Processed {len(story_ids[:5])} HN stories, saved {saved_count}.",
        metrics={"Fetched": len(story_ids[:5]), "Saved": saved_count}
    )
    return f"Processed {len(story_ids[:5])} HN stories, saved {saved_count}."


@celery.task(name="process_raw_articles")
def process_raw_articles():
    print("[TASK] Starting AI processing of raw articles...")
    update_health_status("AI Engine", "running", "Processing raw articles...")
    db = SessionLocal()
    
    try:
        # Find raw articles that haven't been processed yet
        unprocessed = db.query(RawArticle).outerjoin(
            ProcessedArticle, RawArticle.id == ProcessedArticle.raw_article_id
        ).filter(ProcessedArticle.id == None).limit(5).all()
        
        if not unprocessed:
            print("[INFO] No new articles to process!")
            update_health_status("AI Engine", "healthy", "No new articles to process")
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
                
        # Calculate global funnel metrics to show in the UI for the last 24 hours
        from datetime import datetime, timedelta
        
        now = datetime.utcnow()
        if now.tzinfo is not None:
             from datetime import timezone
             now = datetime.now(timezone.utc)
        twenty_four_hours_ago = now - timedelta(days=1)
        
        total_raw = db.query(RawArticle).filter(RawArticle.created_at >= twenty_four_hours_ago).count()
        total_processed = db.query(ProcessedArticle).filter(ProcessedArticle.created_at >= twenty_four_hours_ago).count()
        total_skipped = max(0, total_raw - total_processed)
        
        update_health_status(
            "AI Engine", 
            "healthy", 
            f"Processed {processed_count} articles successfully.",
            metrics={"Raw Downloaded (24h)": total_raw, "AI Analyzed (24h)": total_processed, "Skipped (24h)": total_skipped}
        )
        
        # Check if there are still more articles in the backlog queue
        remaining = db.query(RawArticle).outerjoin(
            ProcessedArticle, RawArticle.id == ProcessedArticle.raw_article_id
        ).filter(ProcessedArticle.id == None).count()
        
        if remaining > 0:
            print(f"[INFO] {remaining} articles still in queue. Triggering next batch...")
            process_raw_articles.delay()
            
        return f"Processed {processed_count} articles successfully."
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during AI processing: {e}")
        update_health_status("AI Engine", "error", f"AI Processing Error: {e}")
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
            dummy_biz = BusinessEntity(profile_id=dummy_profile.id, name="Viorant", tracked_organizations=["OpenAI", "Anthropic", "Google"], target_sectors=["Healthcare", "Fintech"])
            db.add(dummy_biz)
            db.commit()
            users = [dummy_user]

        for user in users:
            score_components = {
                "Tracked Org": 0,
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
                    # Tracked Organizations (Max 45%)
                    for org in biz.tracked_organizations:
                        if org.lower() in text_to_search:
                            if score_components["Tracked Org"] == 0:
                                score_components["Tracked Org"] = 45
                                categories.append("Tracked Org")
                            reasons.append(f"Tracked Org: {org}")
                    
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

@celery.task(name="fetch_arxiv_papers")
def fetch_arxiv_papers():
    print("[TASK] Starting fetch_arxiv_papers task...")
    update_health_status("arXiv", "running", "Fetching latest papers...")
    
    url = f"{settings.ARXIV_API_BASE}/query"
    params = {
        "search_query": "cat:cs.AI OR cat:cs.LG",
        "sortBy": "lastUpdatedDate",
        "sortOrder": "descending",
        "max_results": 10
    }
    
    print(f"[NETWORK] Fetching from arXiv...")
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"[ERROR] Failed to fetch arXiv: {response.text}")
        update_health_status("arXiv", "error", f"API Error: {response.text}")
        return
        
    import xml.etree.ElementTree as ET
    root = ET.fromstring(response.content)
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    entries = root.findall('atom:entry', ns)
    
    db = SessionLocal()
    saved_count = 0
    try:
        for entry in entries:
            title = entry.find('atom:title', ns).text.strip().replace('\n', ' ')
            summary = entry.find('atom:summary', ns).text.strip().replace('\n', ' ')
            url = entry.find('atom:id', ns).text.strip()
            published = entry.find('atom:published', ns).text.strip()
            
            authors = [author.find('atom:name', ns).text for author in entry.findall('atom:author', ns)]
            author_str = ", ".join(authors)

            content_hash_input = f"{title}-{url}"
            content_hash = sha256(content_hash_input.encode('utf-8')).hexdigest()
            
            existing = db.query(RawArticle).filter(RawArticle.url == url).first()
            if existing:
                continue
                
            new_raw_article = RawArticle(
                url=url,
                content_hash=content_hash,
                raw_data={
                    "title": title,
                    "description": summary,
                    "content": summary, 
                    "publishedAt": published,
                    "author": author_str,
                    "source": "arXiv"
                }
            )
            db.add(new_raw_article)
            saved_count += 1
            
        db.commit()
        print(f"[SUCCESS] Successfully saved {saved_count} new arXiv papers.")
    except Exception as e:
        db.rollback()
        saved_count = 0
        print(f"[ERROR] Database error: {e}")
    finally:
        db.close()
        
    if saved_count > 0:
        process_raw_articles.delay()
        
    update_health_status(
        "arXiv", 
        "healthy", 
        f"Processed {len(entries)} papers, saved {saved_count}.",
        metrics={"Fetched": len(entries), "Saved": saved_count}
    )
    return f"Processed {len(entries)} papers, saved {saved_count}."

@celery.task(name="fetch_github_trending")
def fetch_github_trending():
    print("[TASK] Starting fetch_github_trending task...")
    update_health_status("GitHub", "running", "Fetching trending repositories...")
    
    if not settings.GITHUB_TOKEN:
        print("[ERROR] Error: No GITHUB_TOKEN found.")
        update_health_status("GitHub", "error", "No GITHUB_TOKEN found")
        return
        
    url = f"{settings.GITHUB_API_BASE}/search/repositories"
    params = {
        "q": "artificial intelligence",
        "sort": "updated",
        "order": "desc",
        "per_page": 10
    }
    headers = {
        "Authorization": f"token {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    print(f"[NETWORK] Fetching from GitHub...")
    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code != 200:
        print(f"[ERROR] Failed to fetch GitHub: {response.text}")
        update_health_status("GitHub", "error", f"API Error: {response.text}")
        return
        
    data = response.json()
    items = data.get("items", [])
    
    db = SessionLocal()
    saved_count = 0
    try:
        for item in items:
            repo_name = item.get("full_name")
            url = item.get("html_url")
            description = item.get("description") or ""
            stars = item.get("stargazers_count", 0)
            
            title = f"GitHub Release/Update: {repo_name}"
            content_hash_input = f"{title}-{url}-{item.get('updated_at')}"
            content_hash = sha256(content_hash_input.encode('utf-8')).hexdigest()
            
            existing = db.query(RawArticle).filter(RawArticle.url == url).first()
            if existing:
                continue
                
            new_raw_article = RawArticle(
                url=url,
                content_hash=content_hash,
                raw_data={
                    "title": title,
                    "description": f"⭐ {stars} Stars | {description}",
                    "content": f"Repository: {repo_name}\nDescription: {description}\nStars: {stars}\nLanguage: {item.get('language')}", 
                    "publishedAt": item.get('updated_at'),
                    "author": item.get("owner", {}).get("login"),
                    "source": "GitHub"
                }
            )
            db.add(new_raw_article)
            saved_count += 1
            
        db.commit()
        print(f"[SUCCESS] Successfully saved {saved_count} new GitHub repos.")
    except Exception as e:
        db.rollback()
        saved_count = 0
        print(f"[ERROR] Database error: {e}")
    finally:
        db.close()
        
    if saved_count > 0:
        process_raw_articles.delay()
        
    update_health_status(
        "GitHub", 
        "healthy", 
        f"Processed {len(items)} repos, saved {saved_count}.",
        metrics={"Fetched": len(items), "Saved": saved_count}
    )
    return f"Processed {len(items)} repos, saved {saved_count}."

@celery.task(name="fetch_huggingface_models")
def fetch_huggingface_models():
    print("[TASK] Starting fetch_huggingface_models task...")
    update_health_status("HuggingFace", "running", "Fetching latest models...")
    
    url = f"{settings.HUGGINGFACE_API_BASE}/models"
    params = {
        "sort": "createdAt",
        "direction": -1,
        "limit": 10
    }
    headers = {}
    if settings.HUGGINGFACE_TOKEN:
        headers["Authorization"] = f"Bearer {settings.HUGGINGFACE_TOKEN}"
    
    print(f"[NETWORK] Fetching from Hugging Face...")
    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code != 200:
        print(f"[ERROR] Failed to fetch Hugging Face: {response.text}")
        update_health_status("HuggingFace", "error", f"API Error: {response.text}")
        return
        
    models = response.json()
    
    db = SessionLocal()
    saved_count = 0
    try:
        for model in models:
            model_id = model.get("id")
            url = f"https://huggingface.co/{model_id}"
            
            title = f"New AI Model: {model_id}"
            content_hash_input = f"{title}-{url}"
            content_hash = sha256(content_hash_input.encode('utf-8')).hexdigest()
            
            existing = db.query(RawArticle).filter(RawArticle.content_hash == content_hash).first()
            if existing:
                continue
                
            new_raw_article = RawArticle(
                url=url,
                content_hash=content_hash,
                raw_data={
                    "title": title,
                    "description": f"New model uploaded to Hugging Face: {model_id}",
                    "content": f"Model: {model_id}\nPipeline tag: {model.get('pipeline_tag', 'N/A')}\nDownloads: {model.get('downloads', 0)}", 
                    "publishedAt": model.get('createdAt'),
                    "author": model_id.split('/')[0] if '/' in model_id else "Unknown",
                    "source": "Hugging Face"
                }
            )
            db.add(new_raw_article)
            saved_count += 1
            
        db.commit()
        print(f"[SUCCESS] Successfully saved {saved_count} new HF models.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database error: {e}")
    finally:
        db.close()
        
    if saved_count > 0:
        process_raw_articles.delay()
        
    return f"Processed {len(models)} models, saved {saved_count}."

@celery.task(name="fetch_openalex_research")
def fetch_openalex_research():
    print("[TASK] Starting fetch_openalex_research task...")
    update_health_status("OpenAlex", "running", "Fetching latest research...")
    
    url = f"{settings.OPENALEX_API_BASE}/works"
    params = {
        "search": "artificial intelligence",
        "sort": "publication_date:desc",
        "per-page": 10,
        "filter": "has_abstract:true"
    }
    
    headers = {}
    if settings.OPENALEX_EMAIL:
        headers["mailto"] = settings.OPENALEX_EMAIL
        
    print(f"[NETWORK] Fetching from OpenAlex...")
    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code != 200:
        print(f"[ERROR] Failed to fetch OpenAlex: {response.text}")
        update_health_status("OpenAlex", "error", f"API Error: {response.status_code}")
        return
        
    data = response.json()
    works = data.get("results", [])
    
    db = SessionLocal()
    saved_count = 0
    try:
        for work in works:
            title = work.get("title", "Untitled")
            abstract = work.get("abstract_inverted_index", {})
            
            # Reconstruct abstract from inverted index
            abstract_text = ""
            if abstract:
                words = {}
                for word, positions in abstract.items():
                    for pos in positions:
                        words[pos] = word
                abstract_text = " ".join([words[p] for p in sorted(words.keys())])
                
            url = work.get("id")
            
            content_hash_input = f"{title}-{url}"
            content_hash = sha256(content_hash_input.encode('utf-8')).hexdigest()
            
            existing = db.query(RawArticle).filter(RawArticle.content_hash == content_hash).first()
            if existing:
                continue
                
            authors = [a.get("author", {}).get("display_name") for a in work.get("authorships", [])]
            author_str = ", ".join(filter(None, authors)) if authors else "Unknown"
            
            new_raw_article = RawArticle(
                url=url,
                content_hash=content_hash,
                raw_data={
                    "title": title,
                    "description": abstract_text[:500] + "..." if len(abstract_text) > 500 else abstract_text,
                    "content": abstract_text, 
                    "publishedAt": work.get('publication_date'),
                    "author": author_str,
                    "source": "OpenAlex"
                }
            )
            db.add(new_raw_article)
            saved_count += 1
            
        db.commit()
        print(f"[SUCCESS] Successfully saved {saved_count} new OpenAlex works.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database error: {e}")
    finally:
        db.close()
        
    if saved_count > 0:
        process_raw_articles.delay()
        
    update_health_status(
        "OpenAlex", 
        "healthy", 
        f"Processed {len(works)} works, saved {saved_count}.",
        metrics={"Fetched": len(works), "Saved": saved_count}
    )
    return f"Processed {len(works)} works, saved {saved_count}."
