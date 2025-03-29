from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.config import settings
from app.core.security import get_current_user
from app.core.database import collection_resume, collection_jobdesc, collection_coverletter, collection_analysis

router = APIRouter()

class UserAddress(BaseModel):
    street: str
    zip_code: str
    city: str
    country: str

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    credits: int
    address: Optional[UserAddress] = None
    created_at: datetime
    updated_at: datetime

class UserStats(BaseModel):
    resumes_count: int
    job_descriptions_count: int
    optimized_resumes_count: int
    cover_letters_count: int
    available_credits: int

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user = Depends(get_current_user)):
    """
    Gibt das Profil des aktuellen Benutzers zurück
    """
    # TODO: Implementiere Datenbankabfrage
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "credits": current_user.credits,
        "address": current_user.address,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.get("/stats", response_model=UserStats)
async def get_user_stats(user_id: str = Query(..., description="User ID (email) to get stats for")):
    """
    Gibt die Statistiken des Benutzers zurück
    """
    return {
        "resumes_count": await count_user_resumes(user_id),
        "job_descriptions_count": await count_user_job_descriptions(user_id),
        "optimized_resumes_count": await count_user_optimized_resumes(user_id),
        "cover_letters_count": await count_user_cover_letters(user_id),
        "available_credits": 10  # Temporärer Wert, später aus der Datenbank
    }

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserProfile,
    current_user = Depends(get_current_user)
):
    """
    Aktualisiert das Profil des aktuellen Benutzers
    """
    # TODO: Implementiere Datenbankupdate
    return profile_update

# Hilfsfunktionen für Datenbankabfragen
async def count_user_resumes(user_id: str) -> int:
    return collection_resume.count_documents({"userId": user_id})

async def count_user_job_descriptions(user_id: str) -> int:
    return collection_jobdesc.count_documents({"userId": user_id})

async def count_user_optimized_resumes(user_id: str) -> int:
    return collection_resume.count_documents({
        "userId": user_id,
        "status": "optimized"
    })

async def count_user_cover_letters(user_id: str) -> int:
    return collection_coverletter.count_documents({"userId": user_id}) 