"""
Embedding generation module
Converts text chunks into vector embeddings
"""

import logging
from typing import List
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

from .config import EMBEDDING_MODEL, EMBEDDING_BATCH_SIZE

logger = logging.getLogger(__name__)


class EmbeddingGenerator:
    """Generates embeddings for text chunks using sentence-transformers"""
    
    def __init__(self, model_name: str = EMBEDDING_MODEL):
        """
        Initialize embedding generator
        
        Args:
            model_name: Name of the sentence-transformers model to use
        """
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            raise ImportError(
                "sentence-transformers not installed. "
                "Install with: pip install sentence-transformers"
            )
        
        logger.info(f"Loading embedding model: {model_name}")
        self.model_name = model_name
        self.model = SentenceTransformer(model_name)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        logger.info(f"Model loaded successfully. Embedding dimension: {self.embedding_dim}")
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding for a single text
        
        Args:
            text: Input text
            
        Returns:
            Numpy array of embedding vector
        """
        return self.model.encode(text, convert_to_numpy=True)
    
    def generate_embeddings_batch(
        self,
        texts: List[str],
        batch_size: int = EMBEDDING_BATCH_SIZE,
        show_progress: bool = True
    ) -> np.ndarray:
        """
        Generate embeddings for multiple texts efficiently
        
        Args:
            texts: List of input texts
            batch_size: Batch size for processing
            show_progress: Whether to show progress bar
            
        Returns:
            Numpy array of shape (len(texts), embedding_dim)
        """
        logger.info(f"Generating embeddings for {len(texts)} texts in batches of {batch_size}")
        
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=show_progress,
            convert_to_numpy=True
        )
        
        logger.info(f"Generated {len(embeddings)} embeddings of dimension {self.embedding_dim}")
        
        return embeddings
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings produced by this model"""
        return self.embedding_dim
