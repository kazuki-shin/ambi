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
 * NOTE: This is a basic stub for Phase 1. It doesn't handle actual audio input yet.
 * This example assumes pre-recorded audio; live transcription would be different.
 * @param audioSource - The audio data (e.g., a Buffer or URL). For stub, this is ignored.
 * @returns A Promise resolving to the transcription text or null if failed.
 */
export const transcribeSpeech = async (
  audioSource: any // Use 'any' for stub, define specific type later (e.g., Buffer)
): Promise<string | null> => {
  if (!deepgramClient) {
    console.warn('Deepgram client not initialized (API key missing?). Cannot transcribe.');
    return null;
  }

  console.log('[Deepgram Stub] Received request to transcribe audio source.');

  try {
    // --- TODO: Implement actual API call in later phase ---
    // Example for pre-recorded audio (e.g., from a Buffer):
    // const { result, error } = await deepgramClient.listen.prerecorded.transcribeFile(
    //   audioSource, // Assuming audioSource is a Buffer
    //   {
    //     model: 'nova-2',
    //     smart_format: true,
    //     // Add language, diarize, etc. as needed based on PRD
    //     // language: 'en-US', // Example
    //     // diarize: true, // Example for speaker separation
    //   }
    // );
    // if (error) throw error;
    // if (!result) throw new Error('No transcription result received.');
    // const transcript = result.results.channels[0].alternatives[0].transcript;
    // console.log(`[Deepgram] Transcription: ${transcript}`);
    // return transcript;
    // --- End Example ---

    // For Phase 1 stub, return a placeholder string
    const placeholderTranscript = 'This is a placeholder transcription from the Deepgram stub.';
    console.log(`[Deepgram Stub] Returning placeholder: "${placeholderTranscript}"`);
    return placeholderTranscript;

  } catch (error) {
    console.error('[Deepgram] Error transcribing speech:', error);
    return null;
  }
};

// --- TODO: Implement Live Transcription Handling if needed based on PRD ---
// This would involve setting up a WebSocket connection and handling events.
// Example structure:
// export const setupLiveTranscription = (/* connection parameters */) => {
//   if (!deepgramClient) return null;
//   const connection = deepgramClient.listen.live({
//      model: 'nova-2',
//      language: 'en-US',
//      // other options
//   });
//   connection.on(LiveTranscriptionEvents.Open, () => console.log('[Deepgram Live] Connection opened.'));
//   connection.on(LiveTranscriptionEvents.Transcript, (data) => {
//     console.log('[Deepgram Live] Transcript received:', data.channel.alternatives[0].transcript);
//     // Handle transcript data (e.g., send to frontend or conversation logic)
//   });
//   connection.on(LiveTranscriptionEvents.Close, () => console.log('[Deepgram Live] Connection closed.'));
//   connection.on(LiveTranscriptionEvents.Error, (error) => console.error('[Deepgram Live] Error:', error));
//   return connection; // Return the connection object to send audio data to
// }; 