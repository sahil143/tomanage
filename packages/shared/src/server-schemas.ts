import { z } from "zod";

// ===== Todo Schemas =====
export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  category: z.enum(["work", "personal", "interview", "learning"]),
  energyRequired: z.enum(["high", "medium", "low"]),
  estimatedDuration: z.number().optional(), // minutes
  contextType: z.enum([
    "frontend",
    "backend",
    "interview",
    "meeting",
    "review",
    "admin",
    "learning",
    "planning",
    "architecture",
  ]),
  tags: z.array(z.string()),
  status: z.enum(["pending", "in_progress", "completed", "blocked"]),
  dueDate: z.string().optional(), // ISO date
  completedAt: z.string().optional(),
  createdAt: z.string(),
});

export type Todo = z.infer<typeof todoSchema>;

// ===== AI Schemas =====
export const aiMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.union([
    z.string(),
    z.array(
      z.object({
        type: z.string(),
        text: z.string().optional(),
        source: z.unknown().optional(),
      })
    ),
  ]),
});

export const chatInputSchema = z.object({
  userId: z.string().optional(),
  messages: z.array(aiMessageSchema),
  todos: z.array(todoSchema).optional(),
});

export const recommendationMethodSchema = z.enum([
  "smart",
  "energy",
  "quick",
  "eisenhower",
  "focus",
]);

export const recommendationInputSchema = z.object({
  userId: z.string().optional(),
  todos: z.array(todoSchema),
  method: recommendationMethodSchema,
});

export const extractTodosInputSchema = z.object({
  userId: z.string().optional(),
  content: z.union([
    z.string(),
    z.array(
      z.object({
        type: z.string(),
        text: z.string().optional(),
        source: z.unknown().optional(),
      })
    ),
  ]),
});

// ===== Storage Schemas =====
export const patternTypeSchema = z.enum([
  "productivity_by_hour",
  "task_completion_patterns",
  "energy_patterns",
  "context_preferences",
  "learned_behaviors",
]);

export const patternDataSchema = z.record(z.unknown());

export const savePatternInputSchema = z.object({
  userId: z.string(),
  patternType: patternTypeSchema,
  data: patternDataSchema,
});

export const getPatternInputSchema = z.object({
  userId: z.string(),
  patternType: patternTypeSchema,
});

export const userPreferencesSchema = z.object({
  role: z.string(),
  focus_areas: z.array(z.string()),
  current_goals: z.array(z.string()),
  work_hours: z.object({
    start: z.string(),
    end: z.string(),
  }),
  peak_focus_times: z.array(z.string()),
  energy_by_hour: z.record(z.enum(["high", "medium", "low"])),
  preferred_morning_contexts: z.array(z.string()),
  preferred_afternoon_contexts: z.array(z.string()),
  preferred_evening_contexts: z.array(z.string()),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const savePreferencesInputSchema = z.object({
  userId: z.string(),
  preferences: userPreferencesSchema,
});

export const analyticsEntrySchema = z.object({
  taskId: z.string(),
  completedAt: z.string(),
  timeOfDay: z.string(),
  dayOfWeek: z.string(),
  energyLevel: z.enum(["high", "medium", "low"]),
  contextType: z.string(),
  estimatedDuration: z.number().optional(),
  actualDuration: z.number().optional(),
});

export type AnalyticsEntry = z.infer<typeof analyticsEntrySchema>;

export const saveAnalyticsInputSchema = z.object({
  userId: z.string(),
  entry: analyticsEntrySchema,
});

// ===== Context Schemas =====
export const currentContextSchema = z.object({
  currentTime: z.string(),
  currentHour: z.number(),
  dayOfWeek: z.string(),
  isWorkHours: z.boolean(),
  predictedEnergy: z.enum(["high", "medium", "low"]).optional(),
  recommendedContexts: z.array(z.string()),
});

export type CurrentContext = z.infer<typeof currentContextSchema>;

export const userProfileSchema = z.object({
  userId: z.string(),
  preferences: userPreferencesSchema,
  currentContext: currentContextSchema,
  patterns: z.record(patternDataSchema).optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;


