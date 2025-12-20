import { Todo, EnergyLevel, ContextType, Urgency } from '../types/todo';
import { isBefore, differenceInHours, differenceInDays, endOfDay, addDays } from 'date-fns';

/**
 * Minimal local enrichment for todos
 * Most complex context building now happens on backend
 * This is just for basic urgency/energy/context inference
 */

/**
 * Calculate urgency based on due date
 */
function calculateUrgency(todo: Todo): Urgency {
  if (!todo.dueDate) {
    return 'none';
  }

  const now = new Date();
  const dueDate = new Date(todo.dueDate);

  if (isBefore(dueDate, now)) return 'overdue';

  const hoursUntilDue = differenceInHours(dueDate, now);
  if (hoursUntilDue <= 4) return 'critical';

  const endOfToday = endOfDay(now);
  if (isBefore(dueDate, endOfToday)) return 'today';

  const endOfTomorrow = endOfDay(addDays(now, 1));
  if (isBefore(dueDate, endOfTomorrow)) return 'tomorrow';

  const daysUntilDue = differenceInDays(dueDate, now);
  if (daysUntilDue <= 7) return 'this-week';

  return 'future';
}

/**
 * Infer energy level from title and description
 */
function inferEnergyLevel(todo: Todo): EnergyLevel {
  const text = `${todo.title} ${todo.description || ''}`.toLowerCase();

  const highKeywords = ['implement', 'build', 'design', 'refactor', 'architect', 'complex'];
  const lowKeywords = ['read', 'check', 'review', 'quick', 'simple', 'update'];

  let highCount = 0;
  let lowCount = 0;

  highKeywords.forEach((keyword) => {
    if (text.includes(keyword)) highCount++;
  });

  lowKeywords.forEach((keyword) => {
    if (text.includes(keyword)) lowCount++;
  });

  if (highCount > lowCount) return 'high';
  if (lowCount > highCount) return 'low';
  return 'medium';
}

/**
 * Infer context type from content
 */
function inferContext(todo: Todo): ContextType {
  const text = `${todo.title} ${todo.description || ''} ${todo.tags.join(' ')}`.toLowerCase();

  if (text.match(/frontend|react|ui|css|component/)) return 'frontend';
  if (text.match(/backend|api|server|database/)) return 'backend';
  if (text.match(/interview|leetcode|coding\s*challenge/)) return 'interview';
  if (text.match(/meeting|call|standup/)) return 'meeting';
  if (text.match(/review|pr|pull\s*request/)) return 'review';
  if (text.match(/plan|organize|strategy/)) return 'planning';
  if (text.match(/learn|study|course|tutorial/)) return 'learning';
  if (text.match(/admin|email|schedule/)) return 'admin';

  return 'general';
}

/**
 * Estimate duration in minutes
 */
function estimateDuration(todo: Todo): number {
  // Check tags for explicit duration
  for (const tag of todo.tags) {
    const hoursMatch = tag.match(/(\d+\.?\d*)h/);
    if (hoursMatch) return Math.round(parseFloat(hoursMatch[1]) * 60);

    const minutesMatch = tag.match(/(\d+)m/);
    if (minutesMatch) return parseInt(minutesMatch[1], 10);
  }

  // Estimate based on energy and context
  const energy = todo.energyRequired || inferEnergyLevel(todo);
  const context = todo.contextType || inferContext(todo);

  const durationMap: Record<ContextType, { high: number; medium: number; low: number }> = {
    frontend: { high: 120, medium: 60, low: 30 },
    backend: { high: 150, medium: 90, low: 45 },
    interview: { high: 90, medium: 60, low: 30 },
    meeting: { high: 60, medium: 45, low: 30 },
    review: { high: 60, medium: 40, low: 20 },
    planning: { high: 90, medium: 60, low: 30 },
    learning: { high: 120, medium: 90, low: 45 },
    admin: { high: 45, medium: 30, low: 15 },
    general: { high: 90, medium: 60, low: 30 },
  };

  return durationMap[context][energy];
}

/**
 * Enrich todos with inferred fields
 * Note: For complex recommendations, use backend AI which has full context
 */
export function enrichTodos(todos: Todo[]): Todo[] {
  return todos.map((todo) => ({
    ...todo,
    urgency: todo.urgency || calculateUrgency(todo),
    energyRequired: todo.energyRequired || inferEnergyLevel(todo),
    contextType: todo.contextType || inferContext(todo),
    estimatedDuration: todo.estimatedDuration || estimateDuration(todo),
  }));
}
