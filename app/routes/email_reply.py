from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime
import imaplib
import email
from email.header import decode_header
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import time
import threading

# Models
class EmailAccount(BaseModel):
    email: EmailStr
    password: str
    imap_server: str = "imap.gmail.com"
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    enabled: bool = True

class EmailReplyTemplate(BaseModel):
    name: str
    subject_contains: List[str]
    body: str

class EmailReplyConfig(BaseModel):
    account_id: str
    templates: List[EmailReplyTemplate]
    auto_reply_enabled: bool = True

class EmailAccountResponse(BaseModel):
    id: str
    email: str
    connected: bool
    message: str

# Router
router = APIRouter(tags=["email"])

# In-memory storage for development (replace with database in production)
email_accounts = []
email_templates = [
    {
        "name": "Appointment Inquiry",
        "subject_contains": ["appointment", "booking", "schedule"],
        "body": """
        <html>
        <body>
            <p>Thank you for your inquiry about scheduling an appointment.</p>
            <p>Our team will review your request and get back to you within 24 hours to confirm your appointment time.</p>
            <p>If you need immediate assistance, please call our office at (555) 123-4567.</p>
            <p>Best regards,<br>CareSync Team</p>
        </body>
        </html>
        """
    },
    {
        "name": "General Inquiry",
        "subject_contains": ["information", "question", "inquiry"],
        "body": """
        <html>
        <body>
            <p>Thank you for your inquiry.</p>
            <p>We have received your message and will respond with the information you requested within 24-48 hours.</p>
            <p>If you need immediate assistance, please call our office at (555) 123-4567.</p>
            <p>Best regards,<br>CareSync Team</p>
        </body>
        </html>
        """
    }
]

# Background email monitoring threads
email_threads = {}

# Helper Functions
def send_email(account, to_email, subject, html_content):
    """Send an email using the account's SMTP server"""
    try:
        message = MIMEMultipart()
        message["From"] = account["email"]
        message["To"] = to_email
        message["Subject"] = subject
        
        message.attach(MIMEText(html_content, "html"))
        
        with smtplib.SMTP(account["smtp_server"], account["smtp_port"]) as server:
            server.starttls()
            server.login(account["email"], account["password"])
            server.send_message(message)
            
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def check_and_reply_to_emails(account):
    """Check emails and send automatic replies"""
    try:
        # Connect to IMAP server
        mail = imaplib.IMAP4_SSL(account["imap_server"])
        mail.login(account["email"], account["password"])
        mail.select("inbox")
        
        # Search for unread emails
        status, messages = mail.search(None, "UNSEEN")
        
        if status != "OK":
            print(f"Error searching for emails: {status}")
            return
        
        for mail_id in messages[0].split():
            status, msg_data = mail.fetch(mail_id, "(RFC822)")
            
            if status != "OK":
                print(f"Error fetching email {mail_id}: {status}")
                continue
                
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)
            
            # Get email details
            subject = decode_header(msg["Subject"])[0][0]
            if isinstance(subject, bytes):
                subject = subject.decode()
                
            sender = msg["From"]
            
            # Determine if this email needs an auto-reply
            if sender and subject:
                # Check against templates
                matched_template = None
                for template in email_templates:
                    for keyword in template["subject_contains"]:
                        if keyword.lower() in subject.lower():
                            matched_template = template
                            break
                    if matched_template:
                        break
                
                # Send auto-reply if template matched
                if matched_template:
                    reply_subject = f"Re: {subject}"
                    send_email(account, sender, reply_subject, matched_template["body"])
                    print(f"Auto-replied to {sender} with template: {matched_template['name']}")
                    
                    # Increment reply count
                    if "reply_count" in account:
                        account["reply_count"] += 1
                    else:
                        account["reply_count"] = 1
            
            # Mark as read
            mail.store(mail_id, "+FLAGS", "\\Seen")
        
        mail.close()
        mail.logout()
        
    except Exception as e:
        print(f"Error checking emails: {e}")

def email_monitoring_thread(account_id):
    """Thread function to continuously monitor an email account"""
    account = next((acc for acc in email_accounts if acc["id"] == account_id), None)
    if not account:
        print(f"Account {account_id} not found")
        return
    
    while account["enabled"]:
        try:
            check_and_reply_to_emails(account)
        except Exception as e:
            print(f"Error in monitoring thread: {e}")
        
        # Sleep for 5 minutes before checking again
        time.sleep(300)

# Routes
@router.post("/connect", response_model=EmailAccountResponse)
async def connect_email_account(account_data: EmailAccount, background_tasks: BackgroundTasks):
    """
    Connect an email account for automatic replies.
    """
    try:
        # Test connection
        try:
            # Test IMAP connection
            mail = imaplib.IMAP4_SSL(account_data.imap_server)
            mail.login(account_data.email, account_data.password)
            mail.logout()
            
            # Test SMTP connection
            with smtplib.SMTP(account_data.smtp_server, account_data.smtp_port) as server:
                server.starttls()
                server.login(account_data.email, account_data.password)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to connect to email: {str(e)}")
        
        # Generate account ID
        account_id = f"account_{len(email_accounts) + 1}"
        
        # Store account info
        account_entry = {
            "id": account_id,
            "email": account_data.email,
            "password": account_data.password,
            "imap_server": account_data.imap_server,
            "smtp_server": account_data.smtp_server,
            "smtp_port": account_data.smtp_port,
            "enabled": account_data.enabled,
            "connected_at": datetime.now(),
            "reply_count": 0  # Initialize reply count
        }
        
        email_accounts.append(account_entry)
        
        # Start background monitoring if enabled
        if account_data.enabled:
            # Start a new thread for monitoring
            thread = threading.Thread(
                target=email_monitoring_thread,
                args=(account_id,),
                daemon=True
            )
            thread.start()
            email_threads[account_id] = thread
        
        return EmailAccountResponse(
            id=account_id,
            email=account_data.email,
            connected=True,
            message="Email account connected successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error connecting email account: {str(e)}")

@router.get("/accounts")
async def get_email_accounts():
    """
    Get all connected email accounts.
    """
    try:
        # Return a simplified version of the accounts (without passwords)
        accounts_data = []
        for account in email_accounts:
            accounts_data.append({
                "id": account["id"],
                "email": account["email"],
                "smtp_server": account["smtp_server"],
                "imap_server": account.get("imap_server", ""),
                "enabled": account["enabled"],
                "connected_at": account["connected_at"],
                "reply_count": account.get("reply_count", 0)
            })
        return accounts_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving email accounts: {str(e)}")

@router.post("/templates")
async def create_email_template(template: EmailReplyTemplate):
    """
    Create a new email reply template.
    """
    try:
        # Add template ID and timestamp
        template_id = f"template_{len(email_templates) + 1}"
        template_data = template.dict()
        template_data["id"] = template_id
        template_data["created_at"] = datetime.now()
        template_data["is_active"] = True
        
        # Add template to list
        email_templates.append(template_data)
        
        return {
            "success": True, 
            "template_id": template_id, 
            "message": "Template created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating template: {str(e)}")

@router.get("/templates")
async def get_email_templates():
    """
    Get all email reply templates.
    """
    try:
        # Return the templates with trigger_keywords properly transformed for frontend
        templates_data = []
        for template in email_templates:
            template_copy = template.copy()
            
            # Ensure subject_contains is renamed to trigger_keywords if needed
            if "subject_contains" in template_copy and "trigger_keywords" not in template_copy:
                template_copy["trigger_keywords"] = template_copy["subject_contains"]
                
            templates_data.append(template_copy)
            
        return templates_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving email templates: {str(e)}") 