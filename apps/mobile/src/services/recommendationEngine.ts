import { Todo } from '../types/todo';
import { RecommendationMethod } from '../types/chat';
import { aiService } from './aiService';

/**
 * Simplified recommendation engine
 * All complex logic and prompts are now on the backend
 * The backend has access to:
 * - User profile and preferences
 * - Current context (time, energy, work hours)
 * - Saved patterns
 * - AI function calling to learn and save patterns
 */
class RecommendationEngine {
  /**
   * Get recommendation based on method
   * Simply delegates to backend which handles all the complexity
   */
  async getRecommendation(
    todos: Todo[],
    method: RecommendationMethod
  ): Promise<string> {
    const incompleteTodos = todos.filter((todo) => !todo.completed);

    if (incompleteTodos.length === 0) {
      return "Great job! You have no incomplete tasks. Time to relax or plan your next goals.";
    }

    try {
      // Backend handles:
      // - Building context-aware prompts
      // - Getting user profile with current context
      // - Accessing saved patterns
      // - Calling AI with function calling enabled
      // - Saving new patterns it learns
      return await aiService.getRecommendation(incompleteTodos, method);
    } catch (error) {
      console.error('Failed to get recommendation:', error);

      // Simple fallback
      const topTask = incompleteTodos[0];
      return `**RECOMMENDED TASK:** ${topTask.title}

**WHY NOW:** This task has ${topTask.priority} priority and requires ${topTask.energyRequired || 'medium'} energy.

**ESTIMATED TIME:** ~${topTask.estimatedDuration || 30} minutes

Start with this and build momentum! (Note: Unable to get AI recommendation - ${error})`;
    }
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
