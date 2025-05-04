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
    *   Copy the example environment file: `cp .env.example .env`
    *   **Edit `backend/.env`**: Fill in *all* required API keys and connection strings (MongoDB, Redis, Anthropic, ElevenLabs, Deepgram). Refer to `backend/.env.example` for variable names.
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
- See `docs/prd.md`