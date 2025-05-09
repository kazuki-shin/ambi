# Product Requirements Document (PRD)
# Ambi - Emotionally Intelligent Companion Robot for the Elderly

## 1. Executive Summary

Ambi is an emotionally intelligent digital companion designed to address the loneliness epidemic affecting 50% of U.S. adults, with special focus on seniors (65+). This PRD outlines our plan to build a web-based POC leveraging ElevenLabs Conversational AI as the core technology, deployed on Fly.io. The product combines emotionally responsive conversation with proactive engagement capabilities specifically tailored to elderly users.

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
- Leverages ElevenLabs Conversational Agents for natural dialogue
- Custom voice optimized for elderly hearing and comprehension
- Native interrupt handling for natural conversation flow
- Real-time audio streaming with minimal latency

#### 2. Emotion Detection System
- Camera-based facial expression analysis
- Basic emotional state recognition (happy, sad, neutral, confused)
- Emotion-aware response adaptation
- Privacy-preserving processing (edge computing where possible)

#### 3. Proactive Engagement Engine
- Time-based engagement triggers (morning greetings, evening check-ins)
- Emotional state triggers (engaging when user appears lonely)
- Context-aware conversation starters
- Natural disengagement when appropriate

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
  - Scene understanding for context

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

### ElevenLabs Conversational AI Configuration

#### Agent Configuration
- Custom agent optimized for elderly users
- Elder-friendly voice settings (clarity, pace, tone)
- Interruption sensitivity tuned for elderly speech patterns
- Low-latency response mode

#### System Prompt Structure
- Personality guidance (warm, patient, clear)
- Current context (time, user emotion, environment)
- User information (preferences, important dates)
- Conversation guidance (topics, reminders)
- Special instructions for elderly interaction

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

## 14. Cost Projections

### Development Costs
- ElevenLabs API: $150-$300/month (development tier)
- Fly.io hosting: $100-$200/month (POC infrastructure)
- Development team: Not included (internal resources)

### POC User Costs
- 50 test users: ~$500-$1000/month for ElevenLabs usage
- Infrastructure scaling: ~$300-$500/month additional Fly.io resources
- Support and monitoring: Internal resources

### Projected Production Model
- Software subscription: $50/month per user
- Hardware (future): $2000 upfront + $500/year subscription

## 15. Risks and Mitigations

### Technical Risks
- **Risk**: Latency issues affecting conversation quality
  - **Mitigation**: Edge deployment, optimize audio processing, fallback mechanisms

- **Risk**: Emotion detection accuracy limitations
  - **Mitigation**: Conservative classification, confidence thresholds, multi-modal signals

- **Risk**: Elderly adoption challenges
  - **Mitigation**: Simplified UX, caregiver onboarding assistance, robust help system

### Business Risks
- **Risk**: ElevenLabs API cost scaling
  - **Mitigation**: Caching strategies, usage optimization, tiered feature access

- **Risk**: Competitor offerings with similar capabilities
  - **Mitigation**: Focus on elderly-specific optimizations, superior emotion intelligence

- **Risk**: Regulatory concerns regarding elder care
  - **Mitigation**: Clear product positioning as companion not medical device, compliance review

## 16. Success Criteria for POC

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

## 17. Conclusion

The Ambi POC represents a significant opportunity to address the growing loneliness epidemic, particularly among elderly populations. By leveraging cutting-edge technology from ElevenLabs and deploying on Fly.io's global infrastructure, we can create an emotionally intelligent companion that provides meaningful interaction and proactive engagement. This POC will demonstrate the core value proposition and set the foundation for future hardware integration and market expansion.

---

## Appendix A: ElevenLabs Conversational AI Integration Details

### API Endpoints and Methods

#### Conversation Creation
- **Endpoint**: `/v1/conversational-agent/conversations`
- **Method**: POST
- **Purpose**: Create a new conversation with the Ambi agent
- **Key Parameters**:
  - `agent_id`: Ambi's ElevenLabs agent ID
  - `system_prompt`: Custom context for the conversation
  - `initial_message`: First message to the user
  - `settings`: Configuration for interruption sensitivity, etc.

#### WebSocket Communication
- **Endpoint**: `/v1/conversational-agent/conversations/{conversationId}/websocket`
- **Purpose**: Real-time audio streaming and message exchange
- **Message Types**:
  - `auth`: Authentication message
  - `audio`: Audio data from user
  - `message`: Text messages
  - `audio_response`: Audio responses from agent

#### System Prompt Updates
- **Endpoint**: `/v1/conversational-agent/conversations/{conversationId}/system-prompt`
- **Method**: PATCH
- **Purpose**: Update the system prompt during a conversation
- **Key Parameters**:
  - `system_prompt`: New context information

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