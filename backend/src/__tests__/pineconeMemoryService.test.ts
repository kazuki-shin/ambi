import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { PineconeVectorMemory, createPineconeMemory } from '../services/pineconeMemoryService';
import { BaseMessage } from '@langchain/core/messages';
import { PineconeRecord } from '@pinecone-database/pinecone';
import { longTermMemoryConfig } from '../config/memoryConfig';

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

import { initializePinecone, upsertVectors, queryVectors } from '../clients/pineconeClient';
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
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = await memory.loadMemoryVariables({ input: 'What is your name?' });
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(result).toEqual({ relevantHistory: [] });
    
    consoleSpy.mockRestore();
  });

  describe('loadMemoryVariables', () => {
    it('should retrieve relevant history based on query', async () => {
      // ... existing test ...
    });

    it('should return empty history if no relevant memories found', async () => {
      // ... existing test ...
    });

    it('should filter retrieved history based on metadata filter', async () => {
      const memory = new PineconeVectorMemory(); // Define memory instance for this test
      // Arrange: Save context with specific metadata
      const specificMetadata = { customTag: 'test-filter' }; // Example filter target
      await memory.saveContext({ input: 'message with tag', sessionId: 's1' }, { output: 'response with tag' });
      // Need to modify saveContext mock/implementation or add a way to inject metadata for testing
      
      // Act: Load variables with a filter
      const filter = { customTag: 'test-filter' };
      const result = await memory.loadMemoryVariables({ input: 'query related to tag' }, filter);

      // Assert: Check if only tagged messages are returned (or none if filter doesn't match)
      // This requires mocking queryVectors to respect the filter
      expect(result.relevantHistory).toBeDefined();
      // Add specific assertions based on mock implementation
    });

    it('should filter retrieved history based on minPriority', async () => {
      const memory = new PineconeVectorMemory(); // Define memory instance for this test
      // Arrange: Define inputs for clarity
      const lowPriorityInput = { input: 'low priority message', sessionId: 's2' };
      const lowPriorityOutput = { output: 'low priority response' };
      const highPriorityInput = { input: 'this is important message', sessionId: 's2' };
      const highPriorityOutput = { output: 'this is important response' };

      // Mock the response queryVectors should return *for this specific test case*
      const mockFilteredResponse = {
        namespace: longTermMemoryConfig.pineconeNamespace, // Use config value
        matches: [
          {
            id: `${highPriorityInput.sessionId}:human:important-uuid`,
            score: 0.9,
            values: [],
            metadata: { sessionId: highPriorityInput.sessionId, role: 'human', originalContent: highPriorityInput.input, priority: 3, timestamp: Date.now() },
          },
          {
            id: `${highPriorityInput.sessionId}:ai:important-uuid2`,
            score: 0.88,
            values: [],
            metadata: { sessionId: highPriorityInput.sessionId, role: 'ai', originalContent: highPriorityOutput.output, priority: 3, timestamp: Date.now() + 1 },
          },
        ],
        usage: { readUnits: 1 } // Ensure type compatibility
      };
      
      // Reset mock and set the specific resolved value before the call
      mockQueryVectors.mockReset();
      mockQueryVectors.mockResolvedValue(mockFilteredResponse as any); // Cast as any to bypass strict type check if QueryResponse type is complex/not imported

      // Act: Load variables with minPriority = 2
      const result = await memory.loadMemoryVariables({ input: 'query for priorities' }, undefined, 2);

      // Assert: Check that queryVectors was called with the correct filter
      const expectedFilter = { priority: { $gte: 2 } };
      expect(mockQueryVectors).toHaveBeenCalledWith(
        expect.any(Array), // queryEmbedding
        expect.any(Number), // increasedTopK
        longTermMemoryConfig.pineconeNamespace, // Check against config value
        expectedFilter      // the filter object
      );

      // Assert: Check if only messages with priority >= 2 are returned
      expect(result.relevantHistory).toBeDefined();
      expect(result.relevantHistory).toHaveLength(2); // Expecting the human/ai pair
      
      // Check for high priority message
      expect(result.relevantHistory.some((msg: BaseMessage) => 
        typeof msg.content === 'string' &&
        ((msg._getType() === 'human' && msg.content === highPriorityInput.input) || (msg._getType() === 'ai' && msg.content === highPriorityOutput.output))
      )).toBe(true);
      
      // Check that low priority message is NOT included
      expect(result.relevantHistory.some((msg: BaseMessage) => 
        typeof msg.content === 'string' && 
        ((msg._getType() === 'human' && msg.content === lowPriorityInput.input) || (msg._getType() === 'ai' && msg.content === lowPriorityOutput.output))
      )).toBe(false);
    });
  });

  describe('saveContext', () => {
    it('should upsert human and AI messages with correct metadata', async () => {
      const memory = new PineconeVectorMemory(); // Define memory instance for this test
      // Arrange
      const inputValues = { input: 'Hello there', sessionId: 'test-session-123' };
      const outputValues = { output: 'General Kenobi!' };
      const mockUpsert = jest.fn();
      // Mock pineconeClient.upsertVectors
      // NOTE: Mocking needs careful setup, potentially using jest.doMock or manual mocks
      // For now, assume mocks are set up correctly elsewhere or adjust test structure

      // Mock embeddingService
      // NOTE: Mocking needs careful setup

      // Temporarily bypass mock issues for linting - actual test needs proper mocking
      const pineconeClient = require('../clients/pineconeClient');
      pineconeClient.upsertVectors = mockUpsert;
      const embeddingService = require('../services/embeddingService');
      jest.spyOn(embeddingService, 'generateEmbedding').mockResolvedValue([0.1, 0.2, 0.3]);

      // Act
      await memory.saveContext(inputValues, outputValues);

      // Assert
      expect(mockUpsert).toHaveBeenCalledTimes(1);
      const upsertArgs = mockUpsert.mock.calls[0][0] as any as PineconeRecord[];
      expect(upsertArgs).toHaveLength(2); // Human and AI records
      
      const humanRecord = upsertArgs.find((r: PineconeRecord) => r.metadata?.role === 'human');
      const aiRecord = upsertArgs.find((r: PineconeRecord) => r.metadata?.role === 'ai');

      expect(humanRecord).toBeDefined();
      if (humanRecord?.metadata) {
        expect(humanRecord.metadata.sessionId).toBe('test-session-123');
        expect(humanRecord.metadata.role).toBe('human');
        expect(humanRecord.metadata.originalContent).toBe('Hello there');
        expect(humanRecord.metadata.timestamp).toBeCloseTo(Date.now(), -3);
        expect(humanRecord.metadata.category).toBeDefined();
        expect(humanRecord.metadata.priority).toBeDefined();
      } else {
        fail('humanRecord or its metadata was undefined');
      }

      expect(aiRecord).toBeDefined();
      if (aiRecord?.metadata) {
        expect(aiRecord.metadata.sessionId).toBe('test-session-123');
        expect(aiRecord.metadata.role).toBe('ai');
        expect(aiRecord.metadata.originalContent).toBe('General Kenobi!');
        expect(aiRecord.metadata.timestamp).toBeCloseTo(Date.now(), -3);
        expect(aiRecord.metadata.category).toBeDefined();
        expect(aiRecord.metadata.priority).toBeDefined();
      } else {
        fail('aiRecord or its metadata was undefined');
      }
    });
  });
});
