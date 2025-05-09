# Product Requirements Document (PRD)
# Ambi - Emotionally Intelligent Companion Robot for the Elderly

## 1. Executive Summary

Ambi is an emotionally intelligent digital companion designed to address the loneliness epidemic affecting 50% of U.S. adults, with special focus on seniors (65+). This PRD outlines our plan to build a web-based POC leveraging ElevenLabs Conversational AI (an orchestration platform integrating Speech-to-Text, LLM intelligence, Text-to-Speech, and built-in interruption handling) as the core technology, deployed on Fly.io. The product combines emotionally responsive conversation with proactive engagement capabilities specifically tailored to elderly users.

### Key Value Proposition
- Natural, emotionally intelligent conversations with seamless interruption handling
- Proactive engagement tailored to elderly users' routines and emotional states
- Simple, accessible user experience optimized for older adults

## 2. Vision and Goals

### Vision Statement
To create an emotionally intelligent companion that reduces loneliness in elderly populations through meaningful interaction, providing consistent engagement when human company is unavailable.

### Core Goals
1. Deliver natural, responsive conversations with <1 second latency
2. Enable proactive engagement without requiring technical initiation
3. Create an emotionally aware companion that responds appropriately to user states
4. Provide a simple, accessible interface optimized for elderly users
5. Deploy a scalable POC that demonstrates core functionality

### Success Metrics
- **Technical**: Response latency <1 second, 95% uptime, <5% error rate
- **Engagement**: Average 5+ daily interactions, 70%+ of proactive engagements accepted
- **Satisfaction**: >4/5 satisfaction rating from elderly test users

## 3. Target Users

### Primary: Elderly Individuals (65+)
- 43% of 54M U.S. seniors experience loneliness
- May have limited technological proficiency
- Potential physical limitations (vision, hearing, dexterity)
- Often living alone or with limited social interaction

### Secondary: Caregivers and Family Members
- Concerned about elderly relatives' social and emotional wellbeing
- May not be physically present to provide constant companionship
- Want peace of mind knowing loved ones have interaction

## 4. Product Features

### Core Features

#### 1. ElevenLabs Conversational AI Integration
- Leverages the ElevenLabs Conversational AI platform, which orchestrates core components like Speech-to-Text (STT), Large Language Model (LLM) processing, and Text-to-Speech (TTS) synthesis, to enable natural dialogue.
- Custom voice optimized for elderly hearing and comprehension
- Native interrupt handling for natural conversation flow
- Real-time audio streaming with minimal latency

#### 2. Emotion Detection System
- Camera-based facial expression analysis
- Basic emotional state recognition (happy, sad, neutral, confused) - POC Target: Correctly identify the user's dominant expressed emotion in >60% of instances where expressions are clear and sustained, based on qualitative testing.
- Emotion-aware response adaptation
- Privacy-preserving processing (edge computing where possible)

#### 3. Proactive Engagement Engine
- Time-based engagement triggers (morning greetings, evening check-ins)
- Emotional state triggers (engaging when user appears lonely)
- Context-aware conversation starters
- Natural disengagement when appropriate - POC Approach: Disengagement will be triggered by simpler cues such as extended user silence, explicit user statements ending the conversation (e.g., "goodbye"), or a predefined short inactivity timeout. More nuanced, context-driven natural disengagement is a goal for future iterations.

#### 4. Custom Context Injection
- Dynamic system prompt generation for ElevenLabs
- User profile information integration
- Current situation awareness
- Adaptive conversation guidance

#### 5. Accessible User Interface
- High-contrast, large-text design
- Simple, consistent interaction patterns
- Clear visual feedback for system states
- Optimization for tablet devices commonly used by elderly

## 5. Technical Architecture

### System Components

#### Frontend Application
- **Technology**: React Native Web
- **Deployment**: Fly.io global edge
- **Key Features**:
  - WebRTC for camera and microphone access
  - WebAssembly for local processing
  - Responsive design optimized for tablets
  - Accessibility compliance for elderly users

##### 5.1.1 UI/UX Development Strategy for Rapid, High-Quality Design
To ensure a clean, well-designed, and accessible user interface is developed efficiently for the Ambi POC, the following strategies will be employed:

1.  **Leverage a High-Quality, Accessible Component Library**:
    *   A reputable, well-maintained React component library (e.g., Material UI, Ant Design, Chakra UI, or a similar library with strong accessibility features) will be selected.
    *   The chosen library must offer robust ARIA support, keyboard navigation, and easy theming capabilities to meet the high-contrast and large-text requirements detailed in Appendix B.
    *   This approach will significantly accelerate development by providing pre-built, tested, and customizable UI elements (buttons, modals, navigation, etc.).

2.  **Strict Adherence to Elderly-Specific Design Principles (Appendix B)**:
    *   All UI development and component customization will directly implement the guidelines outlined in Appendix B (e.g., minimum 16pt text size, WCAG AA high contrast ratios, clear iconography with text labels, simplified navigation, generous touch targets, and predictable interaction patterns).
    *   The selected component library will be themed and configured from the project's inception to align with these critical design principles.

3.  **Focus on Core Interaction Simplicity (MVP UI)**:
    *   The UI for the POC will be minimalist and hyper-focused on the primary conversational experience.
    *   Key elements will include:
        *   Clear and unambiguous visual indicators for Ambi's status (e.g., listening, speaking, processing/thinking, idle).
        *   Large, easily identifiable, and accessible button(s) for initiating interaction or responding if non-verbal cues are needed.
        *   Highly legible display for any essential text prompts or feedback, though voice remains the primary interaction modality.
    *   Non-essential UI elements, complex gestures, or hidden menus will be avoided to maintain simplicity and reduce cognitive load for elderly users, which also speeds up initial development.

4.  **Rapid Prototyping and Iterative Testing**:
    *   UI design and prototyping tools (e.g., Figma, Adobe XD) will be used to create initial mockups and interactive prototypes based on the chosen component library and established design principles.
    *   Early and frequent informal usability testing of these prototypes will be conducted with a small group of representative elderly users (or internal advocates focusing on accessibility and elderly UX principles) *before* extensive coding.
    *   This iterative feedback loop will allow for quick identification and correction of design flaws, ensuring the UI is effective and user-friendly prior to full implementation.

5.  **Minimalist and Calming Aesthetic**:
    *   A clean, uncluttered, and visually calming design language will be adopted. This approach generally enhances usability for elderly users by reducing distraction and cognitive load.
    *   The aesthetic will prioritize clarity, legibility, and ease of use over ornamental design, which also contributes to faster development.

#### Backend Services (Deployed on Fly.io)

##### API Gateway
- **Technology**: Node.js/Express
- **Purpose**: Single entry point for all client requests
- **Key Features**:
  - Request routing
  - Authentication/authorization
  - WebSocket management
  - Rate limiting

##### ElevenLabs Connector
- **Technology**: Node.js
- **Purpose**: Manages all interaction with ElevenLabs APIs
- **Key Features**:
  - Conversation creation and management
  - WebSocket handling for audio streaming
  - Context updates during conversations
  - Error handling and reconnection logic

##### Vision Service
- **Technology**: Node.js with TensorFlow.js
- **Purpose**: Processes visual data for emotion detection
- **Key Features**:
  - MediaPipe integration for face detection
  - Lightweight emotion classification
  - Privacy-preserving processing
  - Scene understanding for context - POC Scope: Basic environmental cues (e.g., distinguishing very low light suggesting nighttime from brighter conditions, or presence of a face in frame vs. not) rather than complex object recognition or detailed scene analysis.

##### Custom Context Service
- **Technology**: Node.js
- **Purpose**: Generates and manages system prompts
- **Key Features**:
  - Dynamic prompt generation
  - User profile management
  - Situation awareness
  - Context optimization for ElevenLabs

##### Proactive Engine
- **Technology**: Node.js
- **Purpose**: Initiates timely interactions
- **Key Features**:
  - Time-based triggers
  - Emotion-based triggers
  - Engagement management
  - Conversation scheduling

### External Services
- **ElevenLabs Conversational AI**: Core conversation intelligence
- **ElevenLabs Voice API**: Natural voice synthesis
- **Fly.io**: Global edge deployment platform

## 6. User Experience Flow

### Initial Setup
1. User (or caregiver) visits Ambi web application on tablet
2. Simple onboarding collects basic information (name, preferences)
3. Brief tutorial explains how Ambi works
4. System begins ambient awareness

### Daily Interaction Flow
1. **Morning Greeting**: Proactive engagement when user appears in the morning
2. **Throughout Day**: 
   - Responds to direct engagement from user
   - Initiates conversations during detected periods of loneliness
   - Provides reminders and check-ins at appropriate times
3. **Evening Wind-Down**: Gentle check-in about user's day
4. **Ambient Presence**: Maintains awareness even when not actively engaging

### Conversation Flow
1. Ambi initiates or user begins conversation
2. Natural dialogue with emotion-aware responses
3. Graceful handling of interruptions
4. Context-appropriate topics and follow-ups
5. Natural conversation conclusion or user disengagement

## 7. Development Timeline

### Phase 1: Foundation (Weeks 1-3)
- Set up ElevenLabs Conversational Agent configuration
- Create basic frontend application with audio/video capabilities
- Implement ElevenLabs Connector service
- Establish API Gateway and service communication
- Deploy initial infrastructure on Fly.io

### Phase 2: Core Capabilities (Weeks 4-6)
- Implement Custom Context Service
- Develop basic Vision Service for emotion detection
- Create simple Proactive Engine with time-based triggers
- Refine conversation flow and interruption handling
- Optimize audio streaming and processing

### Phase 3: Refinement & Testing (Weeks 7-9)
- Enhance emotion detection capabilities
- Expand proactive engagement strategies
- Optimize for elder-specific interaction patterns
- Conduct usability testing with target demographic
- Implement feedback and refinements

### Phase 4: Final POC (Weeks 10-12)
- Complete end-to-end integration of all components
- Optimize performance and reliability
- Implement analytics and monitoring
- Finalize documentation
- Prepare for demonstration to stakeholders

## 8. Technical Implementation Details

### Media Processing Pipeline

#### Audio Processing
- WebRTC for audio capture
- Real-time streaming to ElevenLabs
- WebSocket-based bidirectional audio flow
- Dynamic volume adjustment for elderly users

#### Vision Processing
- MediaPipe for face detection and landmarks
- Privacy-preserving processing (edge computation)
- Basic emotion classification (4-5 key emotions)
- Simple environment recognition

### Deployment Architecture

#### Containerization Strategy
- Docker containers for all services
- Multi-stage builds for optimization
- Consistent development and production environments
- Health checks and graceful recovery

#### Fly.io Configuration
- Global edge deployment for low latency
- Shared networking between services
- Volume storage for persistent data
- WebSocket support for real-time communication

## 9. Privacy and Security Considerations

### Privacy Measures
- Local processing of video when possible
- No storage of raw audio or video
- Transparent indicators when camera/microphone are active
- Clear privacy policy in elderly-friendly language

### Security Implementation
- TLS encryption for all communications
- Secure API key management
- Regular security audits
- Limited data collection and retention

## 10. Testing and Quality Assurance

### Testing Strategy
- Automated unit tests for all services
- Integration testing of conversation flows
- Specialized elderly UX testing
- Performance testing for latency and responsiveness

### Elder-Specific Testing
- Panel of elderly testers (65+ age group)
- Assessments of comprehension and usability
- Testing with various hearing and vision capabilities
- Longitudinal engagement measurement

## 11. Analytics and Measurement

### Key Metrics to Track
- Conversation engagement duration
- Proactive engagement acceptance rate
- Emotion recognition accuracy
- System reliability and error rates
- User satisfaction ratings

### Analytics Implementation
- Anonymous usage data collection
- Conversation quality assessment
- Emotional response tracking
- Technical performance monitoring

## 12. Future Roadmap

### Post-POC Enhancements
- Enhanced memory capabilities
- Multi-modal interaction (touch, voice, vision)
- Integration with health monitoring
- Family/caregiver connection features

### Hardware Integration Path
- Custom hardware development
- Mobile robot form factor
- Enhanced sensors and capabilities
- Productization for consumer market

## 13. Deployment and Operations

### Deployment Process
- CI/CD pipeline for automated deployment
- Canary releases for risk mitigation
- Automated health checks and monitoring
- Rollback capability for critical issues

### Operational Support
- 24/7 monitoring for critical services
- Automated alerting for system issues
- Regular performance optimization
- Version update management

## 14. Deployment for Field Testing and Pilot Programs

This section outlines the specific considerations for deploying Ambi for field testing and pilot programs in elder care homes and similar environments. The goal is to ensure smooth, reliable, and ethically sound testing with target users.

### 14.1 Tablet Compatibility and Access
- **Target Devices**: The React Native Web application will be optimized and tested for compatibility with:
    - **iOS**: iPads running the latest major iOS version and one version prior.
    - **Android**: Reputable Android tablets (e.g., Samsung Galaxy Tab, Lenovo Tab) running the latest major Android version and two versions prior.
- **Browser Requirements**: Latest stable versions of Safari (on iOS) and Chrome (on Android and desktop for testing/admin).
- **Access Method**:
    - A simple, memorable, and easily typable URL (e.g., `ambi.care/test/[testgroup_id]`) will be provided for accessing the application.
    - QR codes linking to the specific test URL will be generated for quick access on tablets.
- **Display and Interaction**: Ensure responsiveness and optimal viewing on common tablet screen sizes (typically 8-11 inches).

### 14.2 Network Considerations for Test Environments
- **Pre-Visit Coordination**: A checklist and communication protocol will be established for coordinating with IT staff at elder care homes prior to testing. This includes:
    - Understanding Wi-Fi network capabilities, SSIDs, and password requirements.
    - Identifying potential firewall restrictions that might block WebRTC or WebSocket traffic to Fly.io or ElevenLabs.
    - Inquiring about captive portal authentication, which may require manual steps on each tablet.
- **Connectivity Requirements**: Clearly document minimum bandwidth requirements for stable audio streaming and interaction.
- **Fallback/Contingency**: Explore options for environments with unreliable Wi-Fi, such as:
    - Testing with cellular-enabled tablets (if budget allows).
    - Providing guidance on using mobile hotspots as a temporary solution (with an understanding of potential data costs).
- **Local Network Diagnostics**: Include a simple diagnostic tool within the Ambi application (or a separate test page) that can check connectivity to essential backend services and ElevenLabs.

### 14.3 Test User Management and Onboarding
- **Pilot User Accounts**: A system for creating and managing distinct user profiles for each elderly participant within the Ambi backend. This will allow for personalized context and tracking of individual engagement.
- **Caregiver/Staff Onboarding Flow**:
    - A simplified web portal or interface for authorized caregivers/staff to:
        - Register new elderly participants for a pilot.
        - Input essential initial context (name, key preferences, emergency contact if Ambi were to have such features later – though not for POC).
        - View basic, anonymized engagement summaries for their assigned participants (if ethically approved and relevant for the pilot).
    - Clear, concise instruction guides (digital and printable) for setting up Ambi on a tablet for an elderly user.
- **Session Management**: Ensure robust session management on tablets to maintain user login status while simplifying re-access.

### 14.4 Field Data Collection and Feedback
- **Qualitative Feedback Mechanisms**:
    - **In-App Feedback**: A simple, optional, large-button feedback mechanism within the Ambi interface (e.g., "How was this chat? 😊 / 😐 / 😞").
    - **Observer Notes**: Structured templates for researchers or care home staff observing interactions (e.g., noting points of confusion, delight, technical issues).
    - **Interviews**: Post-session or weekly brief interviews with participants (where feasible) and caregivers to gather richer insights.
- **Automated Logging**: Supplement built-in analytics (Section 11) with specific logs related to field testing, such as connectivity issues, session duration in specific environments, and usage of any test-specific features.
- **Centralized Feedback Repository**: All qualitative and quantitative feedback will be collected and organized for systematic review.

### 14.5 Ethical Approvals and Consent for Field Testing
- **Institutional Review Board (IRB) / Ethics Committee**: If applicable, an IRB or ethics committee approval will be sought, especially given the vulnerable target population.
- **Informed Consent Process**:
    - Develop clear, large-print, plain-language consent forms explaining:
        - The purpose of Ambi and the pilot study.
        - What data will be collected (especially voice and potentially derived emotion data).
        - How data will be used, stored, and protected (referencing ElevenLabs for voice processing).
        - The voluntary nature of participation and the right to withdraw.
        - Potential risks and benefits.
    - For participants unable to provide full consent themselves, a process for obtaining consent from legally authorized representatives or guardians will be followed, ensuring the participant's assent is also sought where possible.
- **Privacy during Observation**: Protocols for researchers or observers to minimize intrusion and maintain participant dignity during on-site testing.

### 14.6 Test Instance Deployment Strategy (Fly.io)
- **Dedicated Test Environments**: Utilize Fly.io's capabilities to easily spin up and manage isolated test instances/environments if needed (e.g., `test-group-A.ambi.fly.dev`, `test-group-B.ambi.fly.dev`).
- **Configuration Management**: Ability to deploy test instances with slightly different configurations or feature flags to test variations (e.g., different proactive engine settings, voice variations).
- **Data Isolation**: Ensure data from different test groups or homes is appropriately segregated in backend databases if necessary.
- **Scalability for Pilots**: While POC is small, design for graceful scaling of test instances on Fly.io as pilot programs expand.

### 14.7 On-Site Technical Support Plan
- **Designated Support Contact**: A primary technical contact person will be assigned for the duration of field tests.
- **Communication Channel**: A dedicated phone number and email address for on-site staff (e.g., care home liaisons) to report urgent technical issues.
- **Troubleshooting Guide**: A simple troubleshooting guide for common issues (e.g., "Ambi isn't talking," "Cannot connect to Wi-Fi") provided to on-site coordinators.
- **Remote Diagnostics/Support**: Capability for the technical team to remotely diagnose issues if tablets can connect to the internet (e.g., checking server logs, application status on Fly.io).
- **On-Site Visits (If Necessary)**: Budget and plan for potential on-site visits by the technical team if critical issues cannot be resolved remotely, especially during initial setup or widespread problems.

## 15. Cost Projections

### Development Costs
- ElevenLabs API: $150-$300/month (development tier)
- Fly.io hosting: $100-$200/month (POC infrastructure)
- Development team: Internal resources (personnel/salary costs are not included in these operational cost projections).

### POC User Costs
- 50 test users: ~$500-$1000/month for ElevenLabs usage
- Infrastructure scaling: ~$300-$500/month additional Fly.io resources
- Support and monitoring: Internal resources

### Projected Production Model
- Software subscription: $50/month per user
- Hardware (future): $2000 upfront + $500/year subscription

## 16. Risks and Mitigations

### Technical Risks
- **Risk**: Latency issues affecting conversation quality
  - **Mitigation**: Edge deployment, optimize audio processing, fallback mechanisms

- **Risk**: Emotion detection accuracy limitations
  - **Mitigation**: Conservative classification, confidence thresholds, multi-modal signals, qualitative POC target.

- **Risk**: Elderly adoption challenges
  - **Mitigation**: Simplified UX, caregiver onboarding assistance, robust help system

### Business Risks
- **Risk**: ElevenLabs API cost scaling
  - **Mitigation**: Caching strategies, usage optimization, tiered feature access

- **Risk**: Competitor offerings with similar capabilities
  - **Mitigation**: Focus on elderly-specific optimizations, superior emotion intelligence

- **Risk**: Regulatory concerns regarding elder care
  - **Mitigation**: Clear product positioning as companion not medical device, compliance review

### Resource and Timeline Risks
- **Risk**: Dependency on a small internal team; illness or departure of a key member could significantly impact the timeline.
  - **Mitigation**: Prioritize comprehensive documentation, encourage knowledge sharing across the team, and design modular components to reduce single-person dependencies.

- **Risk**: The ambitious 12-week timeline for the POC may be challenged by unforeseen technical hurdles, integration complexities, or scope creep.
  - **Mitigation**: Implement agile development practices with frequent progress reviews and scope reassessment, maintain a strict focus on core MVP features, and clearly define "done" for each task and phase.

## 17. Success Criteria for POC

### Minimum Viable Product (MVP) Requirements
1. Conversational interaction with <1 second response latency
2. Basic emotion detection and appropriate responses
3. Time-based proactive engagement (morning, evening)
4. Elderly-optimized user interface
5. Deployment on Fly.io with >95% uptime

### Stretch Goals
1. Advanced emotion detection with nuanced responses
2. Context-aware proactive engagement
3. Simple recurring memory of important conversations
4. Integration with basic scheduling/reminders
5. Custom voice optimized for elderly comprehension

## 18. Conclusion

The Ambi POC represents a significant opportunity to address the growing loneliness epidemic, particularly among elderly populations. By leveraging cutting-edge technology from ElevenLabs and deploying on Fly.io's global infrastructure, we can create an emotionally intelligent companion that provides meaningful interaction and proactive engagement. This POC will demonstrate the core value proposition and set the foundation for future hardware integration and market expansion.

---

## Appendix A: Detailed ElevenLabs Conversational AI Integration and Usage

This appendix outlines the comprehensive plan for integrating and utilizing ElevenLabs Conversational AI as the core engine for Ambi's interactive capabilities. It details how various platform features will be leveraged to meet Ambi's specific requirements for an emotionally intelligent companion for the elderly.

### 1. Core Platform Orchestration
Ambi will leverage the full spectrum of the ElevenLabs Conversational AI platform, which orchestrates:
- **Speech-to-Text (STT)**: For transcribing user's spoken words.
- **Large Language Model (LLM)**: The "brain" providing intelligent and context-aware responses. Ambi will guide this LLM extensively through system prompts.
- **Text-to-Speech (TTS)**: The "voice" delivering natural and emotionally resonant speech.
- **Interruption Handling & Turn-Taking Logic**: Essential for natural, human-like conversation.

### 2. Agent Configuration
A custom ElevenLabs agent profile will be configured for Ambi with the following characteristics:
- **Optimization for Elderly Users**: All settings fine-tuned for this demographic.
- **Elder-Friendly Voice Settings**: Specific voice models, clarity, pace, and tone will be selected (see Section A.4: Voice Customization).
- **Interruption Sensitivity**: Tuned for elderly speech patterns, allowing for natural pauses without premature interruption by the agent, yet responsive enough to allow users to interject.
- **Low-Latency Response Mode**: Prioritized to ensure conversational exchanges feel immediate and natural (<1 second target).

### 3. System Prompt Strategy
The system prompt is critical for guiding the ElevenLabs LLM. Ambi's "Custom Context Service" will dynamically generate and update these prompts.
- **Dynamic Generation**: Prompts will be continuously updated based on real-time context.
- **Content Domains**:
    - **Personality Guidance**: Warm, patient, empathetic, clear, and respectful, aligning with Ambi's companion role.
    - **Current Context**: Time of day, recent interactions, user's detected emotional state (from Ambi's Vision Service), and relevant environmental cues.
    - **User Information**: Key details from Ambi's knowledge base such as name, preferences, important dates (birthdays, anniversaries), past positive topics, and information shared by caregivers.
    - **Conversation Guidance**: Suggested topics, reminders, cues for proactive engagement, and strategies for handling specific user needs or moods.
    - **Elderly Interaction Guidelines**: Specific instructions for the LLM on how to best communicate with elderly users (e.g., avoiding complex jargon, confirming understanding, patience).

### 4. Voice Customization
The voice is a cornerstone of Ambi's persona.
- **Model Selection**: Prioritize ElevenLabs models like "Eleven Multilingual v2" for its natural-sounding output and rich emotional expression, crucial for an emotionally intelligent companion.
- **Acoustic Properties**:
    - **Clarity**: Enhanced mid-frequencies for better audibility.
    - **Pace**: Slightly slower speech rate (e.g., 0.8x-0.9x of standard) for improved comprehension.
    - **Tone**: Warm, friendly, and calming.
- **Dynamic Adjustments**: Potential for subtle dynamic adjustments based on user feedback or detected comprehension difficulties (e.g., slightly slowing pace if confusion is detected).

### 5. Language Support
- **Initial Deployment**: English, tailored to the U.S. elderly population.
- **Future Scalability**: The choice of ElevenLabs models like "Eleven Multilingual v2" (29 languages) or "Eleven Flash v2.5" (32 languages) provides a clear path for future multilingual support, should Ambi expand to other regions or cater to multilingual users.

### 6. Knowledge Base Integration
Ambi will maintain its own knowledge base, managed by the "Custom Context Service." This information will be strategically injected into the ElevenLabs system prompt to provide deep context.
- **Content Sources**:
    - User profiles: Name, age, preferences, personal history snippets.
    - Caregiver inputs: Important routines, health notes (non-medical), topics of joy or concern.
    - Interaction history: Summaries of past meaningful conversations, recurring themes.
    - Curated content: Age-appropriate news, stories, jokes, or discussion prompts.
- **Mechanism**: Dynamically updating the system prompt ensures the LLM has the most relevant "facts" for the current interaction.
- **RAG Potential**: While the primary method is system prompt injection, Ambi will explore Retrieval-Augmented Generation (RAG) capabilities if offered and suitable within ElevenLabs, to ground responses more deeply in Ambi's dedicated knowledge base, especially for complex queries or reminiscence therapy.

### 7. Personalization
Personalization is key to Ambi's value proposition.
- **System Prompts**: The primary vector for personalization, tailoring the LLM's persona, context, and knowledge to each user.
- **Voice Adaptation**: While the core voice will be consistent, subtle prosody or emotional expression might be adapted based on the interaction context.
- **Content & Topics**: Proactive engagement and conversation starters will be chosen based on individual user profiles, detected emotions, and historical engagement patterns.

### 8. Conversation Flow and Interruption Handling
Natural conversation flow is paramount.
- **Turn-Taking**: Leverage ElevenLabs' built-in logic, configured for patience, allowing users ample time to formulate thoughts and speak.
- **Interruption Management**: Utilize ElevenLabs' native interruption handling. Ambi's system will monitor interruption events, potentially adjusting its speaking style or rephrasing if the user frequently interrupts due to misunderstanding or eagerness.
- **Ambi's Role**: Ambi's backend services (Proactive Engine, Vision Service, Custom Context Service) will work in concert with ElevenLabs, managing the overarching conversational state, deciding when to initiate/end conversations, and what context to provide.

### 9. Event Management
Ambi will utilize events from ElevenLabs and its own internal events.
- **ElevenLabs Events**: The "ElevenLabs Connector" will subscribe to events such as:
    - `conversation_started`, `conversation_ended`
    - `user_speech_detected`, `user_speech_ended`
    - `agent_speech_started`, `agent_speech_ended`
    - `interruption_detected`
    - `error_occurred`
- **Ambi's Use of Events**: These events will inform Ambi's state machine, trigger logging, update user engagement metrics, and potentially influence the Proactive Engine (e.g., if frequent errors or short conversations are detected).
- **Internal Ambi Events**: Triggers from Ambi's "Vision Service" (e.g., user appears sad) or "Proactive Engine" (e.g., time for a morning greeting) will initiate actions like updating the system prompt or starting a new conversation via the ElevenLabs platform.

### 10. "Tools" Integration Strategy
- **Indirect Tool Use**: For the POC, Ambi's backend services (especially the "Custom Context Service" and "Proactive Engine") will act as the primary "tools." They will prepare and provide information (e.g., curated news, reminders, user history) to the ElevenLabs LLM via the system prompt. The LLM itself won't directly call external tools.
- **Future Exploration**: If ElevenLabs agents gain the ability to directly invoke external APIs or "tools" (e.g., for real-time weather, news lookups, or smart home controls), Ambi would evaluate integrating such features to further enhance conversational capabilities.

### 11. Custom LLM Guidance
Ambi will use the powerful LLM integrated within the ElevenLabs Conversational AI platform.
- **Achieving "Custom" Behavior**: While not swapping the foundational LLM, Ambi will achieve highly "customized" and domain-specific LLM behavior through meticulous and dynamic crafting of the system prompt. This prompt engineering, managed by the "Custom Context Service," is Ambi's core strategy for aligning the LLM's responses with Ambi's persona, ethical guidelines, and the specific needs of elderly users.

### 12. Interface/Widget Integration
- **Primary Interface**: Ambi's user interface is a custom-developed React Native Web application, optimized for tablets and elderly accessibility (large fonts, high contrast, simple navigation).
- **Core Conversational Elements**: The audio input (microphone access via WebRTC) and audio output (playing ElevenLabs' synthesized speech) will be deeply embedded into this custom UI. This will likely involve using ElevenLabs' WebSockets for real-time audio streaming.
- **No Direct "Widget"**: Ambi will not use a pre-built "widget" in the traditional sense. Instead, it will integrate ElevenLabs' conversational capabilities as a service into its bespoke front-end, ensuring full control over the user experience and adherence to accessibility requirements.

### 13. API Interaction and Authentication
This section details the specific API interactions with ElevenLabs.
- **API Gateway**: Ambi's own API Gateway will manage authentication for the end-user client (the tablet application).
- **ElevenLabs Connector Service**: This backend Ambi service will be responsible for all secure communication with ElevenLabs APIs, managing API keys and any required authentication tokens.

#### a. Conversation Creation
- **Endpoint**: `/v1/conversational-agent/conversations` (POST)
- **Purpose**: To initiate a new conversation session with the configured Ambi agent on ElevenLabs.
- **Key Parameters Sent by Ambi**:
  - `agent_id`: Ambi's unique ElevenLabs agent ID.
  - `system_prompt`: The initial, dynamically generated system prompt from Ambi's "Custom Context Service."
  - `initial_message` (optional): A first utterance from Ambi to start the conversation.
  - `voice_settings`: Reference to the pre-configured custom voice or specific voice ID.
  - `settings`: Configuration for interruption sensitivity, latency preferences, etc.

#### b. WebSocket Communication
- **Endpoint**: `/v1/conversational-agent/conversations/{conversationId}/websocket`
- **Purpose**: Enables real-time, bidirectional audio streaming and text message exchange for the active conversation.
- **Key Message Types Handled by Ambi's Connector**:
  - `auth`: Client (Ambi's Connector) sends an authentication message to secure the WebSocket connection.
  - `audio_input`: Ambi streams user's microphone audio data (e.g., Opus encoded) to ElevenLabs.
  - `text_input`: Ambi can send user's transcribed text if STT is handled partially client-side or for text-based interaction.
  - `audio_output`: ElevenLabs streams synthesized speech audio data back to Ambi, which is then played to the user.
  - `text_output`: ElevenLabs sends transcribed agent responses.
  - `event_messages`: Various status and event notifications (e.g., speech detected, interruption).

#### c. System Prompt Updates (Dynamic Context Injection)
- **Endpoint**: `/v1/conversational-agent/conversations/{conversationId}/system-prompt` (PATCH)
- **Purpose**: To dynamically update the system prompt for an ongoing conversation, allowing Ambi to inject new context or modify guidance for the LLM in real-time.
- **Key Parameters Sent by Ambi**:
  - `system_prompt`: The new or modified system prompt string. This is crucial for Ambi's emotional responsiveness and context awareness.

### 14. Privacy Considerations with ElevenLabs
Integrating a third-party service for core conversational capabilities requires careful attention to privacy. All interactions will adhere to Ambi's main Privacy Policy (Section 9), with specific considerations for ElevenLabs:
- **Data Transmitted**: Ambi will transmit user audio (for STT) and contextual data (via system prompts) to ElevenLabs. Synthesized audio is received back.
- **Data Minimization**: System prompts will be designed to provide necessary context without transmitting excessive or unnecessary personally identifiable information (PII). Pseudonymization techniques will be explored.
- **No Long-Term Storage by Ambi**: As per policy, Ambi does not store raw audio or video. Data is streamed for processing.
- **ElevenLabs' Policies**: Ambi will maintain an understanding of ElevenLabs' data handling, processing, and retention policies to ensure they align with Ambi's privacy commitments and relevant regulations (e.g., HIPAA considerations if user health is ever discussed, though Ambi is not a medical device).
- **Transparency**: Users will be informed that their voice interactions are processed by ElevenLabs as part of Ambi's service.

## Appendix B: Elderly-Specific Design Considerations

### Visual Design
- Minimum text size: 16pt
- High contrast color scheme (AA accessibility)
- Clear iconography with text labels
- Simplified navigation with consistent patterns

### Audio Design
- Clear voice optimization (enhanced mid-frequencies)
- Slower speech rate (0.8-0.9x normal)
- Appropriate volume levels (adjustable)
- Minimal background sounds or effects

### Interaction Design
- Simple, predictable interaction patterns
- Generous timing for responses
- Clear feedback for system state
- Limited options to prevent confusion

### Content Design
- Age-appropriate references and examples
- Respectful, non-patronizing language
- Clear, concise instructions
- Repetition of important information