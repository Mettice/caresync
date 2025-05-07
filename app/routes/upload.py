from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import os
import io
from ..database import get_db_dependency
from ..models.document import Document

router = APIRouter()

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db_dependency)
):
    """
    Upload a document file and store it in the database
    """
    try:
        # Validate file extension
        file_ext = get_file_extension(file.filename)
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="File type not allowed")
        
        # Read and validate file content
        file_data = await file.read()
        if len(file_data) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
        if len(file_data) == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Store file in database
        document = Document(
            filename=file.filename,
            file_type=file_ext,
            content_type=file.content_type,
            file_data=file_data
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return {"message": "File uploaded successfully", "document": document.to_dict()}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()

@router.get("/documents")
def list_documents(db: Session = Depends(get_db_dependency)) -> List[dict]:
    """
    List all uploaded documents
    """
    try:
        documents = db.query(Document).order_by(Document.upload_time.desc()).all()
        return [doc.to_dict() for doc in documents]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db_dependency)):
    """
    Get a specific document's metadata
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document.to_dict()

@router.get("/download/{document_id}")
def download_document(document_id: int, db: Session = Depends(get_db_dependency)):
    """
    Download a specific document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return StreamingResponse(
        io.BytesIO(document.file_data),
        media_type=document.content_type,
        headers={"Content-Disposition": f"attachment; filename={document.filename}"}
    )