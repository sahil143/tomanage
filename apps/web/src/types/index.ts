/**
 * Type definitions for the web app
 * Re-exports from shared package + web-specific types
 */

import type {
  Todo as SharedTodo,
  ChatMessage as SharedChatMessage,
} from '@tomanage/shared';

// Re-export shared types
export type {
  Todo,
  Priority,
  EnergyLevel,
  ContextType,
  Urgency,
  ChatMessage,
  MessageRole,
  RecommendationMethod,
  TimeOfDay,
  UserContext,
} from '@tomanage/shared';

// Re-export helper functions
export {
  createTodo,
  updateTodo,
  createChatMessage,
  createUserContext,
  getPriorityColor,
  getUrgency,
  sortTodos,
} from '@tomanage/shared';

// Web-specific types
export type TodoFilter = 'all' | 'active' | 'completed';

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
}

// Component prop types
export interface TaskItemProps {
  todo: SharedTodo;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface TaskListProps {
  todos: SharedTodo[];
  stats: TodoStats;
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export interface ChatContainerProps {
  messages: SharedChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export interface ChatMessageProps {
  message: SharedChatMessage;
}

export interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}
