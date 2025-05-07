import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class VectorStoreService:
    """Service for managing document vector storage and retrieval"""
    
    def __init__(self):
        self.vector_store = None
        self.embeddings = OpenAIEmbeddings()
        
        # Get base directory (where main.py is located)
        base_dir = Path(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        
        # Get paths from environment or use defaults with absolute paths
        self.vector_store_path = os.getenv('VECTOR_STORE_PATH', str(base_dir / 'data' / 'vector_store'))
        self.document_store_path = os.getenv('DOCUMENT_STORE_PATH', str(base_dir / 'data' / 'documents'))
        
        # Ensure directories exist
        self._ensure_directories()
        self._initialize_vector_store()
    
    def _ensure_directories(self):
        """Create necessary directories if they don't exist"""
        Path(self.vector_store_path).mkdir(parents=True, exist_ok=True)
        Path(self.document_store_path).mkdir(parents=True, exist_ok=True)
    
    def _initialize_vector_store(self):
        """Initialize the vector store, creating a new one if it doesn't exist"""
        try:
            index_path = Path(self.vector_store_path) / "index.faiss"
            if index_path.exists():
                # Try to load existing vector store
                self.vector_store = FAISS.load_local(
                    folder_path=self.vector_store_path,
                    embeddings=self.embeddings,
                    allow_dangerous_deserialization=True
                )
                print(f"Successfully loaded existing vector store from {self.vector_store_path}")
            else:
                raise FileNotFoundError("Vector store index not found")
                
        except Exception as e:
            print(f"Could not load existing vector store: {str(e)}")
            try:
                # Create a new vector store with a dummy document if none exists
                dummy_text = "CareSync AI initialization document. This is a placeholder."
                self.vector_store = FAISS.from_texts(
                    texts=[dummy_text],
                    embedding=self.embeddings,
                    metadatas=[{"source": "initialization"}]
                )
                # Save the new vector store
                self.vector_store.save_local(self.vector_store_path)
                print(f"Created and saved new vector store at {self.vector_store_path}")
            except Exception as e:
                raise Exception(f"Error initializing vector store: {str(e)}")
    
    async def add_document(self, content: str, metadata: Dict[str, Any]) -> bool:
        """Add a document to the vector store"""
        try:
            if not content.strip():
                return False
                
            # Add the document to the vector store
            self.vector_store.add_texts(
                texts=[content],
                metadatas=[metadata]
            )
            
            # Save the updated vector store
            self.vector_store.save_local(self.vector_store_path)
            return True
        except Exception as e:
            print(f"Error adding document to vector store: {str(e)}")
            return False
    
    async def search_similar(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        """Search for similar documents in the vector store"""
        try:
            if not query.strip():
                return []
                
            results = self.vector_store.similarity_search_with_score(
                query,
                k=k
            )
            
            # Format results
            formatted_results = []
            for doc, score in results:
                if doc.metadata.get("source") != "initialization":  # Skip initialization document
                    formatted_results.append({
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "score": float(score)
                    })
            
            return formatted_results
        except Exception as e:
            print(f"Error searching vector store: {str(e)}")
            return []

def get_vector_store_service() -> VectorStoreService:
    """Dependency injection function for the vector store service"""
    return VectorStoreService()