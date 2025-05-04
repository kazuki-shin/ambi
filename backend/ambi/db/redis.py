"""Redis connection module for Ambi Python backend."""

import logging
from typing import Optional, Union

import redis.asyncio as redis
from redis.asyncio.client import Redis

from ambi.config.settings import (
    REDIS_HOST,
    REDIS_PASS,
    REDIS_PORT,
    REDIS_URL,
    REDIS_USER,
)

logger = logging.getLogger(__name__)


class RedisConnection:
    """Redis connection manager for async operations."""

    client: Optional[Redis] = None

    @classmethod
    async def connect(cls) -> None:
        """Connect to Redis using the configured settings."""
        try:
            logger.info("Connecting to Redis...")
            
            if REDIS_URL:
                cls.client = redis.from_url(REDIS_URL)
            else:
                cls.client = redis.Redis(
                    host=REDIS_HOST,
                    port=REDIS_PORT,
                    username=REDIS_USER,
                    password=REDIS_PASS,
                    decode_responses=True,
                )
            
            await cls.client.ping()
            logger.info("Connected to Redis")
        except Exception as e:
            logger.error(f"Redis connection error: {str(e)}")
            cls.client = None

    @classmethod
    async def disconnect(cls) -> None:
        """Close the Redis connection."""
        if cls.client:
            logger.info("Disconnecting from Redis...")
            await cls.client.close()
            cls.client = None
            logger.info("Disconnected from Redis")

    @classmethod
    def get_client(cls) -> Optional[Redis]:
        """Get the Redis client instance."""
        return cls.client


redis_connection = RedisConnection()
