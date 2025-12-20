# Redirect URI Solution for TickTick OAuth

## The Problem

When using Expo Go, the redirect URI is:
```
exp://192.168.0.111:8081
```

TickTick only accepts **HTTP/HTTPS** URLs, not the `exp://` scheme.

## The Solution

Use **Expo's Auth Proxy** which provides an HTTPS redirect URI that TickTick accepts.

## What Changed

Updated `TickTickAuthButtonExpo` to use Expo's default redirect URI generation:

```typescript
const redirectUri = AuthSession.makeRedirectUri({
  // Omit scheme to use Expo's defaults:
  // - Expo Go: https://auth.expo.io/@username/project-slug
  // - Standalone: tomanage://
});
```

## Setup Steps

### Step 1: Check Your Expo Account

First, make sure you're logged into Expo:

```bash
npx expo whoami
```

If not logged in:
```bash
npx expo login
```

### Step 2: Get the Redirect URI

Run your app and check the console:

```bash
yarn start
```

Navigate to Settings screen. You should see:

```
=== TickTick OAuth Configuration ===
📍 Redirect URI: https://auth.expo.io/@your-username/tomanage
📍 Format: HTTPS ✅
📍 Register this EXACT URI in TickTick Developer Console
=====================================
```

### Step 3: Register in TickTick

1. Go to https://developer.ticktick.com/
2. Open your OAuth app
3. Add this redirect URI:
   ```
   https://auth.expo.io/@your-username/tomanage
   ```
4. Save

## How It Works

```
┌─────────────┐
│  Your App   │
│  (Expo Go)  │
└─────┬───────┘
      │
      │ 1. User authorizes
      │
      ▼
┌─────────────────────────────────────────┐
│  TickTick redirects to:                 │
│  https://auth.expo.io/@user/tomanage    │
└─────┬───────────────────────────────────┘
      │
      │ 2. Expo proxy receives callback
      │
      ▼
┌─────────────────────────────────────────┐
│  Expo proxy redirects to:               │
│  exp://192.168.0.111:8081               │
└─────┬───────────────────────────────────┘
      │
      │ 3. Opens your Expo Go app
      │
      ▼
┌─────────────┐
│  Your App   │
│  (receives  │
│   code)     │
└─────────────┘
```

## Troubleshooting

### Issue: Redirect URI still shows `exp://...`

**Possible causes:**

1. **Not logged into Expo**
   ```bash
   npx expo login
   ```

2. **Project not configured properly**

   Check [app.json](app.json):
   ```json
   {
     "expo": {
       "slug": "tomanage",
       "owner": "tomanageorg"  // Your Expo username or org
     }
   }
   ```

3. **Using wrong Expo CLI version**
   ```bash
   npx expo --version
   ```
   Should be 51.0.0 or higher.

### Issue: Can't find Expo username

Check your Expo account:
```bash
npx expo whoami
```

Or check in [app.json](app.json):
```json
{
  "expo": {
    "owner": "your-username-here"
  }
}
```

### Issue: Auth proxy not working

The redirect URI should look like:
```
https://auth.expo.io/@USERNAME/tomanage
```

NOT:
- ❌ `exp://192.168.0.111:8081`
- ❌ `tomanage://oauth/ticktick`
- ❌ `http://localhost:8081`

If you see `exp://`, the proxy isn't being used. Make sure:
- You're logged into Expo
- `app.json` has correct `slug` and `owner`
- Using the updated `TickTickAuthButtonExpo` component

## For Production Builds

When you create a standalone build (not Expo Go):

1. The redirect URI will automatically change to:
   ```
   tomanage://
   ```

2. Add this as a **second** redirect URI in TickTick:
   ```
   https://auth.expo.io/@your-username/tomanage  (development)
   tomanage://                                     (production)
   ```

3. No code changes needed - Expo handles it automatically!

## Quick Test

To verify the redirect URI is correct:

1. Run app
2. Check console logs
3. Should see:
   ```
   📍 Format: HTTPS ✅
   ```

If you see:
```
📍 Format: Custom Scheme (may not work)
```

Then the `exp://` scheme is being used and you need to fix the Expo configuration.

## Expo Configuration Checklist

Make sure [app.json](app.json) has:

```json
{
  "expo": {
    "name": "toManage",
    "slug": "tomanage",           // ✅ Project slug
    "owner": "tomanageorg",        // ✅ Your Expo username/org
    "scheme": "tomanage"           // ✅ Custom scheme for production
  }
}
```

Or in [app.config.js](app.config.js):

```javascript
export default {
  expo: {
    slug: 'tomanage',
    owner: 'tomanageorg',
    scheme: 'tomanage',
  }
}
```

## Verify Expo Account

```bash
# Check who you're logged in as
npx expo whoami

# Should output:
# Logged in as: your-username
```

The redirect URI will use this username:
```
https://auth.expo.io/@your-username/tomanage
                      ^^^^^^^^^^^^
```

## Summary

✅ **Problem:** `exp://` scheme not accepted by TickTick
✅ **Solution:** Use Expo's auth proxy (`https://auth.expo.io/...`)
✅ **Setup:** Login to Expo, check app.json, run app, copy redirect URI
✅ **Register:** Add HTTPS URL to TickTick developer console
✅ **Test:** Should show "HTTPS ✅" in console logs

## Next Steps

1. ✅ Login to Expo: `npx expo login`
2. ✅ Verify app.json has correct `owner` and `slug`
3. ✅ Run app and check console for HTTPS redirect URI
4. ✅ Register that URI in TickTick
5. ✅ Test OAuth flow

That's it! The HTTPS proxy will work with TickTick. 🎉
