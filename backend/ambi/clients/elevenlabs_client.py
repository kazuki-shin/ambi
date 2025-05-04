"""ElevenLabs API client for Ambi Python backend."""

import logging
from typing import Optional

from elevenlabs import generate, set_api_key
from elevenlabs.api import Voice, VoiceSettings, voices

from ambi.config.settings import ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID

logger = logging.getLogger(__name__)


class ElevenLabsClient:
    """Client for interacting with ElevenLabs API for text-to-speech."""

    def __init__(self) -> None:
        """Initialize the ElevenLabs client."""
        if not ELEVENLABS_API_KEY:
            logger.error("ELEVENLABS_API_KEY is not defined in environment variables")
            self.initialized = False
        else:
            set_api_key(ELEVENLABS_API_KEY)
            self.initialized = True
            self.voice_id = ELEVENLABS_VOICE_ID

    def get_voices(self) -> list[Voice]:
        """
        Get available voices from ElevenLabs.
        
        Returns:
            List of available voices or empty list if an error occurs
        """
        if not self.initialized:
            logger.error("ElevenLabs client is not initialized")
            return []

        try:
            return voices()
        except Exception as e:
            logger.error(f"Error getting voices from ElevenLabs: {str(e)}")
            return []

    def text_to_speech(
        self,
        text: str,
        voice_id: Optional[str] = None,
        stability: float = 0.5,
        similarity_boost: float = 0.75,
    ) -> Optional[bytes]:
        """
        Convert text to speech using ElevenLabs API.
        
        Args:
            text: Text to convert to speech
            voice_id: Voice ID to use (defaults to configured voice)
            stability: Voice stability (0.0 to 1.0)
            similarity_boost: Voice similarity boost (0.0 to 1.0)
            
        Returns:
            Audio data as bytes or None if an error occurs
        """
        if not self.initialized:
            logger.error("ElevenLabs client is not initialized")
            return None

        if not text:
            logger.warning("Empty text provided for text-to-speech")
            return None

        try:
            selected_voice_id = voice_id or self.voice_id
            
            if not selected_voice_id:
                logger.warning("No voice ID provided or configured, using default voice")
                available_voices = self.get_voices()
                if available_voices:
                    selected_voice_id = available_voices[0].voice_id
                else:
                    logger.error("No voices available from ElevenLabs")
                    return None
            
            voice_settings = VoiceSettings(
                stability=stability,
                similarity_boost=similarity_boost,
            )
            
            audio_data = generate(
                text=text,
                voice=selected_voice_id,
                model="eleven_monolingual_v1",
                voice_settings=voice_settings,
            )
            
            return audio_data
            
        except Exception as e:
            logger.error(f"Error generating speech from ElevenLabs: {str(e)}")
            return None


elevenlabs_client = ElevenLabsClient()
