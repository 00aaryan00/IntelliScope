from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings

# This is equivalent to initializing a PrismaClient or TypeORM connection pool in Node.js.
# We pass our DATABASE_URL to SQLAlchemy, and it handles the connection to Supabase.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True  # Automatically checks if the connection is alive before using it
)

# This creates a factory for generating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is a dependency we will use in our FastAPI routes to get a database connection.
# It ensures the database connection is closed after the request is finished.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
