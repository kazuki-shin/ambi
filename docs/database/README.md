# Ambi Database Design

This document provides a comprehensive overview of the database architecture used in the Ambi system. Ambi uses a multi-database approach to efficiently handle different types of data and access patterns.

## Database Architecture Overview

Ambi employs three different database technologies, each serving a specific purpose:

1. **MongoDB**: Primary database for persistent storage of user data, profiles, and metadata
2. **Redis**: In-memory database for short-term memory and caching
3. **Pinecone**: Vector database for long-term semantic memory storage

This architecture enables Ambi to efficiently handle both structured data and unstructured conversation data with semantic search capabilities.

## MongoDB

MongoDB serves as the primary database for persistent storage of structured data.

### Connection

MongoDB is connected using Mongoose, a MongoDB object modeling tool for Node.js:

```typescript
// From backend/src/db/connect.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    // Exit only if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1); 
    }
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure only if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

export default connectDB;
```

### Data Models

MongoDB stores the following data:

1. **User Profiles**: Information about the users of the system
   - Personal details
   - Preferences
   - Accessibility settings

2. **Session Information**: Data about conversation sessions
   - Session start and end times
   - Session metadata
   - User engagement metrics

3. **System Configuration**: Configuration settings for the application
   - Feature flags
   - System parameters
   - Default settings

## Redis

Redis is used as an in-memory database for short-term memory and caching.

### Connection

Redis is initialized in the application startup:

```typescript
// Simplified from backend/src/clients/redisClient.ts
import { createClient } from 'redis';

let redisClient;

export const initializeRedis = async () => {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.warn('REDIS_URL not defined. Redis features will be disabled.');
    return null;
  }
  
  try {
    redisClient = createClient({ url: redisUrl });
    await redisClient.connect();
    console.log('Redis Connected...');
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    return null;
  }
};
```

### Data Structure

Redis stores the following data:

1. **Conversation History**: Recent messages between the user and AI
   - Stored as key-value pairs
   - Keys follow the pattern `session:{sessionId}:history`
   - Values are JSON arrays of message objects

2. **Session State**: Current state of active sessions
   - User information
   - Conversation context
   - Temporary data

3. **Cache**: Frequently accessed data for performance optimization
   - API responses
   - Computed values
   - Temporary storage

### Memory Service Implementation

The Redis memory service handles short-term memory operations:

```typescript
// Simplified from backend/src/services/redisMemoryService.ts
export const addRedisMessagePair = async (
  sessionId: string,
  humanMessageContent: string,
  aiMessageContent: string
): Promise<void> => {
  // Implementation details for storing message pairs in Redis
};

export const getRedisHistory = async (
  sessionId: string
): Promise<BaseMessage[]> => {
  // Implementation details for retrieving conversation history from Redis
};

export const clearRedisHistory = async (
  sessionId: string
): Promise<void> => {
  // Implementation details for clearing conversation history from Redis
};
```

## Pinecone

Pinecone is a vector database used for long-term semantic memory storage.

### Connection

Pinecone is initialized during application startup:

```typescript
// Simplified from backend/src/clients/pineconeClient.ts
import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient;

export const initializePinecone = async () => {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;
  
  if (!apiKey || !indexName) {
    console.warn('Pinecone API key or index name not defined. Pinecone features will be disabled.');
    return null;
  }
  
  try {
    pineconeClient = new Pinecone({ apiKey });
    console.log('Pinecone Connected...');
    return pineconeClient;
  } catch (error) {
    console.error('Pinecone initialization error:', error);
    return null;
  }
};
```

### Data Structure

Pinecone stores the following data:

1. **Conversation Embeddings**: Vector representations of conversation messages
   - Generated using OpenAI's Ada embeddings
   - Enables semantic search for similar conversations

2. **Metadata**: Additional information about the stored vectors
   - Session ID
   - Timestamp
   - Message role (human or AI)
   - Message category
   - Priority level

### Memory Service Implementation

The Pinecone memory service handles long-term memory operations:

```typescript
// Simplified from backend/src/services/pineconeMemoryService.ts
export class PineconeVectorMemory extends BaseMemory {
  // Implementation details for the Pinecone-backed memory system
  
  async loadMemoryVariables(values: InputValues): Promise<MemoryVariables> {
    // Retrieves relevant memories based on semantic similarity
  }
  
  async saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void> {
    // Stores conversation context in Pinecone with embeddings
  }
}
```

## Information Flow Between Databases

The Memory Manager coordinates the flow of information between the different databases:

```typescript
// Simplified from backend/src/services/memoryManager.ts
export const addToMemory = async (
  sessionId: string,
  humanMessageContent: string,
  aiMessageContent: string
): Promise<void> => {
  // Adds message pair to both Redis (short-term) and Pinecone (long-term)
};

export const getRecentHistory = async (
  sessionId: string
): Promise<BaseMessage[]> => {
  // Retrieves recent history from Redis
};

export const getRelevantMemories = async (
  sessionId: string,
  query: string
): Promise<BaseMessage[]> => {
  // Retrieves relevant memories from Pinecone based on semantic similarity
};

export const buildMemoryContext = async (
  sessionId: string,
  currentQuery: string
): Promise<BaseMessage[]> => {
  // Combines recent history and relevant memories to build context
};
```

## Frontend-Backend Connectivity

The frontend connects to the backend databases through the API layer:

1. **API Client**: The frontend uses a fetch-based API client to communicate with the backend
2. **API Endpoints**: The backend exposes RESTful endpoints for data operations
3. **Data Transfer**: Data is transferred as JSON between frontend and backend

The frontend does not directly access the databases; all database operations are performed through the backend API.

## Voice-to-Text Abstraction

The voice-to-text system is abstracted through the Voice Service:

```typescript
// Simplified from backend/src/services/voiceService.ts
export const voiceService = {
  speechToText: {
    transcribe: async (audioBuffer: Buffer): Promise<string | null> => {
      // Converts speech to text using Deepgram
    }
  },
  textToSpeech: {
    synthesize: async (text: string, voiceId?: string): Promise<Buffer | null> => {
      // Converts text to speech using ElevenLabs
    }
  }
};
```

This abstraction allows the system to:
1. Switch between different voice service providers if needed
2. Handle different audio formats and processing requirements
3. Optimize voice processing for elderly users
4. Provide a consistent interface for voice interactions

## Environment Variables

The database connections are configured through environment variables:

```
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ambi

# Redis
REDIS_URL=redis://username:password@redis-host:port

# Pinecone
PINECONE_API_KEY=your-api-key
PINECONE_INDEX_NAME=your-index-name
```

See the [Environment Variables](./environment-variables.md) documentation for a complete list.

## Next Steps

- [Memory System](../memory-system/README.md): Detailed documentation of the memory implementation
- [Database Schema](./schema.md): Detailed documentation of the database schema
- [Data Flow](./data-flow.md): Comprehensive explanation of data flow in the system
