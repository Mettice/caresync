from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UploadResponse(BaseModel):
    """Response model for the document upload endpoint"""
    success: bool = Field(..., description="Whether the upload was successful")
    document_id: str = Field(..., description="Unique identifier for the uploaded document")
    filename: str = Field(..., description="Original filename of the uploaded document")
    document_type: Optional[str] = Field(None, description="Type/category of the document")
    num_chunks: int = Field(..., description="Number of chunks the document was split into")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata about the document")