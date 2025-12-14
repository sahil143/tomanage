import {
  isBefore,
  differenceInHours,
  differenceInDays,
  endOfDay,
  addDays,
} from 'date-fns';
import {
  Todo,
  Urgency,
  EnergyLevel,
  ContextType,
} from '../types/todo';
import { UserContext, createUserContext } from '../types/chat';
import {
  ENERGY_KEYWORDS,
  CONTEXT_KEYWORDS,
  DURATION_PATTERNS,
  WORK_SCHEDULE,
  DEFAULTS,
} from '../utils/constants';

interface WorkloadAnalysis {
  totalIncompleteTasks: number;
  byUrgency: {
    overdue: Todo[];
    critical: Todo[];
    today: Todo[];
    tomorrow: Todo[];
    'this-week': Todo[];
    future: Todo[];
    none: Todo[];
  };
  totalEstimatedHours: number;
  criticalTasks: number;
  isOverloaded: boolean;
}

class ContextBuilder {
  /**
   * Enrich todos with computed fields
   */
  enrichTodos(todos: Todo[]): Todo[] {
    return todos.map((todo) => {
      const enrichedTodo = { ...todo };

      // Calculate urgency if not already set
      if (!enrichedTodo.urgency) {
        enrichedTodo.urgency = this.calculateUrgency(todo);
      }

      // Infer energy level if not already set
      if (!enrichedTodo.energyRequired) {
        enrichedTodo.energyRequired = this.inferEnergyLevel(todo);
      }

      // Infer context type if not already set
      if (!enrichedTodo.contextType) {
        enrichedTodo.contextType = this.inferContext(todo);
      }

      // Estimate duration if not already set
      if (!enrichedTodo.estimatedDuration) {
        enrichedTodo.estimatedDuration = this.estimateDuration(todo);
      }

      return enrichedTodo;
    });
  }

  /**
   * Calculate urgency based on due date
   */
  calculateUrgency(todo: Todo): Urgency {
    if (!todo.dueDate) {
      return 'none';
    }

    const now = new Date();
    const dueDate = new Date(todo.dueDate);

    // Check if overdue
    if (isBefore(dueDate, now)) {
      return 'overdue';
    }

    // Calculate hours until due
    const hoursUntilDue = differenceInHours(dueDate, now);

    // Critical: due within 4 hours
    if (hoursUntilDue <= 4) {
      return 'critical';
    }

    // Today: due before end of today
    const endOfToday = endOfDay(now);
    if (isBefore(dueDate, endOfToday)) {
      return 'today';
    }

    // Tomorrow: due before end of tomorrow
    const endOfTomorrow = endOfDay(addDays(now, 1));
    if (isBefore(dueDate, endOfTomorrow)) {
      return 'tomorrow';
    }

    // This week: due within 7 days
    const daysUntilDue = differenceInDays(dueDate, now);
    if (daysUntilDue <= 7) {
      return 'this-week';
    }

    // Future: everything else
    return 'future';
  }

  /**
   * Infer energy level based on task content
   */
  inferEnergyLevel(todo: Todo): EnergyLevel {
    const text = `${todo.title} ${todo.description || ''}`.toLowerCase();

    let highCount = 0;
    let lowCount = 0;

    ENERGY_KEYWORDS.high.forEach((keyword) => {
      if (text.includes(keyword)) highCount++;
    });

    ENERGY_KEYWORDS.low.forEach((keyword) => {
      if (text.includes(keyword)) lowCount++;
    });

    // Determine energy level based on counts
    if (highCount > lowCount) {
      return 'high';
    } else if (lowCount > highCount) {
      return 'low';
    }

    // Default to medium if unclear or equal
    return DEFAULTS.ENERGY_LEVEL;
  }

  /**
   * Infer context type based on task content
   */
  inferContext(todo: Todo): ContextType {
    const text =
      `${todo.title} ${todo.description || ''} ${todo.tags.join(' ')}`.toLowerCase();

    // Check each context type for keyword matches
    for (const [contextType, keywords] of Object.entries(CONTEXT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return contextType as ContextType;
        }
      }
    }

    // Default to general if no match found
    return DEFAULTS.CONTEXT_TYPE;
  }

  /**
   * Estimate duration in minutes based on task content
   */
  estimateDuration(todo: Todo): number {
    // First, check tags for explicit duration (2h, 30m, 1.5hr)
    for (const tag of todo.tags) {
      // Check for hours pattern
      const hoursMatch = tag.match(DURATION_PATTERNS.hours);
      if (hoursMatch) {
        const value = parseFloat(hoursMatch[1]);
        return Math.round(value * 60);
      }

      // Check for minutes pattern
      const minutesMatch = tag.match(DURATION_PATTERNS.minutes);
      if (minutesMatch) {
        const value = parseFloat(minutesMatch[1]);
        return Math.round(value);
      }
    }

    // Check description for duration
    if (todo.description) {
      const hoursMatch = todo.description.match(DURATION_PATTERNS.hours);
      if (hoursMatch) {
        const value = parseFloat(hoursMatch[1]);
        return Math.round(value * 60);
      }

      const minutesMatch = todo.description.match(DURATION_PATTERNS.minutes);
      if (minutesMatch) {
        const value = parseFloat(minutesMatch[1]);
        return Math.round(value);
      }
    }

    // Estimate based on energy level and context type
    const energyLevel = todo.energyRequired || this.inferEnergyLevel(todo);
    const contextType = todo.contextType || this.inferContext(todo);

    const durationMap: Record<
      ContextType,
      { high: number; medium: number; low: number }
    > = {
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

    return durationMap[contextType][energyLevel];
  }

  /**
   * Get current user context
   */
  getCurrentContext(): UserContext {
    return createUserContext();
  }

  /**
   * Analyze workload from todos
   */
  analyzeWorkload(todos: Todo[]): WorkloadAnalysis {
    const incompleteTodos = todos.filter((todo) => !todo.completed);

    // Group by urgency
    const byUrgency: WorkloadAnalysis['byUrgency'] = {
      overdue: [],
      critical: [],
      today: [],
      tomorrow: [],
      'this-week': [],
      future: [],
      none: [],
    };

    let totalEstimatedMinutes = 0;
    let criticalTasks = 0;

    incompleteTodos.forEach((todo) => {
      const urgency = todo.urgency || this.calculateUrgency(todo);
      const duration = todo.estimatedDuration || this.estimateDuration(todo);

      byUrgency[urgency].push(todo);
      totalEstimatedMinutes += duration;

      if (urgency === 'overdue' || urgency === 'critical') {
        criticalTasks++;
      }
    });

    const totalEstimatedHours = Math.round(totalEstimatedMinutes / 60);

    // Determine if overloaded (>20 tasks or >8 hours of work)
    const isOverloaded =
      incompleteTodos.length > 20 || totalEstimatedHours > 8;

    return {
      totalIncompleteTasks: incompleteTodos.length,
      byUrgency,
      totalEstimatedHours,
      criticalTasks,
      isOverloaded,
    };
  }
}

// Export singleton instance
export const contextBuilder = new ContextBuilder();
