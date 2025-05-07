import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.routes.chat import router as chat_router
from app.routes.upload import router as upload_router

# Create FastAPI app
app = FastAPI(
    title="CareSync AI",
    description="A clinic chatbot API with document processing and RAG capabilities",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api")
app.include_router(upload_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to CareSync AI API. See /docs for API documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)