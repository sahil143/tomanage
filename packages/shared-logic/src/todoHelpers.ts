import type { Todo, Priority } from '@tomanage/shared-types'

/**
 * Calculate priority color for display
 */
export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6',
    none: '#9ca3af',
  }
  return colors[priority]
}

/**
 * Get urgency level based on due date
 */
export function getUrgency(dueDate: Date | string | undefined): string {
  if (!dueDate) return 'none'
  
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  if (diffMs < 0) return 'overdue'
  if (diffHours < 4) return 'critical'
  if (diffHours < 24) return 'today'
  if (diffDays < 2) return 'tomorrow'
  if (diffDays < 7) return 'this-week'
  return 'future'
}

/**
 * Sort todos by priority and urgency
 */
export function sortTodos(todos: Todo[]): Todo[] {
  const priorityWeight = { high: 3, medium: 2, low: 1, none: 0 }
  const urgencyWeight: Record<string, number> = {
    overdue: 7,
    critical: 6,
    today: 5,
    tomorrow: 4,
    'this-week': 3,
    future: 2,
    none: 1,
  }

  return [...todos].sort((a, b) => {
    // Completed items go to bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    // Sort by urgency first
    const urgencyA = getUrgency(a.dueDate)
    const urgencyB = getUrgency(b.dueDate)
    const urgencyDiff = urgencyWeight[urgencyB] - urgencyWeight[urgencyA]
    if (urgencyDiff !== 0) return urgencyDiff

    // Then by priority
    return priorityWeight[b.priority] - priorityWeight[a.priority]
  })
}

