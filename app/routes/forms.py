from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Models
class IntakeFormRequest(BaseModel):
    fullName: str
    email: EmailStr
    reasonForVisit: str
    preferredTime: str

class IntakeFormResponse(BaseModel):
    id: str
    submitted_at: datetime
    status: str
    message: str

class ReminderRequest(BaseModel):
    patient_email: EmailStr
    reminder_date: str  # Format: "YYYY-MM-DDTHH:MM"
    message: str
    status: Optional[str] = "scheduled"
    user_id: Optional[str] = None

class ReminderResponse(BaseModel):
    id: str
    scheduled_at: datetime
    status: str
    message: str

# Router
router = APIRouter(tags=["forms"])

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your-app-password")

# In-memory storage for development (replace with database in production)
intake_forms = []
reminders = []

# Helper Functions
def send_email(to_email: str, subject: str, html_content: str):
    """Send an email using the configured SMTP server"""
    try:
        message = MIMEMultipart()
        message["From"] = SMTP_USERNAME
        message["To"] = to_email
        message["Subject"] = subject
        
        message.attach(MIMEText(html_content, "html"))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
            
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# Routes
@router.post("/form-intake", response_model=IntakeFormResponse)
async def submit_intake_form(form_data: IntakeFormRequest):
    """
    Submit a patient intake form and send confirmation email.
    """
    try:
        # Generate a simple ID (use UUID in production)
        form_id = f"form_{len(intake_forms) + 1}"
        
        # Create form entry
        form_entry = {
            "id": form_id,
            "fullName": form_data.fullName,
            "email": form_data.email,
            "reasonForVisit": form_data.reasonForVisit,
            "preferredTime": form_data.preferredTime,
            "submitted_at": datetime.now()
        }
        
        # Store form data
        intake_forms.append(form_entry)
        
        # Send confirmation email
        email_subject = "CareSync: Intake Form Received"
        email_content = f"""
        <html>
        <body>
            <h2>Thank you for your submission, {form_data.fullName}!</h2>
            <p>We have received your intake form with the following details:</p>
            <ul>
                <li><strong>Reason for Visit:</strong> {form_data.reasonForVisit}</li>
                <li><strong>Preferred Time:</strong> {form_data.preferredTime}</li>
            </ul>
            <p>Our team will review your information and get back to you shortly.</p>
            <p>Best regards,<br>CareSync Team</p>
        </body>
        </html>
        """
        
        send_email(form_data.email, email_subject, email_content)
        
        return IntakeFormResponse(
            id=form_id,
            submitted_at=form_entry["submitted_at"],
            status="success",
            message="Form submitted successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing form: {str(e)}")

@router.post("/schedule-reminder", response_model=ReminderResponse)
async def schedule_reminder(reminder_data: ReminderRequest):
    """
    Schedule a reminder to be sent to a patient via email.
    """
    try:
        # Generate a simple ID (use UUID in production)
        reminder_id = f"reminder_{len(reminders) + 1}"
        
        # Parse the reminder date
        reminder_datetime = datetime.fromisoformat(reminder_data.reminder_date)
        
        # Create reminder entry
        reminder_entry = {
            "id": reminder_id,
            "patient_email": reminder_data.patient_email,
            "reminder_date": reminder_datetime,
            "message": reminder_data.message,
            "status": reminder_data.status,
            "user_id": reminder_data.user_id or "system",
            "scheduled_at": datetime.now()
        }
        
        # Store reminder data
        reminders.append(reminder_entry)
        
        # Send confirmation email to staff (in a real app, this would be scheduled)
        email_subject = "CareSync: Reminder Scheduled"
        email_content = f"""
        <html>
        <body>
            <h2>Reminder Scheduled</h2>
            <p>A reminder has been scheduled with the following details:</p>
            <ul>
                <li><strong>Patient Email:</strong> {reminder_data.patient_email}</li>
                <li><strong>Date:</strong> {reminder_datetime.strftime('%Y-%m-%d')}</li>
                <li><strong>Time:</strong> {reminder_datetime.strftime('%H:%M')}</li>
                <li><strong>Message:</strong> {reminder_data.message}</li>
            </ul>
            <p>The patient will receive this reminder at the scheduled time.</p>
            <p>Best regards,<br>CareSync System</p>
        </body>
        </html>
        """
        
        # In a real app, this would be sent to the staff email
        send_email(SMTP_USERNAME, email_subject, email_content)
        
        return ReminderResponse(
            id=reminder_id,
            scheduled_at=reminder_entry["scheduled_at"],
            status="scheduled",
            message="Reminder scheduled successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scheduling reminder: {str(e)}") 