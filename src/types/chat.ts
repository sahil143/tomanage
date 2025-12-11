import { EnergyLevel } from './todo';

// Type definition for message roles
export type MessageRole = 'user' | 'assistant';

export type RecommendationMethod =
  | 'smart'
  | 'energy'
  | 'quick'
  | 'eisenhower'
  | 'focus';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  hasImage: boolean;
  imageUri?: string;
  createdTodoIds: string[];
}

export interface UserContext {
  currentTime: string;
  localTime: string;
  dayOfWeek: string;
  isWeekend: boolean;
  isWorkHours: boolean;
  timeOfDay: TimeOfDay;
  energyLevel: EnergyLevel;
  timezone: string;
}


export function createChatMessage(
  data: Partial<ChatMessage> & { role: MessageRole; content: string }
): ChatMessage {
  return {
    id: data.id || generateMessageId(),
    role: data.role,
    content: data.content,
    timestamp: data.timestamp || new Date(),
    hasImage: data.hasImage ?? false,
    imageUri: data.imageUri,
    createdTodoIds: data.createdTodoIds || [],
  };
}

export function createUserContext(
  data?: Partial<UserContext>
): UserContext {
  const now = new Date();
  const hours = now.getHours();

  // Determine time of day based on hours
  const getTimeOfDay = (hour: number): TimeOfDay => {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  // Determine if it's work hours (9 AM - 5 PM)
  const isWorkHours = hours >= 9 && hours < 17;

  // Determine if it's weekend (0 = Sunday, 6 = Saturday)
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Get day name
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  return {
    currentTime: data?.currentTime || now.toISOString(),
    localTime: data?.localTime || now.toLocaleTimeString(),
    dayOfWeek: data?.dayOfWeek || dayNames[dayOfWeek],
    isWeekend: data?.isWeekend ?? isWeekend,
    isWorkHours: data?.isWorkHours ?? isWorkHours,
    timeOfDay: data?.timeOfDay || getTimeOfDay(hours),
    energyLevel: data?.energyLevel || 'medium',
    timezone:
      data?.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
