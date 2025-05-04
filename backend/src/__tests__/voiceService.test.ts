import { voiceService, DeepgramSpeechToTextService, ElevenLabsTextToSpeechService } from '../services/voiceService';
import { transcribeSpeech, transcribeSpeechFromUrl, setupLiveTranscription } from '../clients/deepgramClient';
import { synthesizeSpeech } from '../clients/elevenLabsClient';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('../clients/deepgramClient');
jest.mock('../clients/elevenLabsClient');

const mockTranscribeSpeech = transcribeSpeech as jest.MockedFunction<typeof transcribeSpeech>;
const mockTranscribeSpeechFromUrl = transcribeSpeechFromUrl as jest.MockedFunction<typeof transcribeSpeechFromUrl>;
const mockSetupLiveTranscription = setupLiveTranscription as jest.MockedFunction<typeof setupLiveTranscription>;
const mockSynthesizeSpeech = synthesizeSpeech as jest.MockedFunction<typeof synthesizeSpeech>;

describe('Voice Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DeepgramSpeechToTextService', () => {
    const service = new DeepgramSpeechToTextService();
    const testAudio = Buffer.from('test audio data');
    const testUrl = 'https://example.com/audio.mp3';

    it('should call transcribeSpeech with correct parameters', async () => {
      mockTranscribeSpeech.mockResolvedValueOnce('transcribed text');
      
      const result = await service.transcribe(testAudio);
      
      expect(mockTranscribeSpeech).toHaveBeenCalledWith(testAudio);
      expect(result).toBe('transcribed text');
    });

    it('should call transcribeSpeechFromUrl with correct parameters', async () => {
      mockTranscribeSpeechFromUrl.mockResolvedValueOnce('transcribed from url');
      
      const result = await service.transcribeFromUrl(testUrl);
      
      expect(mockTranscribeSpeechFromUrl).toHaveBeenCalledWith(testUrl);
      expect(result).toBe('transcribed from url');
    });

    it('should call setupLiveTranscription with correct parameters', () => {
      const options = { language: 'en-US' };
      const callback = jest.fn();
      
      mockSetupLiveTranscription.mockReturnValueOnce(null);
      
      service.setupLiveTranscription(options, callback);
      
      expect(mockSetupLiveTranscription).toHaveBeenCalledWith(options, callback);
    });
  });

  describe('ElevenLabsTextToSpeechService', () => {
    const service = new ElevenLabsTextToSpeechService();
    const testText = 'test text to synthesize';
    const testVoiceId = 'test-voice-id';

    it('should call synthesizeSpeech with correct parameters', async () => {
      const testBuffer = Buffer.from('audio data');
      mockSynthesizeSpeech.mockResolvedValueOnce(testBuffer);
      
      const result = await service.synthesize(testText);
      
      expect(mockSynthesizeSpeech).toHaveBeenCalledWith(testText, null);
      expect(result).toBe(testBuffer);
    });

    it('should pass voice id to synthesizeSpeech if provided', async () => {
      const testBuffer = Buffer.from('audio data');
      mockSynthesizeSpeech.mockResolvedValueOnce(testBuffer);
      
      const result = await service.synthesize(testText, { voiceId: testVoiceId });
      
      expect(mockSynthesizeSpeech).toHaveBeenCalledWith(testText, testVoiceId);
      expect(result).toBe(testBuffer);
    });
  });

  describe('AmbiVoiceService', () => {
    it('should create default services if none provided', () => {
      const service = voiceService;
      
      expect(service.speechToText).toBeInstanceOf(DeepgramSpeechToTextService);
      expect(service.textToSpeech).toBeInstanceOf(ElevenLabsTextToSpeechService);
    });
  });
});
