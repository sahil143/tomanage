/**
 * useTasks Hook
 * Business logic for task management
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPCClient } from '@/utils/trpc';
import type { Todo, TodoFilter, TodoStats } from '@/types';
import { filterTodos, sortTodos } from '@/utils/todo-helpers';
import { DEFAULT_FILTER } from '@/lib/constants';

export function useTasks() {
  const trpcClient = useTRPCClient();
  const [filter, setFilter] = useState<TodoFilter>(DEFAULT_FILTER);

  // Fetch todos from TickTick
  const {
    data: ticktickData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ticktick', 'getTasks'],
    queryFn: () => trpcClient.ticktick.getTasks.query({}),
  });

  // Convert TickTick tasks to our Todo format
  const todos: Todo[] = useMemo(() => {
    if (!ticktickData?.todos) return [];

    // Map TickTick tasks to our Todo interface
    return ticktickData.todos.map((task: any) => ({
      id: task.id,
      title: task.title || task.content || '',
      description: task.desc,
      completed: task.status === 2 || task.status === 'completed',
      priority: mapTickTickPriority(task.priority),
      category: task.tags?.[0],
      tags: task.tags || [],
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      createdAt: task.createdTime ? new Date(task.createdTime) : new Date(),
      completedAt: task.completedTime ? new Date(task.completedTime) : undefined,
      ticktickId: task.id,
      ticktickProjectId: task.projectId,
      synced: true,
    }));
  }, [ticktickData]);

  // Computed values
  const filteredTodos = useMemo(() => {
    const filtered = filterTodos(todos, filter);
    return sortTodos(filtered);
  }, [todos, filter]);

  const stats: TodoStats = useMemo(
    () => ({
      total: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }),
    [todos]
  );

  // Actions
  const handleToggle = useCallback(
    (id: string) => {
      // In a real implementation, you'd call the TickTick update API
      // For now, we'll just log
      console.log('Toggle todo:', id);
      // TODO: Implement ticktick.updateTask mutation when available
    },
    []
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm('Delete this task?')) {
        console.log('Delete todo:', id);
        // TODO: Implement ticktick.deleteTask mutation when available
      }
    },
    []
  );

  return {
    todos: filteredTodos,
    stats,
    filter,
    setFilter,
    isLoading,
    error: error?.message,
    onToggle: handleToggle,
    onDelete: handleDelete,
    onRefresh: refetch,
  };
}

// Helper to map TickTick priority to our format
function mapTickTickPriority(priority?: number): Todo['priority'] {
  if (!priority) return 'none';

  switch (priority) {
    case 5:
      return 'high';
    case 3:
      return 'medium';
    case 1:
      return 'low';
    default:
      return 'none';
  }
}
