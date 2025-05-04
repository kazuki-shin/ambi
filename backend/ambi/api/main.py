"""Main FastAPI application for Ambi Python backend."""

import logging
from typing import Dict

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from ambi.config.settings import API_PREFIX, DEBUG
from ambi.db.mongodb import mongodb
from ambi.db.pinecone import pinecone_connection
from ambi.db.redis import redis_connection

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Ambi API",
    description="Python backend for Ambi - AI conversational companion",
    version="0.1.0",
    debug=DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize connections on application startup."""
    logger.info("Starting Ambi Python backend...")
    await mongodb.connect()
    await redis_connection.connect()
    pinecone_connection.connect()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Close connections on application shutdown."""
    logger.info("Shutting down Ambi Python backend...")
    await mongodb.disconnect()
    await redis_connection.disconnect()
    pinecone_connection.disconnect()


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.get(f"{API_PREFIX}/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {"message": "Welcome to Ambi API"}


@app.post(f"{API_PREFIX}/conversation")
async def conversation(request: Request) -> Dict[str, str]:
    """Handle conversation requests."""
    return {"message": "Conversation endpoint not yet implemented"}


@app.post(f"{API_PREFIX}/voice-conversation")
async def voice_conversation(request: Request) -> Dict[str, str]:
    """Handle voice conversation requests."""
    return {"message": "Voice conversation endpoint not yet implemented"}
