"""
Medical Librarian - Local RAG implementation using ChromaDB.

This module provides a lightweight, self-contained RAG (Retrieval-Augmented Generation)
system that loads medical guidelines into ChromaDB on startup and enables semantic
search for clinical protocols.
"""

import os
import logging
from pathlib import Path
from typing import List, Optional
import asyncio

import chromadb
from chromadb.config import Settings


def simple_text_splitter(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    """
    Simple text splitter that breaks text into chunks with overlap.
    
    Args:
        text: Input text to split
        chunk_size: Maximum size of each chunk
        chunk_overlap: Number of characters to overlap between chunks
        
    Returns:
        List of text chunks
    """
    if not text or not text.strip():
        return []
    
    # Split by paragraphs first
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
            
        # If adding this paragraph exceeds chunk size, start new chunk
        if len(current_chunk) + len(paragraph) + 2 > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            # Start new chunk with overlap from previous chunk
            if len(current_chunk) > chunk_overlap:
                overlap_text = current_chunk[-chunk_overlap:]
                current_chunk = overlap_text + "\n\n" + paragraph
            else:
                current_chunk = paragraph
        else:
            if current_chunk:
                current_chunk += "\n\n" + paragraph
            else:
                current_chunk = paragraph
    
    # Add the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks

logger = logging.getLogger(__name__)


# Global ChromaDB client and collection
_chroma_client: Optional[chromadb.PersistentClient] = None
_guideline_collection: Optional[chromadb.Collection] = None


def initialize_vector_db() -> bool:
    """
    Initialize the ChromaDB vector database with sepsis guidelines.
    
    This function checks if the ./chroma_db directory exists and has data.
    If not, it reads from knowledge_base/sepsis_guidelines.md, chunks the text,
    and saves it to a persistent ChromaDB client.
    
    Returns:
        bool: True if initialization successful, False otherwise
    """
    global _chroma_client, _guideline_collection
    
    try:
        # Set up ChromaDB persistent client
        chroma_path = Path("./chroma_db")
        
        # Initialize ChromaDB client with persistent storage
        _chroma_client = chromadb.PersistentClient(
            path=str(chroma_path),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=False
            )
        )
        
        # Check if collection already exists
        try:
            _guideline_collection = _chroma_client.get_collection("sepsis_guidelines")
            logger.info("Loaded existing ChromaDB collection 'sepsis_guidelines'")
            
            # Verify collection has data
            count = _guideline_collection.count()
            if count > 0:
                logger.info(f"ChromaDB contains {count} guideline chunks")
                return True
            else:
                logger.warning("ChromaDB collection exists but is empty, reinitializing...")
                
        except Exception:
            logger.info("Creating new ChromaDB collection 'sepsis_guidelines'")
        
        # Load and process guidelines document
        guidelines_path = Path(__file__).resolve().parent.parent / "knowledge_base" / "sepsis_guidelines.md"
        
        if not guidelines_path.exists():
            logger.error(f"Guidelines file not found: {guidelines_path}")
            return False
        
        # Read guidelines text
        with open(guidelines_path, 'r', encoding='utf-8') as f:
            guidelines_text = f.read()
        
        logger.info(f"Loaded guidelines document ({len(guidelines_text)} characters)")
        
        # Split text into chunks for better retrieval
        chunks = simple_text_splitter(guidelines_text, chunk_size=500, chunk_overlap=50)
        logger.info(f"Split guidelines into {len(chunks)} chunks")
        
        # Create or recreate collection
        try:
            _chroma_client.delete_collection("sepsis_guidelines")
        except Exception:
            pass  # Collection doesn't exist, that's fine
        
        _guideline_collection = _chroma_client.create_collection(
            name="sepsis_guidelines",
            metadata={"description": "Sepsis clinical guidelines for RAG"}
        )
        
        # Add chunks to ChromaDB
        documents = []
        metadatas = []
        ids = []
        
        for i, chunk in enumerate(chunks):
            if chunk.strip():  # Skip empty chunks
                documents.append(chunk)
                metadatas.append({
                    "chunk_id": i,
                    "source": "sepsis_guidelines.md",
                    "length": len(chunk)
                })
                ids.append(f"guideline_chunk_{i}")
        
        if documents:
            # Add documents to collection
            _guideline_collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Successfully added {len(documents)} guideline chunks to ChromaDB")
            return True
        else:
            logger.error("No valid document chunks to add to ChromaDB")
            return False
            
    except Exception as exc:
        logger.error(f"Failed to initialize ChromaDB: {exc}")
        _chroma_client = None
        _guideline_collection = None
        return False


async def retrieve_guideline(query_symptoms: str) -> str:
    """
    Retrieve relevant clinical guidelines based on query symptoms.
    
    This function performs semantic similarity search against the ChromaDB
    collection and returns the most relevant protocol text.
    
    Args:
        query_symptoms: Clinical symptoms or query for guideline retrieval
        
    Returns:
        str: Most relevant guideline text or fallback message
    """
    global _guideline_collection
    
    if _guideline_collection is None:
        logger.error("ChromaDB not initialized - cannot retrieve guidelines")
        return "Clinical guidelines unavailable - system initialization failed"
    
    try:
        # Clean and prepare query
        if not query_symptoms or query_symptoms.strip() == "":
            query_symptoms = "sepsis assessment protocol"
        
        # Perform similarity search
        results = _guideline_collection.query(
            query_texts=[query_symptoms],
            n_results=2,  # Get top 2 most relevant chunks
            include=["documents", "metadatas", "distances"]
        )
        
        # Extract and format results
        if results["documents"] and results["documents"][0]:
            retrieved_docs = results["documents"][0]
            distances = results["distances"][0]
            metadatas = results["metadatas"][0]
            
            # Combine multiple relevant chunks if they're similar enough
            relevant_chunks = []
            
            for i, (doc, distance, metadata) in enumerate(zip(retrieved_docs, distances, metadatas)):
                # Include chunks with reasonable similarity (lower distance = higher similarity)
                if distance < 1.0:  # Reasonable similarity threshold
                    relevant_chunks.append(doc)
                    logger.debug(f"Retrieved chunk {i} (distance: {distance:.3f}): {doc[:100]}...")
            
            if relevant_chunks:
                # Combine the most relevant chunks
                combined_guidelines = "\n\n".join(relevant_chunks)
                logger.info(f"Retrieved {len(relevant_chunks)} relevant guideline chunks for query: '{query_symptoms[:50]}...'")
                return combined_guidelines
            else:
                logger.warning(f"No sufficiently relevant guidelines found for query: '{query_symptoms}'")
                return "No specific guidelines found for current symptoms - use standard sepsis protocol"
        else:
            logger.warning(f"No guideline results returned for query: '{query_symptoms}'")
            return "No guidelines available - use standard clinical assessment"
            
    except Exception as exc:
        logger.error(f"Error retrieving guidelines: {exc}")
        return "Guideline retrieval failed - consult clinical protocols manually"


def get_db_status() -> dict:
    """
    Get the current status of the ChromaDB initialization.
    
    Returns:
        dict: Status information about the vector database
    """
    global _guideline_collection
    
    try:
        if _guideline_collection is None:
            return {
                "initialized": False,
                "error": "ChromaDB not initialized"
            }
        
        count = _guideline_collection.count()
        return {
            "initialized": True,
            "collection": "sepsis_guidelines",
            "document_count": count,
            "status": "healthy" if count > 0 else "empty"
        }
    except Exception as exc:
        return {
            "initialized": False,
            "error": str(exc)
        }


async def test_retrieval() -> bool:
    """
    Test the guideline retrieval system with sample queries.
    
    Returns:
        bool: True if retrieval system works correctly
    """
    test_queries = [
        "elevated lactate",
        "blood pressure low",
        "infection protocol",
        "antibiotic therapy"
    ]
    
    for query in test_queries:
        try:
            result = await retrieve_guideline(query)
            if "unavailable" in result.lower() or "failed" in result.lower():
                logger.error(f"Retrieval test failed for query: '{query}'")
                return False
            logger.debug(f"Retrieval test passed for query: '{query}' -> {len(result)} chars")
        except Exception as exc:
            logger.error(f"Retrieval test exception for query '{query}': {exc}")
            return False
    
    logger.info("All retrieval tests passed")
    return True
