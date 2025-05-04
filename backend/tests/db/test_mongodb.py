"""Tests for MongoDB connection module."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from ambi.db.mongodb import MongoDBConnection, mongodb


@pytest.fixture
def mock_motor_client():
    """Create a mock for the AsyncIOMotorClient."""
    with patch("motor.motor_asyncio.AsyncIOMotorClient") as mock_client:
        yield mock_client


@pytest.mark.asyncio
async def test_connect_success(mock_motor_client):
    """Test successful MongoDB connection."""
    mock_db = MagicMock()
    mock_motor_client.return_value = MagicMock()
    mock_motor_client.return_value.__getitem__.return_value = mock_db

    MongoDBConnection.client = None
    MongoDBConnection.db = None

    with patch("ambi.db.mongodb.MONGODB_URI", "mongodb://localhost:27017/test"):
        await MongoDBConnection.connect()

    mock_motor_client.assert_called_once_with("mongodb://localhost:27017/test")
    assert MongoDBConnection.client is not None
    assert MongoDBConnection.db is not None


@pytest.mark.asyncio
async def test_connect_missing_uri():
    """Test MongoDB connection with missing URI."""
    MongoDBConnection.client = None
    MongoDBConnection.db = None

    with patch("ambi.db.mongodb.MONGODB_URI", ""):
        await MongoDBConnection.connect()

    assert MongoDBConnection.client is None
    assert MongoDBConnection.db is None


@pytest.mark.asyncio
async def test_connect_exception(mock_motor_client):
    """Test MongoDB connection with exception."""
    mock_motor_client.side_effect = Exception("Connection error")
    MongoDBConnection.client = None
    MongoDBConnection.db = None

    with patch("ambi.db.mongodb.MONGODB_URI", "mongodb://localhost:27017/test"):
        await MongoDBConnection.connect()

    assert MongoDBConnection.client is None
    assert MongoDBConnection.db is None


@pytest.mark.asyncio
async def test_disconnect():
    """Test MongoDB disconnection."""
    mock_client = MagicMock()
    mock_client.close = AsyncMock()
    MongoDBConnection.client = mock_client
    MongoDBConnection.db = MagicMock()

    await MongoDBConnection.disconnect()

    mock_client.close.assert_called_once()
    assert MongoDBConnection.client is None
    assert MongoDBConnection.db is None


def test_get_db():
    """Test getting the database instance."""
    mock_db = MagicMock()
    MongoDBConnection.db = mock_db

    result = MongoDBConnection.get_db()

    assert result == mock_db
