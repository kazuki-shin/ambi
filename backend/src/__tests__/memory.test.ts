import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { addToMemory, getRecentHistory, getRelevantMemories, buildMemoryContext } from '../services/memoryManager';
import * as redisMemoryService from '../services/redisMemoryService';
import * as pineconeMemoryService from '../services/pineconeMemoryService';
import { PineconeVectorMemory } from '../services/pineconeMemoryService';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

jest.mock('../services/redisMemoryService', () => ({
  addRedisMessagePair: jest.fn(),
  getRedisHistory: jest.fn(),
  clearRedisHistory: jest.fn(),
}));

const mockSaveContext = jest.fn();
const mockLoadMemoryVariables = jest.fn();
jest.mock('../services/pineconeMemoryService', () => ({
  createPineconeMemory: jest.fn().mockImplementation(() => ({
    saveContext: mockSaveContext,
    loadMemoryVariables: mockLoadMemoryVariables,
  })),
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

  test('addToMemory should call dependencies correctly', async () => {
    const addRedisMock = jest.spyOn(redisMemoryService, 'addRedisMessagePair').mockResolvedValue(undefined);
    mockSaveContext.mockResolvedValue(undefined);
    
    await addToMemory(sessionId, userMessage, aiMessage);
    
    expect(addRedisMock).toHaveBeenCalledWith(sessionId, userMessage, aiMessage);
    expect(pineconeMemoryService.createPineconeMemory).toHaveBeenCalledWith(sessionId);
    expect(mockSaveContext).toHaveBeenCalledWith(
      { input: userMessage, sessionId },
      { output: aiMessage }
    );
  });

  test('getRecentHistory should call redis and return BaseMessages', async () => {
    const getRedisHistoryMock = jest.spyOn(redisMemoryService, 'getRedisHistory')
      .mockResolvedValue(mockRecentHistory);

    const result = await getRecentHistory(sessionId);

    expect(result).toEqual(mockRecentHistory);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[1]).toBeInstanceOf(AIMessage);
    expect(getRedisHistoryMock).toHaveBeenCalledWith(sessionId);
  });

  test('getRelevantMemories should call pinecone and return BaseMessages', async () => {
    mockLoadMemoryVariables.mockResolvedValue({ relevantHistory: mockRelevantMemories });

    const result = await getRelevantMemories(sessionId, userMessage);

    expect(result).toEqual(mockRelevantMemories);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[1]).toBeInstanceOf(AIMessage);
    expect(pineconeMemoryService.createPineconeMemory).toHaveBeenCalledWith(sessionId);
    expect(mockLoadMemoryVariables).toHaveBeenCalledWith({ input: userMessage });
  });

  test('buildMemoryContext should combine memories correctly', async () => {
    jest.spyOn(redisMemoryService, 'getRedisHistory').mockResolvedValue(mockRecentHistory);
    mockLoadMemoryVariables.mockResolvedValue({ relevantHistory: mockRelevantMemories });

    const result = await buildMemoryContext(sessionId, userMessage);

    const expectedCombined = [...mockRelevantMemories, ...mockRecentHistory];
    expect(result).toEqual(expectedCombined);
    expect(pineconeMemoryService.createPineconeMemory).toHaveBeenCalledWith(sessionId);
    expect(mockLoadMemoryVariables).toHaveBeenCalledWith({ input: userMessage });
    expect(redisMemoryService.getRedisHistory).toHaveBeenCalledWith(sessionId);
  });

  test('buildMemoryContext should handle errors gracefully', async () => {
    jest.spyOn(redisMemoryService, 'getRedisHistory').mockResolvedValue(mockRecentHistory);
    mockLoadMemoryVariables.mockRejectedValue(new Error('Pinecone error'));

    const result = await buildMemoryContext(sessionId, userMessage);

    expect(result).toEqual(mockRecentHistory);
    expect(pineconeMemoryService.createPineconeMemory).toHaveBeenCalledWith(sessionId);
    expect(mockLoadMemoryVariables).toHaveBeenCalledWith({ input: userMessage });
    expect(redisMemoryService.getRedisHistory).toHaveBeenCalledWith(sessionId);
  });
});
