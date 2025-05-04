/**
 * Configuration for the memory system.
 * This file contains settings for both short-term (Redis) and long-term (Pinecone) memory.
 */

export const shortTermMemoryConfig = {
  windowSize: 10,
  
  redisKeyPrefix: 'ambi:memory:short-term:',
  
  redisTTL: 60 * 60 * 24 * 7,
  
  inputKey: 'input',
  outputKey: 'output',
};

export const longTermMemoryConfig = {
  pineconeNamespace: 'ambi-memory',
  
  embeddingModel: 'text-embedding-ada-002',
  
  embeddingDimension: 1536,
  
  maxResults: 5,
  
  relevanceThreshold: 0.7,
};

export const categorizationConfig = {
  categories: [
    'personal_info',
    'preferences',
    'family',
    'health',
    'events',
    'general',
  ],
  
  priorityLevels: {
    high: 3,
    medium: 2,
    low: 1,
  },
};

export const summarizationConfig = {
  maxConversationLength: 20,
  
  maxSummaryLength: 100,
};
