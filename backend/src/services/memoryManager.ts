import { BaseMessage } from '@langchain/core/messages';
import { addRedisMessagePair, getRedisHistory, clearRedisHistory } from './redisMemoryService';
import { createPineconeMemory } from './pineconeMemoryService';
import { } from '../config/memoryConfig';

/**
 * Memory Manager Service
 * 
 * This service coordinates both short-term (Redis) and long-term (Pinecone) memory systems.
 * It provides a unified interface for storing and retrieving conversation history,
 * with automatic persistence and semantic search capabilities.
 */

/**
 * Adds a message pair to both short-term and long-term memory.
 * @param sessionId - The unique identifier for the conversation session.
 * @param humanMessageContent - The content of the user's message.
 * @param aiMessageContent - The content of the AI's response.
 * @returns A promise that resolves when the messages have been added to both memory systems.
 */
export const addToMemory = async (
  sessionId: string,
  humanMessageContent: string,
  aiMessageContent: string
): Promise<void> => {
  if (!sessionId) {
    console.warn('[MemoryManager] Cannot store history without a session ID');
    return;
  }
  
  try {
    await addRedisMessagePair(sessionId, humanMessageContent, aiMessageContent);
    
    const longTermMemory = createPineconeMemory(sessionId);
    await longTermMemory.saveContext(
      { input: humanMessageContent, sessionId },
      { output: aiMessageContent }
    );
    
    console.log(`[MemoryManager] Added messages to both memory systems for session ${sessionId}`);
  } catch (error) {
    console.error(`[MemoryManager] Error adding messages to memory:`, error);
    await addRedisMessagePair(sessionId, humanMessageContent, aiMessageContent);
  }
};

/**
 * Retrieves the recent conversation history from short-term memory.
 * @param sessionId - The unique identifier for the conversation session.
 * @returns A promise that resolves to an array of BaseMessage objects.
 */
export const getRecentHistory = async (sessionId: string): Promise<BaseMessage[]> => {
  if (!sessionId) {
    return [];
  }
  
  try {
    return await getRedisHistory(sessionId);
  } catch (error) {
    console.error(`[MemoryManager] Error retrieving recent history:`, error);
    return [];
  }
};

/**
 * Retrieves relevant memories from long-term memory based on the current query.
 * @param sessionId - The unique identifier for the conversation session.
 * @param query - The current user query to find relevant memories for.
 * @returns A promise that resolves to an array of BaseMessage objects.
 */
export const getRelevantMemories = async (
  sessionId: string,
  query: string
): Promise<BaseMessage[]> => {
  if (!sessionId || !query) {
    return [];
  }
  
  try {
    const longTermMemory = createPineconeMemory(sessionId);
    if (!longTermMemory) {
      console.warn('[MemoryManager Debug] Failed to create Pinecone memory instance.');
      return [];
    }
    
    const relevantHistoryResult = await longTermMemory.loadMemoryVariables({ input: query });

    console.log(`[MemoryManager Debug] Pinecone retrieval results for query "${query.substring(0, 50)}...":`, JSON.stringify(relevantHistoryResult, null, 2));
    const retrievedDocs = relevantHistoryResult.relevantHistory || [];
    const relevantMessages: BaseMessage[] = Array.isArray(retrievedDocs) ? retrievedDocs.filter(doc => doc instanceof BaseMessage) : [];
    console.log(`[MemoryManager Debug] Found ${relevantMessages.length} potentially relevant BaseMessage documents via Pinecone.`);
    
    return relevantMessages;
  } catch (error) {
    console.error(`[MemoryManager] Error retrieving relevant memories:`, error);
    return [];
  }
};

/**
 * Builds a complete context for the AI by combining recent history and relevant memories.
 * @param sessionId - The unique identifier for the conversation session.
 * @param currentQuery - The current user query.
 * @returns A promise that resolves to an array of BaseMessage objects.
 */
export const buildMemoryContext = async (
  sessionId: string,
  currentQuery: string
): Promise<BaseMessage[]> => {
  if (!sessionId) {
    return [];
  }
  
  try {
    const recentHistory = await getRecentHistory(sessionId);
    console.log(`[MemoryManager] Retrieved ${recentHistory.length} recent messages.`);
    
    const relevantMemories = await getRelevantMemories(sessionId, currentQuery);
    
    const combinedMessages: BaseMessage[] = [];
    const processedMemoryIds = new Set<string>();

    relevantMemories.forEach(mem => {
      const memoryId = JSON.stringify(mem);
      if (!processedMemoryIds.has(memoryId)) {
        combinedMessages.push(mem);
        processedMemoryIds.add(memoryId);
      }
    });

    recentHistory.forEach(msg => {
      const messageId = JSON.stringify(msg);
      if (!processedMemoryIds.has(messageId)) {
        combinedMessages.push(msg);
        processedMemoryIds.add(messageId);
      }
    });

    const maxContextMessages = 10;
    const finalMessages = combinedMessages.slice(-maxContextMessages);

    console.log(`[MemoryManager] Built context with ${recentHistory.length} recent messages and ${relevantMemories.length} relevant memories.`);
    
    console.log(`[MemoryManager Debug] Final context messages being sent to LLM (Count: ${finalMessages.length}):`);
    const relevantMemorySet = new Set(relevantMemories.map(mem => JSON.stringify(mem)));
    finalMessages.forEach((msg, index) => {
      const msgId = JSON.stringify(msg);
      const origin = relevantMemorySet.has(msgId) ? 'Pinecone (LTM)' : 'Redis (STM)';
      console.log(`  [${index}] Origin: ${origin}, Type: ${msg._getType()}, Content: "${String(msg.content).substring(0, 70)}..."`);
    });

    return finalMessages;
  } catch (error) {
    console.error(`[MemoryManager] Error building memory context:`, error);
    return getRecentHistory(sessionId);
  }
};

/**
 * Clears all memory for a specific session.
 * @param sessionId - The unique identifier for the conversation session.
 * @returns A promise that resolves when the memory has been cleared.
 */
export const clearMemory = async (sessionId: string): Promise<void> => {
  if (!sessionId) {
    return;
  }
  
  try {
    await clearRedisHistory(sessionId);
    
    console.log(`[MemoryManager] Cleared memory for session ${sessionId}`);
  } catch (error) {
    console.error(`[MemoryManager] Error clearing memory:`, error);
  }
};
