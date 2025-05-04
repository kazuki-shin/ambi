import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { BaseMemory, InputValues, OutputValues, MemoryVariables } from '@langchain/core/memory';
import { PineconeRecord } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';
import { longTermMemoryConfig, categorizationConfig } from '../config/memoryConfig';
import { upsertVectors, queryVectors } from '../clients/pineconeClient';
import { generateEmbedding } from './embeddingService';

/**
 * Pinecone-backed implementation of long-term memory using vector embeddings.
 * This service provides semantic search and retrieval of past conversations.
 */

/**
 * Interface for memory entry metadata.
 */
interface MemoryEntryMetadata {
  sessionId: string;
  timestamp: number;
  role: 'human' | 'ai';
  category?: string;
  priority?: number;
  tags?: string[];
}

/**
 * Custom implementation of a vector store memory that uses Pinecone for storage.
 * This class provides semantic search and retrieval of past conversations.
 */
export class PineconeVectorMemory extends BaseMemory {
  private namespace: string;
  private inputKey: string;
  private outputKey: string;
  private relevanceThreshold: number;
  private maxResults: number;
  
  constructor({
    namespace = longTermMemoryConfig.pineconeNamespace,
    inputKey = 'input',
    outputKey = 'output',
    relevanceThreshold = longTermMemoryConfig.relevanceThreshold,
    maxResults = longTermMemoryConfig.maxResults,
  } = {}) {
    super();
    this.namespace = namespace;
    this.inputKey = inputKey;
    this.outputKey = outputKey;
    this.relevanceThreshold = relevanceThreshold;
    this.maxResults = maxResults;
  }
  
  get memoryKeys(): string[] {
    return [this.inputKey, this.outputKey];
  }
  
  /**
   * Loads memory variables based on the input values.
   * @param values - The input values.
   * @returns A promise that resolves with the memory variables.
   */
  async loadMemoryVariables(values: InputValues): Promise<MemoryVariables> {
    const query = values[this.inputKey] as string;
    
    if (!query) {
      return { relevantHistory: [] };
    }
    
    try {
      const queryEmbedding = await generateEmbedding(query);
      
      const results = await queryVectors(
        queryEmbedding,
        this.maxResults,
        this.namespace
      );
      
      if (!results || !results.matches.length) {
        return { relevantHistory: [] };
      }
      
      const relevantMatches = results.matches.filter(
        match => match.score && match.score >= this.relevanceThreshold
      );
      
      if (!relevantMatches.length) {
        return { relevantHistory: [] };
      }
      
      const messages: BaseMessage[] = relevantMatches.map(match => {
        const metadata = match.metadata as Record<string, any>;
        const content = match.id.split(':')[1]; // Extract content from ID
        
        if (metadata && metadata.role === 'human') {
          return new HumanMessage(content);
        } else {
          return new AIMessage(content);
        }
      });
      
      console.log(`[PineconeMemoryService] Retrieved ${messages.length} relevant memories.`);
      return { relevantHistory: messages };
    } catch (error) {
      console.error('[PineconeMemoryService] Error loading memory variables:', error);
      return { relevantHistory: [] };
    }
  }
  
  /**
   * Saves the context based on the input and output values.
   * @param inputValues - The input values.
   * @param outputValues - The output values.
   * @returns A promise that resolves when the context has been saved.
   */
  async saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void> {
    const humanContent = inputValues[this.inputKey] as string;
    const aiContent = outputValues[this.outputKey] as string;
    
    if (!humanContent || !aiContent) {
      return;
    }
    
    try {
      const [humanEmbedding, aiEmbedding] = await Promise.all([
        generateEmbedding(humanContent),
        generateEmbedding(aiContent)
      ]);
      
      const sessionId = inputValues.sessionId as string || uuidv4();
      
      const humanCategory = categorizeMessage(humanContent);
      const aiCategory = categorizeMessage(aiContent);
      
      const humanRecord: PineconeRecord = {
        id: `${sessionId}:${humanContent}`,
        values: humanEmbedding,
        metadata: {
          sessionId,
          timestamp: Date.now(),
          role: 'human',
          category: humanCategory,
          priority: getPriorityLevel(humanContent),
        },
      };
      
      const aiRecord: PineconeRecord = {
        id: `${sessionId}:${aiContent}`,
        values: aiEmbedding,
        metadata: {
          sessionId,
          timestamp: Date.now(),
          role: 'ai',
          category: aiCategory,
          priority: getPriorityLevel(aiContent),
        },
      };
      
      await upsertVectors([humanRecord, aiRecord], this.namespace);
      console.log(`[PineconeMemoryService] Saved conversation to long-term memory.`);
    } catch (error) {
      console.error('[PineconeMemoryService] Error saving context:', error);
    }
  }
  
  /**
   * Clears all memories from the vector store.
   * @returns A promise that resolves when the memories have been cleared.
   */
  async clear(): Promise<void> {
    try {
      const { deleteAllVectors } = require('../clients/pineconeClient');
      await deleteAllVectors(this.namespace);
      console.log(`[PineconeMemoryService] Cleared all memories from namespace ${this.namespace}.`);
    } catch (error) {
      console.error(`[PineconeMemoryService] Error clearing memories:`, error);
    }
  }
}

/**
 * Creates a Pinecone-backed vector memory for semantic search and retrieval.
 * @param sessionId - Optional session ID to associate with the memory.
 * @returns A PineconeVectorMemory instance.
 */
export const createPineconeMemory = (sessionId?: string): PineconeVectorMemory => {
  return new PineconeVectorMemory();
};

/**
 * Simple categorization function for messages.
 * In a real implementation, this would use more sophisticated NLP techniques.
 * @param content - The message content to categorize.
 * @returns The category of the message.
 */
const categorizeMessage = (content: string): string => {
  const lowerContent = content.toLowerCase();
  const categories = categorizationConfig.categories;
  
  if (lowerContent.includes('name') || lowerContent.includes('call me') || lowerContent.includes('my name is')) {
    return categories[0]; // personal_info
  }
  
  if (lowerContent.includes('like') || lowerContent.includes('prefer') || lowerContent.includes('favorite')) {
    return categories[1]; // preferences
  }
  
  if (lowerContent.includes('family') || lowerContent.includes('parent') || 
      lowerContent.includes('child') || lowerContent.includes('sister') || 
      lowerContent.includes('brother') || lowerContent.includes('spouse')) {
    return categories[2]; // family
  }
  
  if (lowerContent.includes('health') || lowerContent.includes('sick') || 
      lowerContent.includes('doctor') || lowerContent.includes('pain')) {
    return categories[3]; // health
  }
  
  if (lowerContent.includes('event') || lowerContent.includes('meeting') || 
      lowerContent.includes('appointment') || lowerContent.includes('schedule')) {
    return categories[4]; // events
  }
  
  return categories[5]; // general
};

/**
 * Determines the priority level of a message based on its content.
 * @param content - The message content to analyze.
 * @returns The priority level (1-3).
 */
const getPriorityLevel = (content: string): number => {
  const lowerContent = content.toLowerCase();
  const { priorityLevels } = categorizationConfig;
  
  if (lowerContent.includes('name') || lowerContent.includes('address') || 
      lowerContent.includes('phone') || lowerContent.includes('email') ||
      lowerContent.includes('birthday') || lowerContent.includes('important')) {
    return priorityLevels.high;
  }
  
  if (lowerContent.includes('like') || lowerContent.includes('prefer') || 
      lowerContent.includes('event') || lowerContent.includes('meeting') ||
      lowerContent.includes('remember') || lowerContent.includes('don\'t forget')) {
    return priorityLevels.medium;
  }
  
  return priorityLevels.low;
};
