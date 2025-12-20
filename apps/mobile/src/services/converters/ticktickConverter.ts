import type { TickTickTask } from '@tomanage/ticktick-sdk';
import { TICKTICK_CONSTANTS } from '@tomanage/ticktick-sdk';
import { EnergyLevel, Priority, Todo, createTodo } from '../../types/todo';

export class ConverterService {
  /**
   * Convert TickTick task format to our Todo type
   */
  static convertTickTickToTodo(data: TickTickTask): Todo {
    // Extract energy and duration from tags
    let energyRequired: EnergyLevel | undefined;
    let estimatedDuration: number | undefined;

    const tags: string[] = data.tags || [];
    const regularTags: string[] = [];

    tags.forEach((tag: string) => {
      if (tag.startsWith('energy:')) {
        const energy = tag.replace('energy:', '') as EnergyLevel;
        if (['low', 'medium', 'high'].includes(energy)) {
          energyRequired = energy;
        }
      } else if (tag.startsWith('duration:')) {
        const duration = parseInt(tag.replace('duration:', ''), 10);
        if (!isNaN(duration)) {
          estimatedDuration = duration;
        }
      } else {
        regularTags.push(tag);
      }
    });

    return createTodo({
      id: data.id,
      title: data.title || '',
      description: data.content,
      completed: data.status === TICKTICK_CONSTANTS.STATUS.COMPLETED,
      priority: ConverterService.reversePriority(data.priority || 0),
      tags: regularTags,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdAt: data.createdTime ? new Date(data.createdTime) : new Date(),
      completedAt: data.completedTime
        ? new Date(data.completedTime)
        : undefined,
      energyRequired,
      estimatedDuration,
      ticktickId: data.id,
      ticktickProjectId: data.projectId,
      synced: true,
    });
  }

  /**
   * Convert our Todo type to TickTick task format
   */
  static convertTodoToTickTick(todo: Partial<Todo>): any {
    const tags: string[] = [...(todo.tags || [])];

    // Encode energy level into tags
    if (todo.energyRequired) {
      tags.push(`energy:${todo.energyRequired}`);
    }

    // Encode duration into tags
    if (todo.estimatedDuration) {
      tags.push(`duration:${todo.estimatedDuration}`);
    }

    return {
      title: todo.title || '',
      content: todo.description || '',
      priority: todo.priority ? ConverterService.mapPriority(todo.priority) : 0,
      status: todo.completed ? TICKTICK_CONSTANTS.STATUS.COMPLETED : TICKTICK_CONSTANTS.STATUS.ACTIVE,
      tags,
      dueDate: todo.dueDate?.toISOString(),
    };
  }

  /**
   * Map our Priority type to TickTick priority number
   * Our format: 'none' | 'low' | 'medium' | 'high'
   * TickTick format: 0 (none), 1 (low), 3 (medium), 5 (high)
   */
  private static mapPriority(priority: Priority): number {
    const priorityMap: Record<Priority, number> = {
      none: TICKTICK_CONSTANTS.PRIORITY.NONE,
      low: TICKTICK_CONSTANTS.PRIORITY.LOW,
      medium: TICKTICK_CONSTANTS.PRIORITY.MEDIUM,
      high: TICKTICK_CONSTANTS.PRIORITY.HIGH,
    };
    return priorityMap[priority];
  }

  /**
   * Map TickTick priority number to our Priority type
   * TickTick format: 0 (none), 1 (low), 3 (medium), 5 (high)
   * Our format: 'none' | 'low' | 'medium' | 'high'
   */
  private static reversePriority(priority: number): Priority {
    if (priority === 0) return 'none';
    if (priority === 1) return 'low';
    if (priority === 3) return 'medium';
    if (priority >= 5) return 'high';
    return 'none'; // Default fallback
  }
}
