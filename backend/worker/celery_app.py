from celery import Celery
from celery.schedules import crontab
from core.config import settings
import os
import sys

# Ensure backend directory is in the python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# This is equivalent to setting up a BullMQ Queue in Node.js.
# We tell Celery to use Redis as the broker to manage our tasks.
celery = Celery(
    "tasknova_worker",
    broker=settings.REDIS_URL,
    include=["worker.tasks"]
)

# Optional configuration
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # This prevents Celery from failing immediately if Redis takes a second to connect
    broker_connection_retry_on_startup=True,
    # Upstash Redis Free Tier fixes: prevents server from dropping idle pool connections
    broker_pool_limit=None,
    broker_transport_options={
        'visibility_timeout': 3600,
    }
)

# Setup Celery Beat schedule for automated scraping
celery.conf.beat_schedule = {
    "fetch-ai-news-every-hour": {
        "task": "fetch_ai_news",
        # Run at minute 0 past every hour
        "schedule": crontab(minute=0, hour="*"),
    },
    "fetch-hacker-news-every-hour": {
        "task": "fetch_hacker_news",
        # Run at minute 30 past every hour (staggered to avoid overwhelming the system)
        "schedule": crontab(minute=30, hour="*"),
    },
    "fetch-arxiv-papers-every-two-hours": {
        "task": "fetch_arxiv_papers",
        "schedule": crontab(minute=15, hour="*/2"),
    },
    "fetch-github-trending-every-hour": {
        "task": "fetch_github_trending",
        "schedule": crontab(minute=45, hour="*"),
    },
    "fetch-huggingface-models-every-hour": {
        "task": "fetch_huggingface_models",
        "schedule": crontab(minute=10, hour="*"),
    },
    "fetch-openalex-research-every-two-hours": {
        "task": "fetch_openalex_research",
        "schedule": crontab(minute=25, hour="*/2"),
    }
}
