import { format, getHours, getDay } from 'date-fns';
import { storageService } from '../services/storage';
import { CurrentContext, UserProfile } from '../schemas';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getCurrentContext(userId: string): CurrentContext {
  const now = new Date();
  const currentHour = getHours(now);
  const dayOfWeek = DAYS_OF_WEEK[getDay(now)];
  const currentTime = format(now, 'yyyy-MM-dd HH:mm:ss');

  // Get user preferences
  const preferences = storageService.getOrCreateDefaultPreferences(userId);

  // Check if within work hours
  const workStart = parseInt(preferences.work_hours.start.split(':')[0], 10);
  const workEnd = parseInt(preferences.work_hours.end.split(':')[0], 10);
  const isWorkHours = currentHour >= workStart && currentHour < workEnd;

  // Get predicted energy level
  const predictedEnergy = preferences.energy_by_hour[currentHour.toString()] as 'high' | 'medium' | 'low' | undefined;

  // Determine recommended contexts based on time of day
  let recommendedContexts: string[] = [];
  if (currentHour >= 6 && currentHour < 12) {
    recommendedContexts = preferences.preferred_morning_contexts;
  } else if (currentHour >= 12 && currentHour < 18) {
    recommendedContexts = preferences.preferred_afternoon_contexts;
  } else {
    recommendedContexts = preferences.preferred_evening_contexts;
  }

  return {
    currentTime,
    currentHour,
    dayOfWeek,
    isWorkHours,
    predictedEnergy,
    recommendedContexts,
  };
}

export function getUserProfile(userId: string): UserProfile {
  const preferences = storageService.getOrCreateDefaultPreferences(userId);
  const currentContext = getCurrentContext(userId);
  const patterns = storageService.getAllPatterns(userId);

  return {
    userId,
    preferences,
    currentContext,
    patterns: Object.keys(patterns).length > 0 ? patterns : undefined,
  };
}

export function formatContextForPrompt(context: CurrentContext): string {
  return `
- Time: ${context.currentTime}
- Hour: ${context.currentHour}
- Day: ${context.dayOfWeek}
- Predicted energy: ${context.predictedEnergy || 'unknown'}
- Work hours: ${context.isWorkHours ? 'Yes' : 'No'}
- Recommended contexts: ${context.recommendedContexts.join(', ')}
`.trim();
}

export function formatUserProfileForPrompt(profile: UserProfile): string {
  const { preferences, currentContext, patterns } = profile;

  let prompt = `
# WHO I AM
- Role: ${preferences.role}
- Focus areas: ${preferences.focus_areas.join(', ')}
- Current goals: ${preferences.current_goals.join(', ')}

# CURRENT CONTEXT
${formatContextForPrompt(currentContext)}

# WORK SCHEDULE
- Work hours: ${preferences.work_hours.start} - ${preferences.work_hours.end}
- Peak focus times: ${preferences.peak_focus_times.join(', ')}
`.trim();

  if (patterns && Object.keys(patterns).length > 0) {
    prompt += '\n\n# MY LEARNED PATTERNS\n';
    for (const [patternType, data] of Object.entries(patterns)) {
      prompt += `\n## ${patternType}\n${JSON.stringify(data, null, 2)}`;
    }
  }

  return prompt;
}
