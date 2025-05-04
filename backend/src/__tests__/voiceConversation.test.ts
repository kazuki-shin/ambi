import request from 'supertest';
import mongoose from 'mongoose';
import { redisClient } from '../clients/redisClient';
import app from '../index';
import { voiceService } from '../services/voiceService';
import { getClaudeResponse } from '../clients/claudeClient';
import { addMessagePair, getHistory } from '../services/memoryService';

jest.mock('../services/voiceService', () => ({
  voiceService: {
    speechToText: {
      transcribe: jest.fn()
    },
    textToSpeech: {
      synthesize: jest.fn()
    }
  }
}));
jest.mock('../clients/claudeClient');
jest.mock('../services/memoryService');

const mockSpeechToText = voiceService.speechToText.transcribe as jest.MockedFunction<typeof voiceService.speechToText.transcribe>;
const mockTextToSpeech = voiceService.textToSpeech.synthesize as jest.MockedFunction<typeof voiceService.textToSpeech.synthesize>;
const mockGetClaudeResponse = getClaudeResponse as jest.MockedFunction<typeof getClaudeResponse>;
const mockAddMessagePair = addMessagePair as jest.MockedFunction<typeof addMessagePair>;
const mockGetHistory = getHistory as jest.MockedFunction<typeof getHistory>;

describe('POST /api/voice-conversation', () => {
  beforeEach(() => {
    mockSpeechToText.mockClear();
    mockTextToSpeech.mockClear();
    mockGetClaudeResponse.mockClear();
    mockAddMessagePair.mockClear();
    mockGetHistory.mockClear();

    mockGetHistory.mockReturnValue([]);
    mockSpeechToText.mockResolvedValue('Transcribed text');
    mockGetClaudeResponse.mockResolvedValue('Mocked Claude response.');
    mockTextToSpeech.mockResolvedValue(Buffer.from('Mocked audio data'));
  });

  it('should process voice input and return audio and text responses', async () => {
    const mockAudioBuffer = Buffer.from('Test audio data');
    const mockTranscribedText = 'Hello from voice test';
    const mockClaudeResponse = 'Mocked response to voice input';
    const mockAudioResponse = Buffer.from('Synthesized audio response');
    
    mockSpeechToText.mockResolvedValueOnce(mockTranscribedText);
    mockGetClaudeResponse.mockResolvedValueOnce(mockClaudeResponse);
    mockTextToSpeech.mockResolvedValueOnce(mockAudioResponse);

    const response = await request(app)
      .post('/api/voice-conversation')
      .set('Content-Type', 'application/octet-stream')
      .send(mockAudioBuffer);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('textReply', mockClaudeResponse);
    expect(response.body).toHaveProperty('audioReply', mockAudioResponse.toString('base64'));
    expect(response.body).toHaveProperty('sessionId');
    
    expect(mockSpeechToText).toHaveBeenCalledTimes(1);
    expect(mockSpeechToText).toHaveBeenCalledWith(expect.any(Buffer));
    
    expect(mockGetClaudeResponse).toHaveBeenCalledTimes(1);
    expect(mockGetClaudeResponse).toHaveBeenCalledWith(mockTranscribedText);
    
    expect(mockTextToSpeech).toHaveBeenCalledTimes(1);
    expect(mockTextToSpeech).toHaveBeenCalledWith(mockClaudeResponse);
    
    expect(mockAddMessagePair).toHaveBeenCalledTimes(1);
    expect(mockAddMessagePair).toHaveBeenCalledWith(
      expect.stringContaining('session_'),
      mockTranscribedText,
      mockClaudeResponse
    );
  });

  it('should use provided sessionId for conversation context', async () => {
    const mockAudioBuffer = Buffer.from('Test audio data');
    const sessionId = 'existing-session-456';
    const mockTranscribedText = 'Follow up voice message';
    const mockClaudeResponse = 'Mocked follow up response';
    
    mockSpeechToText.mockResolvedValueOnce(mockTranscribedText);
    mockGetClaudeResponse.mockResolvedValueOnce(mockClaudeResponse);
    mockTextToSpeech.mockResolvedValueOnce(Buffer.from('Audio response'));

    const response = await request(app)
      .post(`/api/voice-conversation?sessionId=${sessionId}`)
      .set('Content-Type', 'application/octet-stream')
      .send(mockAudioBuffer);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sessionId', sessionId);
    expect(mockGetHistory).toHaveBeenCalledWith(sessionId);
    expect(mockAddMessagePair).toHaveBeenCalledWith(
      sessionId,
      mockTranscribedText,
      mockClaudeResponse
    );
  });

  it('should return 400 if transcription fails', async () => {
    const mockAudioBuffer = Buffer.from('Invalid audio data');
    mockSpeechToText.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/voice-conversation')
      .set('Content-Type', 'application/octet-stream')
      .send(mockAudioBuffer);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Failed to transcribe audio');
    expect(mockGetClaudeResponse).not.toHaveBeenCalled();
    expect(mockTextToSpeech).not.toHaveBeenCalled();
    expect(mockAddMessagePair).not.toHaveBeenCalled();
  });

  it('should return 500 if speech synthesis fails', async () => {
    const mockAudioBuffer = Buffer.from('Test audio data');
    mockSpeechToText.mockResolvedValueOnce('Transcribed text');
    mockGetClaudeResponse.mockResolvedValueOnce('Claude response');
    mockTextToSpeech.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/voice-conversation')
      .set('Content-Type', 'application/octet-stream')
      .send(mockAudioBuffer);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to synthesize speech');
    expect(mockSpeechToText).toHaveBeenCalled();
    expect(mockGetClaudeResponse).toHaveBeenCalled();
    expect(mockAddMessagePair).toHaveBeenCalled();
  });

  it('should return 500 if Claude client fails', async () => {
    const mockAudioBuffer = Buffer.from('Test audio data');
    mockSpeechToText.mockResolvedValueOnce('Transcribed text');
    mockGetClaudeResponse.mockRejectedValueOnce(new Error('Claude API Error'));

    const response = await request(app)
      .post('/api/voice-conversation')
      .set('Content-Type', 'application/octet-stream')
      .send(mockAudioBuffer);

    expect(response.status).toBe(500);
    expect(mockSpeechToText).toHaveBeenCalled();
    expect(mockGetClaudeResponse).toHaveBeenCalled();
    expect(mockTextToSpeech).not.toHaveBeenCalled();
    expect(mockAddMessagePair).not.toHaveBeenCalled();
  });

  afterAll(async () => {
    try {
      await mongoose.disconnect();
      
      if (redisClient) {
        await redisClient.quit();
      }
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  });
});
