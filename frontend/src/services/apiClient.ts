const BASE_URL = 'http://localhost:4000/api'; // Backend API base URL (adjust if needed)

interface ConversationPayload {
  message: string;
  userId?: string;
  sessionId?: string;
}

interface ConversationResponse {
  reply: string;
  sessionId?: string; // Backend might return this
}

/**
 * Sends a message to the backend conversation endpoint.
 * @param payload - The message and optional context.
 * @returns The AI's reply and session ID.
 */
export const sendConversationMessage = async (
  payload: ConversationPayload
): Promise<ConversationResponse> => {
  try {
    console.log(`[API Client] Sending message: ${payload.message}, Session: ${payload.sessionId}`);
    const response = await fetch(`${BASE_URL}/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Attempt to read error details from the response body
      let errorBody = 'Unknown error';
      try {
        errorBody = await response.text();
      } catch (e) { /* Ignore if reading body fails */ }
      console.error(`[API Client] HTTP error ${response.status}: ${errorBody}`);
      throw new Error(`HTTP error ${response.status}: ${errorBody}`);
    }

    const data: ConversationResponse = await response.json();
    console.log(`[API Client] Received reply: ${data.reply}, Session: ${data.sessionId}`);
    return data;

  } catch (error) {
    console.error('[API Client] Failed to send message:', error);
    // Re-throw or return a specific error structure
    throw error;
  }
};

interface VoiceConversationResponse {
  audioReply: string; // Base64 encoded audio
  textReply: string;
  sessionId?: string;
}

/**
 * Sends an audio recording to the backend for voice-based conversation.
 * @param audioBlob - The audio recording as a Blob.
 * @param userId - Optional user ID.
 * @param sessionId - Optional session ID for conversation context.
 * @returns The AI's audio reply, text reply, and session ID.
 */
export const sendVoiceMessage = async (
  audioBlob: Blob,
  userId?: string,
  sessionId?: string
): Promise<VoiceConversationResponse> => {
  try {
    console.log(`[API Client] Sending voice message, Session: ${sessionId}`);

    const arrayBuffer = await audioBlob.arrayBuffer();

    const queryParams = new URLSearchParams();
    if (userId) {queryParams.append('userId', userId);}
    if (sessionId) {queryParams.append('sessionId', sessionId);}

    const response = await fetch(`${BASE_URL}/voice-conversation?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: arrayBuffer,
    });

    if (!response.ok) {
      // Attempt to read error details from the response body
      let errorBody = 'Unknown error';
      try {
        errorBody = await response.text();
      } catch (e) { /* Ignore if reading body fails */ }
      console.error(`[API Client] HTTP error ${response.status}: ${errorBody}`);
      throw new Error(`HTTP error ${response.status}: ${errorBody}`);
    }

    const data: VoiceConversationResponse = await response.json();
    console.log(`[API Client] Received voice reply, Session: ${data.sessionId}`);
    return data;

  } catch (error) {
    console.error('[API Client] Failed to send voice message:', error);
    throw error;
  }
};
