from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Source(BaseModel):
    """Represents a source document used for generating a response"""
    document_name: str = Field(..., description="Name of the source document")
    page_number: Optional[int] = Field(None, description="Page number in the document")
    text_snippet: str = Field(..., description="Relevant text snippet from the document")
    relevance_score: Optional[float] = Field(None, description="Relevance score of this source")

class ChatRequest(BaseModel):
    """Request model for the chat endpoint"""
    question: str = Field(..., description="The user's question or message")
    conversation_id: Optional[str] = Field(None, description="Optional ID to maintain conversation context")

class ChatResponse(BaseModel):
    """Response model for the chat endpoint"""
    answer: str = Field(..., description="The AI-generated response to the user's question")
    sources: Optional[List[Source]] = Field(None, description="List of sources used to generate the response")
    confidence: Optional[float] = Field(None, description="Confidence score for the generated response")
    conversation_id: Optional[str] = Field(None, description="ID to maintain conversation context")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata about the response")