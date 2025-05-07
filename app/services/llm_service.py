import os
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LLMService:
    """Service for interacting with Large Language Models (OpenAI or OpenRouter)"""
    
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "openai").lower()
        self.model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
        
        # Initialize the appropriate client based on provider
        if self.provider == "openai":
            from langchain_openai import ChatOpenAI
            self.api_key = os.getenv("OPENAI_API_KEY")
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY environment variable is required")
            
            self.llm = ChatOpenAI(
                model=self.model,
                temperature=0.3,
                api_key=self.api_key
            )
        
        elif self.provider == "openrouter":
            from langchain.llms import OpenRouter
            self.api_key = os.getenv("OPENROUTER_API_KEY")
            if not self.api_key:
                raise ValueError("OPENROUTER_API_KEY environment variable is required")
            
            self.llm = OpenRouter(
                model=self.model,
                api_key=self.api_key,
                temperature=0.3
            )
        
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    async def generate_response(self, 
                               question: str, 
                               context: Optional[List[Dict[str, Any]]] = None,
                               conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate a response to a user question using the configured LLM"""
        try:
            from langchain.prompts import ChatPromptTemplate
            from langchain.schema import StrOutputParser
            
            # Create a prompt template
            if context:
                template = """
                You are CareSync AI, a helpful clinic assistant. Answer the user's question based on the provided context.
                If you don't know the answer, say that you don't know and avoid making up information.
                
                Context:
                {context}
                
                User question: {question}
                
                Answer:
                """
                prompt = ChatPromptTemplate.from_template(template)
                chain = prompt | self.llm | StrOutputParser()
                answer = await chain.ainvoke({"context": str(context), "question": question})
            else:
                template = """
                You are CareSync AI, a helpful clinic assistant. Answer the user's question to the best of your ability.
                If you don't know the answer, say that you don't know and avoid making up information.
                
                User question: {question}
                
                Answer:
                """
                prompt = ChatPromptTemplate.from_template(template)
                chain = prompt | self.llm | StrOutputParser()
                answer = await chain.ainvoke({"question": question})
            
            # For now, we'll use a placeholder confidence score
            confidence = 0.8 if context else 0.5
            
            return {
                "answer": answer,
                "confidence": confidence,
                "conversation_id": conversation_id
            }
            
        except Exception as e:
            raise Exception(f"Error generating LLM response: {str(e)}")


def get_llm_service():
    """Dependency injection function for the LLM service"""
    return LLMService()