import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connect';
import { initializePinecone } from './clients/pineconeClient';
import { initializeRedis } from './clients/redisClient';
import { getClaudeResponse } from './clients/claudeClient';
import { addMessagePair, getHistory } from './services/memoryService';
// import { transcribeSpeech } from './clients/deepgramClient';
// import { synthesizeSpeech } from './clients/elevenLabsClient';

dotenv.config();

// Connect to Database
connectDB();

// Initialize External Clients
initializeRedis();
initializePinecone();

const app = express();
app.use(cors());
app.use(express.json());

// --- Interfaces ---
interface ConversationRequest {
  message: string;
  userId?: string;
  sessionId?: string;
}
interface ConversationResponse {
  reply: string;
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
  const history = getHistory(currentSessionId);
  const ambiReply = await getClaudeResponse(message);
  addMessagePair(currentSessionId, message, ambiReply);

  // --- REMOVING TEMPORARY TEST for Deepgram --- 
  // console.log('[Conversation Endpoint] Triggering STT stub...');
  // await transcribeSpeech(null); // Pass null as dummy audio source for stub
  // console.log('[Conversation Endpoint] STT stub trigger complete.');
  // --- END REMOVING TEMPORARY TEST ---

  // --- REMOVING TEMPORARY TEST for ElevenLabs --- 
  // console.log('[Conversation Endpoint] Triggering TTS stub...');
  // await synthesizeSpeech(ambiReply);
  // console.log('[Conversation Endpoint] TTS stub trigger complete.');
  // --- END REMOVING TEMPORARY TEST ---

  const response: ConversationResponse = {
    reply: ambiReply,
  };
  res.json(response);
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