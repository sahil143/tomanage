/**
 * TaskList Component
 * Container for displaying tasks with filters
 */

import { Skeleton } from '@/components/ui/skeleton';
import type { TaskListProps } from '@/types';
import { TaskItem } from './TaskItem';
import { TaskFilters } from './TaskFilters';
import { EmptyState } from './EmptyState';

export function TaskList({
  todos,
  stats,
  filter,
  onFilterChange,
  onToggle,
  onDelete,
  isLoading,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TaskFilters filter={filter} onFilterChange={onFilterChange} stats={stats} />

      {todos.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <TaskItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
