from typing import Dict, Any, Optional, List
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime

class FormSubmission(BaseModel):
    """
    Model for form submission data
    """
    name: str = Field(..., description="Patient's full name")
    email: EmailStr = Field(..., description="Patient's email address")
    phone: str = Field(..., description="Patient's phone number")
    form_data: Dict[str, Any] = Field(..., description="Dictionary containing form fields and values")
    send_confirmation: bool = Field(True, description="Whether to send a confirmation email")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "123-456-7890",
                "form_data": {
                    "medical_history": "No significant medical history",
                    "current_medications": "None",
                    "allergies": "Penicillin"
                },
                "send_confirmation": True
            }
        }

class FormResponse(BaseModel):
    """
    Response model for form submissions
    """
    success: bool = Field(..., description="Whether the operation was successful")
    form_id: str = Field(..., description="Unique identifier for the form submission")
    message: str = Field(..., description="Status message")
    confirmation_sent: bool = Field(..., description="Whether a confirmation email was sent")

class ReminderRequest(BaseModel):
    """
    Model for scheduling appointment reminders
    """
    patient_name: str = Field(..., description="Patient's full name")
    patient_email: EmailStr = Field(..., description="Patient's email address")
    appointment_time: datetime = Field(..., description="Date and time of the appointment")
    appointment_type: str = Field(..., description="Type of the appointment")
    reminder_time: datetime = Field(..., description="When to send the reminder")
    doctor_name: Optional[str] = Field(None, description="Name of the doctor (optional)")
    additional_notes: Optional[str] = Field(None, description="Any additional information for the patient")
    
    @validator('reminder_time')
    def reminder_time_must_be_before_appointment(cls, v, values):
        if 'appointment_time' in values and v >= values['appointment_time']:
            raise ValueError('reminder_time must be before appointment_time')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "patient_name": "John Doe",
                "patient_email": "john.doe@example.com",
                "appointment_time": "2023-12-01T14:30:00",
                "appointment_type": "Annual Checkup",
                "reminder_time": "2023-11-30T10:00:00",
                "doctor_name": "Dr. Smith",
                "additional_notes": "Please bring your insurance card"
            }
        }

class ReminderResponse(BaseModel):
    """
    Response model for reminder scheduling
    """
    success: bool = Field(..., description="Whether the operation was successful")
    reminder_id: str = Field(..., description="Unique identifier for the reminder")
    message: str = Field(..., description="Status message") 