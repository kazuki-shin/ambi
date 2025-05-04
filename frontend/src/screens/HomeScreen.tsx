import React, { useState, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  TextInput,
  Button,
} from 'react-native-paper';
import { MD3Theme } from 'react-native-paper';
import { sendConversationMessage } from '../services/apiClient';

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

  // Handler for sending message
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            disabled={currentStatus === 'THINKING'}
          />
          <Button 
            mode="contained" 
            onPress={handleSendMessage}
            disabled={!inputText.trim() || currentStatus === 'THINKING'}
            style={styles.sendButton}
            loading={currentStatus === 'THINKING'}
            > 
            Send
          </Button>
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
});

export default HomeScreen; 