import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { buildMemoryContext } from '../services/memoryManager';

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

/**
 * Converts LangChain BaseMessage objects to Anthropic message format.
 * @param messages - Array of LangChain BaseMessage objects.
 * @returns Array of Anthropic message objects.
 */
const _convertToAnthropicMessages = (messages: BaseMessage[]) => {
  return messages.map(message => {
    if (message instanceof HumanMessage) {
      return { role: 'user', content: message.content as string };
    } else if (message instanceof AIMessage) {
      return { role: 'assistant', content: message.content as string };
    } else {
      return { role: 'user', content: message.content as string };
    }
  });
};

/**
 * Gets a response from Claude with memory context.
 * @param userMessage - The user's message.
 * @param sessionId - The unique identifier for the conversation session.
 * @returns A promise that resolves to the AI's response.
 */
export const getClaudeResponse = async (
  userMessage: string,
  sessionId?: string,
): Promise<string> => {
  if (!anthropic) {
    console.warn('Anthropic client not initialized. Returning stub response.');
    return 'Anthropic API key missing. Stub response.';
  }

  console.log(`Sending message to Claude for session ${sessionId || 'unknown'}: "${userMessage}"`);

  try {
    let contextMessages: BaseMessage[] = [];
    if (sessionId) {
      contextMessages = await buildMemoryContext(sessionId, userMessage);
      console.log(`Retrieved ${contextMessages.length} context messages from memory.`);
    }

    const systemPrompt = "You are Ambi, a friendly and helpful companion. You have access to the user's conversation history and can reference past interactions. Be concise but helpful.";

    const anthropicMessages = [];
    
    for (const message of contextMessages) {
      if (message instanceof HumanMessage) {
        anthropicMessages.push({ 
          role: 'user', 
          content: typeof message.content === 'string' ? message.content : String(message.content) 
        });
      } else if (message instanceof AIMessage) {
        anthropicMessages.push({ 
          role: 'assistant', 
          content: typeof message.content === 'string' ? message.content : String(message.content) 
        });
      }
    }
    
    if (anthropicMessages.length === 0 || anthropicMessages[anthropicMessages.length - 1].role !== 'user') {
      anthropicMessages.push({ role: 'user', content: userMessage });
    }
    
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 300, // Increased for more detailed responses
      temperature: 0.7,
      system: systemPrompt,
      messages: anthropicMessages,
    } as Anthropic.MessageCreateParams);

    // Extract the text content from the response
    let responseText = 'Could not get a response text.'; // Default fallback
    if ('content' in msg && Array.isArray(msg.content) && msg.content.length > 0 && 
        'type' in msg.content[0] && msg.content[0].type === 'text' && 
        'text' in msg.content[0]) {
        responseText = msg.content[0].text;
    }

    console.log(`Received response from Claude: "${responseText}"`);
    return responseText;

  } catch (error) {
    console.error('Error communicating with Anthropic API:', error);
    return 'Sorry, I encountered an error trying to respond.';
  }
};                  