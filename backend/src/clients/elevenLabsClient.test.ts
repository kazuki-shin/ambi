import { synthesizeSpeech, _setElevenLabsClientForTest } from './elevenLabsClient';
import dotenv from 'dotenv';

// Prevent dotenv from loading .env file automatically during tests
jest.mock('dotenv', () => ({ config: jest.fn() }));

// Load environment variables (optional, as we are injecting mocks)
dotenv.config();

// Mock the necessary structure: client -> textToSpeech -> convert
const mockConvert = jest.fn();
const mockTextToSpeech = {
  convert: mockConvert,
};
const mockClientInstance = {
  textToSpeech: mockTextToSpeech,
};

// Store the original implementation module to restore after tests if needed (especially for API key test)
const originalModule = jest.requireActual('./elevenLabsClient');

// Reset mocks and set the test client before each test
beforeEach(() => {
  mockConvert.mockClear();
  _setElevenLabsClientForTest(mockClientInstance as any); // Inject the mock client
  // Reset env vars potentially changed by tests
  delete process.env.ELEVENLABS_MODEL_ID;
  delete process.env.ELEVENLABS_DEFAULT_VOICE_ID;
});

// Restore the original client after all tests in this suite (optional, good practice)
afterAll(() => {
  _setElevenLabsClientForTest(originalModule.activeElevenLabsClient); // Attempt to restore original client logic if possible
});

describe('ElevenLabs Client - synthesizeSpeech', () => {
  const FALLBACK_DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
  const SDK_DEFAULT_MODEL_ID = 'eleven_multilingual_v2'; // Default in the code
  const DEFAULT_STABILITY = 0.5;
  const DEFAULT_SIMILARITY_BOOST = 0.75;

  // Helper to set up mock response
  const setupMockSuccess = () => {
    async function* mockAudioStream() { yield Buffer.from('audio'); }
    mockConvert.mockResolvedValue(mockAudioStream());
  };

  it('should call convert with fallback voice, default model, and default settings when no params provided', async () => {
    // Arrange
    setupMockSuccess();
    const mockText = 'Defaults test';

    // Act
    await synthesizeSpeech(mockText);

    // Assert
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(mockConvert).toHaveBeenCalledWith(FALLBACK_DEFAULT_VOICE_ID, {
      text: mockText,
      model_id: SDK_DEFAULT_MODEL_ID,
      voice_settings: {
        stability: DEFAULT_STABILITY,
        similarity_boost: DEFAULT_SIMILARITY_BOOST,
      },
    });
  });

  it('should use ELEVENLABS_MODEL_ID from environment variable if set', async () => {
    // Arrange
    const envModelId = 'eleven_turbo_v2';
    process.env.ELEVENLABS_MODEL_ID = envModelId; // Set env var
    jest.resetModules(); // Reset modules to read the updated env var state
    const { synthesizeSpeech: synthesizeSpeechFresh, _setElevenLabsClientForTest: setClientFresh } = await import('./elevenLabsClient');
    setClientFresh(mockClientInstance as any);
    setupMockSuccess();
    const mockText = 'Env Model ID test';

    // Act
    await synthesizeSpeechFresh(mockText);

    // Assert
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(mockConvert).toHaveBeenCalledWith('pNInz6obpgDQGcFmaJgB', {
      text: mockText,
      model_id: envModelId, // Check env var model was used
      voice_settings: {
        stability: DEFAULT_STABILITY,
        similarity_boost: DEFAULT_SIMILARITY_BOOST,
      },
    });
    jest.resetModules(); // Clean up
  });

  it('should use provided voiceSettings', async () => {
    // Arrange
    setupMockSuccess();
    const mockText = 'Custom settings test';
    const customSettings = { stability: 0.3, similarity_boost: 0.9 };

    // Act
    await synthesizeSpeech(mockText, null, customSettings);

    // Assert
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(mockConvert).toHaveBeenCalledWith('pNInz6obpgDQGcFmaJgB', {
      text: mockText,
      model_id: SDK_DEFAULT_MODEL_ID,
      voice_settings: { // Check custom settings were used
        stability: customSettings.stability,
        similarity_boost: customSettings.similarity_boost,
      },
    });
  });

  it('should use provided voiceId and default settings', async () => {
    // Arrange
    setupMockSuccess();
    const mockText = 'Custom voice, default settings';
    const customVoiceId = 'custom-voice-123';

    // Act
    await synthesizeSpeech(mockText, customVoiceId, null);

    // Assert
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(mockConvert).toHaveBeenCalledWith(customVoiceId, { // Check custom voice
      text: mockText,
      model_id: SDK_DEFAULT_MODEL_ID,
      voice_settings: { // Check default settings
        stability: DEFAULT_STABILITY,
        similarity_boost: DEFAULT_SIMILARITY_BOOST,
      },
    });
  });

  // --- Previous Default Voice ID tests (adjusted for new structure) ---

  it('should use fallback default voice ID when no voiceId and no env var is provided', async () => {
    // Arrange
    delete process.env.ELEVENLABS_DEFAULT_VOICE_ID; // Use delete instead
    setupMockSuccess();
    const mockText = 'Hello world - fallback default';

    // Act
    await synthesizeSpeech(mockText);

    // Assert
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(mockConvert).toHaveBeenCalledWith('pNInz6obpgDQGcFmaJgB', expect.any(Object));
  });

  it('should use environment variable default voice ID when no voiceId is provided', async () => {
    // Arrange
    const envVoiceId = 'env-default-voice-456';
    process.env.ELEVENLABS_DEFAULT_VOICE_ID = envVoiceId;
    jest.resetModules();
    const { synthesizeSpeech: synthesizeSpeechFresh, _setElevenLabsClientForTest: setClientFresh } = await import('./elevenLabsClient');
    setClientFresh(mockClientInstance as any);
    setupMockSuccess();
    const mockText = 'Hello world - env default';

    // Act
    await synthesizeSpeechFresh(mockText);

    // Assert
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(mockConvert).toHaveBeenCalledWith(envVoiceId, expect.any(Object)); // Check env var voice
    jest.resetModules();
  });

  it('should prioritize explicitly passed voiceId over environment variable default', async () => {
    // Arrange
    const envVoiceId = 'env-default-voice-456';
    const explicitVoiceId = 'explicit-voice-789';
    process.env.ELEVENLABS_DEFAULT_VOICE_ID = envVoiceId;
    setupMockSuccess();
    const mockText = 'Hello world - explicit priority';

    // Act
    await synthesizeSpeech(mockText, explicitVoiceId);

    // Assert
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(mockConvert).toHaveBeenCalledWith(explicitVoiceId, expect.any(Object)); // Check explicit voice
  });

  it('should return null and warn if the client is explicitly unset', async () => {
    // Arrange
    _setElevenLabsClientForTest(null);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const mockText = 'Test with unset client';

    // Act
    const result = await synthesizeSpeech(mockText);

    // Assert
    expect(result).toBeNull();
    expect(mockConvert).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('ElevenLabs client not initialized'));
    consoleWarnSpy.mockRestore();
    _setElevenLabsClientForTest(mockClientInstance as any); // Restore
  });

  it('should return null and log error if convert fails', async () => {
    // Arrange
    const mockText = 'Error test';
    const apiError = new Error('ElevenLabs API Error');
    mockConvert.mockRejectedValue(apiError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Act
    const result = await synthesizeSpeech(mockText);

    // Assert
    expect(result).toBeNull();
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ElevenLabs] Error synthesizing speech:', apiError);
    consoleErrorSpy.mockRestore();
  });

  // --- Cache Tests ---
  it('should return cached result on second call with identical parameters', async () => {
    // Arrange
    const text = 'Test cache hit';
    const voiceId = 'cache-voice-1';
    const settings = { stability: 0.6, similarity_boost: 0.6 };
    const mockAudioChunk = Buffer.from('cached audio data');
    const expectedAudioBuffer = mockAudioChunk;

    async function* mockAudioStream() { yield mockAudioChunk; }
    mockConvert.mockResolvedValue(mockAudioStream()); // API returns stream on first call

    // Act: First call (should miss cache, call API)
    const result1 = await synthesizeSpeech(text, voiceId, settings);

    // Assert: First call
    expect(result1).toEqual(expectedAudioBuffer);
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(mockConvert).toHaveBeenCalledWith(voiceId, expect.objectContaining({ text, voice_settings: settings }));

    // Arrange: Clear mock calls but NOT the cache
    mockConvert.mockClear();

    // Act: Second call (should hit cache, not call API)
    const result2 = await synthesizeSpeech(text, voiceId, settings);

    // Assert: Second call
    expect(result2).toEqual(expectedAudioBuffer); // Should get same buffer
    expect(mockConvert).not.toHaveBeenCalled(); // API should NOT have been called again
  });

  it('should not cache result if API call fails', async () => {
    // Arrange
    const text = 'Test no cache on error';
    const apiError = new Error('API Failed');
    mockConvert.mockRejectedValue(apiError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Act: First call (fails)
    const result1 = await synthesizeSpeech(text);

    // Assert: First call
    expect(result1).toBeNull();
    expect(mockConvert).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Arrange: Clear mock calls, make API succeed now
    mockConvert.mockClear();
    consoleErrorSpy.mockClear();
    async function* mockAudioStream() { yield Buffer.from('new audio'); }
    mockConvert.mockResolvedValue(mockAudioStream());

    // Act: Second call (should miss cache, call API again)
    const result2 = await synthesizeSpeech(text);

    // Assert: Second call
    expect(result2).toBeInstanceOf(Buffer);
    expect(mockConvert).toHaveBeenCalledTimes(1); // API called again
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error this time

    consoleErrorSpy.mockRestore();
  });

  it('should have separate cache entries for different parameters', async () => {
    // Arrange
    const text1 = 'Cache entry 1';
    const text2 = 'Cache entry 2'; // Different text
    const voice1 = 'v1';
    const settings1 = { stability: 0.5 };
    const settings2 = { stability: 0.6 }; // Different settings

    const buffer1 = Buffer.from('audio 1');
    const buffer2 = Buffer.from('audio 2');
    const buffer3 = Buffer.from('audio 3');

    // Call 1: text1, voice1, settings1 -> buffer1
    async function* stream1() { yield buffer1; }
    mockConvert.mockResolvedValueOnce(stream1());
    await synthesizeSpeech(text1, voice1, settings1);
    expect(mockConvert).toHaveBeenCalledTimes(1);
    mockConvert.mockClear();

    // Call 2: text2, voice1, settings1 -> buffer2 (Cache Miss)
    async function* stream2() { yield buffer2; }
    mockConvert.mockResolvedValueOnce(stream2());
    await synthesizeSpeech(text2, voice1, settings1);
    expect(mockConvert).toHaveBeenCalledTimes(1);
    mockConvert.mockClear();

    // Call 3: text1, voice1, settings2 -> buffer3 (Cache Miss)
    async function* stream3() { yield buffer3; }
    mockConvert.mockResolvedValueOnce(stream3());
    await synthesizeSpeech(text1, voice1, settings2);
    expect(mockConvert).toHaveBeenCalledTimes(1);
    mockConvert.mockClear();

    // Call 4: text1, voice1, settings1 -> buffer1 (Cache Hit)
    const result4 = await synthesizeSpeech(text1, voice1, settings1);
    expect(result4).toEqual(buffer1);
    expect(mockConvert).not.toHaveBeenCalled();

    // Call 5: text2, voice1, settings1 -> buffer2 (Cache Hit)
    const result5 = await synthesizeSpeech(text2, voice1, settings1);
    expect(result5).toEqual(buffer2);
    expect(mockConvert).not.toHaveBeenCalled();
  });

  // Add tests for caching etc. here
}); 