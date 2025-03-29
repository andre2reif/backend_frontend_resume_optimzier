from fastapi import APIRouter, HTTPException, Query, Body, Form, UploadFile, File, Path
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
async def count_resumes(user_id: str = Query(..., description="User ID to count resumes for")):
    count = collection_resume.count_documents({"userId": user_id})
    return {"collection": "resumes", "count": count}

@router.post("/create")
async def create_resume(
    title: str = Form(...),
    content: str = Form(...),
    user_id: str = Form(...)
):
    """Erstellt einen neuen Lebenslauf in der Datenbank."""
    try:
        resume_doc = {
            "title": title,
            "rawText": content,
            "userId": user_id,
            "status": "unstructured",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = collection_resume.insert_one(resume_doc)
        
        if result.inserted_id:
            return {
                "status": "success",
                "message": "Lebenslauf erfolgreich erstellt",
                "data": {
                    "id": str(result.inserted_id),
                    "title": title,
                    "status": "unstructured",
                    "created_at": resume_doc["createdAt"].isoformat(),
                    "updated_at": resume_doc["updatedAt"].isoformat()
                }
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Fehler beim Erstellen des Lebenslaufs"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Erstellen des Lebenslaufs: {str(e)}"
        )

@router.get("/view")
async def view_resumes(user_id: str = Query(..., description="User ID to fetch resumes for")):
    """Gibt alle Lebensläufe eines Nutzers zurück."""
    try:
        # Suche alle Dokumente für den Benutzer
        cursor = collection_resume.find({"userId": user_id})
        
        # Konvertiere die Dokumente in eine Liste und formatiere sie
        resumes = []
        for doc in cursor:
            resume = {
                "id": str(doc["_id"]),
                "title": doc["title"],
                "createdAt": doc["createdAt"].isoformat(),
                "updatedAt": doc["updatedAt"].isoformat(),
                "status": doc["status"],
                "preview": doc["rawText"][:100] if "rawText" in doc else ""
            }
            resumes.append(resume)
        
        return {
            "status": "success",
            "message": "Lebensläufe erfolgreich geladen",
            "data": resumes
        }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Laden der Lebensläufe: {str(e)}"
        )

@router.get("/view/{resume_id}")
async def get_resume(resume_id: str, user_id: str = Query(..., description="User ID (as string) to restrict access")):
    """
    Ruft ein einzelnes Resume anhand seiner ID ab.
    """
    try:
        resume = collection_resume.find_one({"_id": ObjectId(resume_id)})
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Sicherheitscheck: Prüfen, ob das Resume zum übergebenen User gehört
        if str(resume.get("userId", "")) != user_id:
            raise HTTPException(status_code=403, detail="Access forbidden: Resume does not belong to this user")
        
        # ObjectId in String umwandeln
        resume["_id"] = str(resume["_id"])
        
        # Formatiere die Antwort
        return {
            "status": "success",
            "message": "Lebenslauf erfolgreich geladen",
            "data": {
                "_id": resume["_id"],
                "title": resume["title"],
                "content": resume.get("rawText", ""),
                "structured_resume": resume.get("structured_resume", {}),
                "createdAt": resume["createdAt"].isoformat(),
                "updatedAt": resume["updatedAt"].isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
