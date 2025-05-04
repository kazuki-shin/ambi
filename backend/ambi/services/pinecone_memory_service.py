"""Pinecone-based memory service for Ambi Python backend."""

import logging
import uuid
from typing import Dict, List, Optional

from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone as LangchainPinecone

from ambi.config.settings import PINECONE_INDEX_NAME
from ambi.db.pinecone import pinecone_connection

logger = logging.getLogger(__name__)


class PineconeMemoryService:
    """
    Pinecone-based memory service for long-term semantic memory.
    
    This service uses Pinecone vector database to store and retrieve
    memories based on semantic similarity.
    """

    def __init__(self) -> None:
        """Initialize the Pinecone memory service."""
        self.pinecone = pinecone_connection.get_index()
        self.embeddings = OpenAIEmbeddings()

    async def add_memory(
        self,
        session_id: str,
        text: str,
        metadata: Optional[Dict] = None,
    ) -> bool:
        """
        Add a memory entry to the long-term memory.
        
        Args:
            session_id: Unique identifier for the conversation session
            text: Text content to store
            metadata: Optional metadata for the memory entry
            
        Returns:
            Success status of the operation
        """
        if not self.pinecone:
            logger.error("Pinecone index is not initialized")
            return False

        if not session_id or not text:
            logger.error("Session ID and text are required")
            return False

        try:
            if metadata is None:
                metadata = {}
            
            metadata["session_id"] = session_id
            
            memory_id = f"{session_id}:{uuid.uuid4()}"
            
            embedding = await self._get_embedding(text)
            if not embedding:
                logger.error("Failed to generate embedding for text")
                return False
            
            self.pinecone.upsert(
                vectors=[
                    {
                        "id": memory_id,
                        "values": embedding,
                        "metadata": {
                            "text": text,
                            **metadata,
                        },
                    }
                ]
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding memory to Pinecone: {str(e)}")
            return False

    async def search_memories(
        self,
        session_id: str,
        query: str,
        limit: int = 5,
    ) -> List[Dict]:
        """
        Search for relevant memories based on semantic similarity.
        
        Args:
            session_id: Unique identifier for the conversation session
            query: Search query text
            limit: Maximum number of results to retrieve
            
        Returns:
            List of relevant memory entries
        """
        if not self.pinecone:
            logger.error("Pinecone index is not initialized")
            return []

        if not session_id or not query:
            logger.error("Session ID and query are required")
            return []

        try:
            embedding = await self._get_embedding(query)
            if not embedding:
                logger.error("Failed to generate embedding for query")
                return []
            
            search_response = self.pinecone.query(
                vector=embedding,
                filter={"session_id": session_id},
                top_k=limit,
                include_metadata=True,
            )
            
            results = []
            for match in search_response.get("matches", []):
                metadata = match.get("metadata", {})
                results.append({
                    "text": metadata.get("text", ""),
                    "score": match.get("score", 0.0),
                    "metadata": {k: v for k, v in metadata.items() if k != "text"},
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching memories in Pinecone: {str(e)}")
            return []

    async def clear_session(self, session_id: str) -> bool:
        """
        Clear all memories for a specific session.
        
        Args:
            session_id: Unique identifier for the conversation session
            
        Returns:
            Success status of the operation
        """
        if not self.pinecone:
            logger.error("Pinecone index is not initialized")
            return False

        if not session_id:
            logger.error("Session ID is required")
            return False

        try:
            self.pinecone.delete(
                filter={"session_id": session_id},
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error clearing session from Pinecone: {str(e)}")
            return False

    async def _get_embedding(self, text: str) -> Optional[List[float]]:
        """
        Generate embedding for text using the configured embedding model.
        
        Args:
            text: Text to generate embedding for
            
        Returns:
            Embedding vector as a list of floats
        """
        try:
            embedding = self.embeddings.embed_query(text)
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            return None


pinecone_memory_service = PineconeMemoryService()
