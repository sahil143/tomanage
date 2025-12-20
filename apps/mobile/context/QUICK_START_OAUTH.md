# Quick Start: TickTick OAuth

## Setup (Do Once)

1. **Create your .env file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your credentials to .env:**
   ```bash
   EXPO_PUBLIC_TICKTICK_CLIENT_ID=your_actual_client_id
   EXPO_PUBLIC_TICKTICK_CLIENT_SECRET=your_actual_client_secret
   ```

3. **Configure TickTick OAuth app:**
   - Go to TickTick Developer Console
   - Set Redirect URI to: `tomanage://oauth/ticktick`
   - Enable scopes: `tasks:read tasks:write`

4. **Install and run:**
   ```bash
   yarn install
   yarn start
   ```

## How to Use

### In the App UI

1. Open **Settings** screen
2. Tap **Connect TickTick** button
3. Authorize in browser
4. Return to app (automatic)
5. See "Connected" status

### In Your Code

```typescript
import { ticktickService } from './src/services/ticktickService';

// Check if connected
const isConnected = await ticktickService.isAuthenticated();

// Fetch all tasks
const tasks = await ticktickService.getTasks();

// Create a task
await ticktickService.createTask({
  title: 'My new task',
  description: 'Task details',
  priority: 'high',
  dueDate: new Date('2025-12-31'),
});

// Disconnect
await ticktickService.logout();
```

## OAuth Flow Diagram

```
User Taps "Connect"
        ↓
App Opens Browser with TickTick Auth URL
        ↓
User Authorizes in TickTick
        ↓
TickTick Redirects: tomanage://oauth/ticktick?code=XXX&state=YYY
        ↓
App Validates State (Security Check)
        ↓
App Exchanges Code for Access Token
        ↓
Token Stored Securely
        ↓
All API Calls Include: Authorization: Bearer <token>
```

## What Got Implemented

✅ OAuth authorization URL generation with security
✅ Token exchange with Basic Auth
✅ Secure token storage (Keychain/EncryptedStorage)
✅ Deep link callback handling
✅ CSRF protection with state parameter
✅ Ready-to-use UI component
✅ Settings screen integration
✅ Auto token injection in API requests

## Files to Know

- **[src/services/ticktickService.ts](src/services/ticktickService.ts)** - OAuth & API methods
- **[src/components/TickTickAuthButton.tsx](src/components/TickTickAuthButton.tsx)** - UI component
- **[src/utils/deepLinking.ts](src/utils/deepLinking.ts)** - OAuth URLs & security
- **[app/_layout.tsx](app/_layout.tsx)** - OAuth callback handler
- **[.env.example](.env.example)** - Environment template

## Need Help?

Read the full guides:
- **[OAUTH_IMPLEMENTATION_SUMMARY.md](OAUTH_IMPLEMENTATION_SUMMARY.md)** - What was implemented
- **[TICKTICK_OAUTH_GUIDE.md](TICKTICK_OAUTH_GUIDE.md)** - Detailed implementation guide
