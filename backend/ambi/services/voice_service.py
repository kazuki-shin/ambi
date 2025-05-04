"""Voice service for Ambi Python backend."""

import logging
from typing import Dict, Optional, Union

from ambi.clients.deepgram_client import deepgram_client
from ambi.clients.elevenlabs_client import elevenlabs_client

logger = logging.getLogger(__name__)


class VoiceService:
    """Service for handling speech-to-text and text-to-speech operations."""

    async def speech_to_text(
        self,
        audio_data: Union[bytes, str],
        language: str = "en",
    ) -> Dict[str, Union[str, bool]]:
        """
        Convert speech to text using Deepgram.
        
        Args:
            audio_data: Audio data as bytes or file path
            language: Language code (default: 'en')
            
        Returns:
            Dictionary with transcript and success status
        """
        try:
            result = await deepgram_client.transcribe_audio(
                audio_data=audio_data,
                language=language,
                smart_format=True,
            )
            
            if not result:
                logger.error("Failed to transcribe audio")
                return {"success": False, "transcript": ""}
            
            transcript = deepgram_client.extract_transcript(result)
            
            if not transcript:
                logger.warning("Empty transcript from speech recognition")
                return {"success": False, "transcript": ""}
            
            return {"success": True, "transcript": transcript}
            
        except Exception as e:
            logger.error(f"Error in speech-to-text conversion: {str(e)}")
            return {"success": False, "transcript": "", "error": str(e)}

    def text_to_speech(
        self,
        text: str,
        voice_id: Optional[str] = None,
    ) -> Dict[str, Union[bytes, bool]]:
        """
        Convert text to speech using ElevenLabs.
        
        Args:
            text: Text to convert to speech
            voice_id: Optional voice ID to use
            
        Returns:
            Dictionary with audio data and success status
        """
        try:
            audio_data = elevenlabs_client.text_to_speech(
                text=text,
                voice_id=voice_id,
            )
            
            if not audio_data:
                logger.error("Failed to generate speech")
                return {"success": False, "audio": b""}
            
            return {"success": True, "audio": audio_data}
            
        except Exception as e:
            logger.error(f"Error in text-to-speech conversion: {str(e)}")
            return {"success": False, "audio": b"", "error": str(e)}


voice_service = VoiceService()
