import Constants from 'expo-constants';

// API Configuration
export const API_CONFIG = {
  TICKTICK_BASE_URL: 'https://api.ticktick.com/open/v1',
  TICKTICK_OAUTH_URL: 'https://ticktick.com/oauth',

  // Use proxy server instead of direct API calls to avoid CORS
  PROXY_BASE_URL: Constants.expoConfig?.extra?.proxyBaseUrl || 'http://localhost:3001',
  ANTHROPIC_PROXY_ENDPOINT: '/api/ai/claude',

  // Direct API config (for reference, not used in web)
  ANTHROPIC_BASE_URL: 'https://api.anthropic.com/v1/messages',
  ANTHROPIC_MODEL: 'claude-sonnet-4-20241022',
  ANTHROPIC_VERSION: '2023-06-01',

  // Environment variables (fallback to empty strings if not set)
  TICKTICK_CLIENT_ID: Constants.expoConfig?.extra?.ticktickClientId || '',
  TICKTICK_CLIENT_SECRET: Constants.expoConfig?.extra?.ticktickClientSecret || '',
  ANTHROPIC_API_KEY: Constants.expoConfig?.extra?.anthropicApiKey || '',
} as const;

// Color Schemes
export const COLORS = {
  // Priority colors
  priority: {
    high: '#EF4444',    // Red
    medium: '#F59E0B',  // Amber
    low: '#3B82F6',     // Blue
    none: '#6B7280',    // Gray
  },

  // Energy level colors
  energy: {
    high: '#EF4444',    // Red (requires high energy)
    medium: '#F59E0B',  // Amber (moderate energy)
    low: '#10B981',     // Green (low energy required)
  },

  // Urgency colors
  urgency: {
    overdue: '#DC2626',   // Dark red
    critical: '#EF4444',  // Red
    today: '#F59E0B',     // Amber
    tomorrow: '#3B82F6',  // Blue
    normal: '#6B7280',    // Gray
  },

  // App theme colors
  theme: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  },
} as const;

// Energy Level Keywords (for inference)
export const ENERGY_KEYWORDS = {
  high: [
    // Complex cognitive tasks
    'implement',
    'architecture',
    'design',
    'refactor',
    'optimize',
    'debug',
    'investigate',
    'analyze',
    'research',
    'prototype',
    'build',
    'create',
    'develop',
    'solve',
    'algorithm',
    'system',
    'complex',
    'planning',
    'strategy',
  ],
  medium: [
    // Standard development tasks
    'write',
    'add',
    'update',
    'modify',
    'test',
    'fix',
    'merge',
    'code',
    'feature',
    'function',
    'component',
    'module',
    'integrate',
    'configure',
    'setup',
    'document',
  ],
  low: [
    // Administrative and simple tasks
    'review',
    'read',
    'check',
    'organize',
    'format',
    'rename',
    'delete',
    'clean',
    'cleanup',
    'remove',
    'copy',
    'move',
    'update docs',
    'comment',
    'notes',
    'meeting',
    'email',
    'respond',
    'schedule',
  ],
} as const;

// Context Type Keywords (for categorization)
export const CONTEXT_KEYWORDS = {
  frontend: [
    'react',
    'ui',
    'ux',
    'frontend',
    'component',
    'view',
    'screen',
    'style',
    'css',
    'html',
    'interface',
    'button',
    'form',
    'modal',
    'navigation',
    'layout',
    'design',
    'responsive',
    'animation',
  ],
  backend: [
    'api',
    'backend',
    'server',
    'database',
    'endpoint',
    'service',
    'controller',
    'model',
    'schema',
    'query',
    'sql',
    'migration',
    'auth',
    'middleware',
    'route',
  ],
  interview: [
    'interview',
    'candidate',
    'screening',
    'technical interview',
    'hiring',
    'recruitment',
    'assess',
    'evaluation',
  ],
  meeting: [
    'meeting',
    'standup',
    'sync',
    'call',
    'discussion',
    'presentation',
    'demo',
    'retrospective',
    'planning meeting',
    '1:1',
    'one-on-one',
  ],
  review: [
    'review',
    'pr',
    'pull request',
    'code review',
    'feedback',
    'approve',
    'merge request',
  ],
  planning: [
    'plan',
    'planning',
    'roadmap',
    'strategy',
    'estimate',
    'spec',
    'specification',
    'requirements',
    'architecture',
    'design doc',
  ],
  learning: [
    'learn',
    'study',
    'research',
    'tutorial',
    'course',
    'documentation',
    'read',
    'understand',
    'explore',
  ],
  admin: [
    'admin',
    'administrative',
    'paperwork',
    'expense',
    'report',
    'timesheet',
    'organize',
    'setup',
    'configure',
  ],
} as const;

// Duration Keywords (for parsing)
export const DURATION_PATTERNS = {
  minutes: /(\d+)\s*(min|mins|minute|minutes)/i,
  hours: /(\d+)\s*(h|hr|hrs|hour|hours)/i,
  days: /(\d+)\s*(d|day|days)/i,
} as const;

// Work Schedule Constants
export const WORK_SCHEDULE = {
  workHours: {
    start: 9,  // 9 AM
    end: 17,   // 5 PM
  },
  weekendDays: [0, 6], // Sunday, Saturday
  timeOfDay: {
    morning: { start: 6, end: 12 },
    afternoon: { start: 12, end: 17 },
    evening: { start: 17, end: 21 },
    night: { start: 21, end: 6 },
  },
} as const;

// Recommendation Methods
export const RECOMMENDATION_METHODS = {
  SMART: 'smart',
  ENERGY: 'energy',
  QUICK: 'quick',
  EISENHOWER: 'eisenhower',
  FOCUS: 'focus',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  TODOS: 'todo-storage',
  CHAT_MESSAGES: 'chat-messages',
  TICKTICK_TOKEN: 'ticktick-access-token',
  ANTHROPIC_API_KEY: 'anthropic-api-key',
  LAST_SYNC: 'last-sync-timestamp',
  USER_PREFERENCES: 'user-preferences',
} as const;

// API Timeouts (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 30000,      // 30 seconds
  SYNC_REQUEST: 60000,     // 1 minute
  AI_REQUEST: 120000,      // 2 minutes (AI can be slow)
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;

// Quick Win Criteria
export const QUICK_WIN_CRITERIA = {
  MAX_DURATION: 30,  // minutes
  MIN_PRIORITY: 'low' as const,
} as const;

// Eisenhower Matrix Thresholds
export const EISENHOWER_THRESHOLDS = {
  URGENT_DAYS: 2,      // Tasks due in 2 days are urgent
  IMPORTANT_PRIORITY: 'medium' as const,  // medium or high is important
} as const;

// Deep Work Criteria
export const DEEP_WORK_CRITERIA = {
  MIN_DURATION: 60,       // minutes
  REQUIRED_ENERGY: 'high' as const,
  PREFERRED_TIME: 'morning' as const,
} as const;

// Validation Rules
export const VALIDATION = {
  TODO_TITLE_MIN_LENGTH: 1,
  TODO_TITLE_MAX_LENGTH: 200,
  CHAT_MESSAGE_MAX_LENGTH: 2000,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS: 10,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TICKTICK_AUTH_ERROR: 'Failed to authenticate with TickTick.',
  TICKTICK_SYNC_ERROR: 'Failed to sync with TickTick.',
  AI_ERROR: 'Failed to get AI recommendation. Please try again.',
  STORAGE_ERROR: 'Failed to save data locally.',
  INVALID_TODO: 'Invalid todo data.',
  MISSING_API_KEY: 'API key not configured. Please check settings.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  TODO_CREATED: 'Task created successfully',
  TODO_UPDATED: 'Task updated successfully',
  TODO_DELETED: 'Task deleted successfully',
  TODO_COMPLETED: 'Task completed!',
  SYNC_SUCCESS: 'Synced with TickTick successfully',
  AUTH_SUCCESS: 'Successfully connected to TickTick',
} as const;

// Feature Flags (for gradual rollout)
export const FEATURE_FLAGS = {
  ENABLE_AI_RECOMMENDATIONS: true,
  ENABLE_TICKTICK_SYNC: true,
  ENABLE_IMAGE_UPLOAD: true,
  ENABLE_VOICE_INPUT: false,
  ENABLE_ANALYTICS: false,
} as const;

// Default Values
export const DEFAULTS = {
  TODO_PRIORITY: 'none' as const,
  ESTIMATED_DURATION: 30, // minutes
  ENERGY_LEVEL: 'medium' as const,
  CONTEXT_TYPE: 'general' as const,
} as const;
