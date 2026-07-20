from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.session import get_db
from models.user_profile import User, InterestProfile, BusinessEntity
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
