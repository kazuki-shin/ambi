import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

// Simple in-memory store for conversation histories, keyed by sessionId
// NOTE: This is a basic stub for Phase 1. It's not persistent and has limited capacity.
const conversationHistories: Record<string, BaseMessage[]> = {};

const MAX_HISTORY_LENGTH = 10; // Keep only the last 5 pairs (10 messages)

/**
 * Adds a message pair to the conversation history for a given session.
 * @param sessionId - The unique identifier for the conversation session.
 * @param humanMessageContent - The content of the user's message.
 * @param aiMessageContent - The content of the AI's response.
 */
export const addMessagePair = (
  sessionId: string,
  humanMessageContent: string,
  aiMessageContent: string
): void => {
  if (!sessionId) return; // Cannot store history without a session ID

  if (!conversationHistories[sessionId]) {
    conversationHistories[sessionId] = [];
  }

  const history = conversationHistories[sessionId];
  history.push(new HumanMessage(humanMessageContent));
  history.push(new AIMessage(aiMessageContent));

  // Keep history length manageable
  if (history.length > MAX_HISTORY_LENGTH) {
    conversationHistories[sessionId] = history.slice(-MAX_HISTORY_LENGTH);
  }

  console.log(`[MemoryService] Added messages for session ${sessionId}. History length: ${conversationHistories[sessionId].length}`);
};

/**
 * Retrieves the recent conversation history for a given session.
 * @param sessionId - The unique identifier for the conversation session.
 * @returns An array of BaseMessage objects or an empty array if no history exists.
 */
export const getHistory = (sessionId: string): BaseMessage[] => {
  if (!sessionId || !conversationHistories[sessionId]) {
    return [];
  }
  console.log(`[MemoryService] Retrieved history for session ${sessionId}. Length: ${conversationHistories[sessionId].length}`);
  return conversationHistories[sessionId];
};

/**
 * Clears the history for a specific session (e.g., on user logout or session timeout).
 * @param sessionId - The unique identifier for the conversation session.
 */
export const clearHistory = (sessionId: string): void => {
  if (conversationHistories[sessionId]) {
    delete conversationHistories[sessionId];
    console.log(`[MemoryService] Cleared history for session ${sessionId}.`);
  }
}; 