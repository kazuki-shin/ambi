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
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd ambi
   ```
2. **Install dependencies:**
   ```bash
   # For Node.js/React Native
   npm install
   # For backend (if separate)
   # cd backend && npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in required API keys and configuration values.
4. **Run the application:**
   ```bash
   # For React Native (tablet app)
   npm run start
   # For backend (if separate)
   # npm run dev
   ```

## Documentation
- See `docs/prd.md` for the full product requirements and feature details.

## License
[MIT](LICENSE)