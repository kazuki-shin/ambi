import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, PermissionsAndroid } from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  TextInput,
  Button,
  IconButton,
} from 'react-native-paper';
import { MD3Theme } from 'react-native-paper';
import { sendConversationMessage, sendVoiceMessage } from '../services/apiClient';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

// Define possible states
type SystemStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

const HomeScreen = () => {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  // State variables
  const [currentStatus, setCurrentStatus] = useState<SystemStatus>('IDLE');
  const [inputText, setInputText] = useState('');
  const [lastReply, setLastReply] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [_recordedAudioPath, _setRecordedAudioPath] = useState<string | null>(null);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  const requestMicrophonePermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Ambi needs access to your microphone to enable voice conversations.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Failed to request microphone permission:', err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  }, []);

  // Define processVoiceMessage first to avoid circular dependency
  const processVoiceMessage = useCallback(async (recordedPath: string) => {
    if (!recordedPath) {return;}

    setLastReply('');
    setCurrentStatus('THINKING');

    try {
      const response = await fetch(`file://${recordedPath}`);
      const audioBlob = await response.blob();

      const voiceResponse = await sendVoiceMessage(audioBlob, undefined, sessionId);

      if (voiceResponse.sessionId) {
        setSessionId(voiceResponse.sessionId);
      }

      setLastReply(voiceResponse.textReply);

      setCurrentStatus('SPEAKING');

      // const _base64Audio = voiceResponse.audioReply;
      const responseAudioPath = Platform.OS === 'ios'
        ? `${Date.now()}.m4a`
        : `${Platform.OS === 'android' ? 'sdcard/' : ''}ambi_response_${Date.now()}.mp3`;

      await audioRecorderPlayer.startPlayer(responseAudioPath);

      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.currentPosition === e.duration) {
          audioRecorderPlayer.removePlayBackListener();
          setCurrentStatus('IDLE');
          setIsPlaying(false);
        }
      });

      setIsPlaying(true);
    } catch (error) {
      console.error('Error processing voice message:', error);
      setLastReply('Error: Could not process voice message.');
      setCurrentStatus('ERROR');
    }
  }, [audioRecorderPlayer, sessionId]);

  const stopRecordingAndSend = useCallback(async () => {
    if (!isRecording) {return;}

    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      _setRecordedAudioPath(result);
      console.log('Recording stopped:', result);

      await processVoiceMessage(result);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setCurrentStatus('ERROR');
    }
  }, [isRecording, audioRecorderPlayer, processVoiceMessage]);

  useEffect(() => {
    const setupAudio = async () => {
      await requestMicrophonePermission();
    };
    setupAudio();

    return () => {
      if (isRecording) {
        audioRecorderPlayer.stopRecorder();
      }
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
      }
    };
  }, [requestMicrophonePermission, isRecording, isPlaying, audioRecorderPlayer]);

  const startRecording = useCallback(async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        console.error('Microphone permission denied');
        return;
      }

      setCurrentStatus('LISTENING');
      setIsRecording(true);

      const audioPath = Platform.OS === 'ios'
        ? 'ambi_recording.m4a'
        : `${Platform.OS === 'android' ? 'sdcard/' : ''}ambi_recording.mp4`;

      await audioRecorderPlayer.startRecorder(audioPath);
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setCurrentStatus('ERROR');
    }
  }, [audioRecorderPlayer, requestMicrophonePermission]);

  // Handler for sending text message
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) {return;}

    const messageToSend = inputText;
    setInputText('');
    setLastReply('');
    setCurrentStatus('THINKING');

    try {
      const response = await sendConversationMessage({
        message: messageToSend,
        sessionId: sessionId,
      });
      setLastReply(response.reply);
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      setCurrentStatus('IDLE');
    } catch (error) {
      console.error('Error sending message:', error);
      setLastReply('Error: Could not get response from backend.');
      setCurrentStatus('ERROR');
    }
  }, [inputText, sessionId]);

  // Helper function to render status indicator
  const renderStatusIndicator = () => {
    switch (currentStatus) {
      case 'LISTENING':
        return <Text style={styles.statusText}>Listening...</Text>;
      case 'THINKING':
        return <ActivityIndicator animating={true} color={theme.colors.primary} size="small" style={styles.statusIndicator} />;
      case 'SPEAKING':
        return <Text style={styles.statusText}>Speaking...</Text>;
      case 'ERROR':
         return <Text style={[styles.statusText, { color: theme.colors.error }]}>Error</Text>;
      case 'IDLE':
      default:
        return <Text style={styles.statusText}>Idle</Text>;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
      <View style={styles.container}>
        {/* Placeholder for Three.js Visual Companion */}
        <View style={styles.visualCompanionPlaceholder}>
          <Text style={styles.placeholderText}>[Visual Companion Area]</Text>
        </View>

        <Text style={styles.title}>Ambi Home Screen</Text>

        {/* Display Last Reply */}
        <View style={styles.replyContainer}>
          <Text style={styles.replyLabel}>Ambi:</Text>
          <Text style={styles.replyText}>{lastReply || '...'}</Text>
        </View>

        {/* System Status Display */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status: </Text>
          {renderStatusIndicator()}
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            mode="outlined"
            disabled={currentStatus === 'THINKING' || currentStatus === 'LISTENING' || currentStatus === 'SPEAKING'}
          />
          <Button
            mode="contained"
            onPress={handleSendMessage}
            disabled={!inputText.trim() || currentStatus === 'THINKING' || currentStatus === 'LISTENING' || currentStatus === 'SPEAKING'}
            style={styles.sendButton}
            loading={currentStatus === 'THINKING'}
            >
            Send
          </Button>
        </View>

        {/* Voice Controls */}
        <View style={styles.voiceControlsContainer}>
          <IconButton
            icon={isRecording ? 'microphone-off' : 'microphone'}
            mode="contained"
            size={30}
            onPress={isRecording ? stopRecordingAndSend : startRecording}
            disabled={currentStatus === 'THINKING' || currentStatus === 'SPEAKING'}
            style={[
              styles.voiceButton,
              isRecording && styles.recordingButton,
            ]}
          />
          <Text style={styles.voiceButtonLabel}>
            {isRecording ? 'Stop & Send' : 'Voice Message'}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  visualCompanionPlaceholder: {
    width: '90%',
    height: 150,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  placeholderText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 20,
  },
  replyContainer: {
    minHeight: 60,
    width: '90%',
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  replyText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    color: theme.colors.secondary,
    marginRight: 5,
  },
  statusText: {
    fontSize: 16,
    color: theme.colors.secondary,
    fontStyle: 'italic',
  },
  statusIndicator: {
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 'auto',
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
  },
  voiceControlsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    width: '90%',
  },
  voiceButton: {
    backgroundColor: theme.colors.primaryContainer,
    marginBottom: 5,
  },
  recordingButton: {
    backgroundColor: theme.colors.errorContainer,
  },
  voiceButtonLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
});

export default HomeScreen;
