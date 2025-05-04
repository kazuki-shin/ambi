import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { BaseMemory, InputValues, OutputValues, MemoryVariables } from '@langchain/core/memory';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { getRedisClient } from '../clients/redisClient';
import { shortTermMemoryConfig } from '../config/memoryConfig';
import * as memoryService from './memoryService';

/**
 * Redis-backed implementation of short-term memory using a custom BufferWindowMemory.
 * This service provides persistent short-term memory storage using Redis.
 */

/**
 * Custom implementation of a buffer window memory that uses Redis for storage.
 * This class maintains a sliding window of the last k interactions.
 */
export class RedisBufferWindowMemory extends BaseMemory {
  protected chatHistory: RedisChatMessageHistory;
  private k: number;
  private returnMessages: boolean;
  private inputKey: string;
  private outputKey: string;

  constructor({
    chatHistory,
    k = 5,
    returnMessages = true,
    inputKey = 'input',
    outputKey = 'output',
  }: {
    chatHistory: RedisChatMessageHistory;
    k?: number;
    returnMessages?: boolean;
    inputKey?: string;
    outputKey?: string;
  }) {
    super();
    this.chatHistory = chatHistory;
    this.k = k;
    this.returnMessages = returnMessages;
    this.inputKey = inputKey;
    this.outputKey = outputKey;
  }

  get memoryKeys(): string[] {
    return [this.inputKey, this.outputKey];
  }

  /**
   * Loads memory variables based on the input values.
   * @param values - The input values.
   * @returns A promise that resolves with the memory variables.
   */
  async loadMemoryVariables(_values: InputValues): Promise<MemoryVariables> {
    const messages = await this.chatHistory.getMessages();
    const windowedMessages = messages.slice(-this.k * 2);
    
    if (this.returnMessages) {
      return { messages: windowedMessages };
    }
    
    const result: { [key: string]: string } = {};
    
    if (windowedMessages.length > 0) {
      let humanMessages = [];
      let aiMessages = [];
      
      for (let i = 0; i < windowedMessages.length; i += 2) {
        if (i < windowedMessages.length) {
          const humanMessage = windowedMessages[i];
          humanMessages.push(humanMessage.content);
        }
        if (i + 1 < windowedMessages.length) {
          const aiMessage = windowedMessages[i + 1];
          aiMessages.push(aiMessage.content);
        }
      }
      
      result[this.inputKey] = humanMessages.join('\n');
      result[this.outputKey] = aiMessages.join('\n');
    }
    
    return result;
  }

  /**
   * Saves the context based on the input and output values.
   * @param inputValues - The input values.
   * @param outputValues - The output values.
   * @returns A promise that resolves when the context has been saved.
   */
  async saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void> {
    const humanContent = inputValues[this.inputKey];
    const aiContent = outputValues[this.outputKey];
    
    if (humanContent) {
      await this.chatHistory.addUserMessage(humanContent);
    }
    
    if (aiContent) {
      await this.chatHistory.addAIMessage(aiContent);
    }
  }

  /**
   * Adds a user message to the chat history.
   * @param content - The content of the user message.
   * @returns A promise that resolves when the message has been added.
   */
  async addUserMessage(content: string): Promise<void> {
    await this.chatHistory.addUserMessage(content);
  }

  /**
   * Adds an AI message to the chat history.
   * @param content - The content of the AI message.
   * @returns A promise that resolves when the message has been added.
   */
  async addAIMessage(content: string): Promise<void> {
    await this.chatHistory.addAIMessage(content);
  }

  /**
   * Gets all messages from the chat history.
   * @returns A promise that resolves with an array of BaseMessage objects.
   */
  async getMessages(): Promise<BaseMessage[]> {
    return this.chatHistory.getMessages();
  }

  /**
   * Clears all messages from the chat history.
   * @returns A promise that resolves when the chat history has been cleared.
   */
  async clear(): Promise<void> {
    await this.chatHistory.clear();
  }
}

/**
 * Creates a Redis-backed memory store for a specific session.
 * @param sessionId - The unique identifier for the conversation session.
 * @returns A RedisBufferWindowMemory instance backed by Redis, or null if Redis is not available.
 */
export const createRedisMemory = (sessionId: string): RedisBufferWindowMemory | null => {
  const redisClient = getRedisClient();
  
  if (!redisClient) {
    console.warn('Redis client not available. Cannot create Redis-backed memory.');
    return null;
  }
  
  try {
    const chatHistory = new RedisChatMessageHistory({
      sessionId,
      client: redisClient,
      sessionTTL: shortTermMemoryConfig.redisTTL,
    });
    
    return new RedisBufferWindowMemory({
      chatHistory,
      k: shortTermMemoryConfig.windowSize,
      inputKey: shortTermMemoryConfig.inputKey,
      outputKey: shortTermMemoryConfig.outputKey,
    });
  } catch (error) {
    console.error('Error creating Redis memory:', error);
    return null;
  }
};

/**
 * Adds a message pair to the Redis-backed conversation history for a given session.
 * Falls back to in-memory storage if Redis is not available.
 * @param sessionId - The unique identifier for the conversation session.
 * @param humanMessageContent - The content of the user's message.
 * @param aiMessageContent - The content of the AI's response.
 * @returns A promise that resolves when the messages have been added.
 */
export const addRedisMessagePair = async (
  sessionId: string,
  humanMessageContent: string,
  aiMessageContent: string
): Promise<void> => {
  if (!sessionId) {
    console.warn('Cannot store history without a session ID');
    return;
  }
  
  const memory = createRedisMemory(sessionId);
  
  if (!memory) {
    memoryService.addMessagePair(sessionId, humanMessageContent, aiMessageContent);
    return;
  }
  
  try {
    await memory.addUserMessage(humanMessageContent);
    await memory.addAIMessage(aiMessageContent);
    console.log(`[RedisMemoryService] Added messages for session ${sessionId}`);
  } catch (error) {
    console.error(`[RedisMemoryService] Error adding messages for session ${sessionId}:`, error);
    memoryService.addMessagePair(sessionId, humanMessageContent, aiMessageContent);
  }
};

/**
 * Retrieves the recent conversation history for a given session from Redis.
 * Falls back to in-memory storage if Redis is not available.
 * @param sessionId - The unique identifier for the conversation session.
 * @returns A promise that resolves to an array of BaseMessage objects or an empty array if no history exists.
 */
export const getRedisHistory = async (sessionId: string): Promise<BaseMessage[]> => {
  if (!sessionId) {
    return [];
  }
  
  const memory = createRedisMemory(sessionId);
  
  if (!memory) {
    return memoryService.getHistory(sessionId);
  }
  
  try {
    const messages = await memory.getMessages();
    console.log(`[RedisMemoryService] Retrieved history for session ${sessionId}. Length: ${messages.length}`);
    return messages;
  } catch (error) {
    console.error(`[RedisMemoryService] Error retrieving history for session ${sessionId}:`, error);
    return memoryService.getHistory(sessionId);
  }
};

/**
 * Clears the history for a specific session from Redis.
 * @param sessionId - The unique identifier for the conversation session.
 * @returns A promise that resolves when the history has been cleared.
 */
export const clearRedisHistory = async (sessionId: string): Promise<void> => {
  if (!sessionId) {
    return;
  }
  
  const memory = createRedisMemory(sessionId);
  
  if (!memory) {
    memoryService.clearHistory(sessionId);
    return;
  }
  
  try {
    await memory.clear();
    console.log(`[RedisMemoryService] Cleared history for session ${sessionId}.`);
  } catch (error) {
    console.error(`[RedisMemoryService] Error clearing history for session ${sessionId}:`, error);
    memoryService.clearHistory(sessionId);
  }
};
