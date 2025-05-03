import { ElevenLabsClient } from 'elevenlabs';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
  console.warn(
    'ELEVENLABS_API_KEY not found in environment variables. ElevenLabs functions will be disabled.'
  );
}

// Initialize client only if API key is available
const elevenlabs = apiKey ? new ElevenLabsClient({ apiKey }) : null;

// Define a default voice ID (find suitable ones in ElevenLabs console)
// Example: 'pNInz6obpgDQGcFmaJgB' (Rachel), '21m00Tcm4TlvDq8ikWAM' (Grace)
// Keep null for now to indicate stub
const DEFAULT_VOICE_ID: string | null = null; // 'pNInz6obpgDQGcFmaJgB';

/**
 * Synthesizes speech from text using ElevenLabs API.
 * NOTE: In Phase 1, this is just a stub.
 * @param text - The text to synthesize.
 * @param voiceId - Optional voice ID to use.
 * @returns A Promise that resolves to an audio buffer or similar audio data (or null for stub).
 */
export const synthesizeSpeech = async (
  text: string,
  voiceId: string | null = DEFAULT_VOICE_ID
): Promise<Buffer | null> => {
  if (!elevenlabs) {
    console.warn('ElevenLabs client not initialized (API key missing?). Returning null.');
    return null;
  }

  if (!voiceId) {
    console.warn('ElevenLabs voice ID not set. Cannot synthesize speech (stub).');
    return null;
  }

  console.log(`[ElevenLabs Stub] Synthesizing speech for text: "${text.substring(0, 50)}..." using voice ${voiceId}`);

  try {
    // --- TODO: Implement actual API call in later phase ---
    // Example:
    // const audio = await elevenlabs.generate({ voice: voiceId, text });
    // // Process the audio stream (e.g., collect into a buffer)
    // const chunks: Buffer[] = [];
    // for await (const chunk of audio) {
    //   chunks.push(chunk);
    // }
    // const audioBuffer = Buffer.concat(chunks);
    // console.log(`[ElevenLabs] Synthesized audio buffer size: ${audioBuffer.length}`);
    // return audioBuffer;
    // --- End Example ---

    // For Phase 1 stub, return null or a dummy buffer if needed for testing downstream
    console.log('[ElevenLabs Stub] Returning null (not implemented).');
    return null;
  } catch (error) {
    console.error('[ElevenLabs] Error synthesizing speech:', error);
    return null;
  }
}; 