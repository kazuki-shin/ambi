"""Memory manager service for Ambi Python backend."""

import logging
from typing import Dict, List, Optional, Union

from ambi.services.redis_memory_service import redis_memory_service
from ambi.services.pinecone_memory_service import pinecone_memory_service

logger = logging.getLogger(__name__)


class MemoryManager:
    """
    Memory manager that orchestrates short-term and long-term memory services.
    
    This service coordinates between Redis (short-term) and Pinecone (long-term)
    memory systems to provide a comprehensive memory context for conversations.
    """

    async def add_memory(
        self,
        session_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict] = None,
    ) -> bool:
        """
        Add a memory entry to both short-term and long-term memory.
        
        Args:
            session_id: Unique identifier for the conversation session
            role: Role of the message sender (user/assistant)
            content: Content of the message
            metadata: Optional metadata for the memory entry
            
        Returns:
            Success status of the operation
        """
        try:
            short_term_success = await redis_memory_service.add_message(
                session_id=session_id,
                role=role,
                content=content,
            )
            
            long_term_success = True
            if role == "user" and content.strip():
                long_term_success = await pinecone_memory_service.add_memory(
                    session_id=session_id,
                    text=content,
                    metadata=metadata or {},
                )
            
            return short_term_success and long_term_success
            
        except Exception as e:
            logger.error(f"Error adding memory: {str(e)}")
            return False

    async def get_conversation_history(
        self,
        session_id: str,
        limit: int = 10,
    ) -> List[Dict[str, str]]:
        """
        Get recent conversation history from short-term memory.
        
        Args:
            session_id: Unique identifier for the conversation session
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of message objects with role and content
        """
        try:
            return await redis_memory_service.get_messages(
                session_id=session_id,
                limit=limit,
            )
            
        except Exception as e:
            logger.error(f"Error getting conversation history: {str(e)}")
            return []

    async def search_long_term_memory(
        self,
        session_id: str,
        query: str,
        limit: int = 5,
    ) -> List[Dict]:
        """
        Search long-term memory for relevant context.
        
        Args:
            session_id: Unique identifier for the conversation session
            query: Search query text
            limit: Maximum number of results to retrieve
            
        Returns:
            List of relevant memory entries
        """
        try:
            return await pinecone_memory_service.search_memories(
                session_id=session_id,
                query=query,
                limit=limit,
            )
            
        except Exception as e:
            logger.error(f"Error searching long-term memory: {str(e)}")
            return []

    async def build_context(
        self,
        session_id: str,
        current_input: str,
        history_limit: int = 10,
        relevant_limit: int = 3,
    ) -> Dict[str, Union[List[Dict[str, str]], List[Dict]]]:
        """
        Build a comprehensive context for the conversation.
        
        This combines recent conversation history with relevant long-term memories.
        
        Args:
            session_id: Unique identifier for the conversation session
            current_input: Current user input
            history_limit: Maximum number of recent messages to include
            relevant_limit: Maximum number of relevant memories to include
            
        Returns:
            Dictionary with conversation history and relevant memories
        """
        try:
            history = await self.get_conversation_history(
                session_id=session_id,
                limit=history_limit,
            )
            
            relevant_memories = await self.search_long_term_memory(
                session_id=session_id,
                query=current_input,
                limit=relevant_limit,
            )
            
            return {
                "history": history,
                "relevant_memories": relevant_memories,
            }
            
        except Exception as e:
            logger.error(f"Error building context: {str(e)}")
            return {
                "history": [],
                "relevant_memories": [],
            }

    async def clear_session(self, session_id: str) -> bool:
        """
        Clear all memory for a specific session.
        
        Args:
            session_id: Unique identifier for the conversation session
            
        Returns:
            Success status of the operation
        """
        try:
            short_term_success = await redis_memory_service.clear_session(
                session_id=session_id,
            )
            
            long_term_success = await pinecone_memory_service.clear_session(
                session_id=session_id,
            )
            
            return short_term_success and long_term_success
            
        except Exception as e:
            logger.error(f"Error clearing session memory: {str(e)}")
            return False


memory_manager = MemoryManager()
