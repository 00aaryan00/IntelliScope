from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base

class Event(Base):
    """Groups multiple similar articles into one single logical event"""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    priority = Column(String) # Critical, High, Worth Reading, Low Priority, Noise
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    articles = relationship("ProcessedArticle", back_populates="event")

class RawArticle(Base):
    """Stores the exact messy JSON/HTML scraped from the internet"""
    __tablename__ = "raw_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("rss_sources.id"))
    url = Column(String, unique=True, index=True)
    content_hash = Column(String, unique=True, index=True)
    raw_data = Column(JSON) # Store raw response
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProcessedArticle(Base):
    """Cleaned text ready for UI rendering and AI processing"""
    __tablename__ = "processed_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    raw_article_id = Column(Integer, ForeignKey("raw_articles.id"), unique=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    
    title = Column(String)
    content = Column(Text)
    published_date = Column(DateTime(timezone=True))
    author = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    event = relationship("Event", back_populates="articles")
    summary = relationship("Summary", back_populates="article", uselist=False)
    raw_article = relationship("RawArticle")
