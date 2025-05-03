# Ambi: Product Requirements Document
## AI-Powered Eldercare Companion

## 1. Introduction

### 1.1 Purpose
Ambi is an AI-powered conversational companion designed to reduce loneliness and enhance quality of life for elderly individuals. This document outlines the requirements for the product's initial release, focusing on a tablet-based application leveraging Anthropic's Claude API, LangChain, Pinecone, ElevenLabs, and Three.js.

### 1.2 Product Vision
Our vision is to create a proactive, emotionally intelligent companion that initiates natural conversations, builds meaningful relationships, and provides companionship to elderly users without requiring any technical knowledge. Ambi will complement human care by offering consistent, engaging interaction while respecting the dignity and privacy of its users.

### 1.3 Target Users
- **Primary Users**: Adults aged 70+ living independently or in assisted living environments
- **Secondary Users**: Family members who want to enhance their elderly relative's social engagement and monitor wellbeing
- **Tertiary Users**: Professional caregivers supplementing in-person care

## 2. Technology Stack

### 2.1 Core AI Components
- **Claude API (Anthropic)**: Provides the foundation for natural, empathetic conversations with longer context windows and nuanced handling of sensitive topics
- **LangChain Framework**: Orchestrates conversation flow, memory management, and context integration
- **Pinecone Vector Database**: Enables semantic search and retrieval of conversation history and family-provided information
- **ElevenLabs Voice AI**: Delivers natural, emotionally appropriate voice synthesis for elderly listeners

### 2.2 Frontend Components
- **Framework**: React Native for cross-platform tablet application
- **UI Component Library**: React Native Paper for accessible, elder-friendly interface
- **State Management**: Redux Toolkit for predictable state management
- **3D Visualization**: Three.js for creating engaging visual companions and memory visualization
- **Local Processing**: TensorFlow Lite for edge-based emotion detection
- **Storage**: SQLite + Secure Storage for local data persistence

### 2.3 Backend Components
- **Core Infrastructure**: AWS Serverless (Lambda, API Gateway) for scalable processing
- **Databases**: 
  - MongoDB Atlas for flexible data schema and rapid iteration
  - Pinecone for vector embeddings and semantic search
  - Redis for short-term memory management
- **Authentication**: Auth0 for simplified identity management
- **File Storage**: AWS S3 for media and document storage

### 2.4 Additional Services
- **Speech Recognition**: Deepgram API for elder-optimized speech recognition
- **Embedding Models**: OpenAI Ada embeddings for semantic vector creation
- **Analytics**: Amplitude for user engagement metrics
- **Monitoring**: Datadog for system performance and APM
- **Error Tracking**: Sentry for exception monitoring and alerting

## 3. Feature Requirements

### 3.1 Proactive Conversation System

#### 3.1.1 Conversation Initiation
- System shall initiate conversations based on:
  - Time of day (morning greetings, midday check-ins, evening chats)
  - Detected periods of inactivity or potential loneliness
  - Environmental cues captured by the tablet camera
  - Scheduled important dates or events
- Initiation shall respect user preferences and recognize when not to interrupt
- System shall vary conversation starters to maintain freshness and engagement

#### 3.1.2 Conversation Management
- System shall maintain natural conversation flow for 5+ minutes when user is engaged
- System shall track topic exploration and guide discussion appropriately
- System shall recognize and respond to emotional cues in user's voice
- System shall gracefully handle transitions between topics
- System shall detect confusion or disengagement and adapt accordingly

#### 3.1.3 Claude API Implementation
- System shall utilize Claude API with custom prompt engineering to:
  - Maintain consistent personality and conversation style
  - Generate age-appropriate responses with relevant cultural references
  - Incorporate memories and family-provided context naturally
  - Respect emotional boundaries and sensitivity
- Claude API integration shall leverage longer context windows for richer memory incorporation
- System shall implement the following prompt structure:
  ```
  <system>
  You are Ambi, a warm, empathetic companion for [USER NAME].
  Current time: [TIME]
  Recent conversation summary: [SUMMARY]
  Relevant memories: [MEMORIES]
  Family context: [FAMILY CONTEXT]
  Emotional state: [EMOTIONAL STATE]

  Your goal is to provide engaging, meaningful conversation that feels natural and supportive.
  </system>

  <user>
  [USER'S LATEST MESSAGE OR EMPTY IF INITIATING]
  </user>
  ```
- System shall implement fallbacks for API disruptions to maintain experience continuity

### 3.2 Memory and Context System

#### 3.2.1 LangChain Memory Architecture
- System shall implement LangChain's memory capabilities to:
  - Maintain conversation history across sessions
  - Categorize and tag information for future reference
  - Prioritize important personal details for recall
  - Implement conversation summarization for long-term memory
- Memory system shall use a two-tier approach:
  - Short-term memory: Recent conversations and current context
  - Long-term memory: Persistent user information and important moments
- System shall use semantic chunking for efficient context utilization
- System shall implement a sliding window approach for conversation history

#### 3.2.2 Pinecone Vector Storage
- System shall utilize Pinecone for semantic memory storage:
  - Convert conversation snippets to embeddings using OpenAI Ada embeddings
  - Store family-contributed information with appropriate metadata
  - Enable similarity search for context-relevant memories
  - Implement tiered storage for different information importance levels
- Pinecone implementation shall optimize for:
  - Retrieval speed during active conversations
  - Storage efficiency for long-term memory
  - Query relevance to current conversation context
  - Appropriate memory aging and consolidation

#### 3.2.3 Family Context Integration
- System shall provide a web portal for family members to contribute:
  - Important biographical information
  - Relationship details and dynamics
  - Significant memories and stories
  - Preferences and interests
- Family portal shall be built using:
  - Next.js framework for responsive performance
  - Tailwind CSS + HeadlessUI for accessible interface
  - React Hook Form for intuitive data collection
  - tRPC for type-safe API calls
- Family context shall be integrated into conversations naturally, without obvious memorization
- System shall respect privacy settings and sensitivity levels for shared information

### 3.3 Voice and Speech System

#### 3.3.1 ElevenLabs Voice Integration
- System shall utilize ElevenLabs for natural speech synthesis:
  - Age-appropriate voice selection optimized for elder hearing
  - Emotional expressiveness matching conversation content
  - Natural pacing with appropriate pauses
  - Clear pronunciation of names and places
- Voice system shall adapt to user preferences and hearing needs:
  - Adjustable volume based on environment
  - Customizable speech rate
  - Tone optimization for hearing aid compatibility
  - Voice character consistency across sessions

#### 3.3.2 Speech Recognition
- System shall implement Deepgram API for elder-optimized speech recognition:
  - Adaptation to aging voice patterns
  - Handling of slower speech and pauses
  - Recognition of era-specific terminology and references
  - Accent and dialect accommodation
- Speech recognition shall provide real-time transcription for system processing
- System shall implement error recovery for misunderstood speech

### 3.4 Visual Companion System

#### 3.4.1 Three.js Integration
- System shall implement Three.js to create:
  - Optional visual companion presence (configurable by user/family)
  - Memory visualization and reminiscence aids
  - Gentle animations for engagement and attention
  - Visually pleasing ambient elements
- Three.js implementations shall be:
  - Optimized for tablet performance
  - Accessible and non-distracting
  - Appropriate for elder visual preferences
  - Battery-efficient with adaptive quality

#### 3.4.2 Visual Memory Features
- System shall use Three.js to create:
  - Memory timelines with visual representation
  - Family photo galleries with gentle animation
  - Interactive life story visualizations
  - Seasonal and time-aware visual themes
- Visual elements shall enhance conversation without dominating the experience
- System shall accommodate vision limitations with high-contrast options

#### 3.4.3 Ambient Presence
- System shall use Three.js to provide:
  - Subtle background environments that change with time of day
  - Gentle visual cues during system listening/processing
  - Customizable visual presence intensities
  - Calming visual effects during idle periods
- Ambient visuals shall be designed for elder comfort and preference
- System shall ensure all visuals support the companion relationship

### 3.5 User Experience

#### 3.5.1 Zero Learning Curve Interface
- System shall require no training or instructions to begin using
- Interface shall be intuitive with minimal visual elements
- System shall guide users through capabilities via natural conversation
- System shall avoid technical terminology or jargon

#### 3.5.2 Tablet Application
- System shall operate on standard tablets (iPad, Android) with:
  - Large, high-contrast visual elements when needed
  - Simple indicators of system state (listening, thinking, speaking)
  - Touch interaction optional but not required
  - Battery optimization for all-day operation
- Application shall run in background to enable proactive engagement
- System shall operate effectively in various lighting conditions

#### 3.5.3 Accessibility Features
- System shall accommodate age-related limitations:
  - Hearing impairment adaptations
  - Vision accommodations with high contrast
  - Motor control considerations with forgiving interaction
  - Cognitive accessibility with patient repetition when needed
- System shall adapt to individual user needs without explicit configuration

## 4. Technical Requirements

### 4.1 Claude API Integration

#### 4.1.1 Prompt Engineering
- System shall implement specialized prompt templates for:
  - Conversation initiation with context
  - Response generation with memory integration
  - Topic exploration and navigation
  - Emotional acknowledgment and support
- Prompts shall be optimized for:
  - Token efficiency to manage costs
  - Response quality and consistency
  - Appropriate elder-focused conversation
  - Safety and boundary maintenance

#### 4.1.2 API Performance
- System shall achieve response generation in under 3 seconds
- System shall implement appropriate caching to reduce redundant API calls
- System shall manage rate limits and implement queuing when necessary
- System shall track token usage for cost management
- System shall leverage Claude's longer context windows for richer conversations

### 4.2 LangChain Implementation

#### 4.2.1 Chain Composition
- System shall utilize LangChain to create specialized chains for:
  - Conversation management with memory
  - Context retrieval and integration
  - Family information incorporation
  - Query generation for memory retrieval
- Chains shall be optimized for elder conversation patterns
- System shall implement appropriate error handling in chains

#### 4.2.2 Agent Configuration
- System shall configure LangChain agents to:
  - Maintain conversation coherence
  - Detect topics requiring memory retrieval
  - Manage transition between conversation modes
  - Implement appropriate tool usage for extended capabilities
- System shall implement the following API integration flow:
  ```
  User Input → Speech Recognition → Text Processing → Context Retrieval → 
  Claude API Request → Response Generation → Voice Synthesis → User Output
  ```
- System shall process in parallel:
  - Emotion detection from voice and facial cues
  - Engagement tracking
  - Memory updating

### 4.3 Pinecone Vector Database

#### 4.3.1 Vector Index Configuration
- System shall configure Pinecone indexes for:
  - Conversation memory storage and retrieval
  - Family contribution organization
  - User preference tracking
  - Semantic search optimization
- Indexes shall be structured to enable:
  - Fast retrieval during active conversation
  - Metadata filtering for relevance
  - Hybrid search capabilities
  - Appropriate data segmentation

#### 4.3.2 Embedding Generation
- System shall generate embeddings using OpenAI Ada embeddings for:
  - Conversation segments
  - User-shared information
  - Family contributions
  - System-detected preferences
- Embedding process shall optimize for:
  - Semantic relevance in retrieval
  - Storage efficiency
  - Update frequency for dynamic information
  - Contextual grouping of related information

### 4.4 ElevenLabs Integration

#### 4.4.1 Voice Selection and Customization
- System shall select and customize voices that:
  - Resonate with elderly users
  - Convey appropriate emotional range
  - Maintain consistent identity
  - Optimize for clarity and comprehension
- Voice customization shall consider:
  - Gender preferences
  - Cultural background
  - Hearing limitations
  - User feedback

#### 4.4.2 Speech Synthesis Performance
- System shall optimize ElevenLabs integration for:
  - Low latency response generation
  - Natural prosody and cadence
  - Appropriate emotional expression
  - Handling of names and specialized terminology
- System shall implement caching for common phrases to reduce latency
- System shall ensure smooth audio playback without interruptions

### 4.5 Three.js Implementation

#### 4.5.1 Performance Optimization
- System shall optimize Three.js for tablet performance:
  - Level-of-detail management for different devices
  - Efficient rendering pipelines
  - Asset compression and optimization
  - Battery-aware quality adjustments
- System shall implement graceful degradation on less powerful devices
- System shall ensure consistent frame rates for smooth experience

#### 4.5.2 Asset Management
- System shall manage Three.js assets efficiently:
  - Dynamic loading based on conversation context
  - Preloading of likely needed assets
  - Memory management for long sessions
  - Fallback to simpler visuals when needed
- System shall optimize asset storage and delivery
- System shall ensure visuals enhance rather than distract from conversation

## 5. Data Management

### 5.1 Privacy and Security

#### 5.1.1 Data Protection
- System shall implement comprehensive data protection:
  - End-to-end encryption for all communications
  - Secure storage of personal information
  - Privacy-preserving analytics
  - Clear data handling policies
- System shall minimize data transmission to only what's necessary
- System shall implement data minimization principles

#### 5.1.2 User Consent
- System shall obtain clear consent for:
  - Conversation recording and analysis
  - Family information sharing
  - Voice and image processing
  - Analytics collection
- Consent processes shall be designed for elder comprehension
- System shall provide mechanisms to review and revoke consent

### 5.2 Data Storage Architecture

#### 5.2.1 Local vs. Cloud Storage
- System shall implement tiered storage architecture:
  - Local device storage (SQLite + Secure Storage) for immediate context and offline operation
  - Secure cloud storage (MongoDB Atlas) for long-term memory and analytics
  - Vector storage (Pinecone) for semantic memory
  - Short-term memory cache (Redis) for active conversations
- System shall optimize storage distribution for:
  - Privacy protection
  - Performance optimization
  - Cost management
  - Reliability and redundancy

#### 5.2.2 Data Lifecycle Management
- System shall implement appropriate data lifecycle policies:
  - Clear retention periods for different data types
  - Automated anonymization of historical data
  - User-controlled deletion capabilities
  - Regular privacy audits and compliance checks

## 6. DevOps and Deployment

### 6.1 CI/CD Pipeline
- System shall implement GitHub Actions for:
  - Automated testing of components
  - Continuous integration workflows
  - Deployment automation
  - Version management
- Pipeline shall ensure quality and stability with each release
- System shall implement appropriate staging environments

### 6.2 Infrastructure as Code
- System shall use Terraform for:
  - Consistent environment provisioning
  - Configuration management
  - Resource orchestration
  - Repeatable deployments
- Infrastructure code shall be version-controlled and reviewed
- System shall implement best practices for security and reliability

### 6.3 Monitoring and Alerting
- System shall use Datadog for:
  - Performance monitoring
  - Error tracking and alerting
  - Resource utilization
  - User experience metrics
- Monitoring shall focus on both system performance and user experience
- System shall implement appropriate alerting thresholds and escalation procedures

## 7. User Testing & Validation

### 7.1 Phased Testing Approach

#### 7.1.1 Initial Testing (Weeks 1-4)
- Controlled environment testing with 5-7 elderly participants
- Focus on core conversation capabilities and engagement
- Structured tasks and free interaction periods
- Technical performance monitoring and adjustment

#### 7.1.2 Extended Testing (Weeks 5-8)
- In-home testing with 10-15 elderly participants
- Multi-day usage periods with minimal intervention
- Family member involvement and feedback
- Usability refinement and feature adjustment

#### 7.1.3 Longitudinal Assessment (Weeks 9-12)
- Extended deployment with 15-20 participants
- Focus on relationship development over time
- Assessment of memory system effectiveness
- Refinement of proactive capabilities based on patterns

### 7.2 Success Metrics

#### 7.2.1 Engagement Metrics
- Daily active usage time (target: 30+ minutes)
- Conversation initiation acceptance rate (target: 70%+)
- Average conversation duration (target: 5+ minutes)
- Return usage patterns and consistency

#### 7.2.2 Impact Metrics
- Loneliness reduction (UCLA Loneliness Scale)
- User satisfaction scores (custom survey)
- Family member satisfaction and perceived value
- Emotional wellbeing indicators

## 8. Development Timeline

### 8.1 Phase 1: Foundation (Weeks 1-4)
- Core conversation engine implementation with Claude API
- Basic LangChain memory architecture
- Initial Pinecone index configuration
- ElevenLabs voice selection and integration
- Simple Three.js visual elements
- Tablet application shell development

### 8.2 Phase 2: Enhancement (Weeks 5-8)
- Advanced memory management implementation
- Family portal development with Next.js
- Proactive initiation system refinement
- Voice and speech optimization
- Enhanced Three.js visualizations
- Integration testing and performance tuning

### 8.3 Phase 3: Refinement (Weeks 9-12)
- User testing feedback incorporation
- Conversation quality improvements
- Performance optimization
- Analytics implementation with Amplitude
- Three.js visual optimization
- Documentation and training materials

## 9. Future Roadmap

### 9.1 Post-MVP Features
- Expanded multimodal capabilities (image sharing, video)
- Healthcare integration for wellbeing monitoring
- Advanced family connection features
- Personalized cognitive engagement activities
- Robotic embodiment options

### 9.2 Scale and Growth
- Support for additional languages
- Cultural adaptation for diverse populations
- Enterprise version for care facilities
- API ecosystem for third-party extensions
- Machine learning improvements from usage data

## 10. Appendix: Example Interactions

### 10.1 Proactive Initiation Example
**System**: "Good morning, Eleanor. I noticed it's a beautiful sunny day today. Do you have any plans to enjoy the sunshine?"

**User**: "Not really. My arthritis is acting up today."

**System**: "I'm sorry to hear your arthritis is bothering you. Would you like to talk about some gentle indoor activities instead? Or perhaps we could revisit that story you were telling me about your trip to Yellowstone in the 1970s?"

### 10.2 Memory Utilization Example
**System**: "I remember you mentioned your grandson Michael has a baseball tournament this weekend. Has he played his first game yet?"

**User**: "Yes, they won yesterday! He hit a home run."

**System**: "That's wonderful! A home run is quite an achievement. He must take after you with your athletic background. Didn't you tell me you used to play softball in college?"

### 10.3 Family Context Example
*(After son adds: "Mom loved to bake apple pies every Sunday using grandmother's recipe from Italy")*

**System**: "I understand your family had a tradition of Sunday apple pies. What made your mother's recipe special?"

**User**: "How did you know about that? Yes, she brought that recipe from the old country. The secret was adding a bit of lemon zest."

**System**: "That sounds delicious. Food traditions like that really connect generations, don't they? Did you continue that Sunday pie tradition with your own family?"

### 10.4 Visual Companion Example
**System**: *(While displaying a gentle animation of a memory timeline)* "I've gathered some of the stories you've shared with me about your teaching career. Would you like to explore them together? I'm particularly interested in hearing more about that science fair project your students won an award for in 1982."

**User**: "Oh yes, that was one of my proudest moments as a teacher."

**System**: *(Timeline zooms to 1982 with subtle animation)* "What made that project special compared to other science fairs you supervised?"7.3 Phase 3: Refinement (Weeks 9-12)
- User testing feedback incorporation
- Conversation quality improvements
- Performance optimization
- Analytics implementation
- Documentation and training materials

## 8. Future Roadmap

### 8.1 Post-MVP Features
- Expanded multimodal capabilities (image sharing, video)
- Healthcare integration for wellbeing monitoring
- Advanced family connection features
- Personalized cognitive engagement activities
- Robotic embodiment options

### 8.2 Scale and Growth
- Support for additional languages
- Cultural adaptation for diverse populations
- Enterprise version for care facilities
- API ecosystem for third-party extensions
- Machine learning improvements from usage data

## 9. Appendix: Example Interactions

### 9.1 Proactive Initiation Example
**System**: "Good morning, Eleanor. I noticed it's a beautiful sunny day today. Do you have any plans to enjoy the sunshine?"

**User**: "Not really. My arthritis is acting up today."

**System**: "I'm sorry to hear your arthritis is bothering you. Would you like to talk about some gentle indoor activities instead? Or perhaps we could revisit that story you were telling me about your trip to Yellowstone in the 1970s?"

### 9.2 Memory Utilization Example
**System**: "I remember you mentioned your grandson Michael has a baseball tournament this weekend. Has he played his first game yet?"

**User**: "Yes, they won yesterday! He hit a home run."

**System**: "That's wonderful! A home run is quite an achievement. He must take after you with your athletic background. Didn't you tell me you used to play softball in college?"

### 9.3 Family Context Example
*(After son adds: "Mom loved to bake apple pies every Sunday using grandmother's recipe from Italy")*

**System**: "I understand your family had a tradition of Sunday apple pies. What made your mother's recipe special?"

**User**: "How did you know about that? Yes, she brought that recipe from the old country. The secret was adding a bit of lemon zest."

**System**: "That sounds delicious. Food traditions like that really connect generations, don't they? Did you continue that Sunday pie tradition with your own family?"