import request from 'supertest';
import mongoose from 'mongoose';
import { redisClient } from '../clients/redisClient';
import app from '../index';
import { transcribeSpeech } from '../clients/deepgramClient';
import { synthesizeSpeech } from '../clients/elevenLabsClient';
import { getClaudeResponse } from '../clients/claudeClient';
import { addMessagePair, getHistory } from '../services/memoryService';

jest.mock('../clients/deepgramClient');
jest.mock('../clients/elevenLabsClient');
jest.mock('../clients/claudeClient');
jest.mock('../services/memoryService');

const mockTranscribeSpeech = transcribeSpeech as jest.MockedFunction<typeof transcribeSpeech>;
const mockSynthesizeSpeech = synthesizeSpeech as jest.MockedFunction<typeof synthesizeSpeech>;
const mockGetClaudeResponse = getClaudeResponse as jest.MockedFunction<typeof getClaudeResponse>;
const mockAddMessagePair = addMessagePair as jest.MockedFunction<typeof addMessagePair>;
const mockGetHistory = getHistory as jest.MockedFunction<typeof getHistory>;

describe('POST /api/voice-conversation', () => {
  beforeEach(() => {
    mockTranscribeSpeech.mockClear();
    mockSynthesizeSpeech.mockClear();
    mockGetClaudeResponse.mockClear();
    mockAddMessagePair.mockClear();
    mockGetHistory.mockClear();

    mockGetHistory.mockReturnValue([]);
    mockTranscribeSpeech.mockResolvedValue('Transcribed text');
    mockGetClaudeResponse.mockResolvedValue('Mocked Claude response.');
    mockSynthesizeSpeech.mockResolvedValue(Buffer.from('Mocked audio data'));
  });

  it('should process voice input and return audio and text responses', async () => {
    const mockAudioBuffer = Buffer.from('Test audio data');
    const mockTranscribedText = 'Hello from voice test';
    const mockClaudeResponse = 'Mocked response to voice input';
    const mockAudioResponse = Buffer.from('Synthesized audio response');
    
    mockTranscribeSpeech.mockResolvedValueOnce(mockTranscribedText);
    mockGetClaudeResponse.mockResolvedValueOnce(mockClaudeResponse);
    mockSynthesizeSpeech.mockResolvedValueOnce(mockAudioResponse);

    const response = await request(app)
      .post('/api/voice-conversation')
      .set('Content-Type', 'application/octet-stream')
      .send(mockAudioBuffer);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('textReply', mockClaudeResponse);
    expect(response.body).toHaveProperty('audioReply', mockAudioResponse.toString('base64'));
    expect(response.body).toHaveProperty('sessionId');
    
    expect(mockTranscribeSpeech).toHaveBeenCalledTimes(1);
    expect(mockTranscribeSpeech).toHaveBeenCalledWith(expect.any(Buffer));
    
    expect(mockGetClaudeResponse).toHaveBeenCalledTimes(1);
    expect(mockGetClaudeResponse).toHaveBeenCalledWith(mockTranscribedText);
    
    expect(mockSynthesizeSpeech).toHaveBeenCalledTimes(1);
    expect(mockSynthesizeSpeech).toHaveBeenCalledWith(mockClaudeResponse);
    
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
    
    mockTranscribeSpeech.mockResolvedValueOnce(mockTranscribedText);
    mockGetClaudeResponse.mockResolvedValueOnce(mockClaudeResponse);
    mockSynthesizeSpeech.mockResolvedValueOnce(Buffer.from('Audio response'));

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
    mockTranscribeSpeech.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/voice-conversation')
      .set('Content-Type', 'application/octet-stream')
      .send(mockAudioBuffer);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Failed to transcribe audio');
    expect(mockGetClaudeResponse).not.toHaveBeenCalled();
    expect(mockSynthesizeSpeech).not.toHaveBeenCalled();
    expect(mockAddMessagePair).not.toHaveBeenCalled();
  });

  it('should return 500 if speech synthesis fails', async () => {
    const mockAudioBuffer = Buffer.from('Test audio data');
    mockTranscribeSpeech.mockResolvedValueOnce('Transcribed text');
    mockGetClaudeResponse.mockResolvedValueOnce('Claude response');
    mockSynthesizeSpeech.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/voice-conversation')
      .set('Content-Type', 'application/octet-stream')
      .send(mockAudioBuffer);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to synthesize speech');
    expect(mockTranscribeSpeech).toHaveBeenCalled();
    expect(mockGetClaudeResponse).toHaveBeenCalled();
    expect(mockAddMessagePair).toHaveBeenCalled();
  });

  it('should return 500 if Claude client fails', async () => {
    const mockAudioBuffer = Buffer.from('Test audio data');
    mockTranscribeSpeech.mockResolvedValueOnce('Transcribed text');
    mockGetClaudeResponse.mockRejectedValueOnce(new Error('Claude API Error'));

    const response = await request(app)
      .post('/api/voice-conversation')
      .set('Content-Type', 'application/octet-stream')
      .send(mockAudioBuffer);

    expect(response.status).toBe(500);
    expect(mockTranscribeSpeech).toHaveBeenCalled();
    expect(mockGetClaudeResponse).toHaveBeenCalled();
    expect(mockSynthesizeSpeech).not.toHaveBeenCalled();
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
