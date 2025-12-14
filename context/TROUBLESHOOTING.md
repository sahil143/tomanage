# Troubleshooting Guide: expo-router Module Resolution

## Error: "Can't resolve '../../../../../../../app'"

```
ERROR in ./node_modules/expo-router/_ctx.web.js:1:19
Module not found: Can't resolve '../../../../../../../app'
> 1 | export const ctx = require.context(
```

This error occurs when expo-router can't find or access the `app` directory.

## Solutions Applied

### 1. ✅ Set EXPO_ROUTER_APP_ROOT Environment Variable

**File: `package.json`**
```json
{
  "scripts": {
    "web": "EXPO_ROUTER_APP_ROOT=app expo start --web"
  }
}
```

**File: `.env.local`** (fallback)
```bash
EXPO_ROUTER_APP_ROOT=app
```

### 2. ✅ Created Webpack Configuration

**File: `webpack.config.js`**
```javascript
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      projectRoot: __dirname,
    },
    argv
  );

  config.resolve.alias = {
    ...config.resolve.alias,
    app: path.resolve(__dirname, 'app'),
  };

  return config;
};
```

### 3. ✅ Created Metro Configuration

**File: `metro.config.js`**
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

### 4. ✅ Fixed app.config.js

Changed from function-based to direct export:

**File: `app.config.js`**
```javascript
module.exports = {
  expo: {
    name: 'toManage',
    // ... full config
  },
};
```

### 5. ✅ Restructured App Directory

```
app/
├── _layout.tsx           # Root layout
├── index.tsx             # Redirect to tabs
├── (tabs)/               # Tab group
│   ├── _layout.tsx      # Tab navigation
│   ├── index.tsx        # Home screen
│   ├── chat.tsx         # Chat screen
│   └── settings.tsx     # Settings screen
└── oauth/
    └── ticktick.tsx     # OAuth callback
```

## How to Fix

### Step 1: Clear All Caches

```bash
# Clear Expo and build caches
rm -rf .expo node_modules/.cache web-build

# Clear watchman (if using)
watchman watch-del-all

# Clear Metro bundler cache
yarn start --clear
```

### Step 2: Verify File Structure

Ensure you have:
```
your-project/
├── app/                  # Must exist at project root
│   ├── _layout.tsx
│   ├── index.tsx
│   └── (tabs)/
├── app.config.js         # Configuration file
├── webpack.config.js     # Web bundler config
├── metro.config.js       # Metro bundler config
├── package.json
└── .env.local           # Environment variables
```

### Step 3: Verify package.json

```json
{
  "main": "expo-router/entry",
  "scripts": {
    "web": "EXPO_ROUTER_APP_ROOT=app expo start --web"
  }
}
```

### Step 4: Restart Development Server

```bash
# Kill any running processes
killall -9 node

# Start fresh
yarn web
```

## Common Causes

### Cause 1: Missing EXPO_ROUTER_APP_ROOT

**Problem**: expo-router doesn't know where to find the app directory

**Solution**: Set in package.json or .env.local
```bash
EXPO_ROUTER_APP_ROOT=app
```

### Cause 2: Conflicting app.json and app.config.js

**Problem**: Both files exist with different configurations

**Solution**: Use only app.config.js (app.json backed up to app.json.backup)

### Cause 3: Wrong Main Entry Point

**Problem**: package.json main field points to wrong entry

**Solution**: Ensure main is set to expo-router
```json
{
  "main": "expo-router/entry"
}
```

### Cause 4: Cached Build Artifacts

**Problem**: Old webpack/metro cache causing issues

**Solution**: Clear all caches (see Step 1)

### Cause 5: Missing Webpack Config

**Problem**: Web build doesn't have proper path resolution

**Solution**: Create webpack.config.js with alias

## Platform-Specific Notes

### Web (webpack)
- Requires `webpack.config.js`
- Requires `EXPO_ROUTER_APP_ROOT` env var
- Uses `@expo/webpack-config`

### iOS/Android (Metro)
- Uses `metro.config.js`
- Generally works out of the box
- Cache issues are less common

## Verification Steps

### 1. Check Environment Variable

```bash
# In terminal
echo $EXPO_ROUTER_APP_ROOT
# Should output: app
```

### 2. Check File Exists

```bash
# Verify app directory
ls -la app/
# Should show _layout.tsx, index.tsx, etc.
```

### 3. Check Webpack Config

```bash
# Verify webpack config exists
cat webpack.config.js
# Should have app alias
```

### 4. Test Build

```bash
# Try building for web
npx expo export:web

# Check output
ls web-build/
```

## Still Not Working?

### Nuclear Option: Complete Reset

```bash
# 1. Remove all generated files
rm -rf node_modules .expo .yarn web-build ios android

# 2. Remove lock file
rm yarn.lock

# 3. Reinstall
yarn install

# 4. Clear and restart
yarn start --clear

# 5. Try web
yarn web
```

### Alternative: Use Metro Web (Experimental)

If webpack continues to fail, you can try Metro web:

**app.config.js**:
```javascript
module.exports = {
  expo: {
    web: {
      bundler: 'metro',  // Instead of webpack
    },
  },
};
```

Then:
```bash
yarn web
```

## Environment Variables

Ensure these are set:

```bash
# .env.local
EXPO_ROUTER_APP_ROOT=app
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_key
EXPO_PUBLIC_TICKTICK_CLIENT_ID=your_id
EXPO_PUBLIC_TICKTICK_CLIENT_SECRET=your_secret
```

## Debug Mode

Run with debug output:

```bash
# Verbose webpack output
DEBUG=* yarn web

# Or with expo
EXPO_DEBUG=true yarn web
```

## Cross-Platform Testing

```bash
# Test all platforms
yarn start        # Start dev server
# Then press:
# - w for web
# - i for iOS
# - a for Android
```

## Success Indicators

When it works, you should see:

```bash
✓ Webpack compiled successfully
✓ Development server running on http://localhost:8081
✓ Logs for your project will appear below
```

And in the browser:
- App loads without errors
- Navigation works
- Routes are accessible

## Related Issues

- [expo/expo#12345](https://github.com/expo/expo/issues) - Similar webpack issues
- [Expo Router Docs](https://docs.expo.dev/router/installation/)
- [Webpack Config](https://docs.expo.dev/guides/customizing-webpack/)

## Files Created/Modified

| File | Purpose |
|------|---------|
| `webpack.config.js` | Configure webpack for web |
| `metro.config.js` | Configure Metro bundler |
| `.env.local` | Environment variables |
| `app.config.js` | Expo configuration |
| `package.json` | Scripts with EXPO_ROUTER_APP_ROOT |
| `app/(tabs)/_layout.tsx` | Tab navigation |
| `app/oauth/ticktick.tsx` | OAuth callback route |

## Quick Reference

```bash
# Clear everything
rm -rf .expo node_modules/.cache web-build && yarn start --clear

# Run web
yarn web

# Check logs
tail -f .expo/web/output.log
```
