import { createClient, DeepgramClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.DEEPGRAM_API_KEY;

let deepgramClient: DeepgramClient | null = null;

if (apiKey) {
  deepgramClient = createClient(apiKey);
  console.log('[Deepgram] Client initialized.');
} else {
  console.warn(
    'DEEPGRAM_API_KEY not found in environment variables. Deepgram functions will be disabled.'
  );
}

/**
 * Transcribes audio data using Deepgram.
 * @param audioBuffer - The audio data as a Buffer.
 * @returns A Promise resolving to the transcription text or null if failed.
 */
export const transcribeSpeech = async (
  audioBuffer: Buffer
): Promise<string | null> => {
  if (!deepgramClient) {
    console.warn('Deepgram client not initialized (API key missing?). Cannot transcribe.');
    return null;
  }

  console.log('[Deepgram] Received request to transcribe audio source.');

  try {
    const { result, error } = await deepgramClient.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        smart_format: true,
        language: 'en-US',
      }
    );
    
    if (error) throw error;
    if (!result) throw new Error('No transcription result received.');
    
    const transcript = result.results.channels[0].alternatives[0].transcript;
    console.log(`[Deepgram] Transcription: ${transcript}`);
    return transcript;

  } catch (error) {
    console.error('[Deepgram] Error transcribing speech:', error);
    return null;
  }
};

/**
 * Transcribes audio from a URL using Deepgram.
 * @param audioUrl - The URL of the audio file to transcribe.
 * @returns A Promise resolving to the transcription text or null if failed.
 */
export const transcribeSpeechFromUrl = async (
  audioUrl: string
): Promise<string | null> => {
  if (!deepgramClient) {
    console.warn('Deepgram client not initialized (API key missing?). Cannot transcribe.');
    return null;
  }

  console.log(`[Deepgram] Received request to transcribe audio from URL: ${audioUrl}`);

  try {
    const { result, error } = await deepgramClient.listen.prerecorded.transcribeUrl(
      {
        url: audioUrl,
      },
      {
        model: 'nova-2',
        smart_format: true,
        language: 'en-US',
      }
    );
    
    if (error) throw error;
    if (!result) throw new Error('No transcription result received.');
    
    const transcript = result.results.channels[0].alternatives[0].transcript;
    console.log(`[Deepgram] Transcription from URL: ${transcript}`);
    return transcript;

  } catch (error) {
    console.error('[Deepgram] Error transcribing speech from URL:', error);
    return null;
  }
};

/**
 * Sets up a live transcription connection for real-time speech recognition.
 * @param options - Configuration options for the live transcription.
 * @param onTranscript - Callback function to handle transcript data.
 * @returns The live transcription connection object or null if initialization failed.
 */
export const setupLiveTranscription = (
  options: {
    language?: string;
    model?: string;
    encoding?: string;
    sampleRate?: number;
  } = {},
  onTranscript: (transcript: string) => void
) => {
  if (!deepgramClient) {
    console.warn('Deepgram client not initialized (API key missing?). Cannot setup live transcription.');
    return null;
  }

  const connection = deepgramClient.listen.live({
    model: options.model || 'nova-2',
    language: options.language || 'en-US',
    encoding: options.encoding || 'linear16',
    sampleRate: options.sampleRate || 16000,
    punctuate: true,
    smart_format: true,
  });

  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log('[Deepgram Live] Connection opened.');
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel.alternatives[0].transcript;
    if (transcript.trim()) {
      console.log('[Deepgram Live] Transcript received:', transcript);
      onTranscript(transcript);
    }
  });

  connection.on(LiveTranscriptionEvents.Close, () => {
    console.log('[Deepgram Live] Connection closed.');
  });

  connection.on(LiveTranscriptionEvents.Error, (error) => {
    console.error('[Deepgram Live] Error:', error);
  });

  return connection;
};       