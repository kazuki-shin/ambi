"""Pinecone connection module for Ambi Python backend."""

import logging
from typing import Any, Optional

from pinecone import Pinecone

from ambi.config.settings import PINECONE_API_KEY, PINECONE_INDEX_NAME

logger = logging.getLogger(__name__)


class PineconeConnection:
    """Pinecone connection manager for vector database operations."""

    client: Optional[Any] = None
    index: Optional[Any] = None

    @classmethod
    def connect(cls) -> None:
        """Connect to Pinecone using the configured API key."""
        if not PINECONE_API_KEY:
            logger.error("PINECONE_API_KEY is not defined in environment variables")
            return

        if not PINECONE_INDEX_NAME:
            logger.error("PINECONE_INDEX_NAME is not defined in environment variables")
            return

        try:
            logger.info("Connecting to Pinecone...")
            cls.client = Pinecone(api_key=PINECONE_API_KEY)
            cls.index = cls.client.Index(PINECONE_INDEX_NAME)
            logger.info(f"Connected to Pinecone index: {PINECONE_INDEX_NAME}")
        except Exception as e:
            logger.error(f"Pinecone connection error: {str(e)}")
            cls.client = None
            cls.index = None

    @classmethod
    def disconnect(cls) -> None:
        """Clean up Pinecone resources."""
        logger.info("Disconnecting from Pinecone...")
        cls.client = None
        cls.index = None
        logger.info("Disconnected from Pinecone")

    @classmethod
    def get_index(cls) -> Optional[Any]:
        """Get the Pinecone index instance."""
        return cls.index


pinecone_connection = PineconeConnection()
