import express, { Request, Response } from 'express'; // Added Request, Response types
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connect'; // Import the DB connection function
import { initializePinecone } from './clients/pineconeClient'; // Import Pinecone initializer
import { initializeRedis } from './clients/redisClient'; // Import Redis initializer
import { getClaudeResponse } from './clients/claudeClient'; // Import Claude client function
import { addMessagePair, getHistory } from './services/memoryService'; // Import memory service functions

dotenv.config();

// Connect to Database
connectDB();

// Initialize External Clients (Stubs for Phase 1)
initializeRedis(); // Will attempt connection if REDIS_URL is set
initializePinecone(); // Logs warning if API key is missing, doesn't connect yet

const app = express();
app.use(cors());
app.use(express.json());

// Basic request structure interface (optional, but good practice)
interface ConversationRequest {
  message: string;
  userId?: string; // Example: To identify the user later
  sessionId?: string; // Example: To track conversation state
}

// Basic response structure interface (optional)
interface ConversationResponse {
  reply: string;
  // sessionId?: string; // Removing optional sessionId used for testing
  // Add other fields as needed, e.g., emotion, confidence
}

app.get('/health', (_req: Request, res: Response) => { // Added types
  res.json({ status: 'ok' });
});

// Refined conversation endpoint
app.post('/api/conversation', async (req: Request, res: Response) => {
  const { message, userId, sessionId } = req.body as ConversationRequest;

  // Ensure we have a session ID for memory (generate one if missing - basic example)
  // In a real app, session management would be more robust
  const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  console.log(`Received message: "${message}" from user: ${userId || 'unknown'} in session: ${currentSessionId}`);

  // --- TODO: Phase 3 - Retrieve and use history/context before calling Claude ---
  const history = getHistory(currentSessionId); // Retrieve history (not used in call yet)
  // Example: Pass history to getClaudeResponse in Phase 3

  // --- Phase 1: Basic Claude Integration ---
  const ambiReply = await getClaudeResponse(message /*, history */); // Pass history in later phase

  // --- Phase 1: Store message pair in memory stub ---
  addMessagePair(currentSessionId, message, ambiReply);

  const response: ConversationResponse = {
    reply: ambiReply,
    // Optionally include sessionId in response if it was generated
    // sessionId: currentSessionId // Re-commenting after testing
  };
  res.json(response);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 