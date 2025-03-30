from fastapi import APIRouter, HTTPException, Query, Form
from bson import ObjectId
from datetime import datetime
from app.core.database import collection_coverletter
from app.prompts.prompt_coverletter import get_prompt_messages as get_prompt_messages_coverletter
from app.prompts.prompt_coverletter_optimize import get_prompt_messages as get_prompt_messages_coverletter_optimize
from app.utils.calc import count_tokens
from openai import OpenAI
import os
from typing import List, Optional

from typing import List, Dict, Any, Union
from pydantic import BaseModel

# Pydantic Modelle für die PATCH-Operation
class PatchOperation(BaseModel):
    op: str
    path: str
    value: Any

class CoverletterPatch(BaseModel):
    operations: List[PatchOperation]
    user_id: str

router = APIRouter()
client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))


client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))

@router.get("/count")
async def count_coverletters(user_id: str = Query(..., description="User ID to count coverletters for")):
    count = collection_coverletter.count_documents({"userId": user_id})
    return {"collection": "coverletters", "count": count}

@router.post("/create")
async def create_coverletter(
    title: str = Form(...),
    content: str = Form(...),
    user_id: str = Form(...)
):
    """Erstellt einen neuen Lebenslauf in der Datenbank."""
    try:
        coverletter_doc = {
            "title": title,
            "rawText": content,
            "userId": user_id,
            "status": "unstructured",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = collection_coverletter.insert_one(coverletter_doc)
        
        if result.inserted_id:
            return {
                "status": "success",
                "message": "Lebenslauf erfolgreich erstellt",
                "data": {
                    "id": str(result.inserted_id),
                    "title": title,
                    "status": "unstructured",
                    "created_at": coverletter_doc["createdAt"].isoformat(),
                    "updated_at": coverletter_doc["updatedAt"].isoformat()
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
async def view_coverletters(user_id: str = Query(..., description="User ID to fetch coverletters for")):
    """Gibt alle Lebensläufe eines Nutzers zurück."""
    try:
        # Suche alle Dokumente für den Benutzer
        cursor = collection_coverletter.find({"userId": user_id})
        
        # Konvertiere die Dokumente in eine Liste und formatiere sie
        coverletters = []
        for doc in cursor:
            coverletter = {
                "id": str(doc["_id"]),
                "title": doc["title"],
                "createdAt": doc["createdAt"].isoformat(),
                "updatedAt": doc["updatedAt"].isoformat(),
                "status": doc["status"],
                "preview": doc["rawText"][:100] if "rawText" in doc else ""
            }
            coverletters.append(coverletter)
        
        return {
            "status": "success",
            "message": "Lebensläufe erfolgreich geladen",
            "data": coverletters
        }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Laden der Lebensläufe: {str(e)}"
        )

@router.get("/view/{coverletter_id}")
async def get_coverletter(coverletter_id: str, user_id: str = Query(..., description="User ID (as string) to restrict access")):
    """
    Ruft ein einzelnes coverletter anhand seiner ID ab.
    """
    try:
        coverletter = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
        if not coverletter:
            raise HTTPException(status_code=404, detail="coverletter not found")
        
        # Sicherheitscheck: Prüfen, ob das coverletter zum übergebenen User gehört
        if str(coverletter.get("userId", "")) != user_id:
            raise HTTPException(status_code=403, detail="Access forbidden: coverletter does not belong to this user")
        
        # ObjectId in String umwandeln
        coverletter["_id"] = str(coverletter["_id"])
        
        # Formatiere die Antwort
        return {
            "status": "success",
            "message": "Lebenslauf erfolgreich geladen",
            "data": {
                "_id": coverletter["_id"],
                "title": coverletter["title"],
                "content": coverletter.get("rawText", ""),
                "structured_coverletter": coverletter.get("structured_coverletter", {}),
                "createdAt": coverletter["createdAt"].isoformat(),
                "updatedAt": coverletter["updatedAt"].isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/patch/{coverletter_id}")
async def patch_coverletter(
    coverletter_id: str,
    patch_data: CoverletterPatch,
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    """
    Aktualisiert einen Lebenslauf teilweise mit JSON Patch Operationen.
    
    - Unterstützt 'replace' Operationen für title, content und structured_coverletter
    - Validiert die Benutzer-Berechtigung
    - Führt die Patch-Operationen in der angegebenen Reihenfolge aus
    """
    try:
        # Prüfe, ob der Lebenslauf existiert und dem Benutzer gehört
        coverletter = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
        if not coverletter:
            raise HTTPException(status_code=404, detail="coverletter not found")
        
        if str(coverletter.get("userId", "")) != user_id:
            raise HTTPException(status_code=403, detail="Access forbidden: coverletter does not belong to this user")
        
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
            if field not in ["title", "content", "structured_coverletter"]:
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
        result = collection_coverletter.update_one(
            {"_id": ObjectId(coverletter_id)},
            {"$set": update_doc}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Keine Änderungen am Lebenslauf vorgenommen")
        
        # Hole den aktualisierten Lebenslauf
        updated_coverletter = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
        
        return {
            "status": "success",
            "message": "Lebenslauf erfolgreich aktualisiert",
            "data": {
                "_id": str(updated_coverletter["_id"]),
                "title": updated_coverletter["title"],
                "content": updated_coverletter.get("rawText", ""),
                "structured_coverletter": updated_coverletter.get("structured_coverletter", {}),
                "createdAt": updated_coverletter["createdAt"].isoformat(),
                "updatedAt": updated_coverletter["updatedAt"].isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{coverletter_id}")
async def delete_coverletter(
    coverletter_id: str,
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    """
    Löscht einen Lebenslauf anhand seiner ID.
    
    - Validiert die Benutzer-Berechtigung
    - Gibt 404 zurück, wenn der Lebenslauf nicht gefunden wurde
    - Gibt 403 zurück, wenn der Lebenslauf nicht dem Benutzer gehört
    """
    try:
        # Prüfe, ob der Lebenslauf existiert und dem Benutzer gehört
        coverletter = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
        if not coverletter:
            raise HTTPException(status_code=404, detail="coverletter not found")
        
        if str(coverletter.get("userId", "")) != user_id:
            raise HTTPException(status_code=403, detail="Access forbidden: coverletter does not belong to this user")
        
        # Führe das Löschen durch
        result = collection_coverletter.delete_one({"_id": ObjectId(coverletter_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="coverletter not found")
        
        return {
            "status": "success",
            "message": "Lebenslauf erfolgreich gelöscht"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
