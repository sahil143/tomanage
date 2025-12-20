# Fix "redirect URI is not registered" Error

## Quick Fix (Most Common Solution)

### What's Happening
Your app is sending: `tomanage://oauth/ticktick`
But TickTick expects a different URL (or it's not configured)

### Fix Steps

1. **Run your app and check the console logs:**
   ```
   When you tap "Connect TickTick", look for:
   📍 Using Redirect URI: tomanage://oauth/ticktick
   ```

2. **Go to TickTick Developer Console:**
   - Login to https://developer.ticktick.com/
   - Find your OAuth application
   - Look for "Redirect URI" or "Callback URL" field

3. **Add this EXACT redirect URI:**
   ```
   tomanage://oauth/ticktick
   ```

   **Important:**
   - No spaces
   - No trailing slash
   - Exactly as shown

4. **Save and wait 2-3 minutes** for changes to take effect

5. **Try connecting again**

## Alternative: If Using Expo Go for Testing

If you're testing with Expo Go (not a standalone build), you may need a different redirect URI:

1. **Check your terminal** where Expo is running, look for:
   ```
   Metro waiting on exp://192.168.1.XXX:8081
   ```

2. **Add this as an additional redirect URI in TickTick:**
   ```
   exp://192.168.1.XXX:8081
   ```
   (Replace XXX with your actual IP)

3. **Temporarily update the redirect URI in code** for testing:

   Edit [src/utils/deepLinking.ts](src/utils/deepLinking.ts):
   ```typescript
   export function getTickTickRedirectUri(): string {
     // For Expo Go development
     return 'exp://192.168.1.XXX:8081';

     // For production (comment out above and use this)
     // return `${DEEP_LINK_SCHEME}://${DeepLinkPaths.OAUTH_TICKTICK}`;
   }
   ```

## Verify It's Working

After making changes:

1. **Restart your app**
2. **Check console logs** when tapping "Connect TickTick":
   ```
   📍 Using Redirect URI: tomanage://oauth/ticktick
   📍 Client ID: YOUR_CLIENT_ID
   📍 Authorization URL: https://ticktick.com/oauth/authorize?...
   ```

3. **Copy the Authorization URL** and check it contains:
   ```
   redirect_uri=tomanage%3A%2F%2Foauth%2Fticktick
   ```
   (URL-encoded version of `tomanage://oauth/ticktick`)

## Still Not Working?

### Check Your TickTick OAuth App Settings

Make sure you have:
- ✅ Client ID (from .env)
- ✅ Client Secret (from .env)
- ✅ Redirect URI: `tomanage://oauth/ticktick`
- ✅ Scopes enabled: `tasks:read` and `tasks:write`
- ✅ OAuth app is "Active" or "Published"

### Common Mistakes

| Issue | Problem | Solution |
|-------|---------|----------|
| Typo in redirect URI | `tomanage://oauth/tickick` | Fix spelling: `ticktick` |
| Wrong scheme | `myapp://oauth/ticktick` | Use `tomanage` |
| Extra slash | `tomanage://oauth/ticktick/` | Remove trailing `/` |
| Missing in TickTick | Not added to OAuth app | Add it in developer console |
| Not saved | Changed but didn't save | Click Save button |

## Testing Checklist

Before trying again:
- [ ] Console shows: `📍 Using Redirect URI: tomanage://oauth/ticktick`
- [ ] TickTick OAuth app has: `tomanage://oauth/ticktick` in redirect URIs
- [ ] Both match exactly
- [ ] Client ID in .env matches TickTick OAuth app
- [ ] Waited 2-3 minutes after saving in TickTick
- [ ] Restarted the app

## Get Debug Info

Run this to see all the details:

```typescript
import { getTickTickRedirectUri, getTickTickAuthUrl } from './src/utils/deepLinking';
import { API_CONFIG } from './src/utils/constants';

async function debugOAuth() {
  const redirectUri = getTickTickRedirectUri();
  const { url } = await getTickTickAuthUrl(API_CONFIG.TICKTICK_CLIENT_ID);

  console.log('=== OAuth Debug Info ===');
  console.log('Redirect URI:', redirectUri);
  console.log('Client ID:', API_CONFIG.TICKTICK_CLIENT_ID);
  console.log('Auth URL:', url);
  console.log('Expected in TickTick:', 'tomanage://oauth/ticktick');
}
```

## Contact TickTick Support

If nothing works, TickTick might have restrictions. Contact them with:
- Your OAuth app Client ID
- The error message
- The redirect URI you're trying to use: `tomanage://oauth/ticktick`
- That you're building a mobile app with React Native/Expo
