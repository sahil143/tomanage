# Web Platform Setup Guide

## Overview

ToManage is built with React Native and Expo, supporting iOS, Android, and **Web** platforms. This guide covers web-specific setup and considerations.

## Quick Start (Web)

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start web development server
yarn web
```

The app will be available at [http://localhost:8081](http://localhost:8081)

## Web-Specific Implementations

### 1. Secure Storage

**Problem**: `expo-secure-store` doesn't work on web
**Solution**: Custom storage adapter with localStorage fallback

**Implementation**:
- [src/utils/storage.ts](src/utils/storage.ts) - Platform detection
- [src/utils/storage.web.ts](src/utils/storage.web.ts) - Web implementation using localStorage

```typescript
// Automatically uses the right implementation
import { SecureStore } from '../utils/storage';

// Works on all platforms
await SecureStore.setItemAsync('key', 'value');
const value = await SecureStore.getItemAsync('key');
```

**Security Note**: On web, data is stored in localStorage (not encrypted). For production, consider:
- Using IndexedDB with encryption
- Session-based storage only
- Server-side session management

### 2. Image Picker

**Problem**: `expo-image-picker` has limited web support
**Solution**: Custom HTML file input implementation

**Implementation**:
- [src/utils/imagePicker.ts](src/utils/imagePicker.ts) - Platform detection
- [src/utils/imagePicker.web.ts](src/utils/imagePicker.web.ts) - Web implementation

```typescript
// Automatically uses the right implementation
import * as ImagePicker from '../utils/imagePicker';

// Works on all platforms
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
});
```

**Web Behavior**:
- Opens native file picker dialog
- Supports image files only
- Converts to base64 data URL
- No camera access (file upload only)

### 3. Deep Linking

**Problem**: Deep linking works differently on web
**Solution**: Use URL paths and query parameters

**Web URLs**:
```
# OAuth callback
https://your-domain.com/oauth/ticktick?code=xxx&state=yyy

# Deep link equivalent
tomanage://oauth/ticktick?code=xxx&state=yyy
```

**Implementation**:
The same [src/utils/deepLinking.ts](src/utils/deepLinking.ts) handles both:
- Native: Custom URL scheme (`tomanage://`)
- Web: Regular HTTP URLs with path routing

### 4. Navigation

**Current Setup**: Using `expo-router` with `<Slot />` component
**Web Behavior**:
- URL-based routing
- Browser back/forward buttons work
- Shareable URLs
- Direct navigation to deep routes

**File Structure**:
```
app/
├── _layout.tsx       # Root layout with providers
├── index.tsx         # Home screen (/)
├── oauth/
│   └── ticktick.tsx  # OAuth callback (/oauth/ticktick)
```

## Environment Variables

### Development

Create `.env` file:
```bash
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-...
EXPO_PUBLIC_TICKTICK_CLIENT_ID=your_client_id
EXPO_PUBLIC_TICKTICK_CLIENT_SECRET=your_secret
```

### Production (Static Export)

For static web builds, environment variables must be set **at build time**:

```bash
# Build with environment variables
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant... \
EXPO_PUBLIC_TICKTICK_CLIENT_ID=xxx \
npx expo export:web
```

### Runtime Configuration

Web doesn't support runtime env variables in static builds. Options:

**Option 1: Build-time injection (recommended)**
```bash
# Use different .env files
cp .env.production .env
npx expo export:web
```

**Option 2: Config file**
```javascript
// public/config.js (not tracked in git)
window.APP_CONFIG = {
  ANTHROPIC_API_KEY: 'sk-ant-...',
  TICKTICK_CLIENT_ID: '...',
};
```

**Option 3: User input**
- Let users enter API keys in settings
- Store in localStorage
- Better for privacy, worse for UX

## Web-Specific Features

### Responsive Design

The app adapts to screen size:

```typescript
// Automatic tablet/desktop layout
const { width } = useWindowDimensions();
const isTablet = width >= 768;

if (isTablet) {
  return <TabletSplitView />; // Side-by-side layout
}
return <MobileTabNavigator />; // Tab navigation
```

**Breakpoints**:
- Mobile: < 768px (bottom tabs)
- Tablet/Desktop: ≥ 768px (split view)

### Keyboard Shortcuts

Consider adding keyboard shortcuts for web:

```typescript
useEffect(() => {
  if (Platform.OS !== 'web') return;

  const handleKeyPress = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K: Focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      // Focus search input
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### Copy/Paste

Web has native clipboard API:

```typescript
import { Platform } from 'react-native';

const copyToClipboard = async (text: string) => {
  if (Platform.OS === 'web') {
    await navigator.clipboard.writeText(text);
  } else {
    // Use expo-clipboard
  }
};
```

## Building for Production

### Static Export

```bash
# Build static website
npx expo export:web

# Output in web-build/
# Deploy to any static hosting (Vercel, Netlify, etc.)
```

### Hosting Options

**Vercel** (recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Netlify**:
```toml
# netlify.toml
[build]
  command = "npx expo export:web"
  publish = "web-build"
```

**GitHub Pages**:
```bash
# Build
npx expo export:web

# Deploy to gh-pages branch
npx gh-pages -d web-build
```

### Environment Variables in Hosting

**Vercel**:
```bash
vercel env add EXPO_PUBLIC_ANTHROPIC_API_KEY
vercel env add EXPO_PUBLIC_TICKTICK_CLIENT_ID
```

**Netlify**:
- Go to Site Settings → Environment Variables
- Add `EXPO_PUBLIC_*` variables
- Rebuild site

**GitHub Pages**:
- Use GitHub Secrets
- Set in build workflow

## Web Limitations

### What Doesn't Work on Web

1. **Native Modules**:
   - `expo-secure-store` → Use localStorage
   - `expo-camera` → Use file input
   - Push notifications → Use Web Push API
   - Haptics → No equivalent

2. **Performance**:
   - Slower initial load (JavaScript bundle)
   - No native animations
   - Limited gesture support

3. **Offline Support**:
   - Requires PWA setup
   - Service workers needed
   - Cache management

### What Works Well

✅ React Navigation
✅ Zustand state management
✅ API calls (axios)
✅ Image display
✅ Forms and inputs
✅ Responsive layouts
✅ Deep linking (URL routing)

## Progressive Web App (PWA)

To make the web app installable:

### 1. Add manifest

```json
// public/manifest.json
{
  "name": "ToManage",
  "short_name": "ToManage",
  "description": "AI-Powered Task Manager",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Add service worker

```javascript
// public/service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
      ]);
    })
  );
});
```

### 3. Register service worker

```typescript
// src/utils/pwa.ts
if ('serviceWorker' in navigator && Platform.OS === 'web') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
```

## Debugging Web Issues

### Browser DevTools

```bash
# Start with debugging
EXPO_DEBUG=true yarn web
```

**Check**:
- Console for errors
- Network tab for API calls
- Application tab for localStorage
- Sources tab for breakpoints

### Platform-Specific Code

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  console.log('Web-specific code');
}

// Or use Platform.select
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        maxWidth: 1200,
        margin: 'auto',
      },
      default: {
        flex: 1,
      },
    }),
  },
});
```

### Common Issues

**Issue**: localStorage quota exceeded
**Solution**: Implement data cleanup or use IndexedDB

**Issue**: CORS errors with API
**Solution**: Configure CORS headers on backend or use proxy

**Issue**: Fonts not loading
**Solution**: Ensure fonts are in `assets/fonts/` and properly imported

**Issue**: Images not displaying
**Solution**: Check paths are relative and files exist in `assets/`

## Performance Optimization

### 1. Code Splitting

```typescript
// Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ChatScreen = lazy(() => import('./screens/ChatScreen'));
```

### 2. Bundle Size

```bash
# Analyze bundle
npx expo export:web --dump-sourcemap
npx source-map-explorer web-build/static/js/*.js
```

### 3. Caching

```typescript
// Cache API responses
const cache = new Map();

const fetchWithCache = async (url: string) => {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);
  return data;
};
```

## Testing Web Version

```bash
# Unit tests
yarn test

# E2E tests with Playwright
npx playwright test

# Visual regression
npx percy exec -- yarn test
```

## Resources

- [Expo Web Docs](https://docs.expo.dev/workflow/web/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Web Platform APIs](https://developer.mozilla.org/en-US/docs/Web/API)
