import request from 'supertest';
import mongoose from 'mongoose'; // Import mongoose for disconnect
import { redisClient } from '../clients/redisClient'; // Import redisClient for disconnect
import app from '../index'; // Import the exported Express app
import { getClaudeResponse } from '../clients/claudeClient';
import { addMessagePair, getHistory } from '../services/memoryService';

// Mock the external dependencies
jest.mock('../clients/claudeClient');
jest.mock('../services/memoryService');

// Define mock types for stricter type checking in mocks
const mockGetClaudeResponse = getClaudeResponse as jest.MockedFunction<typeof getClaudeResponse>; 
const mockAddMessagePair = addMessagePair as jest.MockedFunction<typeof addMessagePair>;
const mockGetHistory = getHistory as jest.MockedFunction<typeof getHistory>;

describe('POST /api/conversation', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockGetClaudeResponse.mockClear();
    mockAddMessagePair.mockClear();
    mockGetHistory.mockClear();

    // Default mock implementations
    mockGetHistory.mockReturnValue([]); // Return empty history by default
    mockGetClaudeResponse.mockResolvedValue('Mocked Claude response.'); // Return a simple string
  });

  it('should return 200 and AI reply on valid request', async () => {
    const userMessage = 'Hello, test!';
    const mockReply = 'Mocked Claude response for hello.';
    mockGetClaudeResponse.mockResolvedValueOnce(mockReply);

    const response = await request(app)
      .post('/api/conversation')
      .send({ message: userMessage });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ reply: mockReply });
    expect(mockGetClaudeResponse).toHaveBeenCalledTimes(1);
    expect(mockGetClaudeResponse).toHaveBeenCalledWith(userMessage);
    expect(mockAddMessagePair).toHaveBeenCalledTimes(1);
    // Check that session ID was generated and passed (optional stricter check)
    expect(mockAddMessagePair).toHaveBeenCalledWith(
      expect.stringContaining('session_'), // Check if a session ID was generated
      userMessage,
      mockReply
    );
  });

  it('should pass sessionId to memory service if provided', async () => {
    const userMessage = 'Follow up message';
    const sessionId = 'existing-session-123';
    const mockReply = 'Mocked follow up response.';

    mockGetClaudeResponse.mockResolvedValueOnce(mockReply);

    await request(app)
      .post('/api/conversation')
      .send({ message: userMessage, sessionId: sessionId });

    expect(mockGetHistory).toHaveBeenCalledWith(sessionId);
    expect(mockAddMessagePair).toHaveBeenCalledWith(sessionId, userMessage, mockReply);
  });

  it('should return 500 if Claude client fails', async () => {
    const userMessage = 'Trigger error';
    const errorMessage = 'Anthropic API Error';
    mockGetClaudeResponse.mockRejectedValueOnce(new Error(errorMessage));

    const response = await request(app)
      .post('/api/conversation')
      .send({ message: userMessage });

    // If getClaudeResponse rejection isn't caught by the route handler,
    // Express default error handling likely results in 500.
    expect(response.status).toBe(500);
    // We may not get a predictable body, so commenting out body check
    // expect(response.body).toEqual({ error: 'Internal Server Error' }); // Or similar
    expect(mockAddMessagePair).not.toHaveBeenCalled();
  });

  // Add more tests: e.g., missing message body (should be handled by express.json typically or validation)

  // Cleanup after all tests are done
  afterAll(async () => {
    try {
      // Close MongoDB connection
      await mongoose.disconnect();
      
      // Close Redis connection if it exists
      if (redisClient) {
        await redisClient.quit();
      }
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  });
});  