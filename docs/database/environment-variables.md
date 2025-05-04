# Environment Variables

This document provides a comprehensive list of environment variables used in the Ambi system. These variables control various aspects of the system's behavior and connections to external services.

## Core Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode (`development`, `production`, or `test`) | `development` | Yes |
| `PORT` | Port number for the backend server | `4000` | Yes |
| `INTERACTION_MODE` | Primary interaction mode (`voice` or `text`) | `voice` | Yes |

## Database Connection Variables

### MongoDB

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | Connection string for MongoDB Atlas | Yes |

### Redis

| Variable | Description | Required |
|----------|-------------|----------|
| `REDIS_URL` | Connection URL for Redis | Yes |
| `REDIS_HOST` | Redis host (alternative to URL) | No |
| `REDIS_PORT` | Redis port (alternative to URL) | No |
| `REDIS_USER` | Redis username (alternative to URL) | No |
| `REDIS_PASS` | Redis password (alternative to URL) | No |

### Pinecone

| Variable | Description | Required |
|----------|-------------|----------|
| `PINECONE_API_KEY` | API key for Pinecone | Yes |
| `PINECONE_INDEX_NAME` | Name of the Pinecone index | Yes |

## External API Variables

### Anthropic Claude

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | API key for Anthropic Claude | Yes |
| `CLAUDE_MODEL` | Claude model to use | No |
| `MAX_TOKENS` | Maximum tokens for Claude responses | No |

### ElevenLabs

| Variable | Description | Required |
|----------|-------------|----------|
| `ELEVENLABS_API_KEY` | API key for ElevenLabs | Yes* |
| `DEFAULT_VOICE_ID` | Default voice ID for speech synthesis | No |

### Deepgram

| Variable | Description | Required |
|----------|-------------|----------|
| `DEEPGRAM_API_KEY` | API key for Deepgram | Yes* |

### OpenAI

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | API key for OpenAI (used for embeddings) | Yes |

\* Required if `INTERACTION_MODE` is set to `voice`

## Memory System Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MAX_HISTORY_LENGTH` | Maximum number of messages in short-term memory | `10` | No |
| `MEMORY_TTL` | Time-to-live for memory entries in seconds | `86400` (24 hours) | No |
| `RELEVANCE_THRESHOLD` | Minimum similarity score for relevant memories | `0.7` | No |
| `MAX_RESULTS` | Maximum number of results to retrieve from long-term memory | `5` | No |

## Example .env File

```
# Core
NODE_ENV=development
PORT=4000
INTERACTION_MODE=voice

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ambi

# Redis
REDIS_URL=redis://username:password@redis-host:port

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=ambi-memory

# Anthropic Claude
ANTHROPIC_API_KEY=your-anthropic-api-key
CLAUDE_MODEL=claude-3-opus-20240229
MAX_TOKENS=1000

# ElevenLabs
ELEVENLABS_API_KEY=your-elevenlabs-api-key
DEFAULT_VOICE_ID=your-default-voice-id

# Deepgram
DEEPGRAM_API_KEY=your-deepgram-api-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Memory System
MAX_HISTORY_LENGTH=10
MEMORY_TTL=86400
RELEVANCE_THRESHOLD=0.7
MAX_RESULTS=5
```

## Setting Up Environment Variables

1. Copy the `.env.example` file to `.env` in the backend directory:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit the `.env` file to add your API keys and customize settings:
   ```bash
   nano backend/.env
   ```

3. Save the file and restart the server for the changes to take effect.

## Environment Variables in Different Environments

### Development

In development, you can use a local `.env` file with development-specific settings:

```
NODE_ENV=development
PORT=4000
# Other development-specific settings
```

### Production

In production, environment variables should be set in the deployment environment:

```
NODE_ENV=production
PORT=80
# Other production-specific settings
```

### Testing

For testing, you can use a separate `.env.test` file or set variables in your CI/CD pipeline:

```
NODE_ENV=test
# Test-specific settings
```

## Security Considerations

- Never commit `.env` files to version control
- Use environment variable management in your deployment platform
- Rotate API keys regularly
- Use different API keys for development and production
