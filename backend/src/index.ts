import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connect';
import { initializePinecone } from './clients/pineconeClient';
import { initializeRedis } from './clients/redisClient';
import { getClaudeResponse } from './clients/claudeClient';
import { addToMemory, getRecentHistory } from './services/memoryManager';
import { voiceService } from './services/voiceService';

dotenv.config();

// Determine Interaction Mode
const INTERACTION_MODE = process.env.INTERACTION_MODE === 'text' ? 'text' : 'voice'; // Default to 'voice'
console.log(`[Config] Interaction mode set to: ${INTERACTION_MODE}`);

// Connect to Database
connectDB();

// Initialize External Clients
if (process.env.NODE_ENV !== 'test') {
  initializeRedis();
  initializePinecone();
}

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/voice-conversation', express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// --- Interfaces ---
interface ConversationRequest {
  message: string;
  userId?: string;
  sessionId?: string;
}

interface _VoiceConversationRequest {
  audio: Buffer;
  userId?: string;
  sessionId?: string;
}

interface ConversationResponse {
  reply: string;
  sessionId?: string;
}

interface _VoiceConversationResponse {
  audioReply: Buffer;
  textReply: string;
  sessionId?: string;
}
// --- End Interfaces ---

// --- Original Routes ---
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/api/conversation', async (req: Request, res: Response) => {
  const { message, userId, sessionId } = req.body as ConversationRequest;
  const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  console.log(`Received message: "${message}" from user: ${userId || 'unknown'} in session: ${currentSessionId}`);
  
  await getRecentHistory(currentSessionId);
  
  const ambiReply = await getClaudeResponse(message, currentSessionId);
  
  await addToMemory(currentSessionId, message, ambiReply);

  // Conditionally prepare voice response if mode is 'voice'
  let audioReplyBase64: string | null = null;
  if (INTERACTION_MODE === 'voice') {
    console.log('[Conversation] Synthesizing voice reply...');
    const audioBuffer = await voiceService.textToSpeech.synthesize(ambiReply);
    if (audioBuffer) {
      audioReplyBase64 = audioBuffer.toString('base64');
      console.log(`[Conversation] Voice reply synthesized (${audioBuffer.length} bytes)`);
    } else {
      console.error('[Conversation] Failed to synthesize voice reply.');
      // Decide if we should fail the request or just send text
    }
  }

  // Send back both text and potentially audio
  const response: ConversationResponse & { audioReply?: string | null } = {
    reply: ambiReply,
    sessionId: currentSessionId,
    audioReply: audioReplyBase64 // Will be null if mode is 'text' or synthesis failed
  };
  res.json(response);
});

app.post('/api/voice-conversation', async (req: Request, res: Response): Promise<void> => {
  try {
    // Only process if mode is 'voice'
    if (INTERACTION_MODE !== 'voice') {
      console.warn(`[Voice Conversation] Received request while mode is '${INTERACTION_MODE}'. Ignoring.`);
      res.status(400).json({ error: `Voice input not processed in '${INTERACTION_MODE}' mode.` });
      return;
    }

    // If mode is 'voice', proceed with the async processing directly
    const audio = req.body;
    const userId = req.query.userId as string | undefined;
    const sessionId = req.query.sessionId as string | undefined;

    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log(`Received voice message from user: ${userId || 'unknown'} in session: ${currentSessionId}`);

    // Removed the IIFE, await operations directly in the handler
    try {
      const transcribedText = await voiceService.speechToText.transcribe(audio);

      if (!transcribedText) {
        console.error('[Voice Conversation] Failed to transcribe audio');
        res.status(400).json({ error: 'Failed to transcribe audio' });
        return;
      }

      console.log(`[Voice Conversation] Transcribed text: "${transcribedText}"`);

      await getRecentHistory(currentSessionId);

      const ambiReply = await getClaudeResponse(transcribedText, currentSessionId);

      await addToMemory(currentSessionId, transcribedText, ambiReply);

      const audioReply = await voiceService.textToSpeech.synthesize(ambiReply);

      if (!audioReply) {
        console.error('[Voice Conversation] Failed to synthesize speech');
        res.status(500).json({ error: 'Failed to synthesize speech' });
        return;
      }

      console.log(`[Voice Conversation] Successfully synthesized audio reply (${audioReply.length} bytes)`);

      res.setHeader('Content-Type', 'application/json');

      const response = {
        audioReply: audioReply.toString('base64'),
        textReply: ambiReply,
        sessionId: currentSessionId
      };

      res.json(response);
      return;
    } catch (error) {
      console.error('[Voice Conversation] Error processing voice conversation:', error);
      res.status(500).json({ error: 'Internal server error processing voice conversation' });
      return;
    }

  } catch (error) {
    console.error('[Voice Conversation] Error handling voice conversation request:', error);
    res.status(500).json({ error: 'Internal server error handling voice conversation request' });
    return;
  }
});
// --- End Original Routes ---

/* // REMOVING Test Endpoint for ElevenLabs TTS Stub (Keep commented out)
// ... commented out /api/test/tts code ...
*/

const PORT = process.env.PORT || 4000;

// Only start listening if the file is run directly (not imported as a module)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app; // Export the app instance for testing                                                                                                                                                                                                                                                                                                                                                                                                                                                