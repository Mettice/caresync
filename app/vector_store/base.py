import os
from typing import List, Dict, Any, Optional
from langchain.docstore.document import Document
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS, Chroma
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class VectorStoreBase:
    """Base class for vector store implementations"""
    
    def __init__(self, store_path: str, embeddings):
        self.store_path = store_path
        self.embeddings = embeddings
        
        # Create store directory if it doesn't exist
        os.makedirs(self.store_path, exist_ok=True)
    
    async def add_documents(self, documents: List[Document]) -> int:
        """Add documents to the vector store"""
        raise NotImplementedError("Subclasses must implement add_documents")
    
    async def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant documents based on a query"""
        raise NotImplementedError("Subclasses must implement search")
    
    async def delete(self, document_ids: List[str]) -> bool:
        """Delete documents from the vector store"""
        raise NotImplementedError("Subclasses must implement delete")


class FAISSVectorStore(VectorStoreBase):
    """FAISS implementation of vector store"""
    
    def __init__(self, store_path: str, embeddings):
        super().__init__(store_path, embeddings)
        self._initialize_store()
    
    def _initialize_store(self):
        """Initialize the FAISS vector store"""
        try:
            # Try to load existing FAISS index
            self.store = FAISS.load_local(
                self.store_path, 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
        except Exception:
            # Create a new FAISS index if none exists
            self.store = FAISS.from_documents(
                documents=[],  # Empty initial documents
                embedding=self.embeddings
            )
    
    async def add_documents(self, documents: List[Document]) -> int:
        """Add documents to the FAISS vector store"""
        if not documents:
            return 0
            
        self.store.add_documents(documents)
        self.store.save_local(self.store_path)
        return len(documents)
    
    async def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant documents in the FAISS vector store"""
        results = self.store.similarity_search_with_score(query, k=top_k)
        
        # Format the results
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "document_name": doc.metadata.get("filename", "Unknown"),
                "page_number": doc.metadata.get("page", None),
                "text_snippet": doc.page_content,
                "relevance_score": float(1.0 - score) if score <= 1.0 else float((1.0 / score) if score > 0 else 0),
                "metadata": doc.metadata
            })
        
        return formatted_results
    
    async def delete(self, document_ids: List[str]) -> bool:
        """Delete documents from the FAISS vector store"""
        # FAISS doesn't support direct deletion, so we would need to rebuild the index
        # This is a simplified implementation
        return False


class ChromaVectorStore(VectorStoreBase):
    """Chroma implementation of vector store"""
    
    def __init__(self, store_path: str, embeddings):
        super().__init__(store_path, embeddings)
        self._initialize_store()
    
    def _initialize_store(self):
        """Initialize the Chroma vector store"""
        self.store = Chroma(
            persist_directory=self.store_path,
            embedding_function=self.embeddings
        )
    
    async def add_documents(self, documents: List[Document]) -> int:
        """Add documents to the Chroma vector store"""
        if not documents:
            return 0
            
        self.store.add_documents(documents)
        self.store.persist()
        return len(documents)
    
    async def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant documents in the Chroma vector store"""
        results = self.store.similarity_search_with_score(query, k=top_k)
        
        # Format the results
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "document_name": doc.metadata.get("filename", "Unknown"),
                "page_number": doc.metadata.get("page", None),
                "text_snippet": doc.page_content,
                "relevance_score": float(1.0 - score) if score <= 1.0 else float((1.0 / score) if score > 0 else 0),
                "metadata": doc.metadata
            })
        
        return formatted_results
    
    async def delete(self, document_ids: List[str]) -> bool:
        """Delete documents from the Chroma vector store"""
        try:
            self.store.delete(document_ids)
            self.store.persist()
            return True
        except Exception:
            return False


def create_vector_store(store_type: str = None, store_path: str = None, embeddings = None):
    """Factory function to create the appropriate vector store"""
    # Use environment variables if not provided
    if store_type is None:
        store_type = os.getenv("VECTOR_STORE_TYPE", "faiss").lower()
    
    if store_path is None:
        store_path = os.getenv("VECTOR_STORE_PATH", "./data/vector_store")
    
    if embeddings is None:
        embeddings = OpenAIEmbeddings(
            api_key=os.getenv("OPENAI_API_KEY")
        )
    
    # Create the appropriate vector store
    if store_type == "faiss":
        return FAISSVectorStore(store_path, embeddings)
    elif store_type == "chroma":
        return ChromaVectorStore(store_path, embeddings)
    else:
        raise ValueError(f"Unsupported vector store type: {store_type}")