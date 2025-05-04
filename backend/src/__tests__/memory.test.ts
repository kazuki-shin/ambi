import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { addToMemory, getRecentHistory, getRelevantMemories, buildMemoryContext } from '../services/memoryManager';
import * as redisMemoryService from '../services/redisMemoryService';
import * as pineconeMemoryService from '../services/pineconeMemoryService';
import { PineconeVectorMemory } from '../services/pineconeMemoryService';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { MemoryVariables } from '@langchain/core/memory';

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

  const mockRecentHistory: BaseMessage[] = [
    new HumanMessage('Recent message'),
    new AIMessage('Recent response')
  ];

  const mockRelevantMemories: BaseMessage[] = [
    new HumanMessage('Relevant message'),
    new AIMessage('Relevant response')
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addToMemory should add messages to both memory systems', async () => {
    const mockPineconeMemory = {
      saveContext: jest.fn().mockImplementation(() => Promise.resolve()),
    };
    
    jest.spyOn(pineconeMemoryService, 'createPineconeMemory')
      .mockReturnValue(mockPineconeMemory as unknown as PineconeVectorMemory);
    
    await addToMemory(sessionId, userMessage, aiMessage);
    
    const addRedisMessagePairMock = jest.spyOn(redisMemoryService, 'addRedisMessagePair');
    expect(addRedisMessagePairMock).toHaveBeenCalledWith(sessionId, userMessage, aiMessage);
    
    expect(mockPineconeMemory.saveContext).toHaveBeenCalledWith(
      { input: userMessage, sessionId },
      { output: aiMessage }
    );
  });

  test('getRecentHistory should retrieve history from Redis as BaseMessages', async () => {
    const getRedisHistoryMock = jest.spyOn(redisMemoryService, 'getRedisHistory')
      .mockResolvedValue(mockRecentHistory);
    
    const result = await getRecentHistory(sessionId);
    
    expect(result).toEqual(mockRecentHistory);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[1]).toBeInstanceOf(AIMessage);
    expect(getRedisHistoryMock).toHaveBeenCalledWith(sessionId);
  });

  test('getRelevantMemories should retrieve memories from Pinecone as BaseMessages', async () => {
    const mockPineconeMemory = {
      loadMemoryVariables: jest.fn().mockImplementation(() => Promise.resolve({
        relevantHistory: mockRelevantMemories,
      })),
    };
    
    jest.spyOn(pineconeMemoryService, 'createPineconeMemory')
      .mockReturnValue(mockPineconeMemory as unknown as PineconeVectorMemory);
    
    const result = await getRelevantMemories(sessionId, userMessage);
    
    expect(result).toEqual(mockRelevantMemories);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[1]).toBeInstanceOf(AIMessage);
    expect(mockPineconeMemory.loadMemoryVariables)
      .toHaveBeenCalledWith({ input: userMessage });
  });

  test('buildMemoryContext should combine recent and relevant memories', async () => {
    jest.spyOn(redisMemoryService, 'getRedisHistory')
      .mockResolvedValue(mockRecentHistory);
    
    const mockPineconeMemory = {
      loadMemoryVariables: jest.fn().mockImplementation(() => Promise.resolve({
        relevantHistory: mockRelevantMemories,
      })),
    };
    
    jest.spyOn(pineconeMemoryService, 'createPineconeMemory')
      .mockReturnValue(mockPineconeMemory as unknown as PineconeVectorMemory);
    
    const result = await buildMemoryContext(sessionId, userMessage);
    
    const expectedCombined = [...mockRelevantMemories, ...mockRecentHistory];
    expect(result).toEqual(expectedCombined);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[1]).toBeInstanceOf(AIMessage);
    expect(result[2]).toBeInstanceOf(HumanMessage);
    expect(result[3]).toBeInstanceOf(AIMessage);
  });

  test('buildMemoryContext should handle empty session ID', async () => {
    const result = await buildMemoryContext('', userMessage);
    expect(result).toEqual([]);
  });

  test('buildMemoryContext should handle errors gracefully and return recent history', async () => {
    jest.spyOn(redisMemoryService, 'getRedisHistory')
      .mockResolvedValue(mockRecentHistory);
    
    const mockLoadMemoryVariables = jest.fn().mockImplementationOnce(() => {
      return Promise.reject(new Error('Pinecone error'));
    });
    const mockPineconeMemoryInstance = {
      saveContext: jest.fn(),
      loadMemoryVariables: mockLoadMemoryVariables 
    };
    jest.spyOn(pineconeMemoryService, 'createPineconeMemory').mockReturnValue(mockPineconeMemoryInstance as any);
    
    const result = await buildMemoryContext(sessionId, userMessage);
    
    expect(result).toEqual(mockRecentHistory);
    expect(mockLoadMemoryVariables).toHaveBeenCalledWith({ input: userMessage });
  });
});
