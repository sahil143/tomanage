# ToManage Proxy Server

This is a simple Express.js proxy server that forwards requests to the Anthropic API to avoid CORS issues when using the app in a web browser.

## Why is this needed?

The Anthropic API doesn't support CORS (Cross-Origin Resource Sharing), which means you can't make direct API calls from a web browser. Additionally, exposing your API key in client-side code is a security risk. This proxy server:

1. Runs on your local machine (or a server)
2. Receives requests from your React Native app
3. Forwards them to Anthropic API with your API key
4. Returns the response back to your app

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
PORT=3001
```

## Running the Server

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## Endpoints

- `GET /health` - Health check endpoint
- `POST /api/ai/claude` - Proxy endpoint for Anthropic API

## Testing

You can test if the server is running:
```bash
curl http://localhost:3001/health
```

## Security Notes

- Never commit your `.env` file
- In production, add proper authentication
- Consider rate limiting for production use
- Only allow requests from your app's domain in production
