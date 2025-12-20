import { router, publicProcedure } from '../trpc';
import { chat, simpleChat } from '../services/anthropic';
import { promptBuilder } from '../services/promptBuilder';
import { AI_TOOLS } from '../utils/toolMapper';
import {
  chatInputSchema,
  recommendationInputSchema,
  extractTodosInputSchema,
  todoSchema,
} from '../schemas';
import { z } from 'zod';

export const aiRouter = router({
  // Main conversational endpoint with function calling
  chat: publicProcedure
    .input(chatInputSchema)
    .mutation(async ({ input, ctx, caller }) => {
      const userId = input.userId || ctx.userId;

      // Build system prompt for conversational task creation
      const systemPrompt = promptBuilder.buildConversationalPrompt(userId);

      console.log(`[AI Router] Chat request from user ${userId}`);

      // Execute chat with tool calling
      const response = await chat(
        {
          messages: input.messages.map(msg => ({
            role: msg.role,
            content: msg.content as any,
          })),
          tools: AI_TOOLS,
          systemPrompt,
          maxTokens: 4096,
        },
        {
          userId,
          trpcCaller: caller,
        }
      );

      return {
        message: response.content,
        stopReason: response.stopReason,
        usage: response.usage,
      };
    }),

  // Get task recommendation based on method
  getRecommendation: publicProcedure
    .input(recommendationInputSchema)
    .mutation(async ({ input, ctx, caller }) => {
      const userId = input.userId || ctx.userId;

      console.log(`[AI Router] Recommendation request from user ${userId}, method: ${input.method}`);

      // Build recommendation prompt
      const systemPrompt = promptBuilder.buildRecommendationPrompt(
        userId,
        input.todos,
        input.method
      );

      // Execute chat with tool calling
      const response = await chat(
        {
          messages: [
            {
              role: 'user',
              content: 'Please recommend the best task for me to work on right now.',
            },
          ],
          tools: AI_TOOLS,
          systemPrompt,
          maxTokens: 2048,
        },
        {
          userId,
          trpcCaller: caller,
        }
      );

      return {
        recommendation: response.content,
        method: input.method,
        usage: response.usage,
      };
    }),

  // Extract todos from text/image
  extractTodos: publicProcedure
    .input(extractTodosInputSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = input.userId || ctx.userId;

      console.log(`[AI Router] Extract todos request from user ${userId}`);

      // Build extraction prompt
      const systemPrompt = promptBuilder.buildExtractionPrompt();

      // Prepare messages
      const messages = [
        {
          role: 'user' as const,
          content: input.content as any,
        },
      ];

      // Execute simple chat (no tools needed for extraction)
      const response = await simpleChat(messages, systemPrompt, 2048);

      // Parse the JSON response
      let todos;
      try {
        // Remove markdown code blocks if present
        let jsonText = response.content.trim();
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
        }

        todos = JSON.parse(jsonText);

        // Validate against schema
        const todosArray = z.array(todoSchema).parse(todos);

        return {
          todos: todosArray,
          count: todosArray.length,
          usage: response.usage,
        };
      } catch (error: any) {
        console.error('[AI Router] Failed to parse todos:', error);

        // Return raw response if parsing fails
        return {
          todos: [],
          count: 0,
          error: 'Failed to parse todos from AI response',
          rawResponse: response.content,
          usage: response.usage,
        };
      }
    }),

  // Test endpoint for AI connectivity
  test: publicProcedure
    .input(z.object({
      message: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const message = input.message || 'Hello, Claude!';

      const response = await simpleChat(
        [
          {
            role: 'user',
            content: message,
          },
        ],
        'You are a helpful assistant.',
        512
      );

      return {
        message: response.content,
        usage: response.usage,
      };
    }),
});
