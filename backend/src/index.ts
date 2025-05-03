import express, { Request, Response } from 'express'; // Added Request, Response types
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connect'; // Import the DB connection function
import { initializePinecone } from './clients/pineconeClient'; // Import Pinecone initializer
import { initializeRedis } from './clients/redisClient'; // Import Redis initializer
import { getClaudeResponse } from './clients/claudeClient'; // Import Claude client function

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
  // Add other fields as needed, e.g., emotion, confidence
}

app.get('/health', (_req: Request, res: Response) => { // Added types
  res.json({ status: 'ok' });
});

// Refined conversation endpoint
app.post('/api/conversation', async (req: Request, res: Response) => { // Made async
  const { message, userId, sessionId } = req.body as ConversationRequest;

  console.log(`Received message: "${message}" from user: ${userId || 'unknown'} in session: ${sessionId || 'unknown'}`);

  // --- Phase 1: Basic Claude Integration ---
  const ambiReply = await getClaudeResponse(message /*, userId, sessionId */);
  // --- TODO: Phase 3 - Add context/memory retrieval before calling Claude ---
  // --- TODO: Phase 3 - Add memory update after getting response ---

  const response: ConversationResponse = { reply: ambiReply }; // Use Claude's reply
  res.json(response);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 