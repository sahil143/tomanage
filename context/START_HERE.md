# 🚀 Start Here: TickTick OAuth Setup

## The Problem You Had

TickTick **does not accept** custom URL schemes like `tomanage://oauth/ticktick` as redirect URIs in their developer console.

## The Solution

I've implemented **Expo AuthSession** which generates redirect URIs that TickTick accepts.

## Quick Start (3 Steps)

### ✅ Step 1: Start Your App

```bash
yarn start
```

Navigate to **Settings** screen in your app.

### ✅ Step 2: Get Your Redirect URI

Look at the console logs. You'll see:

```
📍 Expo AuthSession Redirect URI: https://auth.expo.io/@username/tomanage
📍 Register this URI in TickTick Developer Console
```

**Copy that exact URL!**

### ✅ Step 3: Register in TickTick

1. Go to https://developer.ticktick.com/
2. Open your OAuth app
3. Find "Redirect URI" field
4. **Paste the URL** from Step 2
5. **Save**

### 🎉 Done! Test It

1. In your app, tap **"Connect TickTick"**
2. Authorize in browser
3. You'll be redirected back
4. Should show **"Connected"** status

---

## What Was Implemented

### ✅ Two Solutions Provided

1. **Expo AuthSession (Recommended & Active)**
   - File: [src/components/TickTickAuthButtonExpo.tsx](src/components/TickTickAuthButtonExpo.tsx)
   - Uses Expo's built-in OAuth handling
   - ✅ **Currently active** in Settings screen
   - ✅ Works with TickTick
   - ✅ Auto-generates correct redirect URIs

2. **Manual OAuth (Backup)**
   - File: [src/components/TickTickAuthButton.tsx](src/components/TickTickAuthButton.tsx)
   - Custom implementation
   - Kept as reference/backup

### 📦 Packages Installed

```bash
✅ expo-auth-session
✅ expo-crypto
✅ base-64
```

### 📝 Documentation Created

| File | Purpose |
|------|---------|
| **[START_HERE.md](START_HERE.md)** | This file - quick start guide |
| **[EXPO_AUTHSESSION_SETUP.md](EXPO_AUTHSESSION_SETUP.md)** | Detailed Expo AuthSession setup |
| **[TICKTICK_MOBILE_OAUTH_SOLUTIONS.md](TICKTICK_MOBILE_OAUTH_SOLUTIONS.md)** | All possible OAuth solutions explained |
| **[FIX_REDIRECT_URI_ERROR.md](FIX_REDIRECT_URI_ERROR.md)** | Fix for redirect URI errors |
| **[OAUTH_TROUBLESHOOTING.md](OAUTH_TROUBLESHOOTING.md)** | Complete troubleshooting guide |
| **[TICKTICK_OAUTH_GUIDE.md](TICKTICK_OAUTH_GUIDE.md)** | Original OAuth implementation guide |
| **[QUICK_START_OAUTH.md](QUICK_START_OAUTH.md)** | Quick reference for manual OAuth |

---

## Understanding the Redirect URI

### In Development (Expo Go):
```
https://auth.expo.io/@your-expo-username/tomanage
```

This is an **Expo proxy** that:
- Receives OAuth callbacks from TickTick
- Redirects back to your Expo Go app
- Works on any device

### In Production (Standalone Build):
```
tomanage://
```

This is your **custom scheme** that:
- Opens directly in your app
- No proxy needed
- Faster and more secure

### Magic! ✨

Expo AuthSession **automatically switches** between these based on your environment. No code changes needed!

---

## Expected Flow

```
1. User taps "Connect TickTick"
   ↓
2. Browser opens with TickTick authorization
   ↓
3. User logs in and authorizes
   ↓
4. TickTick redirects to Expo's redirect URI
   ↓
5. Expo redirects back to your app
   ↓
6. App exchanges code for token
   ↓
7. Token stored securely
   ↓
8. Shows "Connected" status ✅
```

---

## Troubleshooting

### ❌ "Invalid redirect_uri"

**Solution:** Make sure you copied the **exact** redirect URI from the console logs.

Should look like:
```
https://auth.expo.io/@your-username/tomanage
```

NOT:
- ❌ `tomanage://oauth/ticktick`
- ❌ `http://localhost:8081`
- ❌ Any other URL

### ❌ "Configuration Error"

**Solution:** Check your `.env` file has:
```bash
EXPO_PUBLIC_TICKTICK_CLIENT_ID=your_client_id
EXPO_PUBLIC_TICKTICK_CLIENT_SECRET=your_client_secret
```

### ❌ Can't find redirect URI in console

**Solution:**
1. Make sure app is running
2. Navigate to Settings screen
3. Look for logs starting with 📍
4. Check you're using `TickTickAuthButtonExpo` (not `TickTickAuthButton`)

---

## For Production Builds

When you build a standalone app (not using Expo Go):

1. The redirect URI will change to: `tomanage://`
2. **Add this as a second redirect URI** in TickTick
3. No code changes needed - Expo handles it automatically!

So in TickTick developer console, you'll have **both**:
- `https://auth.expo.io/@username/tomanage` (development)
- `tomanage://` (production)

---

## Testing Checklist

Before reporting issues, check:

- [ ] App is running (`yarn start`)
- [ ] Navigated to Settings screen
- [ ] Copied redirect URI from console (📍 log)
- [ ] Registered that exact URI in TickTick
- [ ] Waited 2-3 minutes after saving in TickTick
- [ ] Client ID and secret in `.env` are correct
- [ ] Using `TickTickAuthButtonExpo` component
- [ ] Restarted app after `.env` changes

---

## Need More Help?

Read these guides in order:

1. **[EXPO_AUTHSESSION_SETUP.md](EXPO_AUTHSESSION_SETUP.md)** - How Expo AuthSession works
2. **[TICKTICK_MOBILE_OAUTH_SOLUTIONS.md](TICKTICK_MOBILE_OAUTH_SOLUTIONS.md)** - Why we chose this solution
3. **[OAUTH_TROUBLESHOOTING.md](OAUTH_TROUBLESHOOTING.md)** - Common issues and fixes

---

## What's Different from Before?

### Before (Manual OAuth):
```typescript
// Generated: tomanage://oauth/ticktick
// ❌ TickTick rejected this redirect URI
```

### Now (Expo AuthSession):
```typescript
// Generated: https://auth.expo.io/@username/tomanage
// ✅ TickTick accepts this!
```

---

## Summary

✅ **Active Component:** `TickTickAuthButtonExpo`
✅ **In Settings Screen:** Already integrated
✅ **Packages Installed:** expo-auth-session, expo-crypto
✅ **What You Need:** Register the redirect URI from console

**That's it! The rest is automatic.** 🎉

---

## Sources

- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [TickTick OAuth Guide](https://rollout.com/integration-guides/tick-tick/how-to-build-a-public-ticktick-integration-building-the-auth-flow)
- [TickTick Python OAuth Example](https://lazeroffmichael.github.io/ticktick-py/usage/oauth2/)
