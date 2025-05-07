import os
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("caresync")

def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """Validate if a file has an allowed extension"""
    ext = os.path.splitext(filename)[1].lower()
    return ext in allowed_extensions

def create_error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Create a standardized error response"""
    return {
        "success": False,
        "error": {
            "code": status_code,
            "message": message
        }
    }

def ensure_directory_exists(directory_path: str) -> None:
    """Ensure that a directory exists, creating it if necessary"""
    if not os.path.exists(directory_path):
        os.makedirs(directory_path, exist_ok=True)
        logger.info(f"Created directory: {directory_path}")

def log_error(error: Exception, context: str = "") -> None:
    """Log an error with optional context"""
    if context:
        logger.error(f"{context}: {str(error)}")
    else:
        logger.error(str(error))

def handle_exception(e: Exception, context: str = "", status_code: int = 500) -> HTTPException:
    """Handle an exception by logging it and returning an HTTPException"""
    log_error(e, context)
    return HTTPException(
        status_code=status_code,
        detail=str(e)
    )