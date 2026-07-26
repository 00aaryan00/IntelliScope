import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url, isolation_level="AUTOCOMMIT")
with engine.connect() as conn:
    print("Enabling pgvector...")
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    print("Success!")
