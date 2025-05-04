# Ambi Python Backend

This is the Python implementation of the Ambi backend, converted from the original TypeScript/Node.js implementation.

## Setup

### Prerequisites

- Python 3.12+
- Poetry (dependency management)

### Installation

```bash
# Install dependencies
poetry install

# Activate the virtual environment
poetry shell
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/ambi
REDIS_URL=redis://localhost:6379
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index
ANTHROPIC_API_KEY=your_anthropic_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
```

## Development

### Running the Server

```bash
# Start the development server
poetry run uvicorn ambi.api.main:app --reload
```

### Testing

```bash
# Run tests
poetry run pytest

# Run tests with coverage
poetry run pytest --cov=ambi
```

### Linting and Formatting

```bash
# Format code with Black
poetry run black .

# Sort imports with isort
poetry run isort .

# Type checking with mypy
poetry run mypy ambi
```

## Project Structure

```
python_backend/
├── ambi/
│   ├── __init__.py
│   ├── api/           # FastAPI routes and middleware
│   ├── clients/       # External API clients (Claude, ElevenLabs, Deepgram)
│   ├── config/        # Configuration and environment variables
│   ├── db/            # Database connections (MongoDB, Redis, Pinecone)
│   └── services/      # Business logic and services
├── tests/             # Test suite
├── pyproject.toml     # Poetry configuration
└── README.md          # This file
```

## API Documentation

When the server is running, you can access the auto-generated API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
