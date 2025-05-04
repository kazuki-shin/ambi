import { ElevenLabsClient } from 'elevenlabs';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
  console.warn(
    'ELEVENLABS_API_KEY not found in environment variables. ElevenLabs functions will be disabled.'
  );
}

// --- Configuration ---
const ENV_DEFAULT_VOICE_ID = process.env.ELEVENLABS_DEFAULT_VOICE_ID || null;
const FALLBACK_DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Rachel voice as a fallback
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2'; // Default to high-quality model
const DEFAULT_STABILITY = 0.5;
const DEFAULT_SIMILARITY_BOOST = 0.75;

// --- Client Initialization and Testing Hook ---
let activeElevenLabsClient: ElevenLabsClient | null = apiKey ? new ElevenLabsClient({ apiKey }) : null;

export const _setElevenLabsClientForTest = (client: ElevenLabsClient | null) => {
  activeElevenLabsClient = client;
};

/**
 * Interface for optional voice settings.
 */
export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
}

// --- In-Memory Cache ---
// Simple cache for synthesized speech buffers
// Key: string generated from text, voiceId, modelId, and settings
// Value: Buffer
const synthesisCache = new Map<string, Buffer>();
// TODO: Consider adding cache size limit / eviction strategy later if needed

/**
 * Generates a unique cache key for a synthesis request.
 * @param text
 * @param voiceId
 * @param modelId
 * @param stability
 * @param similarityBoost
 * @returns A unique string key.
 */
const generateCacheKey = (
  text: string,
  voiceId: string,
  modelId: string,
  stability: number,
  similarityBoost: number
): string => {
  // Simple concatenation. Consider hashing for very long text or more complex keys.
  return `text:${text}|voice:${voiceId}|model:${modelId}|stability:${stability}|similarity:${similarityBoost}`;
};

/**
 * Synthesizes speech from text using ElevenLabs API.
 * @param text - The text to synthesize.
 * @param voiceId - Optional voice ID to use. If null, uses the default voice.
 * @param voiceSettings - Optional voice settings (stability, similarity_boost).
 * @returns A Promise that resolves to an audio buffer or null if synthesis fails.
 */
export const synthesizeSpeech = async (
  text: string,
  voiceId: string | null = null,
  voiceSettings: VoiceSettings | null = null
): Promise<Buffer | null> => {
  if (!activeElevenLabsClient) {
    console.warn('ElevenLabs client not initialized (API key missing or client unset?). Returning null.');
    return null;
  }

  const effectiveVoiceId = voiceId || ENV_DEFAULT_VOICE_ID || FALLBACK_DEFAULT_VOICE_ID;
  const stability = voiceSettings?.stability ?? DEFAULT_STABILITY;
  const similarityBoost = voiceSettings?.similarity_boost ?? DEFAULT_SIMILARITY_BOOST;
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID;

  // --- Cache Check ---
  const cacheKey = generateCacheKey(text, effectiveVoiceId, modelId, stability, similarityBoost);
  if (synthesisCache.has(cacheKey)) {
    console.log(`[ElevenLabs] Cache hit for key: ${cacheKey.substring(0, 100)}...`);
    return synthesisCache.get(cacheKey)!; // Assert non-null as we just checked with has()
  }
  console.log(`[ElevenLabs] Cache miss for key: ${cacheKey.substring(0, 100)}...`);
  // --- End Cache Check ---

  console.log(
    `[ElevenLabs] Synthesizing speech for text: "${text.substring(0, 50)}..." using voice ${effectiveVoiceId}, model ${modelId}, settings: { stability: ${stability}, similarity_boost: ${similarityBoost} }`
  );

  try {
    const audio = await activeElevenLabsClient.textToSpeech.convert(effectiveVoiceId, {
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
      },
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    
    const audioBuffer = Buffer.concat(chunks);
    console.log(`[ElevenLabs] Synthesized audio buffer size: ${audioBuffer.length} bytes`);

    // Store in cache on success
    synthesisCache.set(cacheKey, audioBuffer);
    console.log(`[ElevenLabs] Cached result for key: ${cacheKey.substring(0, 100)}...`);

    return audioBuffer;
  } catch (error) {
    console.error('[ElevenLabs] Error synthesizing speech:', error);
    return null;
  }
};  