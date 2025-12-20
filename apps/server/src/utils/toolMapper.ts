import Anthropic from '@anthropic-ai/sdk';
import type { TrpcCaller } from '../context';
import {
  getPatternInputSchema,
  saveAnalyticsInputSchema,
  savePatternInputSchema,
} from '../schemas';

// Define the tools available to the AI
export const AI_TOOLS: Anthropic.Tool[] = [
  {
    name: 'save_pattern',
    description: 'Save a learned pattern about the user. Use this when you discover new patterns in their behavior, productivity, or preferences.',
    input_schema: {
      type: 'object',
      properties: {
        patternType: {
          type: 'string',
          enum: [
            'productivity_by_hour',
            'task_completion_patterns',
            'energy_patterns',
            'context_preferences',
            'learned_behaviors',
          ],
          description: 'The type of pattern being saved',
        },
        data: {
          type: 'object',
          description: 'The pattern data as a JSON object',
        },
      },
      required: ['patternType', 'data'],
    },
  },
  {
    name: 'get_pattern',
    description: 'Retrieve a previously saved pattern about the user. Use this to check what you already know before making recommendations.',
    input_schema: {
      type: 'object',
      properties: {
        patternType: {
          type: 'string',
          enum: [
            'productivity_by_hour',
            'task_completion_patterns',
            'energy_patterns',
            'context_preferences',
            'learned_behaviors',
          ],
          description: 'The type of pattern to retrieve',
        },
      },
      required: ['patternType'],
    },
  },
  {
    name: 'get_user_profile',
    description: 'Get the complete user profile including preferences, current context, and all patterns. Use this to understand the user comprehensively.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'save_analytics',
    description: 'Save task completion analytics. Use this to record when tasks are completed for learning patterns.',
    input_schema: {
      type: 'object',
      properties: {
        entry: {
          type: 'object',
          properties: {
            taskId: { type: 'string' },
            completedAt: { type: 'string', description: 'ISO date string' },
            timeOfDay: { type: 'string' },
            dayOfWeek: { type: 'string' },
            energyLevel: { type: 'string', enum: ['high', 'medium', 'low'] },
            contextType: { type: 'string' },
            estimatedDuration: { type: 'number', description: 'in minutes' },
            actualDuration: { type: 'number', description: 'in minutes' },
          },
          required: ['taskId', 'completedAt', 'timeOfDay', 'dayOfWeek', 'energyLevel', 'contextType'],
        },
      },
      required: ['entry'],
    },
  },
  {
    name: 'get_analytics',
    description: 'Retrieve task completion analytics to learn from past patterns.',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of recent entries to retrieve (optional)',
        },
      },
      required: [],
    },
  },
];

// Type for tool execution context
export interface ToolExecutionContext {
  userId: string;
  // tRPC caller will be passed from the router
  trpcCaller: TrpcCaller;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function getString(obj: UnknownRecord, key: string): string {
  const v = obj[key];
  if (typeof v !== 'string') throw new Error(`Invalid tool input: '${key}' must be a string`);
  return v;
}

// Execute a tool call by mapping it to the appropriate tRPC procedure
export async function executeToolCall(
  toolUse: Anthropic.ToolUseBlock,
  context: ToolExecutionContext
): Promise<unknown> {
  const { name, input } = toolUse;
  const { userId, trpcCaller } = context;

  console.log(`[AI Tool] Executing ${name} with input:`, input);

  try {
    if (!isRecord(input)) {
      throw new Error('Invalid tool input: must be an object');
    }

    switch (name) {
      case 'save_pattern': {
        const patternType = getString(input, 'patternType');
        const data = input.data;
        const parsed = savePatternInputSchema.parse({
          userId,
          patternType,
          data,
        });
        return await trpcCaller.storage.savePattern(parsed);
      }

      case 'get_pattern': {
        const patternType = getString(input, 'patternType');
        const parsed = getPatternInputSchema.parse({
          userId,
          patternType,
        });
        return await trpcCaller.storage.getPattern(parsed);
      }

      case 'get_user_profile':
        return await trpcCaller.context.getUserProfile({
          userId,
        });

      case 'save_analytics': {
        const entry = input.entry;
        const parsed = saveAnalyticsInputSchema.parse({
          userId,
          entry,
        });
        return await trpcCaller.storage.saveAnalytics(parsed);
      }

      case 'get_analytics': {
        const limit = input.limit;
        return await trpcCaller.storage.getAnalytics({
          userId,
          limit: typeof limit === 'number' ? limit : undefined,
        });
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`[AI Tool] Error executing ${name}:`, error);
    throw error;
  }
}
