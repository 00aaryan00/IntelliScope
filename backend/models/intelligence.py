from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from db.base_class import Base

class Summary(Base):
    """AI-generated bullet points and business impact"""
    __tablename__ = "summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    processed_article_id = Column(Integer, ForeignKey("processed_articles.id"), unique=True)
    
    bullet_points = Column(Text) # Stored as JSON string or text block
    technical_impact = Column(Text)
    business_impact = Column(Text)
    business_relevant = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    article = relationship("ProcessedArticle", back_populates="summary")

class Embedding(Base):
    """Stores vector math for pgvector semantic search"""
    __tablename__ = "embeddings"
    
    id = Column(Integer, primary_key=True, index=True)
    processed_article_id = Column(Integer, ForeignKey("processed_articles.id"), unique=True)
    
    # Google Gemini text-embedding-004 is 768 dimensions by default.
    embedding = Column(Vector(768))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
