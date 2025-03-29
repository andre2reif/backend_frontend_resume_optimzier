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
import json

router = APIRouter()
client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))

@router.get("/count")
async def count_analysis(user_id: str = Query(..., description="User ID to count analyses for")):
    count = collection_analysis.count_documents({"userId": user_id})
    return {"collection": "analysis", "count": count}

@router.get("/view/{analysis_id}")
async def view_analysis(analysis_id: str, user_id: str):
    doc = collection_analysis.find_one({"_id": ObjectId(analysis_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if str(doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Konvertiere ObjectId in String
    doc["_id"] = str(doc["_id"])
    if "resumeId" in doc:
        doc["resumeId"] = str(doc["resumeId"])
    if "coverLetterId" in doc:
        doc["coverLetterId"] = str(doc["coverLetterId"])
    if "jobDescriptionId" in doc:
        doc["jobDescriptionId"] = str(doc["jobDescriptionId"])
    
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
    # Hole die Dokumente aus der Datenbank
    resume = collection_resume.find_one({"_id": ObjectId(resume_id)})
    coverletter = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
    jobdescription = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})
    
    if not all([resume, coverletter, jobdescription]):
        raise HTTPException(status_code=404, detail="One or more documents not found")
    
    # Prüfe die Benutzerrechte
    if str(resume.get("userId", "")) != user_id or str(coverletter.get("userId", "")) != user_id or str(jobdescription.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Wähle die richtigen Texte basierend auf den Optimierungsoptionen
    resume_text = resume.get("optimized_resume", "") if use_optimized_resume else resume.get("structured_resume", "")
    coverletter_text = coverletter.get("optimized_coverletter", "") if use_optimized_coverletter else coverletter.get("structured_coverletter", "")
    jobdescription_data = jobdescription.get("structured_jobdescription", {})
    
    # Hole die Prompts für die Analyse
    messages = get_prompt_messages_analysis(
        resume=resume_text,
        cover_letter=coverletter_text,
        job_description=jobdescription_data,
        language=language
    )
    # Führe die Analyse durch
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        temperature=0.7,
        max_tokens=4000
    )
    
    # Extrahiere die Analyseergebnisse
    analysis_result = response.choices[0].message.content
    
    # Parse den JSON-String in ein Python-Dictionary
    try:
        analysis_dict = json.loads(analysis_result)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid analysis result format")
    
    # Erstelle das Analyse-Dokument
    analysis_doc = {
        "userId": user_id,
        "resumeId": ObjectId(resume_id),
        "coverLetterId": ObjectId(coverletter_id),
        "jobDescriptionId": ObjectId(jobdescription_id),
        "analysis": analysis_dict,  # Speichere als strukturiertes Objekt
        "language": language,
        "useOptimizedResume": use_optimized_resume,
        "useOptimizedCoverletter": use_optimized_coverletter,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    # Speichere oder aktualisiere die Analyse
    if update_existing_analysis_id:
        analysis_doc["updatedAt"] = datetime.utcnow()
        result = collection_analysis.update_one(
            {"_id": ObjectId(update_existing_analysis_id)},
            {"$set": analysis_doc}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")
        analysis_id = update_existing_analysis_id
    else:
        result = collection_analysis.insert_one(analysis_doc)
        analysis_id = str(result.inserted_id)
    
    # Konvertiere ObjectId in String für die Antwort
    analysis_doc["_id"] = analysis_id
    analysis_doc["resumeId"] = str(analysis_doc["resumeId"])
    analysis_doc["coverLetterId"] = str(analysis_doc["coverLetterId"])
    analysis_doc["jobDescriptionId"] = str(analysis_doc["jobDescriptionId"])
    
    return analysis_doc

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
    pass
