"""Redis-based memory service for Ambi Python backend."""

import json
import logging
from typing import Dict, List, Optional

from ambi.db.redis import redis_connection

logger = logging.getLogger(__name__)


class RedisMemoryService:
    """
    Redis-based memory service for short-term conversation history.
    
    This service implements a sliding window memory system using Redis
    to store recent conversation messages.
    """

    def __init__(self) -> None:
        """Initialize the Redis memory service."""
        self.redis = redis_connection.get_client()
        self.max_window_size = 50  # Maximum number of messages to keep per session

    async def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
    ) -> bool:
        """
        Add a message to the conversation history.
        
        Args:
            session_id: Unique identifier for the conversation session
            role: Role of the message sender (user/assistant)
            content: Content of the message
            
        Returns:
            Success status of the operation
        """
        if not self.redis:
            logger.error("Redis client is not initialized")
            return False

        if not session_id:
            logger.error("Session ID is required")
            return False

        try:
            message = {
                "role": role,
                "content": content,
                "timestamp": int(__import__("time").time()),
            }
            
            message_json = json.dumps(message)
            
            redis_key = f"ambi:memory:{session_id}"
            
            await self.redis.rpush(redis_key, message_json)
            
            await self.redis.ltrim(redis_key, -self.max_window_size, -1)
            
            await self.redis.expire(redis_key, 86400)
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding message to Redis: {str(e)}")
            return False

    async def get_messages(
        self,
        session_id: str,
        limit: int = 10,
    ) -> List[Dict[str, str]]:
        """
        Get recent messages from the conversation history.
        
        Args:
            session_id: Unique identifier for the conversation session
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of message objects with role and content
        """
        if not self.redis:
            logger.error("Redis client is not initialized")
            return []

        if not session_id:
            logger.error("Session ID is required")
            return []

        try:
            redis_key = f"ambi:memory:{session_id}"
            
            list_length = await self.redis.llen(redis_key)
            
            if list_length == 0:
                return []
            
            start_idx = max(0, list_length - limit)
            
            messages_json = await self.redis.lrange(redis_key, start_idx, -1)
            
            messages = []
            for msg_json in messages_json:
                try:
                    msg = json.loads(msg_json)
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", ""),
                    })
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse message JSON: {msg_json}")
            
            return messages
            
        except Exception as e:
            logger.error(f"Error getting messages from Redis: {str(e)}")
            return []

    async def clear_session(self, session_id: str) -> bool:
        """
        Clear all messages for a specific session.
        
        Args:
            session_id: Unique identifier for the conversation session
            
        Returns:
            Success status of the operation
        """
        if not self.redis:
            logger.error("Redis client is not initialized")
            return False

        if not session_id:
            logger.error("Session ID is required")
            return False

        try:
            redis_key = f"ambi:memory:{session_id}"
            
            await self.redis.delete(redis_key)
            
            return True
            
        except Exception as e:
            logger.error(f"Error clearing session from Redis: {str(e)}")
            return False


redis_memory_service = RedisMemoryService()
