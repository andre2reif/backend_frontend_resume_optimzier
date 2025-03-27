from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from datetime import datetime
from app.core.database import collection_coverletter
from app.prompts.prompt_coverletter import get_prompt_messages as get_prompt_messages_coverletter
from app.prompts.prompt_coverletter_optimize import get_prompt_messages as get_prompt_messages_coverletter_optimize
from app.utils.calc import count_tokens
from openai import OpenAI
import os

router = APIRouter()
client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))

@router.get("/count")
async def count_coverletters():
    count = collection_coverletter.count_documents({})
    return {"collection": "coverletters", "count": count}

@router.get("/view/{coverletter_id}")
async def view_coverletter(coverletter_id: str, user_id: str):
    doc = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Cover Letter not found")
    if str(doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    return doc

@router.get("/extract-structured")
async def extract_structured_coverletter(
    document_id: str = Query(..., description="MongoDB document _id"),
    language: str = Query("de", description="Target language: en, de, pl"),
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    doc = collection_coverletter.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Cover Letter not found")
    if str(doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Hier kommt die Logik für die Strukturierung
    # ... (Rest der Logik aus main.py)
