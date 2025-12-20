import { EnergyLevel } from './todo';
import { WORK_SCHEDULE, DEFAULTS } from '../utils/constants';

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
    const { morning, afternoon, evening } = WORK_SCHEDULE.timeOfDay;
    if (hour >= morning.start && hour < morning.end) return 'morning';
    if (hour >= afternoon.start && hour < afternoon.end) return 'afternoon';
    if (hour >= evening.start && hour < evening.end) return 'evening';
    return 'night';
  };

  // Determine if it's work hours
  const isWorkHours = hours >= WORK_SCHEDULE.workHours.start && hours < WORK_SCHEDULE.workHours.end;

  // Determine if it's weekend
  const dayOfWeek = now.getDay();
  const isWeekend = WORK_SCHEDULE.weekendDays.includes(dayOfWeek);

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
    energyLevel: data?.energyLevel || DEFAULTS.ENERGY_LEVEL,
    timezone:
      data?.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
