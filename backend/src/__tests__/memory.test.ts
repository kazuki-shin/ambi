import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { addToMemory, getRecentHistory, getRelevantMemories, buildMemoryContext } from '../services/memoryManager';
import * as redisMemoryService from '../services/redisMemoryService';
import * as pineconeMemoryService from '../services/pineconeMemoryService';

jest.mock('../services/redisMemoryService', () => ({
  createRedisMemory: jest.fn(),
  addRedisMessagePair: jest.fn().mockImplementation(() => Promise.resolve()),
  getRedisHistory: jest.fn().mockImplementation(() => Promise.resolve([])),
  clearRedisHistory: jest.fn().mockImplementation(() => Promise.resolve()),
}));

jest.mock('../services/pineconeMemoryService', () => ({
  createPineconeMemory: jest.fn().mockImplementation(() => ({
    saveContext: jest.fn().mockImplementation(() => Promise.resolve()),
    loadMemoryVariables: jest.fn().mockImplementation(() => Promise.resolve({ relevantHistory: [] })),
  })),
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
      saveContext: jest.fn().mockImplementation(() => Promise.resolve()),
    };
    
    jest.spyOn(pineconeMemoryService, 'createPineconeMemory')
      .mockReturnValue(mockPineconeMemory as any);
    
    await addToMemory(sessionId, userMessage, aiMessage);
    
    const addRedisMessagePairMock = jest.spyOn(redisMemoryService, 'addRedisMessagePair');
    expect(addRedisMessagePairMock).toHaveBeenCalledWith(sessionId, userMessage, aiMessage);
    
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
    
    const getRedisHistoryMock = jest.spyOn(redisMemoryService, 'getRedisHistory')
      .mockImplementation(() => Promise.resolve(mockHistory as any));
    
    const result = await getRecentHistory(sessionId);
    
    expect(result).toEqual(mockHistory);
    expect(getRedisHistoryMock).toHaveBeenCalledWith(sessionId);
  });

  test('getRelevantMemories should retrieve memories from Pinecone', async () => {
    const mockRelevantMemories = [
      { content: 'Previous relevant message', type: 'human' },
      { content: 'Previous relevant response', type: 'ai' },
    ];
    
    const mockPineconeMemory = {
      loadMemoryVariables: jest.fn().mockImplementation(() => Promise.resolve({
        relevantHistory: mockRelevantMemories,
      })),
    };
    
    jest.spyOn(pineconeMemoryService, 'createPineconeMemory')
      .mockReturnValue(mockPineconeMemory as any);
    
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
    
    const getRedisHistoryMock = jest.spyOn(redisMemoryService, 'getRedisHistory')
      .mockImplementation(() => Promise.resolve(mockRecentHistory as any));
    
    const mockPineconeMemory = {
      loadMemoryVariables: jest.fn().mockImplementation(() => Promise.resolve({
        relevantHistory: mockRelevantMemories,
      })),
    };
    
    jest.spyOn(pineconeMemoryService, 'createPineconeMemory')
      .mockReturnValue(mockPineconeMemory as any);
    
    const result = await buildMemoryContext(sessionId, userMessage);
    
    expect(result).toEqual([...mockRelevantMemories, ...mockRecentHistory]);
  });

  test('buildMemoryContext should handle empty session ID', async () => {
    const result = await buildMemoryContext('', userMessage);
    expect(result).toEqual([]);
  });

  test('buildMemoryContext should handle errors gracefully', async () => {
    const mockPineconeMemory = {
      loadMemoryVariables: jest.fn().mockImplementation(() => Promise.reject(new Error('Test error'))),
    };
    
    jest.spyOn(pineconeMemoryService, 'createPineconeMemory')
      .mockReturnValue(mockPineconeMemory as any);
    
    const mockRecentHistory = [
      { content: 'Recent message', type: 'human' },
      { content: 'Recent response', type: 'ai' },
    ];
    
    const getRedisHistoryMock = jest.spyOn(redisMemoryService, 'getRedisHistory')
      .mockImplementation(() => Promise.resolve(mockRecentHistory as any));
    
    const result = await buildMemoryContext(sessionId, userMessage);
    
    expect(result).toEqual(mockRecentHistory);
  });
});
