from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from datetime import datetime
import json
from app.core.database import collection_coverletter, collection_jobdesc, collection_analysis
from app.utils.prompts import system_prompt_coverletter_analysis
from app.core.config import COVERLETTER_ANALYSIS_SCHEMA
from openai import OpenAI
import os

router = APIRouter()

# OpenAI Client initialisieren
client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))

def get_prompt_messages_coverletter_analysis(
    cover_letter: dict,
    job_description: dict,
    language: str = "en"
) -> list:
    """
    Erzeugt eine Liste von Nachrichten (System + User), um eine
    Coverletter-Analyse durchzuführen.
    """
    # JSON-Dumps für die Eingaben
    cover_letter_str = json.dumps(cover_letter, ensure_ascii=False, indent=2)
    job_desc_str = json.dumps(job_description, ensure_ascii=False, indent=2)
    
    # Hole die Prompts für die gewählte Sprache
    prompts = system_prompt_coverletter_analysis()
    lang_prompts = prompts.get(language, prompts["en"])
    
    # Baue den System-Prompt
    system_prompt = f"""
    {lang_prompts['intro']}
    
    {lang_prompts['input_desc']}
    
    {lang_prompts['instructions']}
    
    {lang_prompts['format']}
    
    {COVERLETTER_ANALYSIS_SCHEMA.strip()}
    """
    
    # Baue den User-Prompt
    user_prompt = f"""
    COVER LETTER (JSON):
    {cover_letter_str}
    
    JOB DESCRIPTION (JSON):
    {job_desc_str}
    
    {lang_prompts['format']}
    {COVERLETTER_ANALYSIS_SCHEMA.strip()}
    """
    
    return [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": user_prompt.strip()}
    ]

@router.get("/analysis-ats")
async def analysis_ats(
    coverletter_id: str = Query(..., description="MongoDB _id of the cover letter"),
    jobdescription_id: str = Query(..., description="MongoDB _id of the job description"),
    language: str = Query("de", description="Target language: en, de, pl"),
    update_existing_analysis_id: str = Query(None, description="If set, update this analysisId instead of creating new one"),
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    # Hole die Dokumente aus der Datenbank
    coverletter = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
    jobdescription = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})
    
    if not all([coverletter, jobdescription]):
        raise HTTPException(status_code=404, detail="One or more documents not found")
    
    # Prüfe die Benutzerrechte
    if str(coverletter.get("userId", "")) != user_id or str(jobdescription.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Wähle die richtigen Texte
    coverletter_text = coverletter.get("structured_coverletter", {})
    jobdescription_text = jobdescription.get("structured_jobdescription", {})
    
    # Hole die Prompts für die Analyse
    messages = get_prompt_messages_coverletter_analysis(
        cover_letter=coverletter_text,
        job_description=jobdescription_text,
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
        "coverLetterId": ObjectId(coverletter_id),
        "jobDescriptionId": ObjectId(jobdescription_id),
        "analysis": analysis_dict,
        "language": language,
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
    analysis_doc["coverLetterId"] = str(analysis_doc["coverLetterId"])
    analysis_doc["jobDescriptionId"] = str(analysis_doc["jobDescriptionId"])
    
    return analysis_doc 