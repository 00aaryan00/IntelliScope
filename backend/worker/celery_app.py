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
    broker_connection_retry_on_startup=True
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
    }
}
