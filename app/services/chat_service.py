import os
import uuid
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ChatService:
    """Service for processing chat requests and generating responses"""
    
    def __init__(self, llm_service):
        self.llm_service = llm_service
        from app.services.vector_store_service import get_vector_store_service
        self.vector_store_service = get_vector_store_service()
    
    async def process_question(self, question: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """Process a user question and generate a response"""
        try:
            # Generate or use the provided conversation ID
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
            
            # Search for relevant context in the vector store
            sources = await self.vector_store_service.search(question, top_k=3)
            
            # Generate response using the LLM service
            if sources:
                response = await self.llm_service.generate_response(
                    question=question,
                    context=sources,
                    conversation_id=conversation_id
                )
            else:
                # If no relevant sources found, generate a response without context
                response = await self.llm_service.generate_response(
                    question=question,
                    conversation_id=conversation_id
                )
            
            # Format the response
            return {
                "answer": response["answer"],
                "sources": sources if sources else None,
                "confidence": response.get("confidence"),
                "conversation_id": conversation_id,
                "metadata": {
                    "has_context": bool(sources)
                }
            }
        
        except Exception as e:
            raise Exception(f"Error processing question: {str(e)}")