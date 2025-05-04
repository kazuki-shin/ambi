"""Deepgram API client for Ambi Python backend."""

import logging
from typing import Dict, Optional, Union

from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    PrerecordedOptions,
)

from ambi.config.settings import DEEPGRAM_API_KEY

logger = logging.getLogger(__name__)


class DeepgramSpeechClient:
    """Client for interacting with Deepgram API for speech-to-text."""

    def __init__(self) -> None:
        """Initialize the Deepgram client."""
        if not DEEPGRAM_API_KEY:
            logger.error("DEEPGRAM_API_KEY is not defined in environment variables")
            self.client = None
        else:
            options = DeepgramClientOptions(api_key=DEEPGRAM_API_KEY)
            self.client = DeepgramClient(options)

    async def transcribe_audio(
        self,
        audio_data: Union[bytes, str],
        language: str = "en",
        model: str = "nova-2",
        smart_format: bool = True,
        diarize: bool = False,
    ) -> Optional[Dict]:
        """
        Transcribe audio data to text using Deepgram API.

        Args:
            audio_data: Audio data as bytes or file path as string
            language: Language code (default: 'en')
            model: Deepgram model to use (default: 'nova-2')
            smart_format: Whether to apply smart formatting (default: True)
            diarize: Whether to diarize the audio (default: False)

        Returns:
            Transcription result as dictionary or None if an error occurs
        """
        if not self.client:
            logger.error("Deepgram client is not initialized")
            return None

        try:
            options = PrerecordedOptions(
                model=model,
                language=language,
                smart_format=smart_format,
                diarize=diarize,
            )

            if isinstance(audio_data, bytes):
                response = await self.client.listen.prerecorded.transcribe_buffer(
                    buffer=audio_data,
                    options=options,
                )
            elif isinstance(audio_data, str):
                with open(audio_data, "rb") as audio_file:
                    response = await self.client.listen.prerecorded.transcribe_file(
                        file=audio_file,
                        options=options,
                    )
            else:
                logger.error("Invalid audio data type")
                return None

            return response.results

        except Exception as e:
            logger.error(f"Error transcribing audio with Deepgram: {str(e)}")
            return None

    def extract_transcript(self, result: Dict) -> str:
        """
        Extract transcript text from Deepgram response.

        Args:
            result: Deepgram transcription result

        Returns:
            Extracted transcript text
        """
        try:
            if not result or "channels" not in result:
                return ""

            channel = result["channels"][0]
            if "alternatives" not in channel or not channel["alternatives"]:
                return ""

            alternative = channel["alternatives"][0]
            if "transcript" not in alternative:
                return ""

            return alternative["transcript"]

        except Exception as e:
            logger.error(f"Error extracting transcript from Deepgram result: {str(e)}")
            return ""


deepgram_client = DeepgramSpeechClient()
