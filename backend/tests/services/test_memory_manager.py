"""Tests for memory manager service."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from ambi.services.memory_manager import MemoryManager, memory_manager


@pytest.fixture
def mock_redis_memory():
    """Create a mock for the Redis memory service."""
    with patch("ambi.services.memory_manager.redis_memory_service") as mock:
        mock.add_message = AsyncMock(return_value=True)
        mock.get_messages = AsyncMock(return_value=[])
        mock.clear_session = AsyncMock(return_value=True)
        yield mock


@pytest.fixture
def mock_pinecone_memory():
    """Create a mock for the Pinecone memory service."""
    with patch("ambi.services.memory_manager.pinecone_memory_service") as mock:
        mock.add_memory = AsyncMock(return_value=True)
        mock.search_memories = AsyncMock(return_value=[])
        mock.clear_session = AsyncMock(return_value=True)
        yield mock


@pytest.mark.asyncio
async def test_add_memory_success(mock_redis_memory, mock_pinecone_memory):
    """Test adding memory successfully."""
    result = await memory_manager.add_memory(
        session_id="test_session",
        role="user",
        content="Hello, world!",
    )

    assert result is True
    mock_redis_memory.add_message.assert_called_once_with(
        session_id="test_session",
        role="user",
        content="Hello, world!",
    )
    mock_pinecone_memory.add_memory.assert_called_once_with(
        session_id="test_session",
        text="Hello, world!",
        metadata={},
    )


@pytest.mark.asyncio
async def test_add_memory_assistant_role(mock_redis_memory, mock_pinecone_memory):
    """Test adding memory with assistant role (should not add to long-term memory)."""
    result = await memory_manager.add_memory(
        session_id="test_session",
        role="assistant",
        content="I'm an AI assistant.",
    )

    assert result is True
    mock_redis_memory.add_message.assert_called_once_with(
        session_id="test_session",
        role="assistant",
        content="I'm an AI assistant.",
    )
    mock_pinecone_memory.add_memory.assert_not_called()


@pytest.mark.asyncio
async def test_add_memory_with_metadata(mock_redis_memory, mock_pinecone_memory):
    """Test adding memory with metadata."""
    metadata = {"timestamp": 123456789, "location": "home"}
    result = await memory_manager.add_memory(
        session_id="test_session",
        role="user",
        content="Hello from home!",
        metadata=metadata,
    )

    assert result is True
    mock_redis_memory.add_message.assert_called_once_with(
        session_id="test_session",
        role="user",
        content="Hello from home!",
    )
    mock_pinecone_memory.add_memory.assert_called_once_with(
        session_id="test_session",
        text="Hello from home!",
        metadata=metadata,
    )


@pytest.mark.asyncio
async def test_add_memory_redis_failure(mock_redis_memory, mock_pinecone_memory):
    """Test adding memory with Redis failure."""
    mock_redis_memory.add_message.return_value = False

    result = await memory_manager.add_memory(
        session_id="test_session",
        role="user",
        content="Hello, world!",
    )

    assert result is False


@pytest.mark.asyncio
async def test_add_memory_pinecone_failure(mock_redis_memory, mock_pinecone_memory):
    """Test adding memory with Pinecone failure."""
    mock_pinecone_memory.add_memory.return_value = False

    result = await memory_manager.add_memory(
        session_id="test_session",
        role="user",
        content="Hello, world!",
    )

    assert result is False


@pytest.mark.asyncio
async def test_get_conversation_history(mock_redis_memory):
    """Test getting conversation history."""
    mock_messages = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there"},
    ]
    mock_redis_memory.get_messages.return_value = mock_messages

    result = await memory_manager.get_conversation_history(
        session_id="test_session",
        limit=10,
    )

    assert result == mock_messages
    mock_redis_memory.get_messages.assert_called_once_with(
        session_id="test_session",
        limit=10,
    )


@pytest.mark.asyncio
async def test_search_long_term_memory(mock_pinecone_memory):
    """Test searching long-term memory."""
    mock_memories = [
        {"text": "Previous conversation", "score": 0.9},
    ]
    mock_pinecone_memory.search_memories.return_value = mock_memories

    result = await memory_manager.search_long_term_memory(
        session_id="test_session",
        query="conversation",
        limit=5,
    )

    assert result == mock_memories
    mock_pinecone_memory.search_memories.assert_called_once_with(
        session_id="test_session",
        query="conversation",
        limit=5,
    )


@pytest.mark.asyncio
async def test_build_context(mock_redis_memory, mock_pinecone_memory):
    """Test building context with history and relevant memories."""
    mock_history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there"},
    ]
    mock_memories = [
        {"text": "Previous conversation", "score": 0.9},
    ]
    mock_redis_memory.get_messages.return_value = mock_history
    mock_pinecone_memory.search_memories.return_value = mock_memories

    result = await memory_manager.build_context(
        session_id="test_session",
        current_input="Tell me about our previous conversation",
    )

    assert result == {
        "history": mock_history,
        "relevant_memories": mock_memories,
    }


@pytest.mark.asyncio
async def test_clear_session(mock_redis_memory, mock_pinecone_memory):
    """Test clearing session memory."""
    result = await memory_manager.clear_session(
        session_id="test_session",
    )

    assert result is True
    mock_redis_memory.clear_session.assert_called_once_with(
        session_id="test_session",
    )
    mock_pinecone_memory.clear_session.assert_called_once_with(
        session_id="test_session",
    )


@pytest.mark.asyncio
async def test_clear_session_failure(mock_redis_memory, mock_pinecone_memory):
    """Test clearing session with failure."""
    mock_redis_memory.clear_session.return_value = False

    result = await memory_manager.clear_session(
        session_id="test_session",
    )

    assert result is False
