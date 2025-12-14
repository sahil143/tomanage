# ✅ Final Setup - TickTick OAuth

## Your Redirect URI

Based on your app.json configuration:

```
https://auth.expo.io/@tomanageorg/tomanage
```

## Steps to Complete

### 1. Restart Your App

```bash
# Stop the current server (Ctrl+C)
# Then restart
yarn start
```

### 2. Verify Redirect URI

Navigate to Settings screen and check console logs. You should see:

```
=== TickTick OAuth Configuration ===
📍 Redirect URI: https://auth.expo.io/@tomanageorg/tomanage
📍 Format: HTTPS ✅
📍 Register this EXACT URI in TickTick Developer Console
=====================================
```

### 3. Register in TickTick

1. Go to: https://developer.ticktick.com/
2. Open your OAuth application
3. Add this redirect URI:
   ```
   https://auth.expo.io/@tomanageorg/tomanage
   ```
4. Click Save

### 4. Test OAuth Flow

1. In your app, tap "Connect TickTick"
2. Browser opens with TickTick authorization
3. Authorize your app
4. TickTick redirects to Expo proxy
5. Expo proxy redirects back to your app
6. App exchanges code for token
7. Shows "Connected" status ✅

## Expected Console Output

```
=== TickTick OAuth Configuration ===
📍 Redirect URI: https://auth.expo.io/@tomanageorg/tomanage
📍 Format: HTTPS ✅
📍 Register this EXACT URI in TickTick Developer Console
=====================================

[User taps "Connect TickTick"]

OAuth code received, exchanging for token...
Successfully authenticated with TickTick!
TickTick connected successfully
```

## TickTick Developer Console Settings

```
OAuth Application:
├─ Client ID: MxmOBi1dpJ0R49mF9A
├─ Client Secret: dj!&jknyM+9(Du09QN^oIShW+HZC6d82
├─ Redirect URIs:
│  └─ https://auth.expo.io/@tomanageorg/tomanage  ✅ Add this!
└─ Scopes:
   ├─ tasks:read  ✅
   └─ tasks:write ✅
```

## Why This Works

| Component | Value | Why |
|-----------|-------|-----|
| Protocol | `https://` | ✅ TickTick accepts HTTPS |
| Host | `auth.expo.io` | Expo's OAuth proxy server |
| Path | `/@tomanageorg/tomanage` | Your owner + slug from app.json |

## If It Still Shows `exp://`

Check these:

1. **Are you logged into Expo?**
   ```bash
   npx expo whoami
   # Should show: tomanageorg (or your username)
   ```

2. **Is app.json configured?**
   - ✅ owner: "tomanageorg"
   - ✅ slug: "tomanage"

3. **Did you restart the app?**
   - Stop server (Ctrl+C)
   - Start again: `yarn start`

4. **Check the component**
   - Using `TickTickAuthButtonExpo`?
   - Not `TickTickAuthButton`?

## File Structure

```
Current Setup:
├── SettingsScreen.tsx → Uses TickTickAuthButtonExpo ✅
├── TickTickAuthButtonExpo.tsx → Generates HTTPS redirect URI ✅
├── app.json → owner: "tomanageorg", slug: "tomanage" ✅
└── .env → Client ID & Secret ✅
```

## Summary

✅ Your redirect URI: `https://auth.expo.io/@tomanageorg/tomanage`
✅ Protocol: HTTPS (TickTick compatible)
✅ Configuration: Complete
✅ Next step: Register URI in TickTick

## Quick Commands

```bash
# Verify Expo login
npx expo whoami

# Restart app
yarn start

# Check for TypeScript errors
yarn tsc --noEmit
```

## Success Checklist

- [ ] App restarted
- [ ] Console shows HTTPS redirect URI
- [ ] Redirect URI registered in TickTick
- [ ] Tapped "Connect TickTick"
- [ ] Authorized in browser
- [ ] Redirected back to app
- [ ] Shows "Connected" status

**Once all boxes checked, you're done!** 🎉

---

## Troubleshooting

### Problem: Still seeing `exp://192.168.0.111:8081`

**Solution:**
```bash
# 1. Login to Expo
npx expo login

# 2. Restart Metro bundler
# Press 'r' in terminal or Ctrl+C and yarn start
```

### Problem: "Cannot connect to OAuth proxy"

**Solution:** Make sure you have internet connection. The Expo proxy requires internet access.

### Problem: Works but slow redirect

**Solution:** This is normal! The Expo proxy adds a small delay (1-2 seconds) as it routes through their server. In production builds, it will be instant.

---

## Next Steps After OAuth Works

1. ✅ Test syncing tasks
2. ✅ Test creating tasks
3. ✅ Test updating tasks
4. ✅ Build standalone app for production
5. ✅ Add second redirect URI for production: `tomanage://`
