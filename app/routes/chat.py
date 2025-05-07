from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.services.llm_service import get_llm_service, LLMService

router = APIRouter(tags=["chat"])

# Request model
class ChatRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None

# Response model
class ChatResponse(BaseModel):
    answer: str
    confidence: float
    conversation_id: Optional[str] = None
    sources: Optional[List[Dict[str, Any]]] = None

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, llm_service: LLMService = Depends(get_llm_service)):
    """
    Process a chat request and return an AI-generated response
    """
    try:
        # Generate response using the LLM service
        result = await llm_service.generate_response(
            question=request.question,
            conversation_id=request.conversation_id
        )
        
        return ChatResponse(
            answer=result["answer"],
            confidence=result["confidence"],
            conversation_id=result.get("conversation_id"),
            sources=result.get("sources")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")