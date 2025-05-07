# CareSync AI - Clinic Chatbot Backend

CareSync AI is a modular FastAPI backend for a clinic chatbot that provides intelligent responses to user questions using Retrieval-Augmented Generation (RAG). The system allows uploading PDF and DOCX documents, which are processed, indexed, and used to provide context-aware responses. It also includes form intake, appointment reminders, and automatic email reply functionality.

## Features

- **Chat Endpoint**: Process user questions and return AI-generated responses
- **Document Upload**: Support for PDF and DOCX document uploads
- **RAG Integration**: Uses LangChain for Retrieval-Augmented Generation
- **Vector Store**: Stores document chunks in FAISS or Chroma vector store
- **LLM Integration**: Supports OpenAI or OpenRouter as the LLM provider
- **Form Intake**: Process patient form submissions
- **Appointment Reminders**: Schedule and send appointment reminders
- **Automatic Email Replies**: Connect email accounts and use templates for automatic replies
- **Modular Architecture**: Organized into routes, services, vector_store, schemas, and utils

## Setup

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/caresync.git
cd caresync
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file based on the example:

```bash
cp .env.example .env
```

4. Edit the `.env` file to add your API keys and configure settings.

### Running the Application

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Chat Endpoint

```
POST /api/chat
```

Process a user question and return an AI-generated response.

#### Request

```json
{
  "question": "What are your clinic hours?",
  "conversation_id": "optional-conversation-id"
}
```

#### Response

```json
{
  "answer": "Our clinic is open Monday to Friday from 9 AM to 5 PM, and Saturday from 10 AM to 2 PM. We are closed on Sundays.",
  "sources": [
    {
      "document_name": "clinic_info.pdf",
      "page_number": 2,
      "text_snippet": "Clinic Hours: Monday-Friday 9 AM - 5 PM, Saturday 10 AM - 2 PM, Closed on Sunday",
      "relevance_score": 0.92
    }
  ],
  "confidence": 0.85,
  "conversation_id": "conversation-uuid",
  "metadata": {
    "has_context": true
  }
}
```

### Document Upload Endpoint

```
POST /api/upload
```

Upload a document (PDF or DOCX) to be processed and indexed for RAG.

#### Request

Form data with:
- `file`: The document file (PDF or DOCX)
- `document_type`: Optional type/category of the document

#### Response

```json
{
  "success": true,
  "document_id": "document-uuid",
  "filename": "clinic_info.pdf",
  "document_type": "clinic_information",
  "num_chunks": 15,
  "metadata": {
    "file_path": "./data/documents/document-uuid.pdf",
    "file_extension": ".pdf"
  }
}
```

### Form Intake Endpoint

```
POST /api/forms/intake
```

Submit patient intake forms.

#### Request

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "123-456-7890",
  "form_data": {
    "medical_history": "No significant medical history",
    "current_medications": "None",
    "allergies": "Penicillin"
  },
  "send_confirmation": true
}
```

#### Response

```json
{
  "success": true,
  "form_id": "form-uuid",
  "message": "Form submitted successfully",
  "confirmation_sent": true
}
```

### Appointment Reminder Endpoint

```
POST /api/forms/schedule-reminder
```

Schedule an appointment reminder.

#### Request

```json
{
  "patient_name": "John Doe",
  "patient_email": "john.doe@example.com",
  "appointment_time": "2023-12-01T14:30:00",
  "appointment_type": "Annual Checkup",
  "reminder_time": "2023-11-30T10:00:00",
  "doctor_name": "Dr. Smith",
  "additional_notes": "Please bring your insurance card"
}
```

#### Response

```json
{
  "success": true,
  "reminder_id": "reminder-uuid",
  "message": "Reminder scheduled successfully"
}
```

### Connect Email Account Endpoint

```
POST /api/email/connect
```

Connect an email account for automatic replies.

#### Request

```json
{
  "email": "clinic@example.com",
  "smtp_server": "smtp.example.com",
  "smtp_port": 587,
  "imap_server": "imap.example.com",
  "imap_port": 993,
  "username": "clinic@example.com",
  "password": "your-secure-password",
  "use_ssl": true
}
```

#### Response

```json
{
  "success": true,
  "account_id": "account-uuid",
  "message": "Email account connected successfully"
}
```

### Create Email Template Endpoint

```
POST /api/email/templates
```

Create a template for automatic email replies.

#### Request

```json
{
  "account_id": "account-uuid",
  "name": "Appointment Confirmation",
  "subject_template": "Confirmation: Your appointment on {{appointment_date}}",
  "body_template": "Dear {{patient_name}},\n\nThis is to confirm your appointment on {{appointment_date}} at {{appointment_time}} with {{doctor_name}}.\n\nBest regards,\nCareSync Clinic",
  "trigger_keywords": ["appointment", "confirm", "schedule"],
  "priority": 1
}
```

#### Response

```json
{
  "success": true,
  "template_id": "template-uuid",
  "message": "Email template created successfully"
}
```

## Example Usage

### Using curl

#### Chat Request

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"question":"What are your clinic hours?"}'
```

#### Document Upload

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/document.pdf" \
  -F "document_type=clinic_information"
```

#### Form Intake

```bash
curl -X POST "http://localhost:8000/api/forms/intake" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john.doe@example.com","phone":"123-456-7890","form_data":{"medical_history":"No significant medical history","current_medications":"None","allergies":"Penicillin"},"send_confirmation":true}'
```

#### Schedule Reminder

```bash
curl -X POST "http://localhost:8000/api/forms/schedule-reminder" \
  -H "Content-Type: application/json" \
  -d '{"patient_name":"John Doe","patient_email":"john.doe@example.com","appointment_time":"2023-12-01T14:30:00","appointment_type":"Annual Checkup","reminder_time":"2023-11-30T10:00:00","doctor_name":"Dr. Smith","additional_notes":"Please bring your insurance card"}'
```

#### Connect Email Account

```bash
curl -X POST "http://localhost:8000/api/email/connect" \
  -H "Content-Type: application/json" \
  -d '{"email":"clinic@example.com","smtp_server":"smtp.example.com","smtp_port":587,"imap_server":"imap.example.com","imap_port":993,"username":"clinic@example.com","password":"your-secure-password","use_ssl":true}'
```

#### Create Email Template

```bash
curl -X POST "http://localhost:8000/api/email/templates" \
  -H "Content-Type: application/json" \
  -d '{"account_id":"account-uuid","name":"Appointment Confirmation","subject_template":"Confirmation: Your appointment on {{appointment_date}}","body_template":"Dear {{patient_name}},\n\nThis is to confirm your appointment on {{appointment_date}} at {{appointment_time}} with {{doctor_name}}.\n\nBest regards,\nCareSync Clinic","trigger_keywords":["appointment","confirm","schedule"],"priority":1}'
```

### Using Postman

#### Chat Request
1. Create a new POST request to `http://localhost:8000/api/chat`
2. Set the Content-Type header to `application/json`
3. In the Body tab, select "raw" and "JSON", then enter:
   ```json
   {
     "question": "What are your clinic hours?"
   }
   ```
4. Click Send

#### Document Upload
1. Create a new POST request to `http://localhost:8000/api/upload`
2. In the Body tab, select "form-data"
3. Add a key "file" of type "File" and select your document
4. Add a key "document_type" of type "Text" and enter a value (e.g., "clinic_information")
5. Click Send

## Project Structure

```
caresync/
├── app/
│   ├── routes/
│   │   ├── chat.py
│   │   ├── upload.py
│   │   ├── forms.py
│   │   ├── email_reply.py
│   │   └── __init__.py
│   ├── services/
│   │   ├── chat_service.py
│   │   ├── document_service.py
│   │   ├── llm_service.py
│   │   ├── vector_store_service.py
│   │   ├── email_service.py
│   │   └── form_service.py
│   ├── schemas/
│   │   ├── chat.py
│   │   ├── upload.py
│   │   ├── forms.py
│   │   └── email.py
│   ├── utils/
│   │   └── common.py
│   ├── vector_store/
│   │   └── vector_store.py
│   └── __init__.py
├── data/
│   ├── documents/
│   └── vector_store/
├── .env
├── .env.example
├── main.py
├── README.md
└── requirements.txt
```

## Future Enhancements

- Patient authentication and personalized responses
- Appointment scheduling integration
- Medical form processing
- Multi-language support
- Voice input/output capabilities
- Advanced email automation with AI classification
- Integration with electronic health records (EHR)
- SMS notifications and reminders

## License

MIT