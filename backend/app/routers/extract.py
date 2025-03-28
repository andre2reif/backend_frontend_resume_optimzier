from fastapi import APIRouter, HTTPException, UploadFile, File
from PyPDF2 import PdfReader
import io

router = APIRouter()

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """Extrahiert Text aus einer PDF-Datei."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Nur PDF-Dateien sind erlaubt")

    try:
        content = await file.read()
        pdf = PdfReader(io.BytesIO(content))
        
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n\n"
        
        return {"text": text}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Extrahieren des PDF-Textes: {str(e)}"
        )
    finally:
        await file.close() 