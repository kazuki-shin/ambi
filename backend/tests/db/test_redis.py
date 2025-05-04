"""Tests for Redis connection module."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from ambi.db.redis import RedisConnection, redis_connection


@pytest.fixture
def mock_redis_client():
    """Create a mock for the Redis client."""
    with patch("redis.asyncio.from_url") as mock_from_url:
        yield mock_from_url


@pytest.fixture
def mock_redis_direct():
    """Create a mock for the Redis direct connection."""
    with patch("redis.asyncio.Redis") as mock_redis:
        yield mock_redis


@pytest.mark.asyncio
async def test_connect_with_url(mock_redis_client):
    """Test Redis connection using URL."""
    mock_client = AsyncMock()
    mock_client.ping = AsyncMock()
    mock_redis_client.return_value = mock_client
    
    RedisConnection.client = None
    
    with patch("ambi.db.redis.REDIS_URL", "redis://localhost:6379"):
        await RedisConnection.connect()
    
    mock_redis_client.assert_called_once_with("redis://localhost:6379")
    mock_client.ping.assert_called_once()
    assert RedisConnection.client is not None


@pytest.mark.asyncio
async def test_connect_with_params(mock_redis_direct):
    """Test Redis connection using individual parameters."""
    mock_client = AsyncMock()
    mock_client.ping = AsyncMock()
    mock_redis_direct.return_value = mock_client
    
    RedisConnection.client = None
    
    with patch.multiple("ambi.db.redis", 
                       REDIS_URL="", 
                       REDIS_HOST="localhost", 
                       REDIS_PORT=6379,
                       REDIS_USER="user",
                       REDIS_PASS="pass"):
        await RedisConnection.connect()
    
    mock_redis_direct.assert_called_once_with(
        host="localhost",
        port=6379,
        username="user",
        password="pass",
        decode_responses=True,
    )
    mock_client.ping.assert_called_once()
    assert RedisConnection.client is not None


@pytest.mark.asyncio
async def test_connect_exception(mock_redis_client):
    """Test Redis connection with exception."""
    mock_client = AsyncMock()
    mock_client.ping.side_effect = Exception("Connection error")
    mock_redis_client.return_value = mock_client
    
    RedisConnection.client = None
    
    with patch("ambi.db.redis.REDIS_URL", "redis://localhost:6379"):
        await RedisConnection.connect()
    
    assert RedisConnection.client is None


@pytest.mark.asyncio
async def test_disconnect():
    """Test Redis disconnection."""
    mock_client = AsyncMock()
    mock_client.close = AsyncMock()
    RedisConnection.client = mock_client
    
    await RedisConnection.disconnect()
    
    mock_client.close.assert_called_once()
    assert RedisConnection.client is None


def test_get_client():
    """Test getting the Redis client instance."""
    mock_client = MagicMock()
    RedisConnection.client = mock_client
    
    result = RedisConnection.get_client()
    
    assert result == mock_client
