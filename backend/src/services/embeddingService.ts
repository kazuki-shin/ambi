import { OpenAIEmbeddings } from '@langchain/openai';
import { longTermMemoryConfig } from '../config/memoryConfig';
import tracer from '../tracer'; // Import Datadog tracer

/**
 * Service for generating embeddings for text using OpenAI's embedding models.
 * These embeddings are used for semantic search and retrieval in the long-term memory system.
 */

let embeddingsModel: OpenAIEmbeddings | null = null;

/**
 * Initializes the embeddings model.
 * @returns The initialized OpenAIEmbeddings instance.
 */
export const initializeEmbeddings = (): OpenAIEmbeddings => {
  if (embeddingsModel) {
    return embeddingsModel;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not found in environment variables. Using mock embeddings.');
    return createMockEmbeddings();
  }

  try {
    embeddingsModel = new OpenAIEmbeddings({
      modelName: longTermMemoryConfig.embeddingModel,
      openAIApiKey: apiKey,
    });
    
    console.log('Embeddings model initialized.');
    return embeddingsModel;
  } catch (error) {
    console.error('Error initializing embeddings model:', error);
    return createMockEmbeddings();
  }
};

/**
 * Creates a mock embeddings model for testing or when OpenAI API is not available.
 * @returns A mock OpenAIEmbeddings instance.
 */
const createMockEmbeddings = (): OpenAIEmbeddings => {
  const mockEmbeddings = {
    embedDocuments: async (texts: string[]): Promise<number[][]> => {
      return texts.map(text => generateMockEmbedding(text, longTermMemoryConfig.embeddingDimension));
    },
    embedQuery: async (text: string): Promise<number[]> => {
      return generateMockEmbedding(text, longTermMemoryConfig.embeddingDimension);
    },
  } as unknown as OpenAIEmbeddings;

  console.log('Using mock embeddings model.');
  return mockEmbeddings;
};

/**
 * Generates a mock embedding vector for a text string.
 * @param text - The text to generate an embedding for.
 * @param dimensions - The number of dimensions for the embedding vector.
 * @returns An array of numbers representing the embedding vector.
 */
const generateMockEmbedding = (text: string, dimensions: number): number[] => {
  const embedding = new Array(dimensions).fill(0);
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const position = i % dimensions;
    embedding[position] += charCode / 1000; // Scale down to get small values
  }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (magnitude || 1));
};

/**
 * Generates embeddings for an array of texts.
 * @param texts - Array of text strings to generate embeddings for.
 * @returns A promise that resolves to an array of embedding vectors.
 */
export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  if (!texts.length) {
    return [];
  }
  
  const embeddings = embeddingsModel || initializeEmbeddings();
  const modelName = longTermMemoryConfig.embeddingModel;

  const parentSpan = tracer.scope().active();
  const span = parentSpan ? tracer.startSpan('openai.embeddings', { childOf: parentSpan }) : tracer.startSpan('openai.embeddings');

  span.setTag('span.kind', 'client');
  span.setTag('llm', true);
  span.setTag('llm.request.type', 'embedding');
  span.setTag('llm.request.model', modelName);
  // Tagging multiple inputs can be large; consider summarizing or tagging only the count
  span.setTag('llm.input_count', texts.length);
  // Optionally tag a sample or summarized version of inputs if needed and feasible
  // span.setTag('llm.input_sample', JSON.stringify(texts.slice(0, 1))); 

  try {
    console.log(`Generating embeddings for ${texts.length} texts...`);
    const vectors = await embeddings.embedDocuments(texts);
    console.log(`Generated ${vectors.length} embeddings.`);

    // Add response tags (token usage often not directly available from LangChain wrappers)
    span.setTag('llm.response.vector_count', vectors.length);
    span.setTag('llm.response.model', modelName); // Assuming request model is response model for embeddings

    span.finish();
    return vectors;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    if (error instanceof Error) {
      span.setTag('error.message', error.message);
      span.setTag('error.stack', error.stack);
      span.setTag('error.type', error.name);
    } else {
      span.setTag('error.message', String(error));
    }
    span.setTag('error', true);
    span.finish();
    // Re-throwing or using mock might hide the error trace, consider returning error/empty
    // Using mock as per original code:
    const mockEmbeddings = createMockEmbeddings();
    return mockEmbeddings.embedDocuments(texts);
  }
};

/**
 * Generates an embedding for a single text.
 * @param text - The text to generate an embedding for.
 * @returns A promise that resolves to an embedding vector.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const embeddings = embeddingsModel || initializeEmbeddings();
  const modelName = longTermMemoryConfig.embeddingModel;

  const parentSpan = tracer.scope().active();
  const span = parentSpan ? tracer.startSpan('openai.embedding', { childOf: parentSpan }) : tracer.startSpan('openai.embedding'); // Note: singular name

  span.setTag('span.kind', 'client');
  span.setTag('llm', true);
  span.setTag('llm.request.type', 'embedding');
  span.setTag('llm.request.model', modelName);
  span.setTag('llm.input', text); // Tag the single input text

  try {
    console.log('Generating embedding for query text...');
    const vector = await embeddings.embedQuery(text);

    // Add response tags (token usage often not directly available from LangChain wrappers)
    span.setTag('llm.response.vector_dimension', vector.length);
    span.setTag('llm.response.model', modelName); // Assuming request model is response model for embeddings

    span.finish();
    return vector;
  } catch (error) {
    console.error('Error generating embedding:', error);
    if (error instanceof Error) {
      span.setTag('error.message', error.message);
      span.setTag('error.stack', error.stack);
      span.setTag('error.type', error.name);
    } else {
      span.setTag('error.message', String(error));
    }
    span.setTag('error', true);
    span.finish();
    // Re-throwing or using mock might hide the error trace, consider returning error/empty
    // Using mock as per original code:
    const mockEmbeddings = createMockEmbeddings();
    return mockEmbeddings.embedQuery(text);
  }
};
