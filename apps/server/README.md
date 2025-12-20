# tomanage tRPC Backend

AI-powered todo management backend built with tRPC, Express, and Anthropic Claude.

## Features

- **tRPC API** - Type-safe API with automatic TypeScript inference
- **AI Function Calling** - Claude AI can save/retrieve patterns about users
- **Smart Context** - Time-based, energy-aware task recommendations
- **Pattern Learning** - AI learns and remembers user productivity patterns
- **In-Memory Storage** - Fast storage (easily swappable for database)
- **Legacy API Support** - Backward compatible with existing Claude API proxy

## Quick Start

```bash
# Install dependencies
yarn install

# Set up environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY

# Start development server
yarn dev

# Build for production
yarn build
yarn start
```

Server runs at `http://localhost:3001`

## Project Structure

```
server/
├── src/
│   ├── index.ts              # Main Express + tRPC server
│   ├── trpc.ts               # tRPC initialization
│   ├── router.ts             # Main app router
│   ├── schemas.ts            # Zod schemas
│   ├── types.ts              # Type exports
│   ├── routers/
│   │   ├── ai.ts             # AI chat, recommendations, extraction
│   │   ├── storage.ts        # Patterns, preferences, analytics
│   │   └── context.ts        # Context helpers
│   ├── services/
│   │   ├── storage.ts        # In-memory storage service
│   │   ├── anthropic.ts      # AI service with tool execution
│   │   └── promptBuilder.ts  # Smart prompt templates
│   └── utils/
│       ├── toolMapper.ts     # AI tool → tRPC mapping
│       └── contextBuilder.ts # Context building utilities
├── index.js                  # Entry point (loads TypeScript)
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
├── API_USAGE.md              # Detailed API documentation
└── README.md                 # This file
```

## Available Procedures

### AI Router
- `ai.chat` - Conversational task creation with AI function calling
- `ai.getRecommendation` - Get smart task recommendation
- `ai.extractTodos` - Extract todos from text/image
- `ai.test` - Test AI connectivity

### Storage Router
- `storage.savePattern` - Save learned patterns (callable by AI)
- `storage.getPattern` - Get saved patterns (callable by AI)
- `storage.getAllPatterns` - Get all patterns for user
- `storage.savePreferences` - Save user preferences
- `storage.getPreferences` - Get user preferences
- `storage.saveAnalytics` - Save task completion analytics
- `storage.getAnalytics` - Get completion analytics

### Context Router
- `context.getCurrentContext` - Get time-based context
- `context.getUserProfile` - Get full user profile (callable by AI)

## AI Function Calling

The AI has access to tools that automatically call tRPC procedures:

1. **save_pattern** - Save learned patterns about user
2. **get_pattern** - Retrieve specific pattern
3. **get_user_profile** - Get complete user profile
4. **save_analytics** - Save task completion data
5. **get_analytics** - Get analytics for learning

Example AI workflow:
1. User asks for recommendation
2. AI calls `get_user_profile()` to understand context
3. AI calls `get_pattern('productivity_by_hour')` to check patterns
4. AI analyzes todos with full context
5. AI saves new patterns with `save_pattern()`
6. AI returns personalized recommendation

## Environment Variables

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
```

## Frontend Integration

```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/src/router';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      headers: { 'x-user-id': 'user-1' },
    }),
  ],
});

// Type-safe calls
const profile = await trpc.context.getUserProfile.query({});
const rec = await trpc.ai.getRecommendation.mutate({
  method: 'smart',
  todos: myTodos,
});
```

## Testing

```bash
# Health check
curl http://localhost:3001/health

# Get user profile
curl 'http://localhost:3001/trpc/context.getUserProfile?input=%7B%7D' \
  -H "x-user-id: user-1"
```

See [API_USAGE.md](API_USAGE.md) for complete API documentation and examples.

## Security Notes

- Never commit your `.env` file
- In production, add proper authentication
- Consider rate limiting for production use
- The legacy `/api/ai/claude` endpoint is maintained for backward compatibility
