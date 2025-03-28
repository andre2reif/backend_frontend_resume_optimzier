from fastapi import APIRouter, HTTPException, UploadFile, File
from PyPDF2 import PdfReader
import io
import mammoth

router = APIRouter()

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """Extrahiert Text aus einer PDF- oder Word-Datei."""
    file_extension = file.filename.lower().split('.')[-1]
    
    if file_extension not in ['pdf', 'doc', 'docx']:
        raise HTTPException(status_code=400, detail="Nur PDF- und Word-Dateien sind erlaubt")

    try:
        content = await file.read()
        
        if file_extension == 'pdf':
            pdf = PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf.pages:
                text += page.extract_text() + "\n\n"
        else:  # doc oder docx
            result = mammoth.extract_raw_text(io.BytesIO(content))
            text = result.value
        
        return {"text": text}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Extrahieren des Textes: {str(e)}"
        )
    finally:
        await file.close() 