import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;

// Export client for testing purposes
export { redisClient };

/**
 * Initializes the Redis client.
 * NOTE: In Phase 1, this is just a stub and doesn't actually connect unless REDIS_URL is set.
 */
export const initializeRedis = () => {
  if (redisClient) {
    console.log('Redis client already initialized.');
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('REDIS_URL not found in environment variables. Redis functions will be disabled or use mock data.');
    // Optionally, you could implement a simple in-memory mock here for dev
    return null;
  }

  try {
    console.log('Initializing Redis client...');
    redisClient = new Redis(redisUrl);

    redisClient.on('connect', () => {
      console.log('Redis client connected.');
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
      redisClient = null; // Prevent use of broken client
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    return null;
  }
};

/**
 * Gets the initialized Redis client instance.
 */
export const getRedisClient = (): Redis | null => {
  if (!redisClient) {
    console.warn('Attempted to get Redis client before initialization or after an error.');
  }
  return redisClient;
};

// Example stub functions - expand as needed

export const setRedisValue = async (key: string, value: string, ttlSeconds?: number): Promise<void> => {
  const client = getRedisClient();
  if (!client) {
    console.warn('Redis not available (stub). Cannot set value.');
    return;
  }
  console.log(`Setting Redis key ${key} (stub)...`);
  if (ttlSeconds) {
    await client.set(key, value, 'EX', ttlSeconds);
  } else {
    await client.set(key, value);
  }
};

export const getRedisValue = async (key: string): Promise<string | null> => {
  const client = getRedisClient();
  if (!client) {
    console.warn('Redis not available (stub). Cannot get value.');
    return null;
  }
  console.log(`Getting Redis key ${key} (stub)...`);
  return client.get(key);
}; 