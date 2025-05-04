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

// Add other API functions here later (e.g., for TTS, STT if handled via backend) 