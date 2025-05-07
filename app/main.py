from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import route modules
from app.routes import chat, upload, forms, email_reply, admin
from .database import init_db

# Create FastAPI app
app = FastAPI(
    title="CareSync AI API",
    description="API for CareSync healthcare assistant with document processing, chat, forms, and email functionalities",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",           # Frontend dev server
    "https://caresync.example.com",    # Production domain (replace with actual domain)
    "*"                                # Allow all origins during development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Include routers
app.include_router(chat.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(forms.router, prefix="/api")
app.include_router(email_reply.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin")

@app.get("/")
async def root():
    return {
        "name": "CareSync AI API",
        "version": "1.0.0",
        "status": "running"
    }

# Run the application with uvicorn when script is executed directly
if __name__ == "__main__":
    import uvicorn
    
    # Determine port - use PORT env var if available (for cloud deployment)
    port = int(os.getenv("PORT", 9999))  # Changed from 8080 to 9999
    
    # Run server with host 127.0.0.1 instead of 0.0.0.0 to avoid permission issues
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",  # Changed from 0.0.0.0 to localhost (127.0.0.1)
        port=port,
        reload=True
    ) 