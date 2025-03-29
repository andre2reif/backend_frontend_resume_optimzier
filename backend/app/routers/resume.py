from fastapi import APIRouter, HTTPException, Query, Body, Form, UploadFile, File, Path
from bson import ObjectId
from datetime import datetime
from app.core.database import collection_resume
from app.prompts.prompt_resume import get_prompt_messages as get_prompt_messages_resume
from app.prompts.prompt_resume_optimize import get_prompt_messages as get_prompt_messages_resume_optimize
from app.utils.calc import count_tokens
from openai import OpenAI
import os
from typing import List, Dict, Any, Union
from pydantic import BaseModel

# Pydantic Modelle für die PATCH-Operation
class PatchOperation(BaseModel):
    op: str
    path: str
    value: Any

class ResumePatch(BaseModel):
    operations: List[PatchOperation]
    user_id: str

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

@router.patch("/patch/{resume_id}")
async def patch_resume(
    resume_id: str,
    patch_data: ResumePatch,
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    """
    Aktualisiert einen Lebenslauf teilweise mit JSON Patch Operationen.
    
    - Unterstützt 'replace' Operationen für title, content und structured_resume
    - Validiert die Benutzer-Berechtigung
    - Führt die Patch-Operationen in der angegebenen Reihenfolge aus
    """
    try:
        # Prüfe, ob der Lebenslauf existiert und dem Benutzer gehört
        resume = collection_resume.find_one({"_id": ObjectId(resume_id)})
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        if str(resume.get("userId", "")) != user_id:
            raise HTTPException(status_code=403, detail="Access forbidden: Resume does not belong to this user")
        
        # Initialisiere das Update-Dokument
        update_doc = {
            "updatedAt": datetime.utcnow()
        }
        
        # Verarbeite die Patch-Operationen
        for operation in patch_data.operations:
            if operation.op != "replace":
                raise HTTPException(
                    status_code=400,
                    detail=f"Operation '{operation.op}' nicht unterstützt. Nur 'replace' ist erlaubt."
                )
            
            # Entferne den führenden Slash vom Pfad
            field = operation.path.lstrip("/")
            
            # Validiere erlaubte Felder
            if field not in ["title", "content", "structured_resume"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Feld '{field}' kann nicht gepatcht werden"
                )
            
            # Füge das Feld zum Update-Dokument hinzu
            if field == "content":
                update_doc["rawText"] = operation.value
            else:
                update_doc[field] = operation.value
        
        # Führe das Update durch
        result = collection_resume.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": update_doc}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Keine Änderungen am Lebenslauf vorgenommen")
        
        # Hole den aktualisierten Lebenslauf
        updated_resume = collection_resume.find_one({"_id": ObjectId(resume_id)})
        
        return {
            "status": "success",
            "message": "Lebenslauf erfolgreich aktualisiert",
            "data": {
                "_id": str(updated_resume["_id"]),
                "title": updated_resume["title"],
                "content": updated_resume.get("rawText", ""),
                "structured_resume": updated_resume.get("structured_resume", {}),
                "createdAt": updated_resume["createdAt"].isoformat(),
                "updatedAt": updated_resume["updatedAt"].isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
