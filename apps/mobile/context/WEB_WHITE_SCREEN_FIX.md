# Fix: White Screen on Web with import.meta Error

## Error

```
Uncaught SyntaxError: Cannot use 'import.meta' outside a module
at entry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.routerRoot=app&transform.reactCompiler=true:121266:65
```

## Root Cause

The error occurs because:
1. expo-router uses `import.meta` for web routing
2. Webpack (default web bundler) doesn't handle this well
3. The bundled code tries to use `import.meta` in a non-module context

## Solution: Use Metro Bundler for Web

Expo now supports Metro bundler for web, which handles `import.meta` correctly.

### Step 1: Configure Metro for Web

**File: `app.config.js`**
```javascript
module.exports = {
  expo: {
    web: {
      bundler: 'metro',  // Use Metro instead of webpack
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
  },
};
```

### Step 2: Remove/Backup Webpack Config

```bash
# Backup webpack config (not needed with Metro)
mv webpack.config.js webpack.config.js.backup
```

### Step 3: Ensure Metro Config Exists

**File: `metro.config.js`**
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

### Step 4: Clear All Caches

```bash
# Clear Expo and build caches
rm -rf .expo web-build node_modules/.cache

# Restart development server
yarn start --clear
```

### Step 5: Start Web Server

```bash
yarn web
```

## Why Metro Instead of Webpack?

| Feature | Metro | Webpack |
|---------|-------|---------|
| expo-router support | ✅ Excellent | ⚠️ Limited |
| import.meta support | ✅ Native | ❌ Requires config |
| Build speed | ✅ Fast | ⚠️ Slower |
| Hot reload | ✅ Fast | ⚠️ Slower |
| Bundle size | ✅ Optimized | ⚠️ Larger |
| Expo recommended | ✅ Yes (new default) | ⚠️ Legacy |

## Verification

After restarting, you should see:

```bash
✓ Metro bundler running on http://localhost:8081
✓ Bundled successfully
✓ Serving web app on http://localhost:8081
```

In the browser:
- ✅ App loads (no white screen)
- ✅ No console errors about import.meta
- ✅ Navigation works
- ✅ Routes are accessible

## Alternative: Fix Webpack (Not Recommended)

If you must use webpack, you would need complex configuration:

**webpack.config.js** (complex, not recommended):
```javascript
config.output = {
  ...config.output,
  module: true,
  environment: {
    module: true,
    dynamicImport: true,
  },
};

config.experiments = {
  ...config.experiments,
  outputModule: true,
};
```

**Issues with this approach**:
- Still may have compatibility issues
- Slower build times
- More complex configuration
- Not officially supported by Expo

## Metro is the Future

Expo SDK 50+ recommends Metro for all platforms:
- **Native**: Always used Metro
- **Web**: Now uses Metro by default
- **Unified**: Same bundler across all platforms

## Troubleshooting

### Still seeing white screen?

1. **Check browser console** for specific errors
2. **Verify bundler** in app.config.js is set to 'metro'
3. **Clear browser cache**: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
4. **Check network tab**: Ensure bundle.js loads successfully

### Metro not starting?

```bash
# Kill all node processes
killall -9 node

# Clear everything
rm -rf .expo node_modules/.cache web-build

# Restart fresh
yarn start --clear
```

### Build errors with Metro?

Check metro.config.js has correct format:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
```

## Performance Tips

### Development

```bash
# Fast refresh enabled by default with Metro
yarn web
```

### Production

```bash
# Build optimized static site
npx expo export:web

# Serve locally to test
npx serve web-build
```

## Related Issues

- Expo Router + Webpack: https://github.com/expo/expo/issues/24534
- Metro for Web: https://docs.expo.dev/guides/customizing-metro/#web-support
- import.meta errors: https://github.com/expo/expo/issues/25123

## Summary

**Before** (Webpack):
- ❌ White screen
- ❌ import.meta errors
- ⚠️ Complex configuration

**After** (Metro):
- ✅ App loads correctly
- ✅ No import.meta errors
- ✅ Simple configuration
- ✅ Better performance

**Key Change**: `web.bundler: 'metro'` in app.config.js

## Quick Fix Commands

```bash
# 1. Remove webpack config
mv webpack.config.js webpack.config.js.backup

# 2. Clear caches
rm -rf .expo web-build node_modules/.cache

# 3. Restart
yarn start --clear

# 4. Open web
# Press 'w' in terminal
```

That's it! The white screen should be resolved. 🎉
