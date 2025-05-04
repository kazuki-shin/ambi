import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { PineconeVectorMemory, createPineconeMemory } from '../services/pineconeMemoryService';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

jest.mock('../clients/pineconeClient', () => {
  return {
    initializePinecone: jest.fn(),
    upsertVectors: jest.fn().mockImplementation(() => Promise.resolve({ upsertedCount: 2 })),
    queryVectors: jest.fn()
  };
});

jest.mock('../services/embeddingService', () => {
  return {
    generateEmbedding: jest.fn().mockImplementation(() => Promise.resolve(new Array(1536).fill(0.1)))
  };
});

import { upsertVectors, queryVectors } from '../clients/pineconeClient';
import { generateEmbedding } from '../services/embeddingService';

const mockUpsertVectors = upsertVectors as jest.MockedFunction<typeof upsertVectors>;
const mockQueryVectors = queryVectors as jest.MockedFunction<typeof queryVectors>;

describe('Pinecone Memory Service', () => {
  const sessionId = 'test-session-123';
  const userMessage = 'Hello, how are you?';
  const aiMessage = 'I am doing well, thank you for asking!';
  
  const mockPineconeIndex = {
    upsert: jest.fn().mockImplementation(() => Promise.resolve({ upsertedCount: 2 })),
    query: jest.fn(),
  };
  
  const mockPineconeClient = {
    index: jest.fn().mockReturnValue(mockPineconeIndex),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    const { initializePinecone } = require('../clients/pineconeClient');
    (initializePinecone as jest.Mock).mockImplementation(() => Promise.resolve(mockPineconeClient));
    
    (generateEmbedding as jest.Mock).mockImplementation(() => Promise.resolve(new Array(1536).fill(0.1)));
  });
  
  test('createPineconeMemory should return a PineconeVectorMemory instance', async () => {
    const memory = await createPineconeMemory();
    
    expect(memory).toBeInstanceOf(PineconeVectorMemory);
    expect(memory).toHaveProperty('saveContext');
    expect(memory).toHaveProperty('loadMemoryVariables');
  });
  
  test('PineconeVectorMemory should save context to Pinecone', async () => {
    const saveContextSpy = jest.spyOn(PineconeVectorMemory.prototype, 'saveContext');
    mockUpsertVectors.mockClear();
    
    const memory = await createPineconeMemory();
    
    await memory.saveContext(
      { input: userMessage, sessionId },
      { output: aiMessage }
    );
    
    expect(generateEmbedding).toHaveBeenCalledTimes(2);
    
    expect(saveContextSpy).toHaveBeenCalledWith(
      { input: userMessage, sessionId },
      { output: aiMessage }
    );
    
    expect(upsertVectors).toHaveBeenCalled();
    
    saveContextSpy.mockRestore();
  });
  
  test('PineconeVectorMemory should load memory variables from Pinecone', async () => {
    const mockQueryResponse = {
      matches: [
        {
          id: `${sessionId}:${userMessage}`,
          score: 0.9,
          metadata: {
            sessionId,
            role: 'human',
          },
        },
        {
          id: `${sessionId}:${aiMessage}`,
          score: 0.85,
          metadata: {
            sessionId,
            role: 'ai',
          },
        },
      ],
    };
    
    (queryVectors as jest.Mock).mockImplementation(() => Promise.resolve(mockQueryResponse));
    
    const loadMemoryVariablesSpy = jest.spyOn(PineconeVectorMemory.prototype, 'loadMemoryVariables');
    
    const memory = await createPineconeMemory();
    const result = await memory.loadMemoryVariables({ input: 'What is your name?' });
    
    expect(generateEmbedding).toHaveBeenCalled();
    
    expect(loadMemoryVariablesSpy).toHaveBeenCalledWith({ input: 'What is your name?' });
    
    expect(queryVectors).toHaveBeenCalled();
    
    expect(result).toHaveProperty('relevantHistory');
    expect(Array.isArray(result.relevantHistory)).toBe(true);
    
    loadMemoryVariablesSpy.mockRestore();
  });
  
  test('PineconeVectorMemory should handle empty query results', async () => {
    (queryVectors as jest.Mock).mockImplementation(() => Promise.resolve({ matches: [] }));
    
    const memory = await createPineconeMemory();
    const result = await memory.loadMemoryVariables({ input: 'What is your name?' });
    
    expect(result).toHaveProperty('relevantHistory');
    expect(result.relevantHistory).toEqual([]);
  });
  
  test('PineconeVectorMemory should handle errors gracefully', async () => {
    (queryVectors as jest.Mock).mockImplementation(() => Promise.reject(new Error('Pinecone error')));
    
    const memory = await createPineconeMemory();
    
    await expect(memory.loadMemoryVariables({ input: 'What is your name?' }))
      .resolves.toEqual({ relevantHistory: [] });
  });
});
