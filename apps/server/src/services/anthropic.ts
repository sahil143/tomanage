import Anthropic from '@anthropic-ai/sdk';
import { AI_TOOLS, executeToolCall, ToolExecutionContext } from '../utils/toolMapper';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MessageParam {
  role: 'user' | 'assistant';
  content: string | Anthropic.MessageParam['content'];
}

export interface ChatOptions {
  messages: MessageParam[];
  tools?: Anthropic.Tool[];
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ChatResponse {
  content: string;
  toolCalls?: any[];
  stopReason: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Main chat function with automatic tool execution loop
export async function chat(
  options: ChatOptions,
  toolContext: ToolExecutionContext
): Promise<ChatResponse> {
  const {
    messages: initialMessages,
    tools = [],
    maxTokens = 4096,
    systemPrompt,
  } = options;

  const messages: Anthropic.MessageParam[] = initialMessages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  let response: Anthropic.Message;
  let iterations = 0;
  const MAX_ITERATIONS = 10; // Prevent infinite loops

  // Tool execution loop
  while (iterations < MAX_ITERATIONS) {
    iterations++;

    console.log(`[Anthropic] Iteration ${iterations}, Messages count: ${messages.length}`);

    // Make API call
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: maxTokens,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      system: systemPrompt,
    });

    console.log(`[Anthropic] Stop reason: ${response.stop_reason}`);

    // If no tool use, we're done
    if (response.stop_reason !== 'tool_use') {
      // Extract text content
      const textContent = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      return {
        content: textContent,
        stopReason: response.stop_reason,
        usage: response.usage,
      };
    }

    // Handle tool calls
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    console.log(`[Anthropic] Found ${toolUseBlocks.length} tool calls`);

    // Add assistant's response to messages
    messages.push({
      role: 'assistant',
      content: response.content,
    });

    // Execute all tool calls and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      try {
        const result = await executeToolCall(toolUse, toolContext);

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      } catch (error: any) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify({
            error: error.message || 'Tool execution failed',
          }),
          is_error: true,
        });
      }
    }

    // Add tool results to messages
    messages.push({
      role: 'user',
      content: toolResults,
    });

    // Continue loop to get AI's next response
  }

  // If we hit max iterations, return what we have
  throw new Error('Maximum tool execution iterations reached');
}

// Simple chat without tools
export async function simpleChat(
  messages: MessageParam[],
  systemPrompt?: string,
  maxTokens: number = 2048
): Promise<ChatResponse> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    system: systemPrompt,
  });

  const textContent = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('\n');

  return {
    content: textContent,
    stopReason: response.stop_reason,
    usage: response.usage,
  };
}
