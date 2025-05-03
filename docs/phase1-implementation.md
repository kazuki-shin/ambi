# Ambi Phase 1 Implementation Guide

## Objective
Establish the core architecture and foundational features for Ambi, focusing on the conversation engine, basic memory, initial integrations, and a simple tablet app shell.

---

## 1. Project Setup

### 1.1 Repository & Environment
- [ ] Initialize git repository and set up main branch.
- [ ] Add `.gitignore` and `.env.example` (see previous suggestions).
- [ ] Add `README.md` with project overview and setup instructions.
- [ ] Create and test `setup.sh` for onboarding.

### 1.2 Tooling
- [ ] Set up Node.js/TypeScript environment.
- [ ] Install and configure ESLint, Prettier, and Husky for code quality.
- [ ] Set up Jest for unit testing.

---

## 2. Core Architecture

### 2.1 Frontend (Tablet App Shell)
- [ ] Initialize React Native project.
- [ ] Integrate React Native Paper for UI components.
- [ ] Set up Redux Toolkit for state management.
- [ ] Implement basic navigation and a placeholder home screen.
- [ ] Add a simple UI to display system state (listening, thinking, speaking).

### 2.2 Backend/API Layer
- [ ] Set up AWS Lambda/API Gateway skeleton (or local Express server for dev).
- [ ] Implement basic endpoint for conversation requests.
- [ ] Set up MongoDB Atlas connection (or local MongoDB for dev).
- [ ] Add Pinecone and Redis client stubs (no full logic yet).

---

## 3. Core AI Integration

### 3.1 Claude API (Anthropic)
- [ ] Integrate Claude API with a basic prompt template.
- [ ] Implement a function to send/receive messages.
- [ ] Log and display responses in the frontend.

### 3.2 LangChain Memory (Stub)
- [ ] Set up LangChain in the backend.
- [ ] Implement basic short-term memory (in-memory or Redis).
- [ ] Store and retrieve recent conversation history.

### 3.3 Pinecone (Stub)
- [ ] Set up Pinecone client.
- [ ] Implement basic vector upsert and query functions (mocked if needed).

---

## 4. Voice & Speech (Stub)

### 4.1 ElevenLabs Voice Synthesis
- [ ] Integrate ElevenLabs API for text-to-speech.
- [ ] Play synthesized audio in the app (use a placeholder if needed).

### 4.2 Deepgram Speech Recognition
- [ ] Integrate Deepgram API for speech-to-text.
- [ ] Display transcribed text in the app.

---

## 5. Visual Companion (Stub)
- [ ] Integrate Three.js into the React Native app (or use a placeholder view).
- [ ] Display a simple animated visual or static image as a companion.

---

## 6. DevOps & CI

- [ ] Set up GitHub Actions for linting, testing, and build checks.
- [ ] Add branch protection rules.

---

## 7. Documentation

- [ ] Document all environment variables and setup steps.
- [ ] Update README with run/test instructions.
- [ ] Add architecture diagram (optional, but recommended).

---

## 8. Milestone Review

- [ ] Demo: App launches, can send/receive messages with Claude API, and play/record audio (even if basic).
- [ ] Code review and merge to main branch.
- [ ] Retrospective: What worked, what needs improvement for Phase 2.

---

## Notes

- Use stubs/mocks for any service not yet fully implemented.
- Focus on end-to-end flow: user speaks → text → Claude API → response → voice → user.
- Keep UI simple and accessible.
- Prioritize clear code structure and documentation. 