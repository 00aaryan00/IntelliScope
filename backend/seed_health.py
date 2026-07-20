from db.session import SessionLocal
from models.system import SystemHealth
from sqlalchemy.dialects.postgresql import insert
import time

def seed():
    db = SessionLocal()
    components = ["NewsAPI", "HackerNews", "GitHub", "arXiv", "HuggingFace", "OpenAlex", "AI Engine"]
    for comp in components:
        stmt = insert(SystemHealth).values(
            component_name=comp,
            status="healthy",
            message="Waiting for next scheduled run..."
        ).on_conflict_do_nothing()
        db.execute(stmt)
    db.commit()
    db.close()
    print("Seeded!")

if __name__ == "__main__":
    seed()
