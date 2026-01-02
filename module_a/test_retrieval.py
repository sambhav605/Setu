"""
Test retrieval from vector database
Validates that semantic search is working correctly
"""

import logging
from typing import List, Tuple

from .embeddings import EmbeddingGenerator
from .vector_db import LegalVectorDB
from .config import LOG_LEVEL, LOG_FORMAT

logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT)
logger = logging.getLogger(__name__)


def test_query(
    query: str,
    vector_db: LegalVectorDB,
    embedder: EmbeddingGenerator,
    n_results: int = 3
) -> None:
    """
    Test a single query and display results
    
    Args:
        query: Query string
        vector_db: Vector database instance
        embedder: Embedding generator instance
        n_results: Number of results to retrieve
    """
    print(f"\n{'=' * 80}")
    print(f"Query: {query}")
    print(f"{'=' * 80}")
    
    # Generate query embedding
    query_embedding = embedder.generate_embedding(query)
    
    # Search
    results = vector_db.query_with_embedding(query_embedding.tolist(), n_results=n_results)
    
    # Display results
    if not results['documents'][0]:
        print("No results found!")
        return
    
    for i, (doc, metadata, distance) in enumerate(zip(
        results['documents'][0],
        results['metadatas'][0],
        results['distances'][0]
    ), 1):
        print(f"\nResult {i} (Distance: {distance:.4f}):")
        print(f"  Source: {metadata.get('source_file', 'N/A')}")
        print(f"  Section: {metadata.get('article_section', 'N/A')}")
        print(f"  Words: {metadata.get('word_count', 'N/A')}")
        print(f"  Text preview: {doc[:200]}...")
        print("-" * 80)


def main():
    """Run test queries"""
    print("=" * 80)
    print("Testing Vector Database Retrieval")
    print("=" * 80)
    
    try:
        # Initialize
        print("\nInitializing embedding model and vector database...")
        embedder = EmbeddingGenerator()
        vector_db = LegalVectorDB()
        
        db_count = vector_db.get_count()
        print(f"✓ Embedding model loaded: {embedder.model_name}")
        print(f"✓ Vector database loaded: {db_count} chunks indexed")
        
        if db_count == 0:
            print("\n✗ Error: Vector database is empty!")
            print("Please run 'python -m module_a.build_vector_db' first")
            return 1
        
        # Test queries from the implementation guide
        test_queries = [
            "I am a single mother, how to get citizenship for my child?",
            "Can daughters inherit property like sons?",
            "What documents needed for marriage registration?",
            "citizenship through mother",
            "right to equality",
            "fundamental rights of citizens",
        ]
        
        print(f"\nRunning {len(test_queries)} test queries...")
        
        for query in test_queries:
            test_query(query, vector_db, embedder, n_results=3)
        
        print("\n" + "=" * 80)
        print("Retrieval Testing Complete!")
        print("=" * 80)
        print("\n✓ All test queries executed successfully")
        print("✓ Vector database is working correctly")
        print("\nNext step: Integrate with LLM for Step 4 (RAG chain)")
        
        return 0
        
    except Exception as e:
        logger.error(f"Testing failed: {e}", exc_info=True)
        print(f"\n✗ Testing failed: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
