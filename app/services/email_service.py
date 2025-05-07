import os
import uuid
import re
import json
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from fastapi import HTTPException, BackgroundTasks
from pydantic import EmailStr
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import jinja2

# In-memory storage for email accounts and templates (would be replaced with database in production)
email_accounts = []
email_templates = []

# Template environment for rendering email templates
template_env = jinja2.Environment(
    autoescape=jinja2.select_autoescape(['html', 'xml']),
    undefined=jinja2.StrictUndefined
)

async def connect_email_account(
    email: EmailStr,
    smtp_server: str,
    smtp_port: int,
    imap_server: str,
    imap_port: int,
    username: str,
    password: str,
    use_ssl: bool = True
) -> Dict[str, Any]:
    """
    Connect an email account for sending and receiving emails
    
    Args:
        email: Email address
        smtp_server: SMTP server hostname
        smtp_port: SMTP server port
        imap_server: IMAP server hostname
        imap_port: IMAP server port
        username: Account username
        password: Account password
        use_ssl: Whether to use SSL for connections
        
    Returns:
        Dictionary with operation result
    """
    try:
        # Generate unique ID for the account
        account_id = str(uuid.uuid4())
        
        # Create account record
        account_record = {
            "id": account_id,
            "email": email,
            "smtp_server": smtp_server,
            "smtp_port": smtp_port,
            "imap_server": imap_server,
            "imap_port": imap_port,
            "username": username,
            "password": password,  # In production, this would be encrypted
            "use_ssl": use_ssl,
            "created_at": datetime.now().isoformat(),
            "is_active": True
        }
        
        # Test connection to verify credentials
        # This is a simplified test - in production you'd want more robust validation
        try:
            smtp = aiosmtplib.SMTP(
                hostname=smtp_server,
                port=smtp_port,
                use_tls=use_ssl
            )
            await smtp.connect()
            await smtp.login(username, password)
            await smtp.quit()
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to connect to email server: {str(e)}"
            )
            
        # Store account (in memory for now, would be database in production)
        email_accounts.append(account_record)
        
        return {
            "success": True,
            "account_id": account_id,
            "message": "Email account connected successfully"
        }
        
    except Exception as e:
        # Log the error (would use proper logging in production)
        print(f"Error connecting email account: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect email account: {str(e)}"
        )

async def create_email_template(
    account_id: str,
    name: str,
    subject_template: str,
    body_template: str,
    trigger_keywords: List[str],
    priority: int = 1
) -> Dict[str, Any]:
    """
    Create an email template for automatic replies
    
    Args:
        account_id: ID of the email account to use
        name: Template name
        subject_template: Subject template with Jinja2 syntax
        body_template: Body template with Jinja2 syntax
        trigger_keywords: Keywords that trigger this template
        priority: Template priority (lower numbers = higher priority)
        
    Returns:
        Dictionary with operation result
    """
    try:
        # Validate account_id
        account = next((acc for acc in email_accounts if acc["id"] == account_id), None)
        if not account:
            raise HTTPException(
                status_code=404,
                detail=f"Email account with ID {account_id} not found"
            )
            
        # Validate templates by trying to compile them
        try:
            subject_tpl = template_env.from_string(subject_template)
            body_tpl = template_env.from_string(body_template)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid template syntax: {str(e)}"
            )
            
        # Generate unique ID for the template
        template_id = str(uuid.uuid4())
        
        # Create template record
        template_record = {
            "id": template_id,
            "account_id": account_id,
            "name": name,
            "subject_template": subject_template,
            "body_template": body_template,
            "trigger_keywords": trigger_keywords,
            "priority": priority,
            "created_at": datetime.now().isoformat(),
            "is_active": True
        }
        
        # Store template (in memory for now, would be database in production)
        email_templates.append(template_record)
        
        return {
            "success": True,
            "template_id": template_id,
            "message": "Email template created successfully"
        }
        
    except Exception as e:
        # If not already an HTTPException, wrap it
        if not isinstance(e, HTTPException):
            # Log the error (would use proper logging in production)
            print(f"Error creating email template: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create email template: {str(e)}"
            )
        raise e

async def send_email(
    recipient_email: EmailStr,
    subject: str,
    body: str,
    sender_name: Optional[str] = None,
    account_id: Optional[str] = None,
    background_tasks: Optional[BackgroundTasks] = None
) -> Dict[str, Any]:
    """
    Send an email
    
    Args:
        recipient_email: Recipient's email address
        subject: Email subject
        body: Email body
        sender_name: Name to display as sender
        account_id: ID of email account to use (if None, uses default)
        background_tasks: FastAPI BackgroundTasks for async processing
        
    Returns:
        Dictionary with operation result
    """
    # Function to actually send the email
    async def _send_email_task(
        recipient: str,
        subject: str,
        body: str,
        sender_name: Optional[str],
        account: Dict[str, Any]
    ) -> None:
        try:
            # Create message
            message = MIMEMultipart()
            message["To"] = recipient
            
            # Set From with display name if provided
            if sender_name:
                message["From"] = f"{sender_name} <{account['email']}>"
            else:
                message["From"] = account['email']
                
            message["Subject"] = subject
            
            # Attach body
            message.attach(MIMEText(body, "plain"))
            
            # Connect to SMTP server and send
            smtp = aiosmtplib.SMTP(
                hostname=account["smtp_server"],
                port=account["smtp_port"],
                use_tls=account["use_ssl"]
            )
            
            await smtp.connect()
            await smtp.login(account["username"], account["password"])
            await smtp.send_message(message)
            await smtp.quit()
            
        except Exception as e:
            # In a background task, we need to log errors
            print(f"Error sending email: {str(e)}")
            # In production, you might want to store failed emails for retry
    
    try:
        # If no account ID is provided, use the first account or raise error if none exists
        if not account_id:
            if not email_accounts:
                # For development, we'll just print the email instead of sending it
                print(f"\n--- EMAIL ---\nTo: {recipient_email}\nSubject: {subject}\n\n{body}\n------------\n")
                return {
                    "success": True,
                    "message": "Email content logged (no email accounts configured)"
                }
            account = email_accounts[0]
        else:
            account = next((acc for acc in email_accounts if acc["id"] == account_id), None)
            if not account:
                # For development, we'll just print the email instead of sending it
                print(f"\n--- EMAIL ---\nTo: {recipient_email}\nSubject: {subject}\n\n{body}\n------------\n")
                return {
                    "success": True,
                    "message": f"Email content logged (account ID {account_id} not found)"
                }
                
        # If BackgroundTasks is provided, use it to send email asynchronously
        if background_tasks:
            background_tasks.add_task(
                _send_email_task,
                recipient=recipient_email,
                subject=subject,
                body=body,
                sender_name=sender_name,
                account=account
            )
            return {
                "success": True,
                "message": "Email scheduled to be sent in background"
            }
        else:
            # Send immediately
            await _send_email_task(
                recipient=recipient_email,
                subject=subject,
                body=body,
                sender_name=sender_name,
                account=account
            )
            return {
                "success": True,
                "message": "Email sent successfully"
            }
            
    except Exception as e:
        # Log the error (would use proper logging in production)
        print(f"Error in send_email: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}"
        )

async def find_matching_template(
    email_subject: str,
    email_body: str,
    account_id: str
) -> Optional[Dict[str, Any]]:
    """
    Find a matching template for an incoming email
    
    Args:
        email_subject: Subject of the incoming email
        email_body: Body of the incoming email
        account_id: ID of the email account
        
    Returns:
        Matching template or None
    """
    # Get templates for this account, sorted by priority
    account_templates = [
        t for t in email_templates 
        if t["account_id"] == account_id and t["is_active"]
    ]
    account_templates.sort(key=lambda t: t["priority"])
    
    # Combine subject and body for keyword matching
    email_content = f"{email_subject} {email_body}".lower()
    
    # Try to find a matching template based on keywords
    for template in account_templates:
        for keyword in template["trigger_keywords"]:
            if keyword.lower() in email_content:
                return template
                
    # No match found
    return None

async def render_template(
    template: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, str]:
    """
    Render a template with given context
    
    Args:
        template: Template record
        context: Context variables for rendering
        
    Returns:
        Dictionary with rendered subject and body
    """
    try:
        subject_tpl = template_env.from_string(template["subject_template"])
        body_tpl = template_env.from_string(template["body_template"])
        
        rendered_subject = subject_tpl.render(**context)
        rendered_body = body_tpl.render(**context)
        
        return {
            "subject": rendered_subject,
            "body": rendered_body
        }
    except Exception as e:
        # Log the error (would use proper logging in production)
        print(f"Error rendering template: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to render template: {str(e)}"
        ) 