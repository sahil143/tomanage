// Type definitions for Priority levels
export type Priority = 'none' | 'low' | 'medium' | 'high';

// Type definitions for Energy levels
export type EnergyLevel = 'low' | 'medium' | 'high';

// Type definitions for Context types
export type ContextType =
  | 'frontend'
  | 'backend'
  | 'interview'
  | 'meeting'
  | 'review'
  | 'planning'
  | 'learning'
  | 'admin'
  | 'general';

// Type definitions for Urgency levels
export type Urgency =
  | 'overdue'
  | 'critical'
  | 'today'
  | 'tomorrow'
  | 'this-week'
  | 'future'
  | 'none';

// Main Todo interface
export interface Todo {
  // Core fields
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category?: string;
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;

  // AI enhancement fields
  energyRequired?: EnergyLevel;
  estimatedDuration?: number; // in minutes
  contextType?: ContextType;
  bestTimeOfDay?: string;
  urgency?: Urgency;

  // Sync fields
  ticktickId?: string;
  ticktickProjectId?: string;
  synced: boolean;
}

// Helper function to create a new Todo with defaults
export function createTodo(data: Partial<Todo>): Todo {
  const now = new Date();

  return {
    id: data.id || generateId(),
    title: data.title || '',
    description: data.description,
    completed: data.completed ?? false,
    priority: data.priority || 'none',
    category: data.category,
    tags: data.tags || [],
    dueDate: data.dueDate,
    createdAt: data.createdAt || now,
    completedAt: data.completedAt,

    // AI enhancement fields
    energyRequired: data.energyRequired,
    estimatedDuration: data.estimatedDuration,
    contextType: data.contextType,
    bestTimeOfDay: data.bestTimeOfDay,
    urgency: data.urgency,

    // Sync fields
    ticktickId: data.ticktickId,
    ticktickProjectId: data.ticktickProjectId,
    synced: data.synced ?? false,
  };
}

// Helper function to update a Todo with partial updates
export function updateTodo(todo: Todo, updates: Partial<Todo>): Todo {
  const updatedTodo = {
    ...todo,
    ...updates,
  };

  // If marking as completed, set completedAt
  if (updates.completed === true && !todo.completed) {
    updatedTodo.completedAt = new Date();
  }

  // If marking as incomplete, clear completedAt
  if (updates.completed === false && todo.completed) {
    updatedTodo.completedAt = undefined;
  }

  return updatedTodo;
}

// Simple ID generator (you may want to use uuid library in production)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
