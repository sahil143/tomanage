import { createFileRoute, Link } from '@tanstack/react-router';
import { useTasks } from '@/hooks/tasks/useTasks';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, MessageSquarePlus, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/tasks')({
  component: TasksRoute,
});

function TasksRoute() {
  const {
    todos,
    stats,
    filter,
    setFilter,
    isLoading,
    error,
    onToggle,
    onDelete,
    onRefresh,
  } = useTasks();

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your todo list
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRefresh()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Link to="/chat">
            <Button size="icon">
              <MessageSquarePlus className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        <TaskList
          todos={todos}
          stats={stats}
          filter={filter}
          onFilterChange={setFilter}
          onToggle={onToggle}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
