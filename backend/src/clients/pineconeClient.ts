import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { longTermMemoryConfig } from '../config/memoryConfig';

dotenv.config();

let pinecone: Pinecone | null = null;
let indexName: string | null = null;

/**
 * Initializes the Pinecone client.
 * NOTE: In Phase 1, this is just a stub and doesn't actually connect.
 */
export const initializePinecone = async () => {
  if (pinecone) {
    console.log('Pinecone client already initialized.');
    return pinecone;
  }

  const apiKey = process.env.PINECONE_API_KEY || '';
  indexName = process.env.PINECONE_INDEX_NAME || '';

  if (!apiKey || !indexName) {
    console.warn('PINECONE_API_KEY or PINECONE_INDEX_NAME not found in environment variables. Pinecone functions will be disabled.');
    return null;
  }

  if (process.env.NODE_ENV === 'test') {
    console.log('Test environment detected. Using mock Pinecone client.');
    return createMockPineconeClient();
  }

  try {
    console.log('Initializing Pinecone client...');
    pinecone = new Pinecone({ apiKey });
    console.log('Pinecone client initialized.');
    return pinecone;
  } catch (error) {
    console.error('Error initializing Pinecone client:', error);
    return null;
  }
};

/**
 * Creates a mock Pinecone client for testing.
 */
const createMockPineconeClient = () => {
  const mockVectors: Record<string, PineconeRecord> = {};
  
  const mockClient = {
    index: (name: string) => ({
      namespace: (namespace: string) => ({
        upsert: async (records: PineconeRecord[]) => {
          for (const record of records) {
            const key = `${namespace}:${record.id}`;
            mockVectors[key] = record;
          }
          return { upsertedCount: records.length };
        },
        query: async ({ vector, topK, filter }: { vector: number[], topK: number, filter?: Record<string, any> }) => {
          const results = Object.entries(mockVectors)
            .filter(([key]) => key.startsWith(`${namespace}:`))
            .filter(([_, record]) => {
              if (!filter) return true;
              for (const [filterKey, filterValue] of Object.entries(filter)) {
                if (record.metadata && record.metadata[filterKey] !== filterValue) {
                  return false;
                }
              }
              return true;
            })
            .map(([_, record]) => {
              const similarity = record.values ? 
                record.values.reduce((sum, val, i) => sum + val * vector[i], 0) : 0;
              return { id: record.id, score: similarity, metadata: record.metadata };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
          
          return { matches: results };
        },
        deleteAll: async () => {
          for (const key of Object.keys(mockVectors)) {
            if (key.startsWith(`${namespace}:`)) {
              delete mockVectors[key];
            }
          }
          return { deletedCount: 0 };
        }
      })
    })
  };
  
  return mockClient as unknown as Pinecone;
};

/**
 * Upserts vectors to Pinecone.
 * @param records - Array of PineconeRecord objects to upsert.
 * @param namespace - The namespace to upsert the vectors to.
 * @returns A promise that resolves with the upsert response.
 */
export const upsertVectors = async (
  records: PineconeRecord[],
  namespace: string = longTermMemoryConfig.pineconeNamespace
) => {
  const client = pinecone || await initializePinecone();
  
  if (!client || !indexName) {
    console.warn('Pinecone not initialized. Cannot upsert vectors.');
    return null;
  }
  
  try {
    console.log(`Upserting ${records.length} vectors to Pinecone namespace ${namespace}...`);
    const index = client.index(indexName);
    const response = await index.namespace(namespace).upsert(records);
    console.log(`Upserted vectors to Pinecone namespace ${namespace}.`);
    return { upsertedCount: records.length };
  } catch (error) {
    console.error('Error upserting vectors to Pinecone:', error);
    return null;
  }
};

/**
 * Queries vectors from Pinecone.
 * @param vector - The query vector.
 * @param topK - The number of results to return.
 * @param namespace - The namespace to query.
 * @param filter - Optional metadata filter.
 * @returns A promise that resolves with the query response.
 */
export const queryVectors = async (
  vector: number[],
  topK: number = longTermMemoryConfig.maxResults,
  namespace: string = longTermMemoryConfig.pineconeNamespace,
  filter?: Record<string, any>
) => {
  const client = pinecone || await initializePinecone();
  
  if (!client || !indexName) {
    console.warn('Pinecone not initialized. Cannot query vectors.');
    return null;
  }
  
  try {
    console.log(`Querying Pinecone namespace ${namespace} for top ${topK} results...`);
    const index = client.index(indexName);
    const queryResponse = await index.namespace(namespace).query({
      vector,
      topK,
      filter,
      includeMetadata: true,
    });
    
    console.log(`Found ${queryResponse.matches.length} matches in Pinecone.`);
    return queryResponse;
  } catch (error) {
    console.error('Error querying vectors from Pinecone:', error);
    return null;
  }
};

/**
 * Deletes all vectors from a namespace.
 * @param namespace - The namespace to delete vectors from.
 * @returns A promise that resolves when the vectors have been deleted.
 */
export const deleteAllVectors = async (namespace: string = longTermMemoryConfig.pineconeNamespace) => {
  const client = pinecone || await initializePinecone();
  
  if (!client || !indexName) {
    console.warn('Pinecone not initialized. Cannot delete vectors.');
    return null;
  }
  
  try {
    console.log(`Deleting all vectors from Pinecone namespace ${namespace}...`);
    const index = client.index(indexName);
    const response = await index.namespace(namespace).deleteAll();
    console.log(`Deleted vectors from Pinecone namespace ${namespace}.`);
    return response;
  } catch (error) {
    console.error('Error deleting vectors from Pinecone:', error);
    return null;
  }
};            