/**
 * Todo helper functions
 * Re-exports shared helpers + adds web-specific utilities
 */

import type { Todo, TodoFilter } from '@/types';

// Re-export shared helpers
export { getPriorityColor, getUrgency, sortTodos } from '@tomanage/shared';

/**
 * Filter todos based on filter type
 */
export function filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    case 'all':
    default:
      return todos;
  }
}

/**
 * Get badge variant for priority
 */
export function getPriorityVariant(priority: Todo['priority']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    case 'none':
    default:
      return 'outline';
  }
}

/**
 * Get urgency badge variant
 */
export function getUrgencyVariant(urgency: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (urgency) {
    case 'overdue':
    case 'critical':
      return 'destructive';
    case 'today':
    case 'tomorrow':
      return 'default';
    case 'this-week':
      return 'secondary';
    default:
      return 'outline';
  }
}
