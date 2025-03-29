from fastapi import APIRouter, HTTPException, Query, Form
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
async def count_coverletters(user_id: str = Query(..., description="User ID to count cover letters for")):
    count = collection_coverletter.count_documents({"userId": user_id})
    return {"collection": "coverletters", "count": count}

@router.post("/create")
async def create_coverletter(
    title: str = Form(...),
    content: str = Form(...),
    user_id: str = Form(...)
):
    """Erstellt ein neues Anschreiben in der Datenbank."""
    try:
        coverletter_doc = {
            "title": title,
            "rawText": content,
            "userId": user_id,
            "status": "draft",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = collection_coverletter.insert_one(coverletter_doc)
        
        if result.inserted_id:
            return {
                "status": "success",
                "message": "Anschreiben erfolgreich erstellt",
                "data": {
                    "id": str(result.inserted_id),
                    "title": title,
                    "status": "draft",
                    "created_at": coverletter_doc["createdAt"].isoformat(),
                    "updated_at": coverletter_doc["updatedAt"].isoformat()
                }
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Fehler beim Erstellen des Anschreibens"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Erstellen des Anschreibens: {str(e)}"
        )

@router.get("/view")
async def view_coverletters(user_id: str = Query(..., description="User ID to fetch cover letters for")):
    """Gibt alle Anschreiben eines Nutzers zurück."""
    try:
        # Suche alle Dokumente für den Benutzer
        cursor = collection_coverletter.find({"userId": user_id})
        
        # Konvertiere die Dokumente in eine Liste und formatiere sie
        coverletters = []
        for doc in cursor:
            coverletter = {
                "id": str(doc["_id"]),
                "title": doc["title"],
                "company": doc.get("company", ""),
                "createdAt": doc["createdAt"].isoformat(),
                "updatedAt": doc["updatedAt"].isoformat(),
                "status": doc.get("status", "draft"),
                "preview": doc["rawText"][:100] if "rawText" in doc else ""
            }
            coverletters.append(coverletter)
        
        return {
            "status": "success",
            "message": "Anschreiben erfolgreich geladen",
            "data": coverletters
        }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Laden der Anschreiben: {str(e)}"
        )

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
