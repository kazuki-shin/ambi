import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { addToMemory, getRecentHistory, getRelevantMemories, buildMemoryContext } from '../services/memoryManager';
import * as redisMemoryService from '../services/redisMemoryService';
import * as pineconeMemoryService from '../services/pineconeMemoryService';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

// Mock redis service
jest.mock('../services/redisMemoryService', () => ({
  addRedisMessagePair: jest.fn(),
  getRedisHistory: jest.fn(),
  clearRedisHistory: jest.fn(),
}));

// Mock the pinecone service module directly
const mockSaveContext = jest.fn();
const mockLoadMemoryVariables = jest.fn();
jest.mock('../services/pineconeMemoryService', () => ({
  createPineconeMemory: jest.fn().mockImplementation(() => ({
    // @ts-expect-error - Ignore potential type mismatch for mockResolvedValue
    saveContext: mockSaveContext.mockResolvedValue(undefined),
    // @ts-expect-error - Ignore potential type mismatch for mockResolvedValue
    loadMemoryVariables: mockLoadMemoryVariables.mockResolvedValue({ relevantHistory: [] }),
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
    mockSaveContext.mockClear();
    mockLoadMemoryVariables.mockClear();
    (redisMemoryService.addRedisMessagePair as jest.Mock).mockClear();
    (redisMemoryService.getRedisHistory as jest.Mock).mockClear();
    (pineconeMemoryService.createPineconeMemory as jest.Mock).mockClear();
  });

  test('addToMemory should call dependencies correctly', async () => {
    const addRedisMock = jest.spyOn(redisMemoryService, 'addRedisMessagePair').mockResolvedValue(undefined);
    // @ts-expect-error - Ignore potential type mismatch for mockResolvedValue
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
      .mockResolvedValueOnce(mockRecentHistory);

    const result = await getRecentHistory(sessionId);

    expect(result).toEqual(mockRecentHistory);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[1]).toBeInstanceOf(AIMessage);
    expect(getRedisHistoryMock).toHaveBeenCalledWith(sessionId);
  });

  test('getRelevantMemories should call pinecone and return BaseMessages', async () => {
    // @ts-expect-error - Ignore potential type mismatch for mockResolvedValue
    mockLoadMemoryVariables.mockResolvedValueOnce({ relevantHistory: mockRelevantMemories });

    const result = await getRelevantMemories(sessionId, userMessage);

    expect(result).toEqual(mockRelevantMemories);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[1]).toBeInstanceOf(AIMessage);
    expect(pineconeMemoryService.createPineconeMemory).toHaveBeenCalledWith(sessionId);
    expect(mockLoadMemoryVariables).toHaveBeenCalledWith({ input: userMessage });
  });

  test('buildMemoryContext should combine memories correctly', async () => {
    jest.spyOn(redisMemoryService, 'getRedisHistory').mockResolvedValueOnce(mockRecentHistory);
    // @ts-expect-error - Ignore potential type mismatch for mockResolvedValue
    mockLoadMemoryVariables.mockResolvedValueOnce({ relevantHistory: mockRelevantMemories });

    const result = await buildMemoryContext(sessionId, userMessage);

    const expectedCombined = [...mockRelevantMemories, ...mockRecentHistory];
    expect(result).toEqual(expectedCombined);
    expect(pineconeMemoryService.createPineconeMemory).toHaveBeenCalledWith(sessionId);
    expect(mockLoadMemoryVariables).toHaveBeenCalledWith({ input: userMessage });
    expect(redisMemoryService.getRedisHistory).toHaveBeenCalledWith(sessionId);
  });

  test('buildMemoryContext should handle errors gracefully', async () => {
    jest.spyOn(redisMemoryService, 'getRedisHistory').mockResolvedValueOnce(mockRecentHistory);
    // @ts-expect-error - Ignore potential type mismatch for mockRejectedValue
    mockLoadMemoryVariables.mockRejectedValueOnce(new Error('Pinecone error'));

    const result = await buildMemoryContext(sessionId, userMessage);

    expect(result).toEqual(mockRecentHistory);
    expect(pineconeMemoryService.createPineconeMemory).toHaveBeenCalledWith(sessionId);
    expect(mockLoadMemoryVariables).toHaveBeenCalledWith({ input: userMessage });
    expect(redisMemoryService.getRedisHistory).toHaveBeenCalledWith(sessionId);
  });
});
