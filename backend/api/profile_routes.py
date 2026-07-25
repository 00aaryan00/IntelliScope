from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.session import get_db
from models.user_profile import User, InterestProfile, BusinessEntity, SavedArticle
from models.article import ProcessedArticle
from api.auth import get_current_user

router = APIRouter()

class BusinessEntitySchema(BaseModel):
    id: Optional[int] = None
    name: str
    tracked_organizations: List[str]
    target_sectors: List[str]

class ProfileUpdateSchema(BaseModel):
    focus_tags: List[str]
    preferred_locations: List[str]
    entities: List[BusinessEntitySchema]

@router.get("/api/profile")
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get the default MVP user
    user = current_user
    if not user or not user.profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    profile = user.profile
    
    return {
        "focus_tags": profile.focus_tags or [],
        "preferred_locations": profile.preferred_locations or [],
        "entities": [
            {
                "id": e.id,
                "name": e.name,
                "tracked_organizations": e.tracked_organizations,
                "target_sectors": e.target_sectors
            } for e in profile.entities
        ]
    }

@router.put("/api/profile")
def update_profile(data: ProfileUpdateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = current_user
    if not user or not user.profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    profile = user.profile
    profile.focus_tags = data.focus_tags
    profile.preferred_locations = data.preferred_locations
    
    # Simple replace logic for entities for MVP
    # First, clear existing entities
    db.query(BusinessEntity).filter(BusinessEntity.profile_id == profile.id).delete()
    
    # Add new ones
    for e_data in data.entities:
        new_entity = BusinessEntity(
            profile_id=profile.id,
            name=e_data.name,
            tracked_organizations=e_data.tracked_organizations,
            target_sectors=e_data.target_sectors
        )
        db.add(new_entity)
        
    db.commit()
    return {"status": "success"}

@router.get("/api/saved")
def get_saved_articles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetches all saved articles for the authenticated user"""
    saved = db.query(SavedArticle).filter(SavedArticle.user_id == current_user.id).order_by(SavedArticle.id.desc()).all()
    
    response = []
    for s in saved:
        article = s.article
        if article:
            response.append({
                "id": article.id,
                "title": article.title,
                "published_date": article.published_date or article.created_at,
                "url": article.raw_article.url if article.raw_article else None,
                "intelligence": {
                    "bullet_points": article.summary.bullet_points if article.summary else None,
                },
                "is_saved": True
            })
            
    return response

@router.post("/api/saved/{article_id}")
def save_article(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Saves an article for the authenticated user"""
    # Check if already saved
    existing = db.query(SavedArticle).filter(
        SavedArticle.user_id == current_user.id,
        SavedArticle.processed_article_id == article_id
    ).first()
    
    if not existing:
        new_save = SavedArticle(user_id=current_user.id, processed_article_id=article_id)
        db.add(new_save)
        db.commit()
        
    return {"status": "success", "is_saved": True}

@router.delete("/api/saved/{article_id}")
def unsave_article(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Removes a saved article for the authenticated user"""
    db.query(SavedArticle).filter(
        SavedArticle.user_id == current_user.id,
        SavedArticle.processed_article_id == article_id
    ).delete()
    
    db.commit()
    return {"status": "success", "is_saved": False}
