import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { addToMemory, getRecentHistory, getRelevantMemories, buildMemoryContext } from '../services/memoryManager';
import { createRedisMemory } from '../services/redisMemoryService';
import { createPineconeMemory } from '../services/pineconeMemoryService';

jest.mock('../services/redisMemoryService', () => ({
  createRedisMemory: jest.fn(),
  addRedisMessagePair: jest.fn().mockResolvedValue(undefined),
  getRedisHistory: jest.fn().mockResolvedValue([]),
  clearRedisHistory: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/pineconeMemoryService', () => ({
  createPineconeMemory: jest.fn().mockReturnValue({
    saveContext: jest.fn().mockResolvedValue(undefined),
    loadMemoryVariables: jest.fn().mockResolvedValue({ relevantHistory: [] }),
  }),
  PineconeVectorMemory: jest.fn(),
}));

describe('Memory Manager', () => {
  const sessionId = 'test-session-123';
  const userMessage = 'Hello, how are you?';
  const aiMessage = 'I am doing well, thank you for asking!';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addToMemory should add messages to both memory systems', async () => {
    const mockPineconeMemory = {
      saveContext: jest.fn().mockResolvedValue(undefined),
    };
    
    (createPineconeMemory as jest.Mock).mockReturnValue(mockPineconeMemory);
    
    await addToMemory(sessionId, userMessage, aiMessage);
    
    expect(require('../services/redisMemoryService').addRedisMessagePair)
      .toHaveBeenCalledWith(sessionId, userMessage, aiMessage);
    
    expect(mockPineconeMemory.saveContext).toHaveBeenCalledWith(
      { input: userMessage, sessionId },
      { output: aiMessage }
    );
  });

  test('getRecentHistory should retrieve history from Redis', async () => {
    const mockHistory = [
      { content: userMessage, type: 'human' },
      { content: aiMessage, type: 'ai' },
    ];
    
    (require('../services/redisMemoryService').getRedisHistory as jest.Mock)
      .mockResolvedValue(mockHistory);
    
    const result = await getRecentHistory(sessionId);
    
    expect(result).toEqual(mockHistory);
    expect(require('../services/redisMemoryService').getRedisHistory)
      .toHaveBeenCalledWith(sessionId);
  });

  test('getRelevantMemories should retrieve memories from Pinecone', async () => {
    const mockRelevantMemories = [
      { content: 'Previous relevant message', type: 'human' },
      { content: 'Previous relevant response', type: 'ai' },
    ];
    
    const mockPineconeMemory = {
      loadMemoryVariables: jest.fn().mockResolvedValue({
        relevantHistory: mockRelevantMemories,
      }),
    };
    
    (createPineconeMemory as jest.Mock).mockReturnValue(mockPineconeMemory);
    
    const result = await getRelevantMemories(sessionId, userMessage);
    
    expect(result).toEqual(mockRelevantMemories);
    expect(mockPineconeMemory.loadMemoryVariables)
      .toHaveBeenCalledWith({ input: userMessage });
  });

  test('buildMemoryContext should combine recent and relevant memories', async () => {
    const mockRecentHistory = [
      { content: 'Recent message', type: 'human' },
      { content: 'Recent response', type: 'ai' },
    ];
    
    const mockRelevantMemories = [
      { content: 'Relevant message', type: 'human' },
      { content: 'Relevant response', type: 'ai' },
    ];
    
    (require('../services/redisMemoryService').getRedisHistory as jest.Mock)
      .mockResolvedValue(mockRecentHistory);
    
    const mockPineconeMemory = {
      loadMemoryVariables: jest.fn().mockResolvedValue({
        relevantHistory: mockRelevantMemories,
      }),
    };
    
    (createPineconeMemory as jest.Mock).mockReturnValue(mockPineconeMemory);
    
    const result = await buildMemoryContext(sessionId, userMessage);
    
    expect(result).toEqual([...mockRelevantMemories, ...mockRecentHistory]);
  });

  test('buildMemoryContext should handle empty session ID', async () => {
    const result = await buildMemoryContext('', userMessage);
    expect(result).toEqual([]);
  });

  test('buildMemoryContext should handle errors gracefully', async () => {
    const mockPineconeMemory = {
      loadMemoryVariables: jest.fn().mockRejectedValue(new Error('Test error')),
    };
    
    (createPineconeMemory as jest.Mock).mockReturnValue(mockPineconeMemory);
    
    const mockRecentHistory = [
      { content: 'Recent message', type: 'human' },
      { content: 'Recent response', type: 'ai' },
    ];
    
    (require('../services/redisMemoryService').getRedisHistory as jest.Mock)
      .mockResolvedValue(mockRecentHistory);
    
    const result = await buildMemoryContext(sessionId, userMessage);
    
    expect(result).toEqual(mockRecentHistory);
  });
});
