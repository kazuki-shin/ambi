"""MongoDB connection module for Ambi Python backend."""

import logging
from typing import Optional

import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from ambi.config.settings import MONGODB_DB_NAME, MONGODB_URI

logger = logging.getLogger(__name__)


class MongoDBConnection:
    """MongoDB connection manager using Motor for async operations."""

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    async def connect(cls) -> None:
        """Connect to MongoDB using the configured URI."""
        if not MONGODB_URI:
            logger.error("MONGODB_URI is not defined in environment variables")
            return

        try:
            logger.info("Connecting to MongoDB...")
            cls.client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
            cls.db = cls.client[MONGODB_DB_NAME]
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"MongoDB connection error: {str(e)}")
            cls.client = None
            cls.db = None

    @classmethod
    async def disconnect(cls) -> None:
        """Close the MongoDB connection."""
        if cls.client:
            logger.info("Disconnecting from MongoDB...")
            cls.client.close()
            cls.client = None
            cls.db = None
            logger.info("Disconnected from MongoDB")

    @classmethod
    def get_db(cls) -> Optional[AsyncIOMotorDatabase]:
        """Get the database instance."""
        return cls.db


mongodb = MongoDBConnection()
