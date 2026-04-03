#!/usr/bin/env python3
"""
RAG System Test Script

This standalone script tests the complete RAG implementation:
1. ChromaDB initialization
2. Guidelines ingestion
3. Semantic search functionality
4. Agent integration

Run this script to verify RAG system is working correctly.
"""

import asyncio
import sys
from pathlib import Path

# Add the Backend directory to Python path
backend_path = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_path))

from app.rag import initialize_vector_db, get_db_status, retrieve_guideline


def test_embedding_model():
    """Test that ChromaDB's embedding model is working."""
    print("🧠 Testing Embedding Model...")
    
    try:
        # Initialize database (this tests the embedding model internally)
        success = initialize_vector_db()
        if success:
            print("✅ Embedding model working - vectors created successfully")
            return True
        else:
            print("❌ Embedding model failed - no vectors created")
            return False
    except Exception as e:
        print(f"❌ Embedding model error: {e}")
        return False


def test_database_initialization():
    """Test ChromaDB database initialization and persistence."""
    print("\n💾 Testing Database Initialization...")
    
    try:
        # Check database status
        status = get_db_status()
        print(f"📊 DB Status: {status}")
        
        # Verify database files exist
        chroma_path = Path("./chroma_db")
        if chroma_path.exists():
            files = list(chroma_path.rglob("*"))
            print(f"📁 Database files: {len(files)} files created")
            
            # Check for main database file
            sqlite_file = chroma_path / "chroma.sqlite3"
            if sqlite_file.exists():
                size_mb = sqlite_file.stat().st_size / (1024 * 1024)
                print(f"💾 Main database: {size_mb:.2f} MB")
                return True
        
        print("❌ Database files not found")
        return False
        
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        return False


async def test_data_flow():
    """Test the complete data flow from query to retrieval."""
    print("\n🔄 Testing Data Flow...")
    
    try:
        # Test queries that should match different sections of guidelines
        test_queries = [
            "elevated lactate",
            "blood cultures", 
            "antibiotic therapy",
            "fluid resuscitation",
            "sepsis protocol"
        ]
        
        results = {}
        
        for query in test_queries:
            print(f"\n🔍 Query: '{query}'")
            
            # Retrieve guidelines
            retrieved_text = await retrieve_guideline(query)
            
            if retrieved_text and len(retrieved_text) > 50:
                results[query] = {
                    "success": True,
                    "length": len(retrieved_text),
                    "preview": retrieved_text[:150] + "..."
                }
                print(f"✅ Retrieved {len(retrieved_text)} characters")
                print(f"📝 Preview: {retrieved_text[:100]}...")
            else:
                results[query] = {
                    "success": False,
                    "error": "No relevant content found"
                }
                print(f"❌ No relevant content found")
        
        return results
        
    except Exception as e:
        print(f"❌ Data flow error: {e}")
        return {}


async def test_agent_integration():
    """Test RAG integration with AI agents."""
    print("\n🤖 Testing Agent Integration...")
    
    try:
        # Simulate Parser Agent output
        mock_symptoms = ["lethargic", "clammy skin", "shortness of breath", "high lactate"]
        symptoms_query = "; ".join(mock_symptoms)
        
        print(f"🏥 Mock symptoms: {symptoms_query}")
        
        # Test RAG retrieval with symptom query
        guidelines = await retrieve_guideline(symptoms_query)
        
        if guidelines and len(guidelines) > 100:
            print("✅ Agent-RAG integration successful")
            print(f"📋 Retrieved guidelines: {len(guidelines)} characters")
            
            # Verify guidelines contain relevant content
            relevant_keywords = ["lactate", "measurement", "protocol", "assessment"]
            found_keywords = [kw for kw in relevant_keywords if kw.lower() in guidelines.lower()]
            
            if found_keywords:
                print(f"🎯 Relevant keywords found: {found_keywords}")
                return True
            else:
                print("⚠️  Guidelines retrieved but may not be optimally relevant")
                return False
        else:
            print("❌ Agent-RAG integration failed")
            return False
            
    except Exception as e:
        print(f"❌ Agent integration error: {e}")
        return False


def test_persistence():
    """Test that database persists across reinitializations."""
    print("\n💾 Testing Persistence...")
    
    try:
        # Get initial status
        initial_status = get_db_status()
        initial_count = initial_status.get("document_count", 0)
        print(f"📊 Initial document count: {initial_count}")
        
        # Re-initialize (should load existing data)
        reinit_success = initialize_vector_db()
        
        if reinit_success:
            # Check status after re-initialization
            final_status = get_db_status()
            final_count = final_status.get("document_count", 0)
            print(f"📊 Final document count: {final_count}")
            
            if final_count == initial_count and final_count > 0:
                print("✅ Persistence test passed - data survived re-initialization")
                return True
            else:
                print("❌ Persistence test failed - data not preserved")
                return False
        else:
            print("❌ Re-initialization failed")
            return False
            
    except Exception as e:
        print(f"❌ Persistence test error: {e}")
        return False


async def main():
    """Run all RAG system tests."""
    print("🧪 RAG System Comprehensive Test")
    print("=" * 50)
    
    test_results = {}
    
    # Test 1: Embedding Model
    test_results["embedding"] = test_embedding_model()
    
    # Test 2: Database Initialization
    test_results["database"] = test_database_initialization()
    
    # Test 3: Data Flow
    test_results["data_flow"] = await test_data_flow()
    
    # Test 4: Agent Integration
    test_results["agent_integration"] = await test_agent_integration()
    
    # Test 5: Persistence
    test_results["persistence"] = test_persistence()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results.items():
        if isinstance(result, bool):
            status = "✅ PASS" if result else "❌ FAIL"
            if result:
                passed += 1
        elif isinstance(result, dict):
            successful_queries = sum(1 for r in result.values() if r.get("success", False))
            total_queries = len(result)
            status = f"✅ {successful_queries}/{total_queries} queries successful"
            if successful_queries > 0:
                passed += 1
        else:
            status = "⚠️  UNKNOWN"
        
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} test categories passed")
    
    if passed == total:
        print("🎉 RAG System is FULLY FUNCTIONAL!")
        return True
    else:
        print("⚠️  RAG System has issues that need attention")
        return False


if __name__ == "__main__":
    print("🚀 Starting RAG System Test...")
    print("This will test ChromaDB, embeddings, and agent integration")
    print()
    
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1)
