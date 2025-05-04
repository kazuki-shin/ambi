import React, { useState, useRef, useEffect } from 'react';
import { sendVoiceMessage } from '../services/apiClient';
import './VoiceDemo.css';

type SystemStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

interface MediaRecorderEvent {
  data: Blob;
}

declare global {
  interface Window {
    MediaRecorder: any;
  }
  
  interface MediaStreamTrack {
    stop(): void;
  }
}

const VoiceDemo: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<SystemStatus>('IDLE');
  const [lastReply, setLastReply] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    audioRef.current = new Audio();
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentStatus('IDLE');
      };
    }
    
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support audio recording');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!window.MediaRecorder) {
        throw new Error('Browser does not support MediaRecorder');
      }
      
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event: MediaRecorderEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current);
        processVoiceMessage(audioBlob);
        
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      };
      
      setCurrentStatus('LISTENING');
      setIsRecording(true);
      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setCurrentStatus('ERROR');
      setLastReply(`Error: ${error instanceof Error ? error.message : 'Could not start recording'}`);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const processVoiceMessage = async (audioBlob: Blob) => {
    try {
      setLastReply('');
      setCurrentStatus('THINKING');
      
      const response = await sendVoiceMessage(audioBlob, undefined, sessionId);
      
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      
      setLastReply(response.textReply);
      setCurrentStatus('SPEAKING');
      
      if (audioRef.current) {
        const audioUrl = `data:audio/mp3;base64,${response.audioReply}`;
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error processing voice message:', error);
      setLastReply('Error: Could not process voice message.');
      setCurrentStatus('ERROR');
    }
  };
  
  const getStatusText = () => {
    switch (currentStatus) {
      case 'IDLE': return 'Ready';
      case 'LISTENING': return 'Listening...';
      case 'THINKING': return 'Thinking...';
      case 'SPEAKING': return 'Speaking...';
      case 'ERROR': return 'Error';
      default: return '';
    }
  };
  
  const getStatusColor = () => {
    switch (currentStatus) {
      case 'IDLE': return '#6200ee';
      case 'LISTENING': return '#03dac6';
      case 'THINKING': return '#ff9800';
      case 'SPEAKING': return '#03dac6';
      case 'ERROR': return '#b00020';
      default: return '#6200ee';
    }
  };
  
  return (
    <div className="container">
      <div className="card">
        <div className="card-title">Ambi Voice Demo</div>
        <div className="card-content">
          <div className="status-container">
            <span className="status-label">Status:</span>
            <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}></div>
            <span className="status-text">{getStatusText()}</span>
            {currentStatus === 'THINKING' && <div className="spinner"></div>}
          </div>
          
          <div className="response-container">
            <div className="response-label">Response:</div>
            <div className="response-text">{lastReply || 'No response yet'}</div>
          </div>
          
          <div className="button-container">
            <button
              className={`button ${isRecording ? 'recording-button' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={currentStatus === 'THINKING' || currentStatus === 'SPEAKING'}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDemo;
