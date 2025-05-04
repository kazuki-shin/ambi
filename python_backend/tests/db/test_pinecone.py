"""Tests for Pinecone connection module."""

import pytest
from unittest.mock import MagicMock, patch

from ambi.db.pinecone import PineconeConnection, pinecone_connection


@pytest.fixture
def mock_pinecone():
    """Create a mock for the Pinecone client."""
    with patch("pinecone.Pinecone") as mock_client:
        yield mock_client


def test_connect_success(mock_pinecone):
    """Test successful Pinecone connection."""
    mock_index = MagicMock()
    mock_client_instance = MagicMock()
    mock_client_instance.Index.return_value = mock_index
    mock_pinecone.return_value = mock_client_instance
    
    PineconeConnection.client = None
    PineconeConnection.index = None
    
    with patch.multiple("ambi.db.pinecone", 
                       PINECONE_API_KEY="test_api_key", 
                       PINECONE_INDEX_NAME="test_index"):
        PineconeConnection.connect()
    
    mock_pinecone.assert_called_once_with(api_key="test_api_key")
    mock_client_instance.Index.assert_called_once_with("test_index")
    assert PineconeConnection.client is not None
    assert PineconeConnection.index is not None


def test_connect_missing_api_key():
    """Test Pinecone connection with missing API key."""
    PineconeConnection.client = None
    PineconeConnection.index = None
    
    with patch.multiple("ambi.db.pinecone", 
                       PINECONE_API_KEY="", 
                       PINECONE_INDEX_NAME="test_index"):
        PineconeConnection.connect()
    
    assert PineconeConnection.client is None
    assert PineconeConnection.index is None


def test_connect_missing_index_name():
    """Test Pinecone connection with missing index name."""
    PineconeConnection.client = None
    PineconeConnection.index = None
    
    with patch.multiple("ambi.db.pinecone", 
                       PINECONE_API_KEY="test_api_key", 
                       PINECONE_INDEX_NAME=""):
        PineconeConnection.connect()
    
    assert PineconeConnection.client is None
    assert PineconeConnection.index is None


def test_connect_exception(mock_pinecone):
    """Test Pinecone connection with exception."""
    mock_pinecone.side_effect = Exception("Connection error")
    PineconeConnection.client = None
    PineconeConnection.index = None
    
    with patch.multiple("ambi.db.pinecone", 
                       PINECONE_API_KEY="test_api_key", 
                       PINECONE_INDEX_NAME="test_index"):
        PineconeConnection.connect()
    
    assert PineconeConnection.client is None
    assert PineconeConnection.index is None


def test_disconnect():
    """Test Pinecone disconnection."""
    mock_client = MagicMock()
    mock_index = MagicMock()
    PineconeConnection.client = mock_client
    PineconeConnection.index = mock_index
    
    PineconeConnection.disconnect()
    
    assert PineconeConnection.client is None
    assert PineconeConnection.index is None


def test_get_index():
    """Test getting the Pinecone index instance."""
    mock_index = MagicMock()
    PineconeConnection.index = mock_index
    
    result = PineconeConnection.get_index()
    
    assert result == mock_index
