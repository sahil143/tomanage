import { trpcClient } from '../trpc';
import { Todo } from '../types/todo';

/**
 * New AI service using tRPC backend
 * All AI operations now happen on the backend with function calling support
 */
class AIService {
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
        text,
      });

      const response = await trpcClient.ai.extractTodos.mutate({
        content,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.todos;
    } catch (error) {
      console.error('Failed to extract todos:', error);
      throw new Error(`Failed to extract todos: ${error}`);
    }
  }

  /**
   * Get AI recommendation - now powered by backend with function calling
   * The backend AI can access user profile, patterns, and context automatically
   */
  async getRecommendation(
    todos: Todo[],
    method: 'smart' | 'energy' | 'quick' | 'eisenhower' | 'focus'
  ): Promise<string> {
    try {
      // Convert todos to the format expected by backend
      const backendTodos = todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        category: this.mapCategoryToBackend(todo.tags),
        energyRequired: todo.energyRequired || 'medium',
        estimatedDuration: todo.estimatedDuration,
        contextType: todo.contextType || 'general',
        tags: todo.tags,
        status: todo.completed ? 'completed' : 'pending',
        dueDate: todo.dueDate?.toISOString(),
        completedAt: todo.completedAt?.toISOString(),
        createdAt: todo.createdAt.toISOString(),
      }));

      const response = await trpcClient.ai.getRecommendation.mutate({
        todos: backendTodos as any,
        method,
      });

      return response.recommendation;
    } catch (error) {
      console.error('Failed to get recommendation:', error);
      throw new Error(`Failed to get recommendation: ${error}`);
    }
  }

  /**
   * Chat with AI for task creation
   * The AI has access to tools and can learn patterns
   */
  async chat(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    try {
      const response = await trpcClient.ai.chat.mutate({
        messages: messages as any,
      });

      return response.message;
    } catch (error) {
      console.error('Failed to chat with AI:', error);
      throw new Error(`Failed to chat with AI: ${error}`);
    }
  }

  /**
   * Map client-side tags to backend category
   */
  private mapCategoryToBackend(
    tags: string[]
  ): 'work' | 'personal' | 'interview' | 'learning' {
    const tagString = tags.join(' ').toLowerCase();

    if (tagString.includes('interview') || tagString.includes('leetcode')) {
      return 'interview';
    }
    if (tagString.includes('learn') || tagString.includes('study')) {
      return 'learning';
    }
    if (tagString.includes('personal') || tagString.includes('home')) {
      return 'personal';
    }

    return 'work';
  }
}

// Export singleton instance
export const aiService = new AIService();
