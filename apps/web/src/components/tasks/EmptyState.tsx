/**
 * EmptyState Component
 * Shows when there are no tasks
 */

import { ListTodo } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  filter: 'all' | 'active' | 'completed';
}

export function EmptyState({ filter }: EmptyStateProps) {
  const getMessage = () => {
    switch (filter) {
      case 'active':
        return {
          title: 'No active tasks',
          description: 'All tasks are completed or create a new one',
        };
      case 'completed':
        return {
          title: 'No completed tasks',
          description: 'Complete some tasks to see them here',
        };
      default:
        return {
          title: 'No tasks yet',
          description: 'Start by creating your first task in the chat',
        };
    }
  };

  const message = getMessage();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <ListTodo className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{message.title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {message.description}
      </p>
      {filter === 'all' && (
        <Link to="/chat">
          <Button>Go to Chat</Button>
        </Link>
      )}
    </div>
  );
}
