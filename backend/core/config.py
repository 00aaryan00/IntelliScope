import os
from dotenv import load_dotenv

# This is exactly like calling `require('dotenv').config()` in Node.js!
# It loads all the variables from the .env file into the system environment.
load_dotenv()

class Settings:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    # Redis
    REDIS_URL = os.getenv("REDIS_URL")

    # APIs
    NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
    NEWS_API_BASE = os.getenv("NEWS_API_BASE")
    HACKERNEWS_API_BASE = os.getenv("HACKERNEWS_API_BASE")
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
    GITHUB_API_BASE = os.getenv("GITHUB_API_BASE", "https://api.github.com")
    ARXIV_API_BASE = os.getenv("ARXIV_API_BASE", "https://export.arxiv.org/api")
    HUGGINGFACE_API_BASE = os.getenv("HUGGINGFACE_API_BASE", "https://huggingface.co/api")
    OPENALEX_API_BASE = os.getenv("OPENALEX_API_BASE", "https://api.openalex.org")
    OPENALEX_EMAIL = os.getenv("OPENALEX_EMAIL", "")

    # AI
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# We export a single instance of settings so we don't have to call os.getenv everywhere.
# This makes our code much cleaner and less prone to typos.
settings = Settings()
