from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from fastapi import Depends
from typing import Generator
import os

# Get database URL from environment variable or use SQLite as default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./caresync.db")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency for FastAPI routes
def get_db_dependency(db: Session = Depends(get_db)) -> Session:
    return db

def init_db():
    """Initialize database with all models"""
    from .models.document import Document  # Import models here to avoid circular imports
    Base.metadata.create_all(bind=engine) 