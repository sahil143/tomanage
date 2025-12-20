import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import dotenv from 'dotenv';
import { appRouter } from './router';
import { createContext } from './context';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'tomanage-trpc-backend',
  });
});

// Legacy Claude API proxy endpoint (for backward compatibility)
app.post('/api/ai/claude', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key not configured on server',
      });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request: messages array required',
      });
    }

    // Import Anthropic SDK
    const Anthropic = require('@anthropic-ai/sdk').default;
    const anthropic = new Anthropic({ apiKey });

    // Make request to Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages,
    });

    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error calling Claude API:', message);

    res.status(500).json({
      error: 'Internal server error',
      message,
    });
  }
});

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: (opts) => {
      const baseCtx = createContext(opts);
      return {
        ...baseCtx,
        caller: appRouter.createCaller(baseCtx),
      };
    },
  })
);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 tRPC Backend Server running on port ${PORT}`);
  console.log(`\n📍 Available endpoints:`);
  console.log(`   Health check:  http://localhost:${PORT}/health`);
  console.log(`   tRPC:          http://localhost:${PORT}/trpc`);
  console.log(`   Legacy API:    http://localhost:${PORT}/api/ai/claude`);
  console.log(`\n📦 Available tRPC procedures:`);
  console.log(`   ai.chat`);
  console.log(`   ai.getRecommendation`);
  console.log(`   ai.extractTodos`);
  console.log(`   ai.test`);
  console.log(`   storage.savePattern`);
  console.log(`   storage.getPattern`);
  console.log(`   storage.getAllPatterns`);
  console.log(`   storage.savePreferences`);
  console.log(`   storage.getPreferences`);
  console.log(`   storage.saveAnalytics`);
  console.log(`   storage.getAnalytics`);
  console.log(`   context.getCurrentContext`);
  console.log(`   context.getUserProfile`);
  console.log(`\n✨ Ready for AI-powered todo management!\n`);
});

export { appRouter, type AppRouter } from './router';
