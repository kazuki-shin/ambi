# Developer Onboarding Guide

This guide will help you get started with developing for the Ambi web-based conversational companion proof of concept (POC).

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or later)
- npm (v7 or later)
- MongoDB (local or Atlas account)
- Git

## Getting the Code

1. Clone the repository:
   ```bash
   git clone https://github.com/kazuki-shin/ambi.git
   cd ambi
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

## Setting Up Environment Variables

1. Create a `.env` file in the backend directory:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit the `.env` file to add your API keys and database connection strings:
   ```
   # Core
   NODE_ENV=development
   PORT=4000
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/ambi
   
   # ElevenLabs Conversational AI
   ELEVENLABS_API_KEY=your-elevenlabs-api-key
   
   # Emotion Analysis API (if applicable)
   EMOTION_API_KEY=your-emotion-api-key
   ```

## Running the Application

### Backend

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

   The server will start on http://localhost:4000 by default.

### Frontend

1. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

   The web application will be available at http://localhost:3000 by default.

## Project Structure

The Ambi project is organized as follows:

```
/
├── backend/                   # Express.js server
│   ├── src/
│   │   ├── index.ts           # Main server entrypoint
│   │   ├── clients/           # External API clients
│   │   ├── services/          # Business logic services
│   │   └── db/                # Database connections
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment variable template
├── frontend/                  # React Native application
│   ├── App.tsx                # Main React component
│   └── src/                   # Frontend source code
└── docs/                      # Documentation
```

## Key Components

### Backend

- **Express Server**: The main entry point for the backend
- **Memory Manager**: Coordinates the two-tier memory system
- **Claude API Client**: Interfaces with Anthropic's Claude API
- **Voice Service**: Manages speech processing

### Frontend

- **React Native App**: The main tablet application
- **UI Components**: Built with React Native Paper
- **State Management**: Uses Redux Toolkit
- **API Client**: Communicates with the backend server
- **Visual Companion**: Three.js-based visualization

## Development Workflow

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**: Implement your feature or fix

3. **Run Tests**:
   ```bash
   # Backend tests
   cd backend
   npm test
   
   # Frontend tests
   cd frontend
   npm test
   ```

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. **Push Changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**: Open a PR on GitHub

## API Documentation

The Ambi API provides endpoints for conversation and voice interaction. See the [API Documentation](../api/README.md) for details.

## Memory System

The memory system is a core feature of Ambi. See the [Memory System Documentation](../memory-system/README.md) for details on how it works and how to extend it.

## Database Design

Ambi uses a multi-database approach with MongoDB, Redis, and Pinecone. See the [Database Design Documentation](../database/README.md) for details.

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Ensure MongoDB and Redis are running
   - Check your connection strings in the `.env` file

2. **API Key Issues**:
   - Verify that all API keys are correctly set in the `.env` file
   - Check for API usage limits

3. **Build Errors**:
   - Ensure all dependencies are installed
   - Check for Node.js version compatibility

### Getting Help

If you encounter issues not covered here, please:

1. Check the existing GitHub issues
2. Ask in the developer Discord channel
3. Create a new GitHub issue with detailed information

## Next Steps

- [Setting Up the Development Environment](./development-environment.md): Detailed environment setup
- [Working with the Memory System](./memory-system.md): Learn how to use and extend the memory system
- [API Integration Guide](./api-integration.md): Integrate with the Ambi API
- [Contributing to Ambi](./contributing.md): Guidelines for contributing to the project
