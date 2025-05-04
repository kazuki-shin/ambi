import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { PineconeVectorMemory, createPineconeMemory } from '../services/pineconeMemoryService';
import { BaseMessage } from '@langchain/core/messages';
import { PineconeRecord, QueryResponse, RecordMetadata } from '@pinecone-database/pinecone';
import { longTermMemoryConfig } from '../config/memoryConfig';

// Remove external mock function definitions
// const mockInitializePinecone = jest.fn();
// const mockUpsertVectorsFn = jest.fn().mockResolvedValue({ upsertedCount: 2 }); 
// const mockQueryVectorsFn = jest.fn().mockResolvedValue({ namespace: 'mock-ns', matches: [], usage: { readUnits: 0 } });
// const mockDeleteAllVectors = jest.fn();
// const mockGenerateEmbeddingFn = jest.fn().mockResolvedValue(new Array(1536).fill(0.1)); 

jest.mock('../clients/pineconeClient', () => ({
  // Define mocks directly inline with explicit types
  initializePinecone: jest.fn(),
  upsertVectors: jest.fn<() => Promise<{ upsertedCount: number }>>().mockResolvedValue({ upsertedCount: 2 }), 
  queryVectors: jest.fn<() => Promise<QueryResponse>>().mockResolvedValue({ namespace: 'mock-ns', matches: [], usage: { readUnits: 0 } }),
  deleteAllVectors: jest.fn(),
}));

jest.mock('../services/embeddingService', () => ({
  // Define mock directly inline with explicit type
  generateEmbedding: jest.fn<() => Promise<number[]>>().mockResolvedValue(new Array(1536).fill(0.1))
}));

// Import the mocked functions AFTER jest.mock calls
// These imports now refer to the inline mocks
import { initializePinecone, upsertVectors, queryVectors, deleteAllVectors } from '../clients/pineconeClient';
import { generateEmbedding } from '../services/embeddingService';

// Cast the imported mocks to Jest MockedFunction type
// These should now correctly reference the mocks defined above
const _mockInitializePinecone = initializePinecone as jest.MockedFunction<typeof initializePinecone>; // Added cast & underscore
const mockUpsertVectors = upsertVectors as jest.MockedFunction<typeof upsertVectors>;
const mockQueryVectors = queryVectors as jest.MockedFunction<typeof queryVectors>;
const _mockDeleteAllVectors = deleteAllVectors as jest.MockedFunction<typeof deleteAllVectors>; // Added cast & underscore
const mockGenerateEmbedding = generateEmbedding as jest.MockedFunction<typeof generateEmbedding>;

describe('Pinecone Memory Service', () => {
  const sessionId = 'test-session-123';
  const userMessage = 'Hello, how are you?';
  const aiMessage = 'I am doing well, thank you for asking!';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks to default defined in jest.mock
    mockQueryVectors.mockResolvedValue({ namespace: 'mock-ns', matches: [], usage: { readUnits: 0 } });
    mockUpsertVectors.mockResolvedValue({ upsertedCount: 2 });
    mockGenerateEmbedding.mockResolvedValue(new Array(1536).fill(0.1));
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
    
    expect(mockGenerateEmbedding).toHaveBeenCalledTimes(2);
    
    expect(saveContextSpy).toHaveBeenCalledWith(
      { input: userMessage, sessionId },
      { output: aiMessage }
    );
    
    expect(mockUpsertVectors).toHaveBeenCalled();
    
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
    
    expect(mockGenerateEmbedding).toHaveBeenCalled();
    
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
      const memory = new PineconeVectorMemory();
      // Mock response for this specific test
      const mockMetadataResponse: QueryResponse<RecordMetadata> = {
        namespace: longTermMemoryConfig.pineconeNamespace,
        matches: [
          { id: 'tagged-id', score: 0.8, values: [], metadata: { sessionId: 's1', role: 'human', originalContent: 'message with tag', customTag: 'test-filter' } }
        ],
        usage: { readUnits: 1 }
      };
      mockQueryVectors.mockResolvedValue(mockMetadataResponse);

      // Act: Load variables with a filter
      const filter = { customTag: 'test-filter' };
      const result = await memory.loadMemoryVariables({ input: 'query related to tag' }, filter);

      // Assert: Check queryVectors called with filter and result is filtered
      expect(mockQueryVectors).toHaveBeenCalledWith(expect.any(Array), expect.any(Number), expect.any(String), filter);
      expect(result.relevantHistory).toBeDefined();
      expect(result.relevantHistory).toHaveLength(1); // Only the tagged message pair should be processed (assuming pair logic)
      // Add more specific assertions based on how pair logic works
    });

    it('should filter retrieved history based on minPriority', async () => {
      const memory = new PineconeVectorMemory();
      const lowPriorityInput = { input: 'low priority message', sessionId: 's2' };
      const lowPriorityOutput = { output: 'low priority response' };
      const highPriorityInput = { input: 'this is important message', sessionId: 's2' };
      const highPriorityOutput = { output: 'this is important response' };

      // Mock the response queryVectors should return *for this specific test case*
      const mockFilteredResponse: QueryResponse<RecordMetadata> = { 
        namespace: longTermMemoryConfig.pineconeNamespace,
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
        usage: { readUnits: 1 }
      };
      
      mockQueryVectors.mockReset(); // Reset needed if beforeEach default isn't desired
      mockQueryVectors.mockResolvedValue(mockFilteredResponse);

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
      const memory = new PineconeVectorMemory();
      const inputValues = { input: 'Hello there', sessionId: 'test-session-123' };
      const outputValues = { output: 'General Kenobi!' };
      
      // Reset mocks used in this test before acting
      mockGenerateEmbedding.mockClear();
      mockUpsertVectors.mockClear();
      mockGenerateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]); // Set desired mock behaviour
      mockUpsertVectors.mockResolvedValue({ upsertedCount: 2 });

      // Act
      await memory.saveContext(inputValues, outputValues);

      // Assert
      expect(mockGenerateEmbedding).toHaveBeenCalledTimes(2);
      expect(mockUpsertVectors).toHaveBeenCalledTimes(1);
      const upsertArgs = mockUpsertVectors.mock.calls[0][0] as PineconeRecord[];
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
        throw new Error('humanRecord or its metadata was undefined');
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
        throw new Error('aiRecord or its metadata was undefined');
      }
    });
  });
});
