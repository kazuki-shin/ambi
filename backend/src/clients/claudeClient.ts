import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn(
    'ANTHROPIC_API_KEY not found in environment variables. Claude API functions will be disabled.'
  );
}

const anthropic = apiKey
  ? new Anthropic({
      apiKey: apiKey,
    })
  : null;

// Basic function to get a response from Claude
export const getClaudeResponse = async (
  userMessage: string,
  // Add other parameters like userId, sessionId for context later
): Promise<string> => {
  if (!anthropic) {
    console.warn('Anthropic client not initialized. Returning stub response.');
    return 'Anthropic API key missing. Stub response.';
  }

  console.log(`Sending message to Claude: "${userMessage}"`);

  try {
    // Simple prompt for Phase 1
    const systemPrompt = "You are Ambi, a friendly companion. Keep your responses brief for now.";

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620', // Updated model name
      max_tokens: 150,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage },
        // Add more messages here for conversation history in later phases
      ],
    });

    // Extract the text content from the response
    // The response structure might vary slightly depending on the model and usage
    let responseText = 'Could not get a response text.'; // Default fallback
    if (msg.content && msg.content.length > 0 && msg.content[0].type === 'text') {
        responseText = msg.content[0].text;
    }

    console.log(`Received response from Claude: "${responseText}"`);
    return responseText;

  } catch (error) {
    console.error('Error communicating with Anthropic API:', error);
    return 'Sorry, I encountered an error trying to respond.';
  }
}; 