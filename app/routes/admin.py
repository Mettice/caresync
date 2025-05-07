from fastapi import APIRouter, HTTPException
from app.services.form_service import forms_db, reminders_db
from app.services.email_service import email_accounts, email_templates
import os

# Router
router = APIRouter(tags=["admin"])

@router.get("/metrics")
async def get_dashboard_metrics():
    """
    Get system metrics for the admin dashboard.
    
    Returns:
        Dictionary with various system metrics
    """
    try:
        # Count documents in documents directory
        document_path = os.getenv("DOCUMENT_STORE_PATH", "./data/documents")
        upload_count = sum(1 for item in os.listdir(document_path) if os.path.isfile(os.path.join(document_path, item))) if os.path.exists(document_path) else 0
        
        # Get counts from in-memory storage
        # In a real application, these would come from a database
        form_count = len(forms_db)
        reminder_count = len(reminders_db)
        
        # Calculate email metrics with default values if fields don't exist
        email_reply_count = 0
        for account in email_accounts:
            email_reply_count += account.get("reply_count", 0)
        
        connected_accounts = len(email_accounts)
        template_count = len(email_templates)
        
        # Placeholder for chat count
        chat_count = 0
        
        # Return metrics with expected field names
        return {
            "uploads": upload_count,
            "forms": form_count,
            "reminders": reminder_count,
            "chats": chat_count,
            "emailReplies": email_reply_count,
            "connectedAccounts": connected_accounts,
            "templates": template_count
        }
    except Exception as e:
        print(f"Error retrieving metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving metrics: {str(e)}") 