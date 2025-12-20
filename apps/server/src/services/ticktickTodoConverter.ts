import type { Todo } from '../schemas';
import { todoSchema } from '../schemas';

// Minimal TickTick task shape (matches TickTick SDK output)
export type TickTickTask = {
  id: string;
  projectId: string;
  title: string;
  content?: string;
  dueDate?: string;
  priority?: number;
  status?: number;
  completedTime?: string;
  createdTime?: string;
  tags?: string[];
};

const TICKTICK_STATUS = {
  ACTIVE: 0,
  COMPLETED: 2,
} as const;

const TICKTICK_PRIORITY = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 3,
  HIGH: 5,
} as const;

function normalizeTags(tags: string[] | undefined): string[] {
  return (tags ?? []).map(t => t.trim()).filter(Boolean);
}

function extractSpecialTagValue(tags: string[], prefix: string): string | undefined {
  const match = tags.find(t => t.toLowerCase().startsWith(prefix));
  if (!match) return undefined;
  return match.slice(prefix.length).trim();
}

function removeSpecialTags(tags: string[]): string[] {
  return tags.filter(t => {
    const lower = t.toLowerCase();
    return !(
      lower.startsWith('energy:') ||
      lower.startsWith('duration:') ||
      lower.startsWith('category:') ||
      lower.startsWith('context:')
    );
  });
}

function inferCategory(title: string, tags: string[]): Todo['category'] {
  const lowerTitle = title.toLowerCase();
  const lowerTags = tags.map(t => t.toLowerCase());

  // Explicit tags win
  const tagged = extractSpecialTagValue(lowerTags, 'category:') as Todo['category'] | undefined;
  if (tagged && ['work', 'personal', 'interview', 'learning'].includes(tagged)) return tagged;

  if (lowerTags.includes('interview') || lowerTitle.includes('interview') || lowerTitle.includes('leetcode') || lowerTitle.includes('dsa')) {
    return 'interview';
  }
  if (lowerTags.includes('learning') || lowerTitle.includes('learn') || lowerTitle.includes('study') || lowerTitle.includes('course')) {
    return 'learning';
  }
  if (lowerTags.includes('personal') || lowerTitle.includes('home') || lowerTitle.includes('family')) {
    return 'personal';
  }
  return 'work';
}

function mapPriority(ticktickPriority: number | undefined): Todo['priority'] {
  const p = ticktickPriority ?? TICKTICK_PRIORITY.NONE;
  if (p >= TICKTICK_PRIORITY.HIGH) return 'high';
  if (p >= TICKTICK_PRIORITY.MEDIUM) return 'medium';
  return 'low';
}

function inferEnergyRequired(title: string, tags: string[]): Todo['energyRequired'] {
  const tagged = extractSpecialTagValue(tags.map(t => t.toLowerCase()), 'energy:') as
    | Todo['energyRequired']
    | undefined;
  if (tagged && ['low', 'medium', 'high'].includes(tagged)) return tagged;

  const lower = title.toLowerCase();
  if (/(implement|build|design|refactor|migrate|architecture|optimi[sz]e)/.test(lower)) return 'high';
  if (/(review|update|write|plan|organize|fix)/.test(lower)) return 'medium';
  return 'low';
}

function inferContextType(title: string, tags: string[]): Todo['contextType'] {
  const lowerTags = tags.map(t => t.toLowerCase());
  const tagged = extractSpecialTagValue(lowerTags, 'context:') as Todo['contextType'] | undefined;
  if (
    tagged &&
    [
      'frontend',
      'backend',
      'interview',
      'meeting',
      'review',
      'admin',
      'learning',
      'planning',
      'architecture',
    ].includes(tagged)
  ) {
    return tagged;
  }

  const lower = title.toLowerCase();
  if (/(react|ui|frontend|css|vite|next|expo)/.test(lower)) return 'frontend';
  if (/(api|server|backend|db|postgres|prisma|trpc)/.test(lower)) return 'backend';
  if (/(review|pr\b)/.test(lower)) return 'review';
  if (/(meeting|sync|1:1)/.test(lower)) return 'meeting';
  if (/(learn|study|course)/.test(lower)) return 'learning';
  if (/(plan|planning|roadmap)/.test(lower)) return 'planning';
  if (/(arch|architecture|design doc)/.test(lower)) return 'architecture';
  if (/(interview|leetcode|dsa)/.test(lower)) return 'interview';
  return 'planning';
}

function inferEstimatedDuration(tags: string[]): number | undefined {
  const raw = extractSpecialTagValue(tags.map(t => t.toLowerCase()), 'duration:');
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function convertTickTickTaskToServerTodo(task: TickTickTask): Todo {
  const title = task.title ?? '';
  const tags = normalizeTags(task.tags);
  const regularTags = removeSpecialTags(tags);

  const todo: Todo = {
    id: task.id,
    title,
    description: task.content,
    priority: mapPriority(task.priority),
    category: inferCategory(title, tags),
    energyRequired: inferEnergyRequired(title, tags),
    estimatedDuration: inferEstimatedDuration(tags),
    contextType: inferContextType(title, tags),
    tags: regularTags,
    status: task.status === TICKTICK_STATUS.COMPLETED ? 'completed' : 'pending',
    dueDate: task.dueDate,
    completedAt: task.completedTime,
    createdAt: task.createdTime ?? new Date().toISOString(),
  };

  // Ensure we return a schema-valid shape for clients/AI
  return todoSchema.parse(todo);
}


