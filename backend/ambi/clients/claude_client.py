"""Claude API client for Ambi Python backend."""

import logging
from typing import Dict, List, Optional, Union

import anthropic
from anthropic.types import Message

from ambi.config.settings import ANTHROPIC_API_KEY, CLAUDE_MODEL

logger = logging.getLogger(__name__)


class ClaudeClient:
    """Client for interacting with Anthropic's Claude API."""

    def __init__(self) -> None:
        """Initialize the Claude client."""
        if not ANTHROPIC_API_KEY:
            logger.error("ANTHROPIC_API_KEY is not defined in environment variables")
            self.client = None
        else:
            self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        
        self.model = CLAUDE_MODEL

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> Optional[str]:
        """
        Generate a response from Claude based on conversation history.
        
        Args:
            messages: List of message objects with role and content
            system_prompt: Optional system prompt to guide Claude's behavior
            max_tokens: Maximum number of tokens to generate
            temperature: Sampling temperature (0.0 to 1.0)
            
        Returns:
            Generated response text or None if an error occurs
        """
        if not self.client:
            logger.error("Claude client is not initialized")
            return None

        try:
            anthropic_messages = []
            
            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                
                if role not in ["user", "assistant"]:
                    role = "user"  # Default to user for unknown roles
                
                anthropic_messages.append({"role": role, "content": content})
            
            request_params = {
                "model": self.model,
                "messages": anthropic_messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            
            if system_prompt:
                request_params["system"] = system_prompt
            
            response: Message = self.client.messages.create(**request_params)
            
            if response.content:
                if isinstance(response.content, list):
                    text_content = ""
                    for block in response.content:
                        if hasattr(block, "text"):
                            text_content += block.text
                    return text_content
                else:
                    return str(response.content)
            
            return None
            
        except Exception as e:
            logger.error(f"Error generating response from Claude: {str(e)}")
            return None


claude_client = ClaudeClient()
