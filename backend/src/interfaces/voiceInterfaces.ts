import { Buffer } from 'buffer';
import { ListenLiveClient } from '@deepgram/sdk';

/**
 * Interface for a live transcription connection
 * This is a simplified version of the Deepgram ListenLiveClient
 */
export type LiveTranscriptionConnection = ListenLiveClient;

/**
 * Interface for speech-to-text operations
 */
export interface SpeechToTextService {
  /**
   * Transcribes audio data to text
   * @param audioBuffer - The audio data as a Buffer
   * @returns A Promise resolving to the transcription text or null if failed
   */
  transcribe(audioBuffer: Buffer): Promise<string | null>;

  /**
   * Transcribes audio from a URL
   * @param audioUrl - The URL of the audio file to transcribe
   * @returns A Promise resolving to the transcription text or null if failed
   */
  transcribeFromUrl(audioUrl: string): Promise<string | null>;

  /**
   * Sets up a live transcription connection for real-time speech recognition
   * @param options - Configuration options for the live transcription
   * @param onTranscript - Callback function to handle transcript data
   * @returns The live transcription connection object or null if initialization failed
   */
  setupLiveTranscription(
    options: {
      language?: string;
      model?: string;
      encoding?: string;
      sampleRate?: number;
    },
    onTranscript: (transcript: string) => void
  ): LiveTranscriptionConnection | null;
}

/**
 * Interface for text-to-speech operations
 */
export interface TextToSpeechService {
  /**
   * Synthesizes speech from text
   * @param text - The text to synthesize
   * @param options - Optional configuration for speech synthesis
   * @returns A Promise resolving to an audio buffer or null if synthesis fails
   */
  synthesize(
    text: string,
    options?: {
      voiceId?: string | null;
    }
  ): Promise<Buffer | null>;
}

/**
 * Combined interface for voice I/O operations
 */
export interface VoiceService {
  speechToText: SpeechToTextService;
  textToSpeech: TextToSpeechService;
}
