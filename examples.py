import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API base URL
BASE_URL = "http://localhost:8000/api"

def chat_example():
    """Example of using the /chat endpoint"""
    print("\n=== Chat Example ===")
    
    # Prepare the request payload
    payload = {
        "question": "What are the symptoms of diabetes?"
    }
    
    # Send the request
    response = requests.post(f"{BASE_URL}/chat", json=payload)
    
    # Print the response
    if response.status_code == 200:
        result = response.json()
        print("\nQuestion:")
        print(payload["question"])
        print("\nAnswer:")
        print(result["answer"])
        
        if result.get("sources"):
            print("\nSources:")
            for source in result["sources"]:
                print(f"- {source['document_name']} (Score: {source['relevance_score']:.2f})")
                print(f"  Snippet: {source['text_snippet'][:100]}...")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

def upload_example(file_path):
    """Example of using the /upload endpoint"""
    print("\n=== Upload Example ===")
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return
    
    # Prepare the files and data
    files = {
        "file": (os.path.basename(file_path), open(file_path, "rb"), "application/octet-stream")
    }
    
    data = {
        "document_type": "medical_information"
    }
    
    # Send the request
    response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
    
    # Print the response
    if response.status_code == 200:
        result = response.json()
        print(f"\nUploaded: {result['filename']}")
        print(f"Document ID: {result['document_id']}")
        print(f"Number of chunks: {result['num_chunks']}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

def main():
    print("CareSync AI API Examples")
    print("=======================")
    
    # Run the chat example
    chat_example()
    
    # Run the upload example (uncomment and provide a valid file path)
    # upload_example("path/to/your/document.pdf")

if __name__ == "__main__":
    main()