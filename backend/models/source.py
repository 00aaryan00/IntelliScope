from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from db.base_class import Base

class RSSSource(Base):
    __tablename__ = "rss_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String, unique=True, index=True)
    category = Column(String)  # news, funding, research, models, etc.
    frequency_minutes = Column(Integer, default=15)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
