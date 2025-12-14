const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for Anthropic API
app.post('/api/ai/claude', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key not configured on server'
      });
    }

    const { model, max_tokens, messages } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request: messages array required'
      });
    }

    // Make request to Anthropic API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        timeout: 60000, // 1 minutes
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error calling Claude API:', error.response?.data || error.message);

    if (error.response) {
      // Forward API error to client
      res.status(error.response.status).json({
        error: error.response.data?.error?.message || 'API request failed',
        details: error.response.data,
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Unable to reach Anthropic API'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Claude API proxy: http://localhost:${PORT}/api/ai/claude`);
});
