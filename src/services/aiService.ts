import axios, { AxiosInstance } from 'axios';
import { Todo } from '../types/todo';
import { UserContext, RecommendationMethod } from '../types/chat';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// TODO: Move to environment variables
const API_KEY = 'your-anthropic-api-key-here';

class AIService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: ANTHROPIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      timeout: 30000, // 30 second timeout
    });
  }

  /**
   * Extract todos from text and optionally an image
   */
  async extractTodosFromText(
    text: string,
    imageBase64?: string
  ): Promise<Partial<Todo>[]> {
    try {
      const content: any[] = [];

      // Add image if provided
      if (imageBase64) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: imageBase64,
          },
        });
      }

      // Add text content
      content.push({
        type: 'text',
        text: `Extract all todos/tasks from the following ${imageBase64 ? 'image and text' : 'text'}.

${imageBase64 ? 'Analyze both the image (if it contains handwritten notes, screenshots, or task lists) and the text below.' : ''}

Text: ${text}

For each todo, infer:
- title (required): clear, concise task description
- description: additional details if available
- priority: 'none', 'low', 'medium', or 'high' based on urgency indicators (ASAP, urgent, important, etc.)
- tags: relevant categories or keywords
- energyRequired: 'low', 'medium', or 'high' based on task complexity
- estimatedDuration: time in minutes (estimate based on task complexity)
- contextType: one of 'frontend', 'backend', 'interview', 'meeting', 'review', 'planning', 'learning', 'admin', or 'general'
- dueDate: parse any date mentions (format as ISO string)

Return ONLY a valid JSON array of todos. Each todo should be an object with the inferred fields.
Example: [{"title": "Fix login bug", "priority": "high", "energyRequired": "medium", "estimatedDuration": 30, "contextType": "backend", "tags": ["bug", "auth"]}]

If no todos are found, return an empty array: []`,
      });

      const response = await this.callClaude(content);

      // Parse JSON response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('No valid JSON array found in response');
        return [];
      }

      const todos = JSON.parse(jsonMatch[0]);

      // Convert date strings to Date objects
      return todos.map((todo: any) => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      }));
    } catch (error) {
      console.error('Failed to extract todos:', error);
      throw new Error(`Failed to extract todos: ${error}`);
    }
  }

  /**
   * Get AI recommendation based on todos, context, and method
   */
  async getRecommendation(
    todos: Todo[],
    context: UserContext,
    method: RecommendationMethod
  ): Promise<string> {
    try {
      const prompt = this.buildPrompt(todos, context, method);
      const content = [{ type: 'text', text: prompt }];
      return await this.callClaude(content);
    } catch (error) {
      console.error('Failed to get recommendation:', error);
      throw new Error(`Failed to get recommendation: ${error}`);
    }
  }

  /**
   * Build detailed prompt based on recommendation method
   */
  buildPrompt(
    todos: Todo[],
    context: UserContext,
    method: RecommendationMethod
  ): string {
    const incompleteTodos = todos.filter((todo) => !todo.completed);

    const contextInfo = `
Current Context:
- Time: ${context.localTime} (${context.timezone})
- Day: ${context.dayOfWeek}${context.isWeekend ? ' (Weekend)' : ''}
- Time of Day: ${context.timeOfDay}
- Work Hours: ${context.isWorkHours ? 'Yes' : 'No'}
- Your Energy Level: ${context.energyLevel}
`;

    const todosInfo = incompleteTodos
      .map(
        (todo, index) => `
${index + 1}. ${todo.title}
   Priority: ${todo.priority}
   ${todo.description ? `Description: ${todo.description}` : ''}
   ${todo.energyRequired ? `Energy Required: ${todo.energyRequired}` : ''}
   ${todo.estimatedDuration ? `Duration: ${todo.estimatedDuration} min` : ''}
   ${todo.contextType ? `Context: ${todo.contextType}` : ''}
   ${todo.dueDate ? `Due: ${todo.dueDate.toLocaleDateString()}` : ''}
   ${todo.urgency ? `Urgency: ${todo.urgency}` : ''}
   ${todo.tags.length > 0 ? `Tags: ${todo.tags.join(', ')}` : ''}
`
      )
      .join('\n');

    let methodInstructions = '';

    switch (method) {
      case 'smart':
        methodInstructions = `
Provide a comprehensive smart recommendation considering:
- Current time and energy levels
- Task urgency and importance
- Energy requirements vs. available energy
- Context switching costs
- Due dates and deadlines
- Best time of day for different task types

Suggest the top 3-5 tasks to focus on right now and explain why.`;
        break;

      case 'energy':
        methodInstructions = `
Match tasks to the user's current energy level (${context.energyLevel}).

For LOW energy: Suggest administrative tasks, quick wins, low-complexity work
For MEDIUM energy: Suggest moderate tasks, meetings, reviews
For HIGH energy: Suggest deep work, complex problems, creative tasks

Focus on energy-appropriate tasks that will maximize productivity.`;
        break;

      case 'quick':
        methodInstructions = `
Find "quick wins" - tasks that can be completed in 15-30 minutes.

Prioritize:
- Low estimated duration
- Low energy requirements
- High impact relative to effort
- Tasks that unblock other work

Suggest 5-7 quick wins the user can knock out quickly.`;
        break;

      case 'eisenhower':
        methodInstructions = `
Use the Eisenhower Matrix (Urgent/Important) to categorize and recommend:

1. Urgent & Important (Do First): High priority, near deadlines
2. Important, Not Urgent (Schedule): High value, can be planned
3. Urgent, Not Important (Delegate/Minimize): Time-sensitive but low impact
4. Neither Urgent nor Important (Eliminate): Lowest priority

Categorize all tasks and recommend which quadrant to focus on now.`;
        break;

      case 'focus':
        methodInstructions = `
Recommend deep work focus sessions.

Suggest:
- 2-3 hour blocks for complex, high-value tasks
- Tasks requiring sustained concentration
- Minimal context switching
- Match to energy levels and time of day
- Group similar context types together

Provide a focused work plan for the next few hours.`;
        break;
    }

    return `${contextInfo}

Tasks to Consider:
${todosInfo || 'No incomplete tasks found.'}

${methodInstructions}

Provide actionable, specific recommendations in a friendly, motivating tone.`;
  }

  /**
   * Make API call to Claude
   */
  async callClaude(content: any[]): Promise<string> {
    try {
      const response = await this.axiosInstance.post('', {
        model: MODEL,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      });

      if (!response.data?.content?.[0]?.text) {
        throw new Error('Invalid response format from Claude API');
      }

      return response.data.content[0].text;
    } catch (error: any) {
      if (error.response) {
        // API error response
        const status = error.response.status;
        const message = error.response.data?.error?.message || 'Unknown error';

        if (status === 401) {
          throw new Error('Invalid API key. Please check your Anthropic API key.');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (status === 400) {
          throw new Error(`Bad request: ${message}`);
        } else {
          throw new Error(`API error (${status}): ${message}`);
        }
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Unable to reach Claude API');
      } else {
        // Other errors
        throw new Error(`Failed to call Claude API: ${error.message}`);
      }
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
