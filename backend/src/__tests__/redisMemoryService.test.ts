import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

jest.mock('../services/memoryService', () => ({
  addMessagePair: jest.fn(),
  getHistory: jest.fn().mockReturnValue([
    new HumanMessage('Hello, how are you?'),
    new AIMessage('I am doing well, thank you for asking!')
  ]),
  clearHistory: jest.fn()
}));

import * as memoryService from '../services/memoryService';

jest.mock('../clients/redisClient', () => ({
  getRedisClient: jest.fn()
}));

import * as redisMemoryServiceModule from '../services/redisMemoryService';
import { 
  RedisBufferWindowMemory,
  createRedisMemory, 
  addRedisMessagePair, 
  getRedisHistory, 
  clearRedisHistory 
} from '../services/redisMemoryService';
import { getRedisClient } from '../clients/redisClient';

jest.mock('@langchain/community/stores/message/ioredis', () => ({
  RedisChatMessageHistory: jest.fn().mockImplementation(() => ({
    addUserMessage: jest.fn().mockImplementation(() => Promise.resolve()),
    addAIMessage: jest.fn().mockImplementation(() => Promise.resolve()),
    getMessages: jest.fn().mockImplementation(() => Promise.resolve([
      new HumanMessage('Hello, how are you?'),
      new AIMessage('I am doing well, thank you for asking!')
    ])),
    clear: jest.fn().mockImplementation(() => Promise.resolve())
  }))
}));

describe('Redis Memory Service', () => {
  const sessionId = 'test-session-123';
  const userMessage = 'Hello, how are you?';
  const aiMessage = 'I am doing well, thank you for asking!';
  
  const mockRedisClient = {
    hset: jest.fn().mockImplementation(() => Promise.resolve('OK')),
    hgetall: jest.fn().mockImplementation(() => Promise.resolve({})),
    del: jest.fn().mockImplementation(() => Promise.resolve('OK')),
    expire: jest.fn().mockImplementation(() => Promise.resolve('OK'))
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (getRedisClient as jest.Mock).mockReturnValue(mockRedisClient);
  });
  
  test('createRedisMemory should return null if Redis client is not available', () => {
    (getRedisClient as jest.Mock).mockReturnValue(null);
    const result = createRedisMemory(sessionId);
    expect(result).toBeNull();
  });
  
  test('createRedisMemory should return a memory object if Redis client is available', () => {
    const memory = createRedisMemory(sessionId);
    expect(memory).not.toBeNull();
    expect(memory).toHaveProperty('saveContext');
    expect(memory).toHaveProperty('loadMemoryVariables');
  });
  
  test('addRedisMessagePair should store messages in Redis', async () => {
    const mockMemory = {
      addUserMessage: jest.fn().mockImplementation(() => Promise.resolve()),
      addAIMessage: jest.fn().mockImplementation(() => Promise.resolve()),
      getMessages: jest.fn().mockImplementation(() => Promise.resolve([])),
      clear: jest.fn().mockImplementation(() => Promise.resolve())
    };
    
    jest.spyOn(redisMemoryServiceModule, 'createRedisMemory')
      .mockReturnValue(mockMemory as unknown as RedisBufferWindowMemory);
    
    await addRedisMessagePair(sessionId, userMessage, aiMessage);
    
    expect(mockMemory.addUserMessage).toHaveBeenCalledWith(userMessage);
    expect(mockMemory.addAIMessage).toHaveBeenCalledWith(aiMessage);
  });
  
  test('addRedisMessagePair should fall back to memoryService if Redis is not available', async () => {
    (getRedisClient as jest.Mock).mockReturnValue(null);
    
    (memoryService.addMessagePair as jest.Mock).mockClear();
    
    jest.spyOn(redisMemoryServiceModule, 'createRedisMemory')
      .mockReturnValue(null);
    
    await addRedisMessagePair(sessionId, userMessage, aiMessage);
    
    expect(memoryService.addMessagePair).toHaveBeenCalledWith(sessionId, userMessage, aiMessage);
  });
  
  test('getRedisHistory should retrieve conversation history from Redis', async () => {
    const mockMessages = [
      new HumanMessage('Hello, how are you?'),
      new AIMessage('I am doing well, thank you for asking!')
    ];
    
    const mockMemory = {
      addUserMessage: jest.fn().mockImplementation(() => Promise.resolve()),
      addAIMessage: jest.fn().mockImplementation(() => Promise.resolve()),
      getMessages: jest.fn().mockImplementation(() => Promise.resolve(mockMessages)),
      clear: jest.fn().mockImplementation(() => Promise.resolve())
    };
    
    jest.spyOn(redisMemoryServiceModule, 'createRedisMemory')
      .mockReturnValue(mockMemory as unknown as RedisBufferWindowMemory);
    
    const result = await getRedisHistory(sessionId);
    
    expect(mockMemory.getMessages).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[1]).toBeInstanceOf(AIMessage);
  });
  
  test('getRedisHistory should fall back to memoryService if Redis is not available', async () => {
    (getRedisClient as jest.Mock).mockReturnValue(null);
    
    (memoryService.getHistory as jest.Mock).mockClear();
    
    jest.spyOn(redisMemoryServiceModule, 'createRedisMemory')
      .mockReturnValue(null);
    
    const result = await getRedisHistory(sessionId);
    
    expect(memoryService.getHistory).toHaveBeenCalledWith(sessionId);
    expect(result).toHaveLength(2);
  });
  
  test('clearRedisHistory should clear conversation history from Redis', async () => {
    const mockMemory = {
      addUserMessage: jest.fn().mockImplementation(() => Promise.resolve()),
      addAIMessage: jest.fn().mockImplementation(() => Promise.resolve()),
      getMessages: jest.fn().mockImplementation(() => Promise.resolve([])),
      clear: jest.fn().mockImplementation(() => Promise.resolve())
    };
    
    jest.spyOn(redisMemoryServiceModule, 'createRedisMemory')
      .mockReturnValue(mockMemory as unknown as RedisBufferWindowMemory);
    
    await clearRedisHistory(sessionId);
    
    expect(mockMemory.clear).toHaveBeenCalled();
  });
  
  test('clearRedisHistory should fall back to memoryService if Redis is not available', async () => {
    (getRedisClient as jest.Mock).mockReturnValue(null);
    
    (memoryService.clearHistory as jest.Mock).mockClear();
    
    jest.spyOn(redisMemoryServiceModule, 'createRedisMemory')
      .mockReturnValue(null);
    
    await clearRedisHistory(sessionId);
    
    expect(memoryService.clearHistory).toHaveBeenCalledWith(sessionId);
  });
});
