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

    # AI
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# We export a single instance of settings so we don't have to call os.getenv everywhere.
# This makes our code much cleaner and less prone to typos.
settings = Settings()
