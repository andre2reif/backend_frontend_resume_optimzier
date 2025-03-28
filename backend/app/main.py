from fastapi import FastAPI, HTTPException, Query, Body
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
import certifi
from datetime import datetime
from app.routers import resume, coverletter, jobdescription, analysis, coverletter_analysis, extract
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware

# Eigene Prompt-Funktionen importieren
from app.prompts.prompt_resume import get_prompt_messages as get_prompt_messages_resume
from app.prompts.prompt_coverletter import get_prompt_messages as get_prompt_messages_coverletter
from app.prompts.prompt_jobdescription import get_prompt_messages as get_prompt_messages_jobdescription
from app.prompts.prompt_analysis import get_prompt_messages as get_prompt_messages_analysis

from app.prompts.prompt_resume_optimize import get_prompt_messages as get_prompt_messages_resume_optimize
from app.prompts.prompt_analysis_optimized import get_prompt_messages as get_prompt_messages_analysis_optimized

from app.prompts.prompt_coverletter_analysis import get_prompt_messages as get_prompt_messages_coverletter_analysis
from app.prompts.prompt_coverletter_optimize import get_prompt_messages as get_prompt_messages_coverletter_optimize

from app.prompts.prompt_analysis_all_optimized import get_prompt_messages_optimized_resume 
from app.prompts.prompt_analysis_all_optimized import get_prompt_messages_optimized_coverletter 
from app.prompts.prompt_coverletter_optimize import get_prompt_messages as get_prompt_messages_coverletter_optimize

load_dotenv()


client = OpenAI(api_key=os.getenv("RESUME_OPENAI_API_KEY"))

client_db = MongoClient(
    os.getenv("MONGODB_URI"),
    tls=True,
    tlsCAFile=certifi.where()
)

# Collections für Resume
db_resume = client_db["resume_db"]
collection_resume = db_resume["resumes"]

# Collections für Cover Letter
db_coverletter = client_db["coverletter_db"]
collection_coverletter = db_coverletter["coverLetter"]

# Collections für Jobdescription
db_jobdesc = client_db["jobposting_db"]
collection_jobdesc = db_jobdesc["jobPostings"]

# Collection für die Analyse
db_analysis = client_db["analysis_db"]
collection_analysis = db_analysis["analysis"]

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS-Konfiguration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3002"],  # Frontend-URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router einbinden
app.include_router(resume.router, prefix="/api/v1/resumes", tags=["resumes"])
app.include_router(coverletter.router, prefix="/api/v1/coverletters", tags=["coverletters"])
app.include_router(jobdescription.router, prefix="/api/v1/jobdescriptions", tags=["jobdescriptions"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(coverletter_analysis.router, prefix="/api/v1/coverletter-analysis", tags=["coverletter-analysis"])
app.include_router(extract.router, prefix="/api/v1", tags=["extract"])

def count_documents(collection):
    return collection.count_documents({})

# ##################################################
# ## Lese-Endpunkte für die Dokumentenzählung     ##
# ##################################################
@app.get("/count/analysis")
async def count_analysis():
    count = count_documents(collection_analysis)
    return {"collection": "analysis", "count": count}

@app.get("/count/resumes")
async def count_resumes():
    count = count_documents(collection_resume)
    return {"collection": "resumes", "count": count}

@app.get("/count/coverletters")
async def count_coverletters():
    count = count_documents(collection_coverletter)
    return {"collection": "coverletters", "count": count}

@app.get("/count/jobpostings")
async def count_jobpostings():
    count = count_documents(collection_jobdesc)
    return {"collection": "jobpostings", "count": count}

# #############################
# ## Ansicht von Dokument_id ##
# #############################
def convert_objectids(obj):
    """
    Rekursive Funktion, die alle bson.ObjectId in Strings umwandelt.
    """
    if isinstance(obj, dict):
        return {k: convert_objectids(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectids(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

@app.get("/view")
async def view_document(
    analysis_id: str = Query(None, description="MongoDB _id of the analysis document"),
    resume_id: str = Query(None, description="MongoDB _id of the resume"),
    coverLetter_id: str = Query(None, description="MongoDB _id of the cover letter"),
    jobdescription_id: str = Query(None, description="MongoDB _id of the job description"),
    user_id: str = Query(..., description="User ID (as string) to restrict access")

):
    """
    Ruft das gewünschte Dokument aus der entsprechenden Collection ab.
    
    Erlaubte Query-Parameter:
      - analysis_id
      - resume_id
      - coverLetter_id
      - jobdescription_id
    
    Beispiel-URLs:
      - /view?analysis_id=67e3258314faaade09bf8e38
      - /view?coverLetter_id=67e2bf3030e88d7728f5b057
      - /view?resume_id=67e2bfb64a73a557d0035844
      - /view?jobdescription_id=67e2bf5403d2f0385ecbe633

    Rückgabe: Das gefundene Dokument als JSON, wobei alle ObjectId-Felder als Strings vorliegen.
    """
    doc = None
    collection_name = ""
    
    if analysis_id:
        doc = collection_analysis.find_one({"_id": ObjectId(analysis_id)})
        collection_name = "analysis"
    elif resume_id:
        doc = collection_resume.find_one({"_id": ObjectId(resume_id)})
        collection_name = "resumes"
    elif coverLetter_id:
        doc = collection_coverletter.find_one({"_id": ObjectId(coverLetter_id)})
        collection_name = "coverletters"
    elif jobdescription_id:
        doc = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})
        collection_name = "jobpostings"
    else:
        raise HTTPException(status_code=400, detail="Bitte mindestens einen Parameter (analysis_id, resume_id, coverLetter_id oder jobdescription_id) angeben.")
    
    if not doc:
        raise HTTPException(status_code=404, detail=f"Dokument in {collection_name} nicht gefunden.")
    
    # Sicherheitscheck: Prüfen, ob das Dokument zum Benutzer gehört
    if str(doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Document does not belong to this user.")
    
    # Rekursive Umwandlung aller ObjectId-Felder in Strings
    doc = convert_objectids(doc)
    
    return doc

# ###############################
# ## Dokument-Strukturierungen ##
# ###############################
@app.get("/extract-structured-document")
async def extract_structured_document(
    document_id: str = Query(..., description="MongoDB document _id"),
    document_type: str = Query(..., regex="^(resume|coverletter|jobdescription)$", description="Type of document: resume, coverletter, or jobdescription"),
    language: str = Query("de", description="Target language: en, de, pl"),
    user_id: str = Query(..., description="User ID (as string) to restrict access")
):
    """
    Extrahiert den 'rawText' eines Dokuments (Resume, Coverletter oder Jobdescription),
    strukturiert diesen mithilfe eines Prompt-Moduls und speichert das strukturierte Ergebnis
    in der jeweiligen Collection. Falls das Dokument bereits strukturiert und in der gewünschten Sprache
    vorliegt, wird das vorhandene Ergebnis zurückgegeben.
    
    Endpoint: 
    GET /extract-structured-document?document_id=67e2bfb64a73a557d0035844&document_type=resume&language=de&user_id=67e2bfb64a73a557d0035843

    Parameter:
      - document_id: Die MongoDB _id des Dokuments.
      - document_type: "resume", "coverletter" oder "jobdescription".
      - language: Zielsprache ("en", "de", "pl").
    
    Rückgabe:
      JSON mit "status", "document_type" und "result" (das strukturierte Dokument).
    """
    if document_type == "resume":
        collection = collection_resume
        prompt_func = get_prompt_messages_resume
        structured_key = "structured_resume"
    elif document_type == "coverletter":
        collection = collection_coverletter
        prompt_func = get_prompt_messages_coverletter
        structured_key = "structured_coverletter"
    elif document_type == "jobdescription":
        collection = collection_jobdesc
        prompt_func = get_prompt_messages_jobdescription
        structured_key = "structured_jobdescription"
    else:
        raise HTTPException(status_code=400, detail="Invalid document_type")

    doc = collection.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail=f"{document_type.capitalize()} not found in database.")

    # Sicherheitscheck: Prüfen, ob das Dokument zum übergebenen User gehört.
    if str(doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Document does not belong to this user.")

    raw_text = doc.get("rawText")
    if not raw_text:
        raise HTTPException(status_code=400, detail="Missing rawText in document")

    existing_language = doc.get("language", "")
    status = doc.get("status", "")

    # Falls bereits strukturiert + Sprache passt => Ergebnis zurückgeben
    if status == "structured_complete" and existing_language == language:
        return {
            "status": status,
            "document_type": document_type,
            "result": doc.get(structured_key)
        }

    token_count = count_tokens(raw_text, settings.OPENAI_MODEL)
    if token_count > settings.MAX_TOKENS:
        raise HTTPException(
            status_code=400,
            detail=f"Document is too long: {token_count} tokens. Max allowed: {settings.MAX_TOKENS}"
        )

    messages = prompt_func(raw_text, language)

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        ai_output = response.choices[0].message.content

        try:
            structured_json = json.loads(ai_output)
            status = "structured_complete"
        except json.JSONDecodeError:
            structured_json = {"raw_response": ai_output}
            status = "structured_incomplete"

    except Exception as e:
        structured_json = {"error": str(e)}
        status = "structured_failed"

    collection.update_one(
        {"_id": ObjectId(document_id)},
        {
            "$set": {
                structured_key: structured_json,
                "status": status,
                "language": language
            }
        }
    )

    return {
        "status": status,
        "document_type": document_type,
        "result": structured_json
    }

# ########################################
# ## ATS Analyse (Resume + Coverletter) ##
# ########################################
@app.get("/analysis-ats")
async def analysis_ats(
    resume_id: str = Query(..., description="MongoDB _id of the resume"),
    coverletter_id: str = Query(..., description="MongoDB _id of the cover letter"),
    jobdescription_id: str = Query(..., description="MongoDB _id of the job description"),
    language: str = Query("de", description="Target language: en, de, pl"),
    use_optimized_resume: bool = Query(False, description="Wenn true, wird der optimierte Lebenslauf verwendet, sonst der strukturierte"),
    use_optimized_coverletter: bool = Query(False, description="Wenn true, wird das optimierte Anschreiben verwendet, sonst das strukturierte"),
    update_existing_analysis_id: str = Query(None, description="Wenn gesetzt, wird das bestehende Analyse-Dokument aktualisiert"),
    user_id: str = Query(..., description="User ID (als String) zur Zugriffsbeschränkung")
):
    """
    Führt eine kombinierte ATS-Analyse durch, die den Lebenslauf (optimiert oder strukturiert),
    das Anschreiben und die Stellenbeschreibung berücksichtigt. Dabei wird auch eine separate
    Analyse des Anschreibens (Cover Letter) vorgenommen.
    
    Parameter:
      - resume_id: MongoDB _id des Lebenslaufs
      - coverletter_id: MongoDB _id des Anschreibens
      - jobdescription_id: MongoDB _id der Stellenbeschreibung
      - language: Zielsprache ("en", "de", "pl")
      - use_optimized_resume: Wenn true, wird der optimierte Lebenslauf verwendet, sonst der strukturierte
      - use_optimized_coverletter: Wenn true, wird das optimierte Anschreiben verwendet, sonst das strukturierte
      - update_existing_analysis_id: Falls gesetzt, wird das bestehende Analyse-Dokument aktualisiert
      - user_id: User ID zur Zugriffsbeschränkung
    
    Beispiel-URL:
      http://127.0.0.1:8001/analysis-ats?resume_id=67e40d4c4bd9b5794700d344&coverletter_id=67e40d2b3f102d51c7610c92&jobdescription_id=67e40d3d94e6433545a608dd&language=de&use_optimized_resume=false&use_optimized_coverletter=false&user_id=fff3a8923a9c3b6e12345678

    Rückgabe:
      JSON mit "analysis_id", "status" und "analysisResult" (mit den Schlüsseln "ats_analysis" und "coverletter_analysis")
    """
    # Dokumente laden
    resume_doc = collection_resume.find_one({"_id": ObjectId(resume_id)})
    coverletter_doc = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
    jobdesc_doc = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})

    if not resume_doc or not coverletter_doc or not jobdesc_doc:
        raise HTTPException(status_code=404, detail="Mindestens ein Dokument nicht gefunden.")

    # Sicherheitsprüfung: Überprüfe, ob alle Dokumente zum gleichen user_id gehören.
    if str(resume_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Resume does not belong to this user.")
    if str(coverletter_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Cover letter does not belong to this user.")
    if str(jobdesc_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Job description does not belong to this user.")


    resume_field = "optimized_resume" if use_optimized_resume else "structured_resume"
    structured_resume = resume_doc.get(resume_field)
    
    # ... und für das Anschreiben.
    coverletter_field = "optimized_coverletter" if use_optimized_coverletter else "structured_coverletter"
    structured_coverletter = coverletter_doc.get(coverletter_field)

    print(structured_coverletter)
    structured_jobdesc = jobdesc_doc.get("structured_jobdescription")

    if not structured_resume or not structured_coverletter or not structured_jobdesc:
        raise HTTPException(status_code=400,
            detail="Bitte stelle sicher, dass alle Dokumente strukturiert sind. (Nutze /extract-structured-document)")

    # 1) ATS Analyse (Resume + Cover Letter + Jobdesc)
    ats_messages = get_prompt_messages_analysis(
        job_description=structured_jobdesc,
        cover_letter=structured_coverletter,
        resume=structured_resume,
        language=language
    )
    try:
        ats_response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=ats_messages,
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        ats_output = ats_response.choices[0].message.content
        try:
            ats_analysis_json = json.loads(ats_output)
            ats_status = "analysis_complete"
        except json.JSONDecodeError:
            ats_analysis_json = {"raw_response": ats_output}
            ats_status = "analysis_incomplete"
    except Exception as e:
        ats_analysis_json = {"error": str(e)}
        ats_status = "analysis_failed"

    # 2) Cover Letter Analyse (Anschreiben separat analysieren)
    cl_messages = get_prompt_messages_coverletter_analysis(
        cover_letter=structured_coverletter,
        job_description=structured_jobdesc,
        language=language
    )
    try:
        cl_response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=cl_messages,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        cl_output = cl_response.choices[0].message.content
        try:
            cl_analysis_json = json.loads(cl_output)
            cl_status = "analysis_complete"
        except json.JSONDecodeError:
            cl_analysis_json = {"raw_response": cl_output}
            cl_status = "analysis_incomplete"
    except Exception as e:
        cl_analysis_json = {"error": str(e)}
        cl_status = "analysis_failed"

    # Kombiniere die Ergebnisse in einer flachen Struktur
    combined_analysis = {
        "resume": ats_analysis_json,
        "coverletter": cl_analysis_json
    }
    
    # Bestimme den Gesamtstatus: Falls einer der beiden Analysen fehlschlägt, gilt das Gesamtergebnis als "analysis_failed".
    overall_status = "analysis_complete" if ats_status == "analysis_complete" and cl_status == "analysis_complete" else "analysis_incomplete"
    if ats_status == "analysis_failed" or cl_status == "analysis_failed":
        overall_status = "analysis_failed"
    
    # Speichere das kombinierte Analyse-Ergebnis in der Collection analysis_db.analysis.
    # Dabei werden die IDs von Lebenslauf, Anschreiben und Stellenbeschreibung gespeichert.
    if update_existing_analysis_id:
        collection_analysis.update_one(
            {"_id": ObjectId(update_existing_analysis_id)},
            {"$set": {
                "analysisResult": combined_analysis,
                "analysis_status": overall_status,
                "updatedAt": datetime.utcnow()
            }}
        )
        analysis_id = update_existing_analysis_id
    else:
        result_doc = {
            "resumeId": resume_id,
            "coverLetterId": coverletter_id,
            "jobDescriptionId": jobdescription_id,
            "userId": user_id,
            "analysisResult": combined_analysis,
            "analysis_status": overall_status,
            "language": language,
            "createdAt": datetime.utcnow()
        }
        insert_result = collection_analysis.insert_one(result_doc)
        analysis_id = str(insert_result.inserted_id)
    
    return {
        "analysis_id": analysis_id,
        "status": overall_status,
        "analysisResult": combined_analysis
    }

# ########################################
# ## ATS Analyse (Resume + Coverletter) ##
# ########################################
@app.get("/analysis-ats_optimized")
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
    # hier muss get_prompt_messages_all_optimized verwendet werden
    # und geschaut werdne wie wir das mit den getrennten prompts machen, 
    """
    Führt eine kombinierte ATS-Analyse durch, die den Lebenslauf (optimiert oder strukturiert),
    das Anschreiben und die Stellenbeschreibung berücksichtigt. Dabei wird auch eine separate
    Analyse des Anschreibens (Cover Letter) vorgenommen.
    
    Parameter:
      - resume_id: MongoDB _id des Lebenslaufs.
      - coverletter_id: MongoDB _id des Anschreibens.
      - jobdescription_id: MongoDB _id der Stellenbeschreibung.
      - language: Zielsprache ("en", "de", "pl").
      - use_optimized_resume: Wenn true, wird der optimierte Lebenslauf verwendet.
      - update_existing_analysis_id: Falls gesetzt, wird das bestehende Analyse-Dokument aktualisiert.
    
      http://127.0.0.1:8000/analysis-ats?resume_id=67e2bfb64a73a557d0035844&coverletter_id=67e2bf3030e88d7728f5b057&jobdescription_id=67e2bf5403d2f0385ecbe633&language=de&use_optimized_resume=true&update_existing_analysis_id=67e2c256ed0b3455107e49a5
      http://127.0.0.1:8000/analysis-ats?resume_id=67e2bfb64a73a557d0035844&coverletter_id=67e2bf3030e88d7728f5b057&jobdescription_id=67e2bf5403d2f0385ecbe633&language=de

      http://127.0.0.1:8000/analysis-ats_optimized?resume_id=67e3c1fc251b88cde6aac4ed&coverletter_id=67e3c1d916ce67f71b000495&jobdescription_id=67e3c1eed7ef130d009d0b2d&language=de&user_id=fff3a8923a9c3b6e12345678
      http://127.0.0.1:8000/analysis-ats_optimized?resume_id=67e3c1fc251b88cde6aac4ed&coverletter_id=67e3c1d916ce67f71b000495&jobdescription_id=67e3c1eed7ef130d009d0b2d&language=de&use_optimized_coverletter=true&use_optimized_resume=true&user_id=fff3a8923a9c3b6e12345678
    Rückgabe:
      JSON mit "analysis_id", "status" und "analysisResult" (mit den Schlüsseln "ats_analysis" und "coverletter_analysis").
    """
    # Dokumente laden
    resume_doc = collection_resume.find_one({"_id": ObjectId(resume_id)})
    coverletter_doc = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
    jobdesc_doc = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})

    if not resume_doc or not coverletter_doc or not jobdesc_doc:
        raise HTTPException(status_code=404, detail="Mindestens ein Dokument nicht gefunden.")

    # Sicherheitsprüfung: Überprüfe, ob alle Dokumente zum gleichen user_id gehören.
    if str(resume_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Resume does not belong to this user.")
    if str(coverletter_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Cover letter does not belong to this user.")
    if str(jobdesc_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Job description does not belong to this user.")


    resume_field = "optimized_resume" if use_optimized_resume else "structured_resume"
    structured_resume = resume_doc.get(resume_field)
    
    # ... und für das Anschreiben.
    coverletter_field = "optimized_coverletter" if use_optimized_coverletter else "structured_coverletter"
    structured_coverletter = coverletter_doc.get(coverletter_field)

    structured_jobdesc = jobdesc_doc.get("structured_jobdescription")

    if not structured_resume or not structured_coverletter or not structured_jobdesc:
        raise HTTPException(status_code=400,
            detail="Bitte stelle sicher, dass alle Dokumente strukturiert sind. (Nutze /extract-structured-document)")

    # 1) ATS Analyse (Resume + Cover Letter + Jobdesc)
    ats_messages = get_prompt_messages_optimized_resume(
        job_description=structured_jobdesc,
        cover_letter=structured_coverletter,
        resume=structured_resume,
        language=language
    )
    try:
        ats_response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=ats_messages,
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        ats_output = ats_response.choices[0].message.content
        try:
            ats_analysis_json = json.loads(ats_output)
            ats_status = "analysis_complete"
        except json.JSONDecodeError:
            ats_analysis_json = {"raw_response": ats_output}
            ats_status = "analysis_incomplete"
    except Exception as e:
        ats_analysis_json = {"error": str(e)}
        ats_status = "analysis_failed"

    # 2) Cover Letter Analyse (Anschreiben separat analysieren)
    cl_messages = get_prompt_messages_optimized_coverletter(
        cover_letter=structured_coverletter,
        job_description=structured_jobdesc,
        language=language
    )
    try:
        cl_response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=cl_messages,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        cl_output = cl_response.choices[0].message.content
        try:
            cl_analysis_json = json.loads(cl_output)
            cl_status = "analysis_complete"
        except json.JSONDecodeError:
            cl_analysis_json = {"raw_response": cl_output}
            cl_status = "analysis_incomplete"
    except Exception as e:
        cl_analysis_json = {"error": str(e)}
        cl_status = "analysis_failed"

    # Kombiniere die Ergebnisse in einer flachen Struktur
    combined_analysis = {
        "resume": ats_analysis_json,
        "coverletter": cl_analysis_json
    }
    
    # Bestimme den Gesamtstatus: Falls einer der beiden Analysen fehlschlägt, gilt das Gesamtergebnis als "analysis_failed".
    overall_status = "analysis_complete" if ats_status == "analysis_complete" and cl_status == "analysis_complete" else "analysis_incomplete"
    if ats_status == "analysis_failed" or cl_status == "analysis_failed":
        overall_status = "analysis_failed"
    
    # Speichere das kombinierte Analyse-Ergebnis in der Collection analysis_db.analysis.
    # Dabei werden die IDs von Lebenslauf, Anschreiben und Stellenbeschreibung gespeichert.
    if update_existing_analysis_id:
        collection_analysis.update_one(
            {"_id": ObjectId(update_existing_analysis_id)},
            {"$set": {
                "analysisResult": combined_analysis,
                "analysis_status": overall_status,
                "updatedAt": datetime.utcnow()
            }}
        )
        analysis_id = update_existing_analysis_id
    else:
        result_doc = {
            "resumeId": resume_id,
            "coverLetterId": coverletter_id,
            "jobDescriptionId": jobdescription_id,
            "userId": user_id,
            "analysisResult": combined_analysis,
            "analysis_status": overall_status,
            "language": language,
            "createdAt": datetime.utcnow()
        }
        insert_result = collection_analysis.insert_one(result_doc)
        analysis_id = str(insert_result.inserted_id)
    
    return {
        "analysis_id": analysis_id,
        "status": overall_status,
        "analysisResult": combined_analysis
    }

'''# ################################################################
# Analyse des Anschreibens (separater Endpunkt, falls benötigt) ##
# ################################################################
@app.get("/analysis-coverletter")
async def analysis_coverletter(
    coverletter_id: str = Query(..., description="MongoDB _id of the cover letter"),
    jobdescription_id: str = Query(..., description="MongoDB _id of the job description"),
    language: str = Query("de", description="Target language: en, de, pl")
):
    """
    Führt eine Analyse des Anschreibens durch – unter Einbeziehung der zugehörigen Stellenbeschreibung.
    Das Ergebnis wird als separates Analyse-Dokument in der Collection analysis_db.analysis gespeichert.
    
    Endpoint: GET /analysis-coverletter?coverletter_id=...&jobdescription_id=...&language=...
    """
    coverletter_doc = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
    if not coverletter_doc:
        raise HTTPException(status_code=404, detail="Cover letter not found.")
    structured_coverletter = coverletter_doc.get("structured_coverletter")
    if not structured_coverletter:
        raise HTTPException(status_code=400, detail="Cover letter not structured yet. Use /extract-structured-document first.")

    jobdesc_doc = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})
    if not jobdesc_doc:
        raise HTTPException(status_code=404, detail="Job description not found.")
    structured_jobdesc = jobdesc_doc.get("structured_jobdescription")
    if not structured_jobdesc:
        raise HTTPException(status_code=400, detail="Job description not structured yet. Use /extract-structured-document first.")

    messages = get_prompt_messages_coverletter_analysis(structured_coverletter, structured_jobdesc, language)
    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        ai_output = response.choices[0].message.content
        try:
            coverletter_analysis_json = json.loads(ai_output)
            analysis_status = "analysis_complete"
        except json.JSONDecodeError:
            coverletter_analysis_json = {"raw_response": ai_output}
            analysis_status = "analysis_incomplete"
    except Exception as e:
        coverletter_analysis_json = {"error": str(e)}
        analysis_status = "analysis_failed"

    result_doc = {
        "coverLetterId": coverletter_id,
        "jobDescriptionId": jobdescription_id,
        "analysisResult": {"cover_letter_analysis": coverletter_analysis_json},
        "status": analysis_status,
        "language": language,
        "createdAt": datetime.utcnow()
    }
    insert_result = collection_analysis.insert_one(result_doc)
    return {
        "analysis_id": str(insert_result.inserted_id),
        "status": analysis_status,
        "analysisResult": coverletter_analysis_json
    }
'''

# ###########################################################
# ## Optimierung des Lebenslaufs basierend auf der Analyse ##
# ###########################################################
@app.get("/optimize-resume-from-analysis")
async def optimize_resume_from_analysis(
    analysis_id: str = Query(..., description="MongoDB _id from the analysis document"),
    language: str = Query("de", description="Target language: en, de, pl"),
    user_id: str = Query(..., description="User ID (as string) to restrict access")

):
    """
    Optimiert den Lebenslauf basierend auf einem existierenden Analyse-Dokument.
    - Das Analyse-Dokument enthält die resumeId und Verbesserungsvorschläge.
    - Der zugehörige Lebenslauf wird geladen und der Prompt zur Optimierung wird erstellt.
    - Das optimierte Ergebnis wird in der Resume-Collection gespeichert.
    
    Endpoint-Beispiel:
      /optimize-resume-from-analysis?analysis_id=...&language=de
      
    http://127.0.0.1:8000/optimize-resume-from-analysis?analysis_id=DEINE_ID&language=de
    http://127.0.0.1:8000/optimize-resume-from-analysis?analysis_id=67e3258314faaade09bf8e38&language=de
    
    Rückgabe:
      JSON mit "analysis_id", "resume_id", "optimize_status" und "optimized_resume".
    """
    # 1. Analysis-Dokument laden
    analysis_doc = collection_analysis.find_one({"_id": ObjectId(analysis_id)})
    if not analysis_doc:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    # 2. ResumeId, improvement_suggestions etc. aus analysisResult holen
    resume_id = analysis_doc.get("resumeId")
    if not resume_id:
        raise HTTPException(status_code=400, detail="No resumeId in analysis document.")

    # Z.B. improvement_suggestions = analysisResult.analysis.improvement_suggestions
    analysis_result = analysis_doc.get("analysisResult", {})
    analysis_nested = analysis_result.get("resume", {}).get("analysis", {})
    improvement_suggestions = analysis_nested.get("improvement_suggestions", {})

    # Optional: Hole additional_keywords aus match_score
    match_score = analysis_nested.get("match_score", {})
    additional_keywords = match_score.get("additional_keywords", [])
    print('additional_keywords:', additional_keywords)
    # Füge additional_keywords strukturiert zu den improvement_suggestions hinzu
    if additional_keywords:
        # Falls der Schlüssel bereits existiert, kannst du die Listen zusammenführen,
        # ansonsten setze ihn einfach.
        if "additional_keywords" in improvement_suggestions:
            # Falls improvement_suggestions["additional_keywords"] schon eine Liste ist:
            if isinstance(improvement_suggestions["additional_keywords"], list):
                improvement_suggestions["additional_keywords"].extend(additional_keywords)
            else:
                improvement_suggestions["additional_keywords"] = additional_keywords
        else:
            improvement_suggestions["additional_keywords"] = additional_keywords


    # 3. Resume-Dokument laden
    resume_doc = collection_resume.find_one({"_id": ObjectId(resume_id)})
    if not resume_doc:
        raise HTTPException(status_code=404, detail="Resume not found in database.")

    structured_resume = resume_doc.get("structured_resume")
    if not structured_resume:
        raise HTTPException(
            status_code=400,
            detail="Resume has not been structured yet. Use /extract-structured-document first."
        )

    if str(analysis_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Resume does not belong to this user.")
    

    # 4. Prompt erstellen und an OpenAI senden
    messages = get_prompt_messages_resume_optimize(
        resume_content=structured_resume,
        improvement_suggestions=improvement_suggestions,
        language=language
    )

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        ai_output = response.choices[0].message.content

        try:
            optimized_resume_json = json.loads(ai_output)
            optimize_status = "optimized_complete"
        except json.JSONDecodeError:
            optimized_resume_json = {"raw_response": ai_output}
            optimize_status = "optimized_incomplete"
    except Exception as e:
        optimized_resume_json = {"error": str(e)}
        optimize_status = "optimized_failed"

    # 5. Speichern (z. B. unter 'optimized_resume')
    collection_resume.update_one(
        {"_id": ObjectId(resume_id)},
        {
            "$set": {
                "optimized_resume": optimized_resume_json,
                "optimized_status": optimize_status,
                "optimizedAt": datetime.utcnow()
            }
        }
    )

    return {
        "analysis_id": analysis_id,
        "resume_id": str(resume_id),
        "optimize_status": optimize_status,
        "optimized_resume": optimized_resume_json
    }

# ###########################################################
# ## Optimierung des Anschreiben basierend auf der Analyse ##
# ###########################################################
@app.get("/optimize-coverletter-from-analysis")
async def optimize_coverletter_from_analysis(
    analysis_id: str = Query(..., description="MongoDB _id from the analysis document (cover letter analysis)"),
    language: str = Query("de", description="Target language: en, de, pl"),
    user_id: str = Query(..., description="User ID (as string) to restrict access")

):
    """
    Optimiert das Anschreiben (Cover Letter) basierend auf einem existierenden Analyse-Dokument.
    - Das Analyse-Dokument enthält die coverLetterId und Verbesserungsvorschläge.
    - Das zugehörige Anschreiben wird geladen und der Prompt zur Optimierung wird erstellt.
    - Das optimierte Ergebnis wird in der CoverLetter-Collection gespeichert.
    
    Endpoint-Beispiel:
      /optimize-coverletter-from-analysis?analysis_id=DEINE_ID&language=de
      http://127.0.0.1:8000/optimize-coverletter-from-analysis?analysis_id=67e3258314faaade09bf8e38&language=de

    Rückgabe:
      JSON mit "analysis_id", "coverletter_id", "optimize_status" und "optimized_coverletter".
    """
    # 1. Analyse-Dokument laden
    analysis_doc = collection_analysis.find_one({"_id": ObjectId(analysis_id)})
    if not analysis_doc:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    # Sicherheitsprüfung: Überprüfe, ob das Analyse-Dokument zum angegebenen user_id gehört
    if str(analysis_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Analysis document does not belong to this user.")

    # 2. CoverLetterId und Verbesserungsvorschläge aus dem Analyse-Dokument holen
    coverletter_id = analysis_doc.get("coverLetterId")
    if not coverletter_id:
        raise HTTPException(status_code=400, detail="No coverLetterId in analysis document.")

    # 3. Verbesserungsvorschläge aus dem Analyse-Dokument extrahieren (ggf. unter einem passenden Schlüssel)
    analysis_result = analysis_doc.get("analysisResult", {})
    improvement_suggestions = analysis_result.get("coverletter", {}).get("cover_letter_analysis", {})

    print('improvement_suggestion of main:', improvement_suggestions)
    # 4. Anschreiben aus der Datenbank laden
    coverletter_doc = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
    if not coverletter_doc:
        raise HTTPException(status_code=404, detail="Cover letter not found in database.")
    
    structured_coverletter = coverletter_doc.get("structured_coverletter")
    if not structured_coverletter:
        raise HTTPException(status_code=400, detail="Cover letter has not been structured yet. Use /extract-structured-document first.")

    # 5. Jobbeschreibung laden (zum Vergleich des Betreffs)
    jobdesc_id = analysis_doc.get("jobDescriptionId")
    if not jobdesc_id:
        raise HTTPException(status_code=400, detail="No jobDescriptionId in analysis document.")
    jobdesc_doc = collection_jobdesc.find_one({"_id": ObjectId(jobdesc_id)})
    if not jobdesc_doc:
        raise HTTPException(status_code=404, detail="Job description not found in database.")
    structured_jobdesc = jobdesc_doc.get("structured_jobdescription")
    if not structured_jobdesc:
        raise HTTPException(status_code=400, detail="Job description has not been structured yet. Use /extract-structured-document first.")

    # 6. Prompt erstellen und an OpenAI senden
    messages = get_prompt_messages_coverletter_optimize(
        coverletter_content=structured_coverletter,
        job_description=structured_jobdesc,
        improvement_suggestions=improvement_suggestions,
        language=language
    )

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        ai_output = response.choices[0].message.content
        try:
            optimized_coverletter_json = json.loads(ai_output)
            optimize_status = "optimized_complete"
        except json.JSONDecodeError:
            optimized_coverletter_json = {"raw_response": ai_output}
            optimize_status = "optimized_incomplete"
    except Exception as e:
        optimized_coverletter_json = {"error": str(e)}
        optimize_status = "optimized_failed"

    # 7. Speichern des optimierten Anschreibens in der CoverLetter-Collection
    collection_coverletter.update_one(
        {"_id": ObjectId(coverletter_id)},
        {
            "$set": {
                "optimized_coverletter": optimized_coverletter_json,
                "optimized_status": optimize_status,
                "optimizedAt": datetime.utcnow()
            }
        }
    )

    return {
        "analysis_id": analysis_id,
        "coverletter_id": coverletter_id,
        "optimize_status": optimize_status,
        "optimized_coverletter": optimized_coverletter_json
    }

# ############################################
# ## ATS Analyse auf optimiertem Lebenslauf ##
# ############################################
@app.get("/analysis-ats-optimized")
async def analysis_ats_optimized(
    resume_id: str = Query(...),
    coverletter_id: str = Query(...),
    jobdescription_id: str = Query(...),
    language: str = Query("de"),
    update_existing_analysis_id: str = Query(None),
    user_id: str = Query(..., description="User ID (as string) to restrict access")

):
    """
    Führt eine neue ATS-Analyse basierend auf dem optimierten Lebenslauf durch.
    Optional: Wenn update_existing_analysis_id angegeben ist, wird das bestehende Analyse-Dokument
    in der Collection analysis_db.analysis aktualisiert.
    
    Endpoint-Beispiele:
      - Neuer Eintrag:
        /analysis-ats-optimized?resume_id=...&coverletter_id=...&jobdescription_id=...&language=de
      - Update bestehender Analyse:
        /analysis-ats-optimized?resume_id=...&coverletter_id=...&jobdescription_id=...&language=de&update_existing_analysis_id=...
    
    Rückgabe:
      JSON mit "analysis_id", "status" und "analysisResult" (das optimierte Analyse-Ergebnis).
    """

    resume_doc = collection_resume.find_one({"_id": ObjectId(resume_id)})
    coverletter_doc = collection_coverletter.find_one({"_id": ObjectId(coverletter_id)})
    jobdesc_doc = collection_jobdesc.find_one({"_id": ObjectId(jobdescription_id)})


    
    if not resume_doc or not coverletter_doc or not jobdesc_doc:
        raise HTTPException(status_code=404, detail="One or more documents not found.")

    # Sicherheitsprüfung: Überprüfe, ob alle Dokumente zum gleichen user_id gehören.
    if str(resume_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Resume does not belong to this user.")
    if str(coverletter_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Cover letter does not belong to this user.")
    if str(jobdesc_doc.get("userId", "")) != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden: Job description does not belong to this user.")
    
    optimized_resume = resume_doc.get("optimized_resume")
    resume_str = json.dumps(resume_doc.get("optimized_resume"), ensure_ascii=False, indent=2)

    if not optimized_resume:
        raise HTTPException(status_code=400, detail="Resume not optimized yet.")

    messages = get_prompt_messages_analysis_optimized(
        job_description=jobdesc_doc.get("structured_jobdescription", {}),
        cover_letter=coverletter_doc.get("structured_coverletter", {}),
        optimized_resume=optimized_resume,
        language=language
    )

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        ai_output = response.choices[0].message.content
        try:
            optimized_analysis_json = json.loads(ai_output)
            analysis_status = "analysis_complete"
        except json.JSONDecodeError:
            optimized_analysis_json = {"raw_response": ai_output}
            analysis_status = "analysis_incomplete"
    except Exception as e:
        optimized_analysis_json = {"error": str(e)}
        analysis_status = "analysis_failed"

    # Optional: Bestehendes Analysis-Doc updaten
    if update_existing_analysis_id:
        collection_analysis.update_one(
            {"_id": ObjectId(update_existing_analysis_id)},
            {
                "$set": {
                    "analysisResult.optimized": optimized_analysis_json,
                    "analysisResult.optimized_status": analysis_status,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        return {
            "updated_analysis_id": update_existing_analysis_id,
            "status": analysis_status,
            "optimized_analysis": optimized_analysis_json
        }

    # Neu speichern
    result_doc = {
        "resumeId": resume_id,
        "coverLetterId": coverletter_id,
        "jobDescriptionId": jobdescription_id,
        "analysisResult": {
            "optimized": optimized_analysis_json,
            "optimized_status": analysis_status
        },
        "language": language,
        "createdAt": datetime.utcnow()
    }

    insert_result = collection_analysis.insert_one(result_doc)

    return {
        "analysis_id": str(insert_result.inserted_id),
        "status": analysis_status,
        "optimized_analysis": optimized_analysis_json
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Resume Optimizer API",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "openapi_url": f"{settings.API_V1_STR}/openapi.json"
    }
