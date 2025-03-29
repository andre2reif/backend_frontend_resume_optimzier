from fastapi import APIRouter, HTTPException, Query, Form
from bson import ObjectId
from datetime import datetime
from app.core.database import collection_jobdesc
from app.prompts.prompt_jobdescription import get_prompt_messages as get_prompt_messages_jobdescription
from app.utils.calc import count_tokens
from openai import OpenAI
import os

router = APIRouter()
client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))

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
                "content": doc.get("content", ""),
                "createdAt": doc["createdAt"].isoformat(),
                "updatedAt": doc["updatedAt"].isoformat(),
                "status": doc["status"],
                "preview": doc.get("content", "")[:100] if "content" in doc else ""
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
        
        return {
            "status": "success",
            "message": "Stellenausschreibung erfolgreich geladen",
            "data": {
                "id": str(doc["_id"]),
                "title": doc["title"],
                "content": doc.get("content", ""),
                "createdAt": doc["createdAt"].isoformat(),
                "updatedAt": doc["updatedAt"].isoformat(),
                "status": doc["status"]
            }
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
            "content": content,
            "userId": user_id,
            "status": "draft",
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
                    "content": content,
                    "status": "draft",
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
async def count_jobpostings(user_id: str = Query(..., description="User ID to count job descriptions for")):
    count = collection_jobdesc.count_documents({"userId": user_id})
    return {"collection": "jobpostings", "count": count}
