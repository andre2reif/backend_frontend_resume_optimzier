from fastapi import APIRouter, HTTPException, Query, Form
from bson import ObjectId
from datetime import datetime
from app.core.database import collection_jobdesc
from app.prompts.prompt_jobdescription import get_prompt_messages as get_prompt_messages_jobdescription
from app.utils.calc import count_tokens
from openai import OpenAI
import os
from pydantic import BaseModel
from typing import List

# Router mit korrektem Präfix
router = APIRouter()

client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))

class PatchOperation(BaseModel):
    op: str
    path: str
    value: str

class JobDescriptionPatch(BaseModel):
    operations: List[PatchOperation]

@router.get("/view")
async def view_jobdescriptions(user_id: str = Query(..., description="User ID to fetch job descriptions for")):
    """Gibt alle Stellenausschreibungen eines Nutzers zurück."""
    try:
        cursor = collection_jobdesc.find({"userId": user_id})
        
        jobdescriptions = []
        for doc in cursor:
            jobdesc = {
                "id": str(doc["_id"]),
                "title": doc["title"],
                "content": doc.get("rawText", ""),
                "createdAt": doc["createdAt"].isoformat(),
                "updatedAt": doc["updatedAt"].isoformat(),
                "status": doc["status"],
                "preview": doc.get("rawText", "")[:100] if "rawText" in doc else ""
            }
            jobdescriptions.append(jobdesc)
        
        return {
            "status": "success",
            "message": "Stellenausschreibungen erfolgreich geladen",
            "data": jobdescriptions
        }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Laden der Stellenausschreibungen: {str(e)}"
        )

@router.get("/view/{jobdescription_id}")
async def view_jobdescription(jobdescription_id: str, user_id: str = Query(..., description="User ID to verify ownership")):
    """Gibt eine spezifische Stellenausschreibung zurück."""
    try:
        doc = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Stellenausschreibung nicht gefunden")
        
        if str(doc.get("userId", "")) != user_id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung für diese Stellenausschreibung")
        
        # Konvertiere das MongoDB-Dokument in ein Dictionary und entferne die _id
        doc_dict = dict(doc)
        doc_dict["id"] = str(doc_dict.pop("_id"))
        
        # Konvertiere datetime-Objekte in ISO-Format-Strings
        if "createdAt" in doc_dict:
            doc_dict["createdAt"] = doc_dict["createdAt"].isoformat()
        if "updatedAt" in doc_dict:
            doc_dict["updatedAt"] = doc_dict["updatedAt"].isoformat()
        
        return {
            "status": "success",
            "message": "Stellenausschreibung erfolgreich geladen",
            "data": doc_dict
        }
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Laden der Stellenausschreibung: {str(e)}"
        )

@router.post("/create")
async def create_jobdescription(
    title: str = Form(...),
    content: str = Form(...),
    user_id: str = Form(...)
):
    """Erstellt eine neue Stellenausschreibung in der Datenbank."""
    try:
        jobdesc_doc = {
            "title": title,
            "rawText": content,
            "userId": user_id,
            "status": "unstructured",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = collection_jobdesc.insert_one(jobdesc_doc)
        
        if result.inserted_id:
            return {
                "status": "success",
                "message": "Stellenausschreibung erfolgreich erstellt",
                "data": {
                    "id": str(result.inserted_id),
                    "title": title,
                    "status": "unstructured",
                    "createdAt": jobdesc_doc["createdAt"].isoformat(),
                    "updatedAt": jobdesc_doc["updatedAt"].isoformat()
                }
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Fehler beim Erstellen der Stellenausschreibung"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Erstellen der Stellenausschreibung: {str(e)}"
        )

@router.put("/update/{jobdescription_id}")
async def update_jobdescription(
    jobdescription_id: str,
    title: str = Form(...),
    content: str = Form(...),
    user_id: str = Form(...)
):
    """Aktualisiert eine bestehende Stellenausschreibung."""
    try:
        doc = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Stellenausschreibung nicht gefunden")
        
        if str(doc.get("userId", "")) != user_id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung für diese Stellenausschreibung")
        
        update_result = collection_jobdesc.update_one(
            {"_id": ObjectId(jobdescription_id)},
            {
                "$set": {
                    "title": title,
                    "content": content,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if update_result.modified_count:
            return {
                "status": "success",
                "message": "Stellenausschreibung erfolgreich aktualisiert",
                "data": {
                    "id": jobdescription_id,
                    "title": title,
                    "content": content,
                    "updatedAt": datetime.utcnow().isoformat()
                }
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Fehler beim Aktualisieren der Stellenausschreibung"
            )
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Aktualisieren der Stellenausschreibung: {str(e)}"
        )

@router.delete("/delete/{jobdescription_id}")
async def delete_jobdescription(jobdescription_id: str, user_id: str = Query(..., description="User ID to verify ownership")):
    """Löscht eine Stellenausschreibung."""
    try:
        doc = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Stellenausschreibung nicht gefunden")
        
        if str(doc.get("userId", "")) != user_id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung für diese Stellenausschreibung")
        
        delete_result = collection_jobdesc.delete_one({"_id": ObjectId(jobdescription_id)})
        
        if delete_result.deleted_count:
            return {
                "status": "success",
                "message": "Stellenausschreibung erfolgreich gelöscht"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Fehler beim Löschen der Stellenausschreibung"
            )
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Löschen der Stellenausschreibung: {str(e)}"
        )

@router.get("/count")
async def count_jobdescriptions(user_id: str = Query(..., description="User ID to count job descriptions for")):
    count = collection_jobdesc.count_documents({"userId": user_id})
    return {"collection": "jobdescriptions", "count": count}

@router.patch("/patch/{jobdescription_id}")
async def patch_jobdescription(
    jobdescription_id: str,
    patch_data: JobDescriptionPatch,
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    """
    Aktualisiert eine Stellenausschreibung teilweise mit JSON Patch Operationen.
    
    - Unterstützt 'replace' Operationen für title, content und structured_jobdescription
    - Validiert die Benutzer-Berechtigung
    - Führt die Patch-Operationen in der angegebenen Reihenfolge aus
    """
    try:
        # Prüfe, ob die Stellenausschreibung existiert und dem Benutzer gehört
        jobdescription = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})
        if not jobdescription:
            raise HTTPException(status_code=404, detail="Stellenausschreibung nicht gefunden")
        
        if str(jobdescription.get("userId", "")) != user_id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung für diese Stellenausschreibung")
        
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
            if field not in ["title", "content", "structured_jobdescription"]:
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
        result = collection_jobdesc.update_one(
            {"_id": ObjectId(jobdescription_id)},
            {"$set": update_doc}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Keine Änderungen an der Stellenausschreibung vorgenommen")
        
        # Hole die aktualisierte Stellenausschreibung
        updated_jobdescription = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})
        
        return {
            "status": "success",
            "message": "Stellenausschreibung erfolgreich aktualisiert",
            "data": {
                "_id": str(updated_jobdescription["_id"]),
                "title": updated_jobdescription["title"],
                "content": updated_jobdescription.get("rawText", ""),
                "structured_jobdescription": updated_jobdescription.get("structured_jobdescription", {}),
                "createdAt": updated_jobdescription["createdAt"].isoformat(),
                "updatedAt": updated_jobdescription["updatedAt"].isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
