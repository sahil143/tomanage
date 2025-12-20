# TickTick Mobile OAuth Solutions

## Problem
TickTick doesn't accept custom URL schemes like `tomanage://oauth/ticktick` as redirect URIs in their developer portal.

## Solutions

### ✅ Solution 1: Use Localhost with Port (Recommended for Development)

TickTick may accept localhost URLs for development/testing:

**Redirect URI to register in TickTick:**
```
http://localhost:8081/oauth/callback
```

**How it works:**
1. Your app starts a local web server on port 8081
2. Opens browser to TickTick authorization
3. TickTick redirects to `http://localhost:8081/oauth/callback?code=...`
4. Your local server captures the code
5. Exchanges it for a token

**Implementation:** This requires setting up a temporary local HTTP server in your React Native app.

---

### ✅ Solution 2: Use a Backend Server (Production Ready)

**Best practice for production apps.**

**Redirect URI to register in TickTick:**
```
https://yourdomain.com/api/oauth/ticktick/callback
```

**Architecture:**
```
Mobile App → Browser → TickTick Authorization
                           ↓
                    Your Backend Server
                           ↓
                    Mobile App (via deep link)
```

**How it works:**
1. Mobile app opens browser to TickTick authorization
2. User authorizes
3. TickTick redirects to your backend: `https://yourdomain.com/api/oauth/ticktick/callback?code=...`
4. Your backend exchanges code for token
5. Your backend redirects to your custom scheme: `tomanage://oauth/success?token=...`
6. Mobile app receives token via deep link

**Benefits:**
- ✅ Client secret stays secure on backend
- ✅ Works with any OAuth provider
- ✅ Production-ready
- ✅ Can add additional security layers

---

### ✅ Solution 3: Universal Links / App Links

Use iOS Universal Links or Android App Links instead of custom URL schemes.

**Redirect URI to register in TickTick:**
```
https://yourdomain.com/oauth/ticktick/callback
```

**Requirements:**
- A domain you own
- Proper AASA file for iOS
- Proper assetlinks.json for Android
- Configured in your app

**How it works:**
- Same as custom scheme but uses HTTPS URLs
- OS automatically opens your app instead of browser
- More secure and reliable than custom schemes

---

### ✅ Solution 4: Use Expo AuthSession (Recommended for Expo Apps)

Expo provides `expo-auth-session` which handles OAuth flows automatically.

**What it provides:**
- Automatic redirect URI generation
- Works in development and production
- Handles the OAuth callback
- No backend needed

**Redirect URI format:**
```
https://auth.expo.io/@your-username/your-app-slug
```

**Implementation:**

```typescript
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://ticktick.com/oauth/authorize',
  tokenEndpoint: 'https://ticktick.com/oauth/token',
};

const [request, response, promptAsync] = AuthSession.useAuthRequest(
  {
    clientId: 'YOUR_CLIENT_ID',
    scopes: ['tasks:read', 'tasks:write'],
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'tomanage',
      // For Expo Go: Uses expo.io proxy
      // For standalone: Uses your custom scheme
    }),
  },
  discovery
);
```

---

## Recommended Approach

Based on your current setup, here are my recommendations:

### For Development/Testing:
**Option A: Try localhost**
```
http://localhost:8081/oauth/callback
```
or
```
http://127.0.0.1:8081/oauth/callback
```

### For Production:
**Option B: Backend Proxy (Most Secure)**

I can help you implement a simple backend proxy that:
1. Receives the OAuth callback from TickTick
2. Exchanges code for token
3. Redirects back to your app

---

## Quick Test: What Redirect URIs Does TickTick Accept?

Try registering these in order to see which works:

1. ✅ `http://localhost:8081/oauth/callback` (localhost)
2. ✅ `http://127.0.0.1:8081/oauth/callback` (localhost IP)
3. ✅ `https://yourdomain.com/oauth/callback` (your domain)
4. ❌ `tomanage://oauth/ticktick` (custom scheme - already tried, doesn't work)

---

## Implementation Guide

### Option 1: Quick Fix with Localhost (Development Only)

I can modify your implementation to:
1. Start a local HTTP server in your app
2. Use `http://localhost:8081/oauth/callback` as redirect URI
3. Capture the OAuth callback locally

**Pros:**
- Quick to implement
- Works for development/testing
- No backend needed

**Cons:**
- Won't work on iOS (localhost restrictions)
- Not suitable for production
- May not work on all devices

### Option 2: Backend Proxy (Production Ready)

I can create:
1. A simple Node.js/Express backend
2. OAuth callback handler
3. Token exchange logic
4. Redirect back to your app

**Pros:**
- Production ready
- Secure (client secret on backend)
- Works on all platforms
- Industry standard approach

**Cons:**
- Requires hosting a backend
- More complex setup

### Option 3: Expo AuthSession (Easiest)

I can refactor to use Expo's built-in OAuth solution:
1. Remove custom OAuth implementation
2. Use `expo-auth-session`
3. Register Expo's redirect URI in TickTick

**Pros:**
- Easiest to implement
- Handles all edge cases
- Works in dev and production
- No backend needed

**Cons:**
- Requires Expo (you're already using it ✅)
- Uses Expo's redirect URI proxy in development

---

## What Would You Like to Do?

1. **Try localhost redirect URI** - Quick test to see if TickTick accepts it
2. **Set up backend proxy** - Production-ready solution
3. **Use Expo AuthSession** - Simplest Expo-native solution
4. **Something else** - Let me know your preference

---

## Sources

- [TickTick OAuth Guide](https://rollout.com/integration-guides/tick-tick/how-to-build-a-public-ticktick-integration-building-the-auth-flow)
- [TickTick Python OAuth](https://lazeroffmichael.github.io/ticktick-py/usage/oauth2/)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
