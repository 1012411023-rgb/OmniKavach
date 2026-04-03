#!/usr/bin/env python3
"""
Simple RAG Test - Quick verification that ChromaDB is working
"""

import asyncio
import sys
from pathlib import Path

# Add the Backend directory to Python path
backend_path = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_path))

from app.rag import initialize_vector_db, retrieve_guideline, get_db_status


async def test_rag_simple():
    """Simple test of RAG functionality."""
    print("🧪 Simple RAG Test")
    print("=" * 30)
    
    # Step 1: Initialize
    print("1. Initializing ChromaDB...")
    success = initialize_vector_db()
    print(f"   Success: {success}")
    
    # Step 2: Check status
    print("2. Checking database status...")
    status = get_db_status()
    print(f"   Status: {status}")
    
    # Step 3: Test retrieval
    print("3. Testing guideline retrieval...")
    
    test_queries = [
        "lactate",
        "sepsis",
        "antibiotics",
        "fluid"
    ]
    
    for query in test_queries:
        result = await retrieve_guideline(query)
        print(f"   Query '{query}': {len(result)} chars returned")
        if len(result) > 50:
            print(f"   Preview: {result[:100]}...")
        else:
            print(f"   Result: {result}")
    
    print("✅ RAG test complete!")


if __name__ == "__main__":
    asyncio.run(test_rag_simple())
