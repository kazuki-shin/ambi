import { Buffer } from 'buffer';
import { 
  SpeechToTextService, 
  TextToSpeechService, 
  VoiceService,
  LiveTranscriptionConnection
} from '../interfaces/voiceInterfaces';
import {
  transcribeSpeech,
  transcribeSpeechFromUrl,
  setupLiveTranscription
} from '../clients/deepgramClient';
import { synthesizeSpeech } from '../clients/elevenLabsClient';

/**
 * Implementation of SpeechToTextService using Deepgram
 */
export class DeepgramSpeechToTextService implements SpeechToTextService {
  async transcribe(audioBuffer: Buffer): Promise<string | null> {
    return transcribeSpeech(audioBuffer);
  }

  async transcribeFromUrl(audioUrl: string): Promise<string | null> {
    return transcribeSpeechFromUrl(audioUrl);
  }

  setupLiveTranscription(
    options: {
      language?: string;
      model?: string;
      encoding?: string;
      sampleRate?: number;
    },
    onTranscript: (transcript: string) => void
  ): LiveTranscriptionConnection | null {
    return setupLiveTranscription(options, onTranscript);
  }
}

/**
 * Implementation of TextToSpeechService using ElevenLabs
 */
export class ElevenLabsTextToSpeechService implements TextToSpeechService {
  async synthesize(
    text: string,
    options?: {
      voiceId?: string | null;
    }
  ): Promise<Buffer | null> {
    return synthesizeSpeech(text, options?.voiceId || null);
  }
}

/**
 * Combined voice service that provides access to both speech-to-text and text-to-speech functionality
 */
export class AmbiVoiceService implements VoiceService {
  speechToText: SpeechToTextService;
  textToSpeech: TextToSpeechService;

  constructor(
    speechToTextService?: SpeechToTextService,
    textToSpeechService?: TextToSpeechService
  ) {
    this.speechToText = speechToTextService || new DeepgramSpeechToTextService();
    this.textToSpeech = textToSpeechService || new ElevenLabsTextToSpeechService();
  }
}

export const voiceService = new AmbiVoiceService();
