import { describe, expect, test, jest, beforeEach, afterAll } from '@jest/globals';
import * as embeddingService from '../services/embeddingService';
import { OpenAIEmbeddings } from '@langchain/openai';

const originalEnv = process.env;

jest.mock('@langchain/openai', () => {
  return {
    OpenAIEmbeddings: jest.fn().mockImplementation(() => {
      return {
        embedQuery: jest.fn().mockImplementation(() => Promise.resolve(new Array(1536).fill(0.1))),
        embedDocuments: jest.fn().mockImplementation(() => Promise.resolve([
          new Array(1536).fill(0.1),
          new Array(1536).fill(0.1)
        ]))
      };
    })
  };
});

describe('Embedding Service', () => {
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    
    console.error = jest.fn();
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  });

  test('initializeEmbeddings should return OpenAIEmbeddings when API key is available', () => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    const embeddings = embeddingService.initializeEmbeddings();
    
    expect(embeddings).toBeDefined();
    expect(OpenAIEmbeddings).toHaveBeenCalled();
  });

  test('initializeEmbeddings should return mock embeddings when API key is missing', () => {
    delete process.env.OPENAI_API_KEY;
    
    jest.resetModules();
    
    const freshEmbeddingService = require('../services/embeddingService');
    const embeddings = freshEmbeddingService.initializeEmbeddings();
    
    expect(embeddings).toBeDefined();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('OPENAI_API_KEY not found')
    );
  });

  test('generateEmbeddings should create embeddings for text array', async () => {
    const texts = ['Test query 1', 'Test query 2'];
    
    const result = await embeddingService.generateEmbeddings(texts);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  test('generateEmbedding should create embeddings for text', async () => {
    const text = 'Test query for embedding';
    
    const result = await embeddingService.generateEmbedding(text);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1536);
  });

  test('generateEmbedding should handle empty text', async () => {
    const text = '';
    
    const result = await embeddingService.generateEmbedding(text);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test('generateEmbedding should handle errors gracefully', async () => {
    jest.resetModules();
    
    const freshEmbeddingService = require('../services/embeddingService');
    
    const mockEmbeddings = {
      embedQuery: jest.fn().mockImplementation((): Promise<number[]> => {
        return Promise.reject(new Error('API Error'));
      }),
      embedDocuments: jest.fn().mockImplementation((): Promise<number[][]> => {
        return Promise.reject(new Error('API Error'));
      })
    };
    
    jest.spyOn(freshEmbeddingService, 'initializeEmbeddings').mockReturnValue(mockEmbeddings as unknown as OpenAIEmbeddings);
    
    const text = 'Test query that will cause an error';
    const result = await freshEmbeddingService.generateEmbedding(text);
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error generating embedding:'),
      expect.any(Error)
    );
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
