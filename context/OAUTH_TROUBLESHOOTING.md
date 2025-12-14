# OAuth Troubleshooting Guide

## Error: "redirect URI is not registered with the client"

This error means the redirect URI in your code doesn't match what's configured in your TickTick OAuth app settings.

### Step 1: Check What Redirect URI Your App is Using

Add this debug code to your TickTickAuthButton or Settings screen temporarily:

```typescript
import { getTickTickRedirectUri } from '../utils/deepLinking';

// Add this somewhere in your component
useEffect(() => {
  const redirectUri = getTickTickRedirectUri();
  console.log('📍 Redirect URI:', redirectUri);
  // You should see: tomanage://oauth/ticktick
}, []);
```

### Step 2: Verify TickTick OAuth App Configuration

1. Go to [TickTick Developer Console](https://developer.ticktick.com/)
2. Select your OAuth application
3. Find the "Redirect URI" field
4. It should **EXACTLY** match: `tomanage://oauth/ticktick`

**Important Notes:**
- No trailing slashes
- Case-sensitive
- Must match character-for-character

### Common Redirect URI Issues

| What's Wrong | Example | Fix |
|-------------|---------|-----|
| Extra slash | `tomanage://oauth/ticktick/` | Remove trailing `/` |
| Wrong scheme | `myapp://oauth/ticktick` | Use `tomanage` |
| Missing path | `tomanage://` | Add `oauth/ticktick` |
| Wrong format | `tomanage:/oauth/ticktick` | Use `://` (two slashes) |
| HTTP format | `http://tomanage/oauth/ticktick` | Use custom scheme format |

### Step 3: Test the Redirect URI Format

Create a simple test file to verify:

```typescript
// test-redirect-uri.ts
import { getTickTickRedirectUri } from './src/utils/deepLinking';

const redirectUri = getTickTickRedirectUri();
console.log('Current Redirect URI:', redirectUri);
console.log('Expected Format:     tomanage://oauth/ticktick');
console.log('Match:', redirectUri === 'tomanage://oauth/ticktick');
```

### Step 4: Common Solutions

#### Solution 1: Update TickTick OAuth App Settings

In TickTick Developer Console:
1. Navigate to your app settings
2. Find "Redirect URI" or "Callback URL" field
3. Set it to: `tomanage://oauth/ticktick`
4. Save changes
5. Wait a few minutes for changes to propagate

#### Solution 2: Check for Multiple Redirect URIs

Some OAuth providers allow multiple redirect URIs. Make sure you have:
- `tomanage://oauth/ticktick` registered

You might also want to add these for testing:
- `exp://localhost:8081` (for Expo Go during development)
- `exp://192.168.1.XXX:8081` (for Expo Go on physical device)

#### Solution 3: Verify App Scheme Configuration

Check [app.config.js](app.config.js):

```javascript
{
  expo: {
    scheme: 'tomanage',  // Must match the scheme in redirect URI
    // ...
  }
}
```

Check [app.json](app.json):

```json
{
  "expo": {
    "scheme": "tomanage"
  }
}
```

### Step 5: Testing with Expo Go vs Standalone Build

**Important:** Deep linking works differently in development vs production:

#### During Development (Expo Go):

The redirect URI might need to be:
```
exp://localhost:8081
```

Add this to your TickTick OAuth app settings for development.

#### Production/Standalone Build:

Use the custom scheme:
```
tomanage://oauth/ticktick
```

### Step 6: Debug the Full OAuth Flow

Add comprehensive logging:

```typescript
// In TickTickAuthButton.tsx
async function handleConnect() {
  const redirectUri = getTickTickRedirectUri();
  console.log('=== OAuth Flow Debug ===');
  console.log('1. Client ID:', API_CONFIG.TICKTICK_CLIENT_ID);
  console.log('2. Redirect URI:', redirectUri);

  const { url, state } = await getTickTickAuthUrl(API_CONFIG.TICKTICK_CLIENT_ID);
  console.log('3. Auth URL:', url);
  console.log('4. State:', state);

  // Open browser...
}
```

### Step 7: Alternative Redirect URI Formats

If you're still having issues, try these formats in TickTick OAuth settings:

1. **Standard format** (recommended):
   ```
   tomanage://oauth/ticktick
   ```

2. **With host** (if TickTick requires it):
   ```
   tomanage://oauth/ticktick
   ```

3. **Expo development** (for testing):
   ```
   exp://localhost:8081
   ```

### Step 8: Check TickTick API Documentation

TickTick might have specific requirements for redirect URIs. Check their documentation at:
- [TickTick Open API Docs](https://developer.ticktick.com/api)

Look for:
- Allowed redirect URI formats
- Development vs production redirect URIs
- Mobile app specific requirements

### Step 9: Use OAuth Debugging Tools

1. **Decode the Authorization URL:**

```typescript
const { url } = await getTickTickAuthUrl(clientId);
console.log('Full URL:', url);

// It should look like:
// https://ticktick.com/oauth/authorize?
//   client_id=YOUR_CLIENT_ID
//   &redirect_uri=tomanage%3A%2F%2Foauth%2Fticktick
//   &scope=tasks%3Aread+tasks%3Awrite
//   &state=RANDOM_STATE
//   &response_type=code
```

2. **Verify URL Encoding:**

The redirect URI in the URL should be URL-encoded:
- `tomanage://oauth/ticktick` becomes `tomanage%3A%2F%2Foauth%2Fticktick`

### Quick Fix Checklist

- [ ] Redirect URI in code is `tomanage://oauth/ticktick`
- [ ] Redirect URI in TickTick OAuth app is `tomanage://oauth/ticktick`
- [ ] Both match exactly (no extra spaces, slashes, or different cases)
- [ ] App scheme in app.config.js is `tomanage`
- [ ] Client ID and secret are correct in .env
- [ ] Changes in TickTick developer console have been saved
- [ ] Waited a few minutes after saving changes

### Still Not Working?

If you're still seeing the error:

1. **Create a new OAuth app in TickTick** with the correct redirect URI from the start
2. **Contact TickTick support** - there might be restrictions on custom schemes
3. **Check if TickTick supports mobile OAuth** - some providers require different flows for mobile apps

### Working Example

Here's what a successful OAuth flow looks like:

```
1. User taps "Connect TickTick"
2. App generates URL: https://ticktick.com/oauth/authorize?client_id=XXX&redirect_uri=tomanage%3A%2F%2Foauth%2Fticktick&...
3. Browser opens TickTick authorization page
4. User authorizes
5. TickTick redirects to: tomanage://oauth/ticktick?code=AUTH_CODE&state=STATE
6. App receives deep link
7. App validates state
8. App exchanges code for token
9. Success!
```

### Need More Help?

If you're still stuck, provide these details:

1. The exact redirect URI from your code (from console.log)
2. The exact redirect URI in TickTick OAuth settings
3. The full error message
4. Whether you're using Expo Go or a standalone build
5. Screenshots of TickTick OAuth app settings
