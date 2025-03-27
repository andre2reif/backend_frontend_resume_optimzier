from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from datetime import datetime
from app.core.database import collection_resume
from app.prompts.prompt_resume import get_prompt_messages as get_prompt_messages_resume
from app.prompts.prompt_resume_optimize import get_prompt_messages as get_prompt_messages_resume_optimize
from app.utils.calc import count_tokens
from openai import OpenAI
import os

router = APIRouter()
client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))

@router.get("/count")
async def count_resumes():
    count = collection_resume.count_documents({})
    return {"collection": "resumes", "count": count}

@router.get("/view/{resume_id}")
async def view_resume(resume_id: str, user_id: str):
    doc = collection_resume.find_one({"_id": ObjectId(resume_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
    if str(doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    return doc

@router.get("/extract-structured")
async def extract_structured_resume(
    document_id: str = Query(..., description="MongoDB document _id"),
    language: str = Query("de", description="Target language: en, de, pl"),
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    doc = collection_resume.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
    if str(doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Hier kommt die Logik für die Strukturierung
    # ... (Rest der Logik aus main.py)
