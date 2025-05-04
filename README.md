# Ambi

## Overview
Ambi is an AI-powered conversational companion designed to reduce loneliness and enhance the quality of life for elderly individuals. It provides proactive, emotionally intelligent conversation, memory support, and family context integration through a tablet-based application.

## Key Features
- **Proactive Conversation:** Initiates and maintains natural, engaging conversations tailored to the user's needs and preferences.
- **Memory & Context System:** Remembers important details, events, and family-provided context for personalized interactions.
- **Voice & Speech:** Natural, elder-optimized voice synthesis and accurate speech recognition.
- **Visual Companion:** Gentle, accessible 3D visualizations and memory timelines.
- **Accessibility:** Designed for zero learning curve, with high-contrast visuals and support for hearing, vision, and motor limitations.
- **Privacy & Security:** End-to-end encryption, secure storage, and clear consent processes.

## Technology Stack
- **AI & Orchestration:** Claude API (Anthropic), LangChain, Pinecone, ElevenLabs
- **Frontend:** React Native, React Native Paper, Redux Toolkit, Three.js, TensorFlow Lite, SQLite
- **Backend:** AWS Serverless, MongoDB Atlas, Pinecone, Redis, Auth0, AWS S3
- **Additional:** Deepgram (speech recognition), OpenAI Ada (embeddings), Amplitude (analytics), Datadog (monitoring), Sentry (error tracking)

## Getting Started

### Prerequisites

*   **Node.js:** (v18 or v20 recommended, check `.github/workflows/ci.yml` for tested versions)
*   **npm:** (Comes with Node.js)
*   **Watchman:** (Recommended for React Native: `brew install watchman`)
*   **Xcode:** (For iOS development, from Mac App Store)
*   **CocoaPods:** (For iOS dependencies: `sudo gem install cocoapods` or via Ruby version manager gem install)
*   **Ruby:** (>= 3.1.0 required for latest CocoaPods, recommend using `rbenv` or `rvm`)
*   **Android Studio:** (For Android development, including SDKs and emulator)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url> # Replace with actual URL
    cd ambi
    ```
2.  **Set up Backend Environment:**
    *   Navigate to the backend directory: `cd backend`
    *   Create a `.env` file for your environment variables. You can copy the example:
        ```bash
        cp .env.example .env
        ```
    *   **Edit `backend/.env`**: Fill in *all* required API keys and connection strings (Redis, Anthropic, ElevenLabs, Deepgram, Pinecone, etc.). Refer to `backend/.env.example` for the full list of required variables.
    *   **Configure Interaction Mode**: The `INTERACTION_MODE` variable in `.env` controls the primary interaction method:
        *   `INTERACTION_MODE=voice` (Default): Uses speech-to-text (Deepgram) and text-to-speech (ElevenLabs). Requires relevant API keys.
        *   `INTERACTION_MODE=text`: Disables voice input/output, relying only on text. Useful for development or if voice services are unavailable.
3.  **Install Backend Dependencies:**
    *   While in the `backend` directory:
        ```bash
        npm install 
        ```
4.  **Set up Frontend Environment:**
    *   Navigate to the frontend directory: `cd ../frontend` 
    *   (No frontend `.env` file needed for Phase 1)
5.  **Install Frontend Dependencies:**
    *   While in the `frontend` directory:
        ```bash
        npm install 
        ```
6.  **Install iOS Pods:**
    *   Navigate to the iOS directory: `cd ios`
    *   Install pods: `pod install`
    *   Navigate back: `cd ..`

### Running the Application

*   **Run Backend Server:**
    *   Open a terminal, navigate to the `backend` directory (`cd backend`).
    *   Start the development server:
        ```bash
        npm run dev
        ```
    *   The server will typically run on `http://localhost:4000`.

*   **Run Frontend App (iOS):**
    *   Ensure the backend server is running.
    *   Ensure an iOS Simulator is running (launch via Xcode).
    *   Open a *new* terminal, navigate to the `frontend` directory (`cd frontend`).
    *   Start the app on the simulator:
        ```bash
        npx react-native run-ios
        ```

*   **Run Frontend App (Android):**
    *   Ensure the backend server is running.
    *   Ensure an Android Emulator is running or a device is connected.
    *   Open a *new* terminal, navigate to the `frontend` directory (`cd frontend`).
    *   Start the app on the emulator/device:
        ```bash
        npx react-native run-android
        ```

### Running Tests

*   **Backend Tests:**
    *   Navigate to the `backend` directory (`cd backend`).
    *   Run tests:
        ```bash
        npm test
        ```
    *   (Note: Currently passes with no tests found. Add actual tests later.)

## Documentation
- See `docs/prd.md` for the full product requirements and feature details.
- See `docs/architecture.md` for the Phase 1 system architecture diagram.

## Memory System

Ambi implements a comprehensive two-tier memory system using LangChain:

- **Short-term Memory**: Uses Redis to store recent conversation history
- **Long-term Memory**: Uses Pinecone for semantic search and retrieval of past conversations

### Setup

After pulling the latest changes, run the setup script to ensure all dependencies are properly installed:

```bash
cd backend
./setup.sh
```

This script will:
1. Check and install/update backend dependencies
2. Check and install/update frontend dependencies (if frontend directory exists)
3. Run linting to catch any issues
4. Verify required environment variables

### Required Environment Variables

The backend requires several environment variables for API keys and service connections. Please refer to the `backend/.env.example` file for a complete list and descriptions.

Key variables include:
- `NODE_ENV`: Set to `development`, `production`, or `test`.
- `PORT`: The port the backend server runs on.
- `INTERACTION_MODE`: Controls voice/text interaction (see Setup section).
- `REDIS_URL`: Connection URL for Redis (short-term memory).
- `PINECONE_API_KEY`: API key for Pinecone (long-term memory).
- `PINECONE_INDEX_NAME`: Name of the Pinecone index.
- `ANTHROPIC_API_KEY`: API key for Claude (core LLM).
- `DEEPGRAM_API_KEY`: API key for Deepgram (speech-to-text).
- `ELEVENLABS_API_KEY`: API key for ElevenLabs (text-to-speech).
- `OPENAI_API_KEY`: API key for OpenAI (used for embeddings).
