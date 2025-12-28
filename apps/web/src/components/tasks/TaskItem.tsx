/**
 * TaskItem Component
 * Displays a single todo item
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskItemProps } from '@/types';
import { getPriorityVariant, getUrgency, getUrgencyVariant } from '@/utils/todo-helpers';
import { formatDuration, formatDate } from '@/utils/format';

export const TaskItem = memo(function TaskItem({
  todo,
  onToggle,
  onDelete,
}: TaskItemProps) {
  const urgency = getUrgency(todo.dueDate);

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            className="mt-1"
          />

          <div className="flex-1 space-y-2 min-w-0">
            <h3
              className={cn(
                'font-medium break-words',
                todo.completed && 'line-through text-muted-foreground'
              )}
            >
              {todo.title}
            </h3>

            {todo.description && (
              <p className="text-sm text-muted-foreground break-words">
                {todo.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {todo.priority !== 'none' && (
                <Badge variant={getPriorityVariant(todo.priority)}>
                  {todo.priority}
                </Badge>
              )}

              {urgency !== 'none' && (
                <Badge variant={getUrgencyVariant(urgency)}>
                  {urgency}
                </Badge>
              )}

              {todo.estimatedDuration && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(todo.estimatedDuration)}
                </Badge>
              )}

              {todo.dueDate && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(todo.dueDate)}
                </Badge>
              )}

              {todo.category && (
                <Badge variant="outline">{todo.category}</Badge>
              )}
            </div>

            {todo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {todo.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(todo.id)}
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
