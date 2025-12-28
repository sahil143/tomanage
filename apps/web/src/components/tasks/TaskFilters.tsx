/**
 * TaskFilters Component
 * Filter chips for todos (All, Active, Completed)
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TodoFilter, TodoStats } from '@/types';

interface TaskFiltersProps {
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  stats: TodoStats;
}

const filters: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export function TaskFilters({ filter, onFilterChange, stats }: TaskFiltersProps) {
  const getCount = (filterValue: TodoFilter) => {
    switch (filterValue) {
      case 'all':
        return stats.total;
      case 'active':
        return stats.active;
      case 'completed':
        return stats.completed;
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={cn(
            'transition-all',
            filter === f.value && 'ring-2 ring-primary ring-offset-2'
          )}
        >
          <Badge
            variant={filter === f.value ? 'default' : 'secondary'}
            className="cursor-pointer hover:opacity-80"
          >
            {f.label} ({getCount(f.value)})
          </Badge>
        </button>
      ))}
    </div>
  );
}
