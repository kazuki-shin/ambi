import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources/messages'; // Import MessageParam type
import dotenv from 'dotenv';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { buildMemoryContext } from '../services/memoryManager';
import tracer from '../tracer'; // Import Datadog tracer

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

  const parentSpan = tracer.scope().active(); // Get active span from the incoming request
  const span = parentSpan ? tracer.startSpan('anthropic.request', { childOf: parentSpan }) : tracer.startSpan('anthropic.request');

  span.setTag('span.kind', 'client'); // Standard APM tag for outgoing requests
  span.setTag('llm', true); // Explicitly tag as an LLM span for product view
  span.setTag('llm.request.type', 'completion');
  span.setTag('llm.request.model', 'claude-3-5-sonnet-20240620'); // Set the model used

  try {
    let contextMessages: BaseMessage[] = [];
    if (sessionId) {
      contextMessages = await buildMemoryContext(sessionId, userMessage);
      console.log(`Retrieved ${contextMessages.length} context messages from memory.`);
    }

    const systemPrompt = "You are Ambi, a friendly and helpful companion. You have access to the user's conversation history and can reference past interactions. Be concise but helpful.";

    const anthropicMessages: MessageParam[] = []; // Explicitly type the array
    
    for (const message of contextMessages) {
      if (message instanceof HumanMessage) {
        anthropicMessages.push({ 
          role: 'user', // Use literal type
          content: typeof message.content === 'string' ? message.content : String(message.content) 
        });
      } else if (message instanceof AIMessage) {
        anthropicMessages.push({ 
          role: 'assistant', // Use literal type
          content: typeof message.content === 'string' ? message.content : String(message.content) 
        });
      }
      // Note: We are skipping other message types here. Consider adding handling if needed.
    }
    
    // Ensure the last message is from the user for the current turn
    if (anthropicMessages.length === 0 || anthropicMessages[anthropicMessages.length - 1].role !== 'user') {
       anthropicMessages.push({ role: 'user', content: userMessage });
    }

    // Combine system prompt and messages for tagging
    const fullPromptContent = JSON.stringify({ system: systemPrompt, messages: anthropicMessages });
    span.setTag('llm.prompt', fullPromptContent); // Tag the full prompt/context
    
    const createParams: Anthropic.MessageCreateParams = {
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 300, // Increased for more detailed responses
      temperature: 0.7,
      system: systemPrompt,
      messages: anthropicMessages,
    };
    
    const msg = await anthropic.messages.create(createParams);

    // Extract the text content from the response
    let responseText = 'Could not get a response text.'; // Default fallback
    // Type guard to ensure msg is a Message object and not a Stream
    if ('content' in msg && Array.isArray(msg.content) && msg.content.length > 0 && 
        msg.content[0].type === 'text') {
        responseText = msg.content[0].text;

        // Add response tags only if it's a non-streaming Message with usage info
        span.setTag('llm.completion', responseText);
        if ('usage' in msg && msg.usage) { // Check if usage exists
          span.setTag('llm.usage.input_tokens', msg.usage.input_tokens);
          span.setTag('llm.usage.output_tokens', msg.usage.output_tokens);
          span.setTag('llm.usage.total_tokens', msg.usage.input_tokens + msg.usage.output_tokens);
        }
        if ('model' in msg && msg.model) { // Check if model exists
           span.setTag('llm.response.model', msg.model); // Record the actual model used in response
        }
    }

    console.log(`Received response from Claude: "${responseText}"`);
    span.finish(); // Finish the span on success
    return responseText;

  } catch (error) {
    console.error('Error communicating with Anthropic API:', error);
    if (error instanceof Error) {
      span.setTag('error.message', error.message);
      span.setTag('error.stack', error.stack);
      span.setTag('error.type', error.name);
    } else {
      span.setTag('error.message', String(error));
    }
    span.setTag('error', true); // Mark the span as errored
    span.finish(); // Finish the span on error
    return 'Sorry, I encountered an error trying to respond.';
  }
};                  