# CareSync AI Frontend

This directory contains the frontend components for the CareSync AI application, including the ChatBox widget that can be embedded in any page.

## Setup

1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Components

### ChatBox

A lightweight React chatbot widget that connects to the CareSync AI backend API.

**Props:**
- `endpoint` (optional): The API endpoint URL (default: "http://localhost:8000/api/chat")
- `clinicName` (optional): Name of the clinic to personalize the greeting message

**Features:**
- Input field for user messages
- Display chat history with message bubbles
- Loading indicator while waiting for response
- Error handling for backend connectivity issues
- Support for pressing Enter to send messages
- Responsive design using TailwindCSS