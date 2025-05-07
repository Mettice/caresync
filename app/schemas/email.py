from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, EmailStr, Field, validator, HttpUrl
from datetime import datetime

class EmailAccount(BaseModel):
    """
    Model for email account connection details
    """
    email: EmailStr = Field(..., description="Email address")
    smtp_server: str = Field(..., description="SMTP server hostname")
    smtp_port: int = Field(..., description="SMTP server port")
    imap_server: str = Field(..., description="IMAP server hostname")
    imap_port: int = Field(..., description="IMAP server port")
    username: str = Field(..., description="Account username")
    password: str = Field(..., description="Account password")
    use_ssl: bool = Field(True, description="Whether to use SSL for connections")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "clinic@example.com",
                "smtp_server": "smtp.example.com",
                "smtp_port": 587,
                "imap_server": "imap.example.com",
                "imap_port": 993,
                "username": "clinic@example.com",
                "password": "your-secure-password",
                "use_ssl": True
            }
        }

class AccountResponse(BaseModel):
    """
    Response model for email account operations
    """
    success: bool = Field(..., description="Whether the operation was successful")
    account_id: str = Field(..., description="Unique identifier for the email account")
    message: str = Field(..., description="Status message")

class EmailTemplate(BaseModel):
    """
    Model for email template creation
    """
    account_id: str = Field(..., description="ID of the email account to use")
    name: str = Field(..., description="Template name")
    subject_template: str = Field(..., description="Subject template with Jinja2 syntax")
    body_template: str = Field(..., description="Body template with Jinja2 syntax")
    trigger_keywords: List[str] = Field(..., description="Keywords that trigger this template")
    priority: int = Field(1, description="Template priority (lower numbers = higher priority)")
    
    @validator('trigger_keywords')
    def keywords_not_empty(cls, v):
        if not v:
            raise ValueError('trigger_keywords must not be empty')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "account_id": "account-uuid",
                "name": "Appointment Confirmation",
                "subject_template": "Confirmation: Your appointment on {{appointment_date}}",
                "body_template": "Dear {{patient_name}},\n\nThis is to confirm your appointment on {{appointment_date}} at {{appointment_time}} with {{doctor_name}}.\n\nBest regards,\nCareSync Clinic",
                "trigger_keywords": ["appointment", "confirm", "schedule"],
                "priority": 1
            }
        }

class TemplateResponse(BaseModel):
    """
    Response model for email template operations
    """
    success: bool = Field(..., description="Whether the operation was successful")
    template_id: str = Field(..., description="Unique identifier for the template")
    message: str = Field(..., description="Status message")

class IncomingEmail(BaseModel):
    """
    Model for incoming email processing
    """
    account_id: str = Field(..., description="ID of the email account")
    from_email: EmailStr = Field(..., description="Sender's email address")
    from_name: Optional[str] = Field(None, description="Sender's name")
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Email body")
    received_at: datetime = Field(default_factory=datetime.now, description="When the email was received")
    
    class Config:
        json_schema_extra = {
            "example": {
                "account_id": "account-uuid",
                "from_email": "patient@example.com",
                "from_name": "John Doe",
                "subject": "Question about my appointment",
                "body": "Hello, I would like to confirm my appointment scheduled for next week.",
                "received_at": "2023-11-25T14:30:00"
            }
        }

class EmailResponse(BaseModel):
    """
    Response model for email sending operations
    """
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Status message")
    
class AutoReplyRequest(BaseModel):
    """
    Model for testing auto-reply functionality
    """
    account_id: str = Field(..., description="ID of the email account")
    from_email: EmailStr = Field(..., description="Sender's email address")
    from_name: Optional[str] = Field(None, description="Sender's name")
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Email body")
    
    class Config:
        json_schema_extra = {
            "example": {
                "account_id": "account-uuid",
                "from_email": "patient@example.com",
                "from_name": "John Doe",
                "subject": "Question about my appointment",
                "body": "Hello, I would like to confirm my appointment scheduled for next week."
            }
        }

class AutoReplyResponse(BaseModel):
    """
    Response model for auto-reply testing
    """
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Status message")
    template_used: Optional[str] = Field(None, description="ID of the template used")
    reply_sent: bool = Field(..., description="Whether a reply was sent")
    reply_subject: Optional[str] = Field(None, description="Subject of the reply email")
    reply_preview: Optional[str] = Field(None, description="Preview of the reply body") 