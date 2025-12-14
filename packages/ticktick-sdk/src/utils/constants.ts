// TickTick API Configuration
export const TICKTICK_API = {
  BASE_URL: 'https://api.ticktick.com/open/v1',
  OAUTH_URL: 'https://ticktick.com/oauth',
  DEFAULT_TIMEOUT: 30000, // 30 seconds
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ticktick-access-token',
} as const;

// TickTick API Constants
export const TICKTICK_CONSTANTS = {
  // Task status values
  STATUS: {
    ACTIVE: 0,
    COMPLETED: 2,
  } as const,

  // Priority mapping
  PRIORITY: {
    NONE: 0,
    LOW: 1,
    MEDIUM: 3,
    HIGH: 5,
  } as const,
} as const;
