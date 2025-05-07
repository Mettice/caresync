from datetime import datetime
import uuid
import json
import os
from typing import Dict, Any, Optional
from pydantic import EmailStr
from fastapi import HTTPException

# Import email sending function from email service (to be created)
from app.services.email_service import send_email

# In-memory storage for forms and reminders (would be replaced with database in production)
forms_db = []
reminders_db = []

async def process_form_submission(
    name: str,
    email: EmailStr,
    phone: str,
    form_data: Dict[str, Any],
    send_confirmation: bool
) -> Dict[str, Any]:
    """
    Process a form submission and optionally send a confirmation email
    
    Args:
        name: Patient's full name
        email: Patient's email address
        phone: Patient's phone number
        form_data: Dictionary containing form fields and values
        send_confirmation: Whether to send a confirmation email
        
    Returns:
        Dictionary with operation result
    """
    try:
        # Generate unique ID for the form
        form_id = str(uuid.uuid4())
        
        # Create form record
        form_record = {
            "id": form_id,
            "name": name,
            "email": email,
            "phone": phone,
            "form_data": form_data,
            "submission_time": datetime.now().isoformat(),
        }
        
        # Store form (in memory for now, would be database in production)
        forms_db.append(form_record)
        
        # Send confirmation email if requested
        confirmation_sent = False
        if send_confirmation:
            subject = "Form Submission Confirmation - CareSync"
            body = f"""
            Dear {name},
            
            Thank you for your form submission to CareSync. We have received your information and will process it shortly.
            
            Best regards,
            The CareSync Team
            """
            
            # Call email service to send the email
            await send_email(
                recipient_email=email,
                subject=subject,
                body=body,
                sender_name="CareSync Clinic"
            )
            confirmation_sent = True
            
        return {
            "success": True,
            "form_id": form_id,
            "message": "Form submitted successfully",
            "confirmation_sent": confirmation_sent
        }
        
    except Exception as e:
        # Log the error (would use proper logging in production)
        print(f"Error processing form: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process form submission: {str(e)}"
        )

async def schedule_reminder(
    patient_name: str,
    patient_email: EmailStr,
    appointment_time: datetime,
    appointment_type: str,
    reminder_time: datetime,
    doctor_name: Optional[str] = None,
    additional_notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Schedule an appointment reminder to be sent at the specified time
    
    Args:
        patient_name: Patient's full name
        patient_email: Patient's email address
        appointment_time: Date and time of the appointment
        appointment_type: Type of the appointment
        reminder_time: When to send the reminder
        doctor_name: Name of the doctor (optional)
        additional_notes: Any additional information for the patient
        
    Returns:
        Dictionary with operation result
    """
    try:
        # Generate unique ID for the reminder
        reminder_id = str(uuid.uuid4())
        
        # Format dates for display
        appointment_date = appointment_time.strftime("%A, %B %d, %Y")
        appointment_time_str = appointment_time.strftime("%I:%M %p")
        
        # Create reminder record
        reminder_record = {
            "id": reminder_id,
            "patient_name": patient_name,
            "patient_email": patient_email,
            "appointment_time": appointment_time.isoformat(),
            "appointment_type": appointment_type,
            "reminder_time": reminder_time.isoformat(),
            "doctor_name": doctor_name,
            "additional_notes": additional_notes,
            "status": "scheduled"
        }
        
        # Store reminder (in memory for now, would be database in production)
        reminders_db.append(reminder_record)
        
        # In a real system, we would use a task queue (like Celery) to schedule the email
        # For now, we'll just format the message that would be sent
        
        # Build the email content
        subject = f"Reminder: Your {appointment_type} Appointment on {appointment_date}"
        
        body = f"""
        Dear {patient_name},
        
        This is a reminder about your upcoming appointment:
        
        Date: {appointment_date}
        Time: {appointment_time_str}
        Type: {appointment_type}
        """
        
        if doctor_name:
            body += f"\nDoctor: {doctor_name}"
            
        if additional_notes:
            body += f"\n\nAdditional Notes: {additional_notes}"
            
        body += f"""
        
        If you need to reschedule, please call our office as soon as possible.
        
        Best regards,
        The CareSync Team
        """
        
        # Add the formatted email to the reminder record for reference
        reminder_record["email_subject"] = subject
        reminder_record["email_body"] = body
        
        return {
            "success": True,
            "reminder_id": reminder_id,
            "message": "Reminder scheduled successfully"
        }
        
    except Exception as e:
        # Log the error (would use proper logging in production)
        print(f"Error scheduling reminder: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to schedule reminder: {str(e)}"
        ) 