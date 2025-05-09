# Environment Variables

This document provides a comprehensive list of environment variables used in the Ambi web-based proof of concept (POC). These variables control various aspects of the system's behavior and connections to external services.

## Core Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode (`development`, `production`, or `test`) | `development` | Yes |
| `PORT` | Port number for the backend server | `4000` | Yes |

## Database Connection Variables

### MongoDB

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | Connection string for MongoDB | Yes |

## External API Variables

### ElevenLabs Conversational AI

| Variable | Description | Required |
|----------|-------------|----------|
| `ELEVENLABS_API_KEY` | API key for ElevenLabs | Yes |
| `ELEVENLABS_VOICE_ID` | Voice ID for speech synthesis | No |

### Emotion Analysis API

| Variable | Description | Required |
|----------|-------------|----------|
| `EMOTION_API_KEY` | API key for emotion analysis service | No |
| `EMOTION_API_URL` | URL for emotion analysis service | No |

## Web Application Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | URL for the backend API | `http://localhost:4000` | No |
| `REACT_APP_WS_URL` | WebSocket URL for real-time communication | `ws://localhost:4000` | No |

## Deployment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FLY_API_TOKEN` | API token for Fly.io deployment | No |
| `FLY_APP_NAME` | Application name on Fly.io | No |

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
