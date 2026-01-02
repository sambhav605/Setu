"""
Vector database module using ChromaDB
Stores and retrieves document chunks with embeddings
"""

import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

from .config import VECTOR_DB_DIR, DEFAULT_RETRIEVAL_K

logger = logging.getLogger(__name__)


class LegalVectorDB:
    """ChromaDB vector database for legal documents"""
    
    def __init__(self, persist_directory: Path = VECTOR_DB_DIR):
        """
        Initialize ChromaDB with persistent storage
        
        Args:
            persist_directory: Directory to store the database
        """
        if not CHROMADB_AVAILABLE:
            raise ImportError(
                "chromadb not installed. "
                "Install with: pip install chromadb"
            )
        
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Initializing ChromaDB at {self.persist_directory}")
        
        # Initialize ChromaDB client with persistent storage
        self.client = chromadb.PersistentClient(
            path=str(self.persist_directory)
        )
        
        # Create or get collection
        self.collection_name = "nepal_legal_docs"
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "Nepal legal documents for RAG-based law explanation"}
        )
        
        current_count = self.collection.count()
        logger.info(f"Collection '{self.collection_name}' ready. Current document count: {current_count}")
    
    def add_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]]
    ) -> None:
        """
        Add chunks with embeddings to the database
        
        Args:
            chunks: List of chunk dictionaries with 'chunk_id', 'text', and 'metadata'
            embeddings: List of embedding vectors (as lists)
        """
        if len(chunks) != len(embeddings):
            raise ValueError(f"Number of chunks ({len(chunks)}) must match number of embeddings ({len(embeddings)})")
        
        # Extract data from chunks
        ids = [chunk['chunk_id'] for chunk in chunks]
        documents = [chunk['text'] for chunk in chunks]
        
        # Clean metadata: ChromaDB only accepts str, int, float, bool
        # Remove None values and convert other types to strings
        metadatas = []
        for chunk in chunks:
            cleaned_metadata = {}
            for key, value in chunk['metadata'].items():
                if value is None:
                    # Skip None values
                    continue
                elif isinstance(value, (str, int, float, bool)):
                    # Keep valid types as-is
                    cleaned_metadata[key] = value
                elif isinstance(value, list):
                    # Convert lists to comma-separated strings
                    if value:  # Only include non-empty lists
                        cleaned_metadata[key] = ', '.join(str(item) for item in value)
                else:
                    # Convert other types to strings
                    cleaned_metadata[key] = str(value)
            metadatas.append(cleaned_metadata)
        
        logger.info(f"Adding {len(chunks)} chunks to vector database")
        
        # Add to ChromaDB
        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        total_count = self.collection.count()
        logger.info(f"Successfully added chunks. Total documents in database: {total_count}")
    
    def query(
        self,
        query_text: str,
        n_results: int = DEFAULT_RETRIEVAL_K,
        where: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Query the database with a text query
        
        Args:
            query_text: Query string
            n_results: Number of results to return
            where: Optional metadata filter
            
        Returns:
            Dictionary with 'ids', 'documents', 'metadatas', and 'distances'
        """
        logger.info(f"Querying database with: '{query_text[:50]}...' (n_results={n_results})")
        
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where
        )
        
        return results
    
    def query_with_embedding(
        self,
        query_embedding: List[float],
        n_results: int = DEFAULT_RETRIEVAL_K,
        where: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Query with pre-computed embedding
        
        Args:
            query_embedding: Query embedding vector
            n_results: Number of results to return
            where: Optional metadata filter
            
        Returns:
            Dictionary with 'ids', 'documents', 'metadatas', and 'distances'
        """
        logger.info(f"Querying database with embedding (n_results={n_results})")
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where
        )
        
        return results
    
    def get_count(self) -> int:
        """Get the number of documents in the database"""
        return self.collection.count()
    
    def delete_collection(self) -> None:
        """Delete the entire collection (use with caution!)"""
        logger.warning(f"Deleting collection '{self.collection_name}'")
        self.client.delete_collection(name=self.collection_name)
        logger.info("Collection deleted")
    
    def peek(self, limit: int = 5) -> Dict[str, Any]:
        """
        Peek at some documents in the database
        
        Args:
            limit: Number of documents to return
            
        Returns:
            Dictionary with sample documents
        """
        return self.collection.peek(limit=limit)
