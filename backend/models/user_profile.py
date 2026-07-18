from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from db.base_class import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    
    profile = relationship("InterestProfile", back_populates="user", uselist=False)
    scores = relationship("UserArticleScore", back_populates="user")

class InterestProfile(Base):
    __tablename__ = "interest_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    focus_tags = Column(JSON, default=list)
    preferred_locations = Column(JSON, default=list) # Array of countries
    
    user = relationship("User", back_populates="profile")
    entities = relationship("BusinessEntity", back_populates="profile")

class BusinessEntity(Base):
    __tablename__ = "business_entities"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("interest_profiles.id"))
    
    name = Column(String)
    description = Column(String, nullable=True)
    competitors = Column(JSON, default=list)
    target_sectors = Column(JSON, default=list)
    
    profile = relationship("InterestProfile", back_populates="entities")

class UserArticleScore(Base):
    __tablename__ = "user_article_scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    processed_article_id = Column(Integer, ForeignKey("processed_articles.id"))
    
    personal_relevance_score = Column(Integer, default=0)
    relevance_category = Column(String, nullable=True)
    relevance_reason = Column(String, nullable=True)
    
    user = relationship("User", back_populates="scores")
    article = relationship("ProcessedArticle")
