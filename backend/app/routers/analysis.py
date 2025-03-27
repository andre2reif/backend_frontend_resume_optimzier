from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from datetime import datetime
from app.core.database import collection_analysis, collection_resume, collection_coverletter, collection_jobdesc
from app.prompts.prompt_analysis import get_prompt_messages as get_prompt_messages_analysis
from app.prompts.prompt_analysis_optimized import get_prompt_messages as get_prompt_messages_analysis_optimized
from app.prompts.prompt_analysis_all_optimized import get_prompt_messages_optimized_resume, get_prompt_messages_optimized_coverletter
from app.utils.calc import count_tokens
from openai import OpenAI
import os

router = APIRouter()
client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))

@router.get("/count")
async def count_analysis():
    count = collection_analysis.count_documents({})
    return {"collection": "analysis", "count": count}

@router.get("/view/{analysis_id}")
async def view_analysis(analysis_id: str, user_id: str):
    doc = collection_analysis.find_one({"_id": ObjectId(analysis_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if str(doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    return doc

@router.get("/ats")
async def analysis_ats(
    resume_id: str = Query(..., description="MongoDB _id of the resume"),
    coverletter_id: str = Query(..., description="MongoDB _id of the cover letter"),
    jobdescription_id: str = Query(..., description="MongoDB _id of the job description"),
    language: str = Query("de", description="Target language: en, de, pl"),
    use_optimized_resume: bool = Query(False, description="Set to true to use optimized_resume instead of structured_resume"),
    use_optimized_coverletter: bool = Query(False, description="Set to true to use optimized_coverletter instead of structured_coverletter"),
    update_existing_analysis_id: str = Query(None, description="If set, update this analysisId instead of creating new one"),
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    # Hier kommt die Logik für die ATS-Analyse
    # ... (Rest der Logik aus main.py)

@router.get("/ats-optimized")
async def analysis_ats_optimized(
    resume_id: str = Query(..., description="MongoDB _id of the resume"),
    coverletter_id: str = Query(..., description="MongoDB _id of the cover letter"),
    jobdescription_id: str = Query(..., description="MongoDB _id of the job description"),
    language: str = Query("de", description="Target language: en, de, pl"),
    use_optimized_resume: bool = Query(False, description="Set to true to use optimized_resume instead of structured_resume"),
    use_optimized_coverletter: bool = Query(False, description="Set to true to use optimized_coverletter instead of structured_coverletter"),
    update_existing_analysis_id: str = Query(None, description="If set, update this analysisId instead of creating new one"),
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    # Hier kommt die Logik für die optimierte ATS-Analyse
    # ... (Rest der Logik aus main.py)
