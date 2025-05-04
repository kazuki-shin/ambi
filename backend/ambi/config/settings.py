"""Configuration settings for the Ambi Python backend."""

import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

MONGODB_URI: str = os.getenv("MONGODB_URI", "")
MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "ambi")

REDIS_URL: str = os.getenv("REDIS_URL", "")
REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
REDIS_USER: Optional[str] = os.getenv("REDIS_USER")
REDIS_PASS: Optional[str] = os.getenv("REDIS_PASS")

PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "")

ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-3-opus-20240229")

ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "")

DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")

API_PREFIX: str = "/api"
DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
