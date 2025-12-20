# tRPC Backend API Usage Guide

## Server Running

```bash
# Development (with hot reload)
yarn dev

# Production build and run
yarn build
yarn start
```

Server runs on `http://localhost:3001`

## Available Endpoints

### Health Check
```bash
GET http://localhost:3001/health
```

### Legacy Claude API (Backward Compatible)
```bash
POST http://localhost:3001/api/ai/claude
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

### tRPC Endpoints

All tRPC endpoints are accessed via `/trpc/<router>.<procedure>`.

#### Query Procedures (GET)
For query procedures, pass input as URL-encoded JSON in the query string.

```bash
# Get current context
curl 'http://localhost:3001/trpc/context.getCurrentContext?input=%7B%7D' \
  -H "x-user-id: user-1"

# Get user preferences
curl 'http://localhost:3001/trpc/storage.getPreferences?input=%7B%7D' \
  -H "x-user-id: user-1"

# Get user profile (with patterns)
curl 'http://localhost:3001/trpc/context.getUserProfile?input=%7B%7D' \
  -H "x-user-id: user-1"

# Get a specific pattern
curl 'http://localhost:3001/trpc/storage.getPattern?input=%7B%22patternType%22%3A%22productivity_by_hour%22%7D' \
  -H "x-user-id: user-1"

# Get analytics
curl 'http://localhost:3001/trpc/storage.getAnalytics?input=%7B%22limit%22%3A10%7D' \
  -H "x-user-id: user-1"
```

#### Mutation Procedures (POST)
For mutations, send POST requests with JSON body.

```bash
# Save a pattern
curl -X POST 'http://localhost:3001/trpc/storage.savePattern' \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{
    "patternType": "productivity_by_hour",
    "data": {
      "9": "high",
      "14": "high",
      "20": "low"
    }
  }'

# Save preferences
curl -X POST 'http://localhost:3001/trpc/storage.savePreferences' \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{
    "preferences": {
      "role": "Engineer",
      "focus_areas": ["React"],
      "current_goals": ["learning"],
      "work_hours": { "start": "09:00", "end": "17:00" },
      "peak_focus_times": ["09:00-12:00"],
      "energy_by_hour": { "9": "high", "10": "high" },
      "preferred_morning_contexts": ["frontend"],
      "preferred_afternoon_contexts": ["review"],
      "preferred_evening_contexts": ["learning"]
    }
  }'

# Chat with AI (with function calling)
curl -X POST 'http://localhost:3001/trpc/ai.chat' \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Create a task: implement sentry monitoring in konflux ui"
      }
    ]
  }'

# Get task recommendation
curl -X POST 'http://localhost:3001/trpc/ai.getRecommendation' \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{
    "method": "smart",
    "todos": [
      {
        "id": "1",
        "title": "Implement Sentry monitoring",
        "priority": "high",
        "category": "work",
        "energyRequired": "high",
        "estimatedDuration": 120,
        "contextType": "frontend",
        "tags": ["sentry", "monitoring"],
        "status": "pending",
        "createdAt": "2025-12-15T10:00:00Z"
      }
    ]
  }'

# Extract todos from text
curl -X POST 'http://localhost:3001/trpc/ai.extractTodos' \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{
    "content": "I need to: 1. Review the PR for bundle optimization 2. Schedule interview with Google 3. Learn about DSA"
  }'
```

## AI Function Calling

The AI has access to these tools that map to tRPC procedures:

1. **save_pattern(patternType, data)** - Save learned patterns about user behavior
2. **get_pattern(patternType)** - Retrieve saved patterns
3. **get_user_profile()** - Get complete user profile with context
4. **save_analytics(entry)** - Save task completion data
5. **get_analytics(limit?)** - Retrieve analytics

When you call AI endpoints, the AI can automatically call these tools to:
- Learn about your preferences
- Save new patterns it discovers
- Make context-aware recommendations
- Track your productivity patterns

## User Identification

Pass user ID in one of two ways:
1. Header: `x-user-id: user-1`
2. Input field: `{ "userId": "user-1", ... }`

Default user is `user-1` if not specified.

## Frontend Integration (React Native)

### Install tRPC Client

```bash
yarn add @trpc/client @trpc/react-query @tanstack/react-query
```

### Setup tRPC Client

```typescript
// src/utils/trpc.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/src/router';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      headers() {
        return {
          'x-user-id': 'user-1',
        };
      },
    }),
  ],
});
```

### Usage Examples

```typescript
// Get user profile
const profile = await trpc.context.getUserProfile.query({});

// Save a pattern
await trpc.storage.savePattern.mutate({
  patternType: 'productivity_by_hour',
  data: { 9: 'high', 14: 'high' },
});

// Get task recommendation
const recommendation = await trpc.ai.getRecommendation.mutate({
  method: 'smart',
  todos: myTodos,
});

// Chat with AI
const response = await trpc.ai.chat.mutate({
  messages: [
    { role: 'user', content: 'Create a task to review the PR' },
  ],
});
```

## Pattern Types

- `productivity_by_hour` - When you're most productive
- `task_completion_patterns` - What types of tasks you complete when
- `energy_patterns` - Your energy levels throughout the day
- `context_preferences` - Preferred contexts for different times
- `learned_behaviors` - AI-discovered patterns

## Recommendation Methods

- `smart` - AI-powered context-aware recommendation
- `energy` - Based on current energy level
- `quick` - Quick wins (low hanging fruit)
- `eisenhower` - Eisenhower matrix (urgent/important)
- `focus` - Deep focus tasks

## Todo Schema

All todos must include these fields:

```typescript
{
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'work' | 'personal' | 'interview' | 'learning';
  energyRequired: 'high' | 'medium' | 'low';
  estimatedDuration?: number; // minutes
  contextType: 'frontend' | 'backend' | 'interview' | 'meeting' | 'review' | 'admin' | 'learning' | 'planning' | 'architecture';
  tags: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: string; // ISO date
  completedAt?: string;
  createdAt: string;
}
```

## Example: Complete Flow

```bash
# 1. Get user profile to see current context
curl 'http://localhost:3001/trpc/context.getUserProfile?input=%7B%7D' \
  -H "x-user-id: user-1"

# 2. Extract todos from message
curl -X POST 'http://localhost:3001/trpc/ai.extractTodos' \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{ "content": "I need to implement Sentry and review the PR" }'

# 3. Get smart recommendation
curl -X POST 'http://localhost:3001/trpc/ai.getRecommendation' \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{ "method": "smart", "todos": [...] }'

# 4. AI saves patterns it learns automatically during recommendation
# Check what it learned:
curl 'http://localhost:3001/trpc/storage.getAllPatterns?input=%7B%7D' \
  -H "x-user-id: user-1"
```

## Logs

The server logs all:
- AI tool calls
- Pattern saves
- Analytics saves
- Errors

Check your terminal for detailed logs.
