# Ambi - Phase 1 Architecture

This diagram outlines the high-level architecture and primary interactions of the Ambi system as implemented in Phase 1.

```mermaid
graph LR
    subgraph Frontend
        direction TB
        RNApp[React Native App (Tablet)];
        UI[UI Components (React Native Paper)];
        StateMgmt[State Management (Redux Toolkit)];
        APIClient[API Client (fetch)];
        ThreeStub[Visual Placeholder (View)];
    end

    subgraph Backend
        direction TB
        NodeAPI[Node.js/Express API];
        Mongo[MongoDB Database];
        Redis[Redis Cache];
        MemoryStub[LangChain Memory Stub (In-Memory)];
        PineconeStub[Pinecone Client Stub];
        ClaudeClient[Claude API Client];
        ElevenLabsStub[ElevenLabs TTS Stub];
        DeepgramStub[Deepgram STT Stub];
    end

    subgraph External Services
        direction TB
        ClaudeAPI[Anthropic Claude API];
        ElevenLabsAPI[ElevenLabs API];
        DeepgramAPI[Deepgram API];
        PineconeService[Pinecone Service];
    end

    %% Interactions
    RNApp -- Text Input --> APIClient;
    APIClient -- "POST /api/conversation" --> NodeAPI;
    NodeAPI -- Uses --> MemoryStub;
    NodeAPI -- Calls --> ClaudeClient;
    ClaudeClient -- HTTPS Request --> ClaudeAPI;
    ClaudeAPI -- Response --> ClaudeClient;
    ClaudeClient -- Reply --> NodeAPI;
    MemoryStub -- Stores/Retrieves --> MemoryStub; # Self loop for in-memory
    NodeAPI -- Stores --> MemoryStub;
    NodeAPI -- Connects --> Mongo;
    NodeAPI -- Connects --> Redis;
    NodeAPI -- Reply --> APIClient;
    APIClient -- Reply --> RNApp;
    RNApp -- Displays Reply --> UI;
    RNApp -- Updates State --> StateMgmt;
    StateMgmt -- Drives --> UI;

    %% Stub Interactions (Backend calls placeholders)
    NodeAPI -.-> ElevenLabsStub; 
    NodeAPI -.-> DeepgramStub;
    NodeAPI -.-> PineconeStub;
    PineconeStub -.-> PineconeService;
    ElevenLabsStub -.-> ElevenLabsAPI;
    DeepgramStub -.-> DeepgramAPI;

    %% Style Definitions (Optional)
    classDef backend fill:#f9f,stroke:#333,stroke-width:2px;
    classDef frontend fill:#ccf,stroke:#333,stroke-width:2px;
    classDef external fill:#cfc,stroke:#333,stroke-width:2px;
    class NodeAPI,Mongo,Redis,MemoryStub,PineconeStub,ClaudeClient,ElevenLabsStub,DeepgramStub backend;
    class RNApp,UI,StateMgmt,APIClient,ThreeStub frontend;
    class ClaudeAPI,ElevenLabsAPI,DeepgramAPI,PineconeService external;
```

**Key:**

*   Solid lines (`-->`) indicate primary data flow or function calls implemented in Phase 1.
*   Dashed lines (`-.->`) indicate stubbed integrations where the client exists but the actual external API call is not yet fully implemented or tested end-to-end.
*   Boxes represent major components or services. 