# Step 3: Create Embeddings and Build Vector Database

## Overview

This step transforms the 1,749 text chunks from Step 2 into vector embeddings and stores them in a ChromaDB vector database for efficient semantic search and retrieval.

**Time Estimate**: 1.5-2 hours  
**Prerequisites**: Step 2 completed (chunks created)

---

## What You'll Build

1. **Embedding Generator**: Module to convert text chunks into vector embeddings
2. **Vector Database**: ChromaDB collection with persistent storage
3. **Retrieval System**: Query interface to find relevant law sections
4. **Testing Script**: Validate retrieval with sample queries

---

## Implementation Steps

### Step 3.1: Choose and Set Up Embedding Model (20 minutes)

**Recommended Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Why**: Small (80MB), fast, good performance, runs on CPU
- **Embedding Size**: 384 dimensions
- **Speed**: ~1000 sentences/second on CPU

**Alternative** (if you want better Nepali support later):
- `intfloat/multilingual-e5-large` - Better for multilingual, but larger and slower

**Installation**:
```bash
source venv/bin/activate
pip install sentence-transformers chromadb
```

**Create**: `module_a/embeddings.py`
```python
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class EmbeddingGenerator:
    """Generates embeddings for text chunks"""
    
    def __init__(self, model_name='sentence-transformers/all-MiniLM-L6-v2'):
        logger.info(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        logger.info(f"Model loaded. Embedding dimension: {self.embedding_dim}")
    
    def generate_embedding(self, text: str):
        """Generate embedding for a single text"""
        return self.model.encode(text, convert_to_numpy=True)
    
    def generate_embeddings_batch(self, texts: list, batch_size=32):
        """Generate embeddings for multiple texts efficiently"""
        logger.info(f"Generating embeddings for {len(texts)} texts")
        embeddings = self.model.encode(
            texts, 
            batch_size=batch_size,
            show_progress_bar=True,
            convert_to_numpy=True
        )
        return embeddings
```

---

### Step 3.2: Set Up ChromaDB (20 minutes)

**Create**: `module_a/vector_db.py`
```python
import chromadb
from chromadb.config import Settings
import logging
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class LegalVectorDB:
    """ChromaDB vector database for legal documents"""
    
    def __init__(self, persist_directory: str = "data/module-A/vector_db"):
        """Initialize ChromaDB with persistent storage"""
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Initializing ChromaDB at {self.persist_directory}")
        
        self.client = chromadb.PersistentClient(
            path=str(self.persist_directory)
        )
        
        # Create or get collection
        self.collection = self.client.get_or_create_collection(
            name="nepal_legal_docs",
            metadata={"description": "Nepal legal documents for RAG"}
        )
        
        logger.info(f"Collection 'nepal_legal_docs' ready. Current count: {self.collection.count()}")
    
    def add_chunks(self, chunks: List[Dict[str, Any]], embeddings: List):
        """Add chunks with embeddings to the database"""
        ids = [chunk['chunk_id'] for chunk in chunks]
        documents = [chunk['text'] for chunk in chunks]
        metadatas = [chunk['metadata'] for chunk in chunks]
        
        logger.info(f"Adding {len(chunks)} chunks to vector database")
        
        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        logger.info(f"Successfully added chunks. Total in DB: {self.collection.count()}")
    
    def query(self, query_text: str, n_results: int = 5):
        """Query the database with a text query"""
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results
    
    def query_with_embedding(self, query_embedding, n_results: int = 5):
        """Query with pre-computed embedding"""
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results
```

---

### Step 3.3: Create Main Pipeline Script (30 minutes)

**Create**: `module_a/build_vector_db.py`
```python
"""
Build vector database from processed chunks
"""

import json
import logging
import time
from pathlib import Path

from .config import CHUNKS_OUTPUT_FILE, LOG_LEVEL, LOG_FORMAT
from .embeddings import EmbeddingGenerator
from .vector_db import LegalVectorDB

logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT)
logger = logging.getLogger(__name__)


def load_chunks(chunks_file: Path):
    """Load processed chunks from JSON"""
    logger.info(f"Loading chunks from {chunks_file}")
    with open(chunks_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    chunks = data['chunks']
    logger.info(f"Loaded {len(chunks)} chunks")
    return chunks


def main():
    """Main pipeline to build vector database"""
    logger.info("=" * 80)
    logger.info("Building Vector Database for Nepal Legal Documents")
    logger.info("=" * 80)
    
    start_time = time.time()
    
    # Step 1: Load chunks
    chunks = load_chunks(CHUNKS_OUTPUT_FILE)
    
    # Step 2: Initialize embedding generator
    logger.info("\nStep 1: Initializing embedding model...")
    embedder = EmbeddingGenerator()
    
    # Step 3: Generate embeddings
    logger.info("\nStep 2: Generating embeddings for all chunks...")
    texts = [chunk['text'] for chunk in chunks]
    embeddings = embedder.generate_embeddings_batch(texts, batch_size=32)
    
    logger.info(f"Generated {len(embeddings)} embeddings of dimension {embeddings[0].shape}")
    
    # Step 4: Initialize vector database
    logger.info("\nStep 3: Initializing vector database...")
    vector_db = LegalVectorDB()
    
    # Step 5: Add chunks to database
    logger.info("\nStep 4: Adding chunks to vector database...")
    vector_db.add_chunks(chunks, embeddings.tolist())
    
    # Calculate stats
    elapsed_time = time.time() - start_time
    
    logger.info("\n" + "=" * 80)
    logger.info("Vector Database Build Complete!")
    logger.info("=" * 80)
    logger.info(f"Total chunks indexed: {len(chunks)}")
    logger.info(f"Embedding dimension: {embedder.embedding_dim}")
    logger.info(f"Build time: {elapsed_time:.2f} seconds")
    logger.info(f"Database location: data/module-A/vector_db")
    logger.info("=" * 80)
    
    print(f"\n✓ Vector database built successfully!")
    print(f"✓ Indexed {len(chunks)} chunks")
    print(f"✓ Ready for retrieval testing")


if __name__ == "__main__":
    main()
```

---

### Step 3.4: Create Retrieval Testing Script (20 minutes)

**Create**: `module_a/test_retrieval.py`
```python
"""
Test retrieval from vector database
"""

import logging
from .embeddings import EmbeddingGenerator
from .vector_db import LegalVectorDB
from .config import LOG_LEVEL, LOG_FORMAT

logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT)
logger = logging.getLogger(__name__)


def test_query(query: str, vector_db: LegalVectorDB, embedder: EmbeddingGenerator, n_results: int = 3):
    """Test a single query"""
    print(f"\n{'=' * 80}")
    print(f"Query: {query}")
    print(f"{'=' * 80}")
    
    # Generate query embedding
    query_embedding = embedder.generate_embedding(query)
    
    # Search
    results = vector_db.query_with_embedding(query_embedding, n_results=n_results)
    
    # Display results
    for i, (doc, metadata, distance) in enumerate(zip(
        results['documents'][0],
        results['metadatas'][0],
        results['distances'][0]
    ), 1):
        print(f"\nResult {i} (Distance: {distance:.4f}):")
        print(f"Source: {metadata.get('source_file', 'N/A')}")
        print(f"Section: {metadata.get('article_section', 'N/A')}")
        print(f"Text preview: {doc[:200]}...")
        print("-" * 80)


def main():
    """Run test queries"""
    print("=" * 80)
    print("Testing Vector Database Retrieval")
    print("=" * 80)
    
    # Initialize
    embedder = EmbeddingGenerator()
    vector_db = LegalVectorDB()
    
    # Test queries from the implementation guide
    test_queries = [
        "I am a single mother, how to get citizenship for my child?",
        "Can daughters inherit property like sons?",
        "What documents needed for marriage registration?",
        "citizenship through mother",
        "right to equality",
    ]
    
    for query in test_queries:
        test_query(query, vector_db, embedder, n_results=3)
    
    print("\n" + "=" * 80)
    print("Retrieval testing complete!")
    print("=" * 80)


if __name__ == "__main__":
    main()
```

---

### Step 3.5: Update Configuration (10 minutes)

**Add to** `module_a/config.py`:
```python
# Vector database settings
VECTOR_DB_DIR = DATA_DIR / "vector_db"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_BATCH_SIZE = 32

# Retrieval settings
DEFAULT_RETRIEVAL_K = 5  # Number of chunks to retrieve
```

---

### Step 3.6: Update Requirements (5 minutes)

**Add to** `module_a/requirements.txt`:
```
sentence-transformers>=2.2.0
chromadb>=0.4.0
```

---

## Execution Commands

```bash
# 1. Install dependencies
source venv/bin/activate
pip install sentence-transformers chromadb

# 2. Build vector database
python -m module_a.build_vector_db

# 3. Test retrieval
python -m module_a.test_retrieval
```

---

## Expected Output

### Building Vector Database:
```
================================================================================
Building Vector Database for Nepal Legal Documents
================================================================================
Loading chunks from data/module-A/chunks/processed_chunks.json
Loaded 1749 chunks

Step 1: Initializing embedding model...
Loading embedding model: sentence-transformers/all-MiniLM-L6-v2
Model loaded. Embedding dimension: 384

Step 2: Generating embeddings for all chunks...
Batches: 100%|████████████████████| 55/55 [00:15<00:00,  3.50it/s]
Generated 1749 embeddings of dimension (384,)

Step 3: Initializing vector database...
Collection 'nepal_legal_docs' ready. Current count: 0

Step 4: Adding chunks to vector database...
Successfully added chunks. Total in DB: 1749

================================================================================
Vector Database Build Complete!
================================================================================
Total chunks indexed: 1749
Embedding dimension: 384
Build time: 18.45 seconds
Database location: data/module-A/vector_db
================================================================================

✓ Vector database built successfully!
✓ Indexed 1749 chunks
✓ Ready for retrieval testing
```

### Testing Retrieval:
```
================================================================================
Query: I am a single mother, how to get citizenship for my child?
================================================================================

Result 1 (Distance: 0.4521):
Source: Constitution-of-Nepal_2072_Eng_www.moljpa.gov_.npDate-72_11_16.pdf
Section: 11. To be citizens of Nepal
Text preview: A person whose father or mother was a citizen of Nepal at the 
birth of such person shall be a citizen of Nepal by descent...
--------------------------------------------------------------------------------

Result 2 (Distance: 0.5234):
Source: citizenship_AIN_2006.pdf
Section: 3. Citizenship by descent
Text preview: A child born to a Nepali woman shall be entitled to citizenship...
--------------------------------------------------------------------------------
```

---

## Validation Checklist

After completing Step 3, verify:

- [ ] Vector database created at `data/module-A/vector_db/`
- [ ] All 1,749 chunks indexed successfully
- [ ] Embeddings are 384-dimensional
- [ ] Test queries return relevant results
- [ ] Results include proper metadata (source, section)
- [ ] Distance scores are reasonable (lower = more similar)
- [ ] Database persists across runs (test by running retrieval twice)

---

## Troubleshooting

**Issue**: Out of memory during embedding generation  
**Solution**: Reduce `batch_size` in `generate_embeddings_batch`

**Issue**: ChromaDB errors about existing collection  
**Solution**: Delete `data/module-A/vector_db/` and rebuild

**Issue**: Poor retrieval results  
**Solution**: Check if chunks have good text quality, consider different embedding model

**Issue**: Slow embedding generation  
**Solution**: Normal on CPU. For GPU acceleration, install `sentence-transformers` with CUDA support

---

## Next Steps (Step 4)

After completing Step 3, you'll have a working retrieval system. Step 4 will add:
- LLM integration (Ollama or API)
- Prompt engineering for simple explanations
- RAG chain (retrieval + generation)
- Bilingual support (optional)

---

## Time Breakdown

- Setup & Installation: 15 min
- Create embeddings.py: 20 min
- Create vector_db.py: 20 min
- Create build_vector_db.py: 30 min
- Create test_retrieval.py: 20 min
- Testing & Validation: 15 min
- **Total**: ~2 hours

---

## Key Concepts

**Embeddings**: Vector representations of text that capture semantic meaning. Similar texts have similar vectors.

**Vector Database**: Specialized database for storing and searching embeddings efficiently using similarity metrics.

**ChromaDB**: Open-source embedding database with persistent storage and easy Python API.

**Semantic Search**: Finding relevant documents based on meaning, not just keyword matching.

---

## Success Criteria

✅ Vector database built with all chunks  
✅ Retrieval returns relevant law sections  
✅ Metadata preserved (source, article/section)  
✅ System ready for LLM integration  
✅ Processing time < 30 seconds for 1,749 chunks
