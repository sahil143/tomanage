# Expo Router Fix - Module Resolution Error

## Problem

Error when running `yarn web`:
```
ERROR in ./node_modules/expo-router/_ctx.web.js:1:19
Module not found: Can't resolve '../../../../../../../app'
```

## Root Cause

The error occurred because:
1. `app/index.tsx` was importing a custom `AppNavigator` component
2. This conflicted with expo-router's file-based routing system
3. expo-router expects the `app` directory to follow a specific structure

## Solution

Restructured the `app` directory to use **expo-router's file-based routing**:

### New File Structure

```
app/
├── _layout.tsx                # Root layout with providers
├── index.tsx                  # Redirects to /(tabs)
├── (tabs)/                    # Tab navigation group
│   ├── _layout.tsx           # Tab bar configuration
│   ├── index.tsx             # Home/Tasks screen
│   ├── chat.tsx              # Chat screen
│   └── settings.tsx          # Settings screen
└── oauth/
    └── ticktick.tsx          # OAuth callback handler
```

### Key Changes

#### 1. Root Index (`app/index.tsx`)
**Before**:
```typescript
import { AppNavigator } from '../src/navigation/AppNavigator';
export default AppNavigator;
```

**After**:
```typescript
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
```

#### 2. Created Tab Layout (`app/(tabs)/_layout.tsx`)
```typescript
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{...}}>
      <Tabs.Screen name="index" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="chat" options={{ title: 'AI Chat' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

#### 3. Tab Screens
Each tab screen just re-exports the existing screen component:

**`app/(tabs)/index.tsx`**:
```typescript
import { HomeScreen } from '../../src/screens/HomeScreen';
export default HomeScreen;
```

**`app/(tabs)/chat.tsx`**:
```typescript
import { ChatScreen } from '../../src/screens/ChatScreen';
export default ChatScreen;
```

**`app/(tabs)/settings.tsx`**:
```typescript
import { SettingsScreen } from '../../src/screens/SettingsScreen';
export default SettingsScreen;
```

#### 4. OAuth Callback (`app/oauth/ticktick.tsx`)
Dedicated route for TickTick OAuth callback:
- Handles: `tomanage://oauth/ticktick?code=xxx&state=yyy`
- Validates OAuth state
- Exchanges code for token
- Redirects back to settings

## How It Works

### expo-router File-Based Routing

| File Path | URL Route | Description |
|-----------|-----------|-------------|
| `app/index.tsx` | `/` | Root redirect |
| `app/(tabs)/index.tsx` | `/(tabs)` or `/` | Home/Tasks |
| `app/(tabs)/chat.tsx` | `/(tabs)/chat` | AI Chat |
| `app/(tabs)/settings.tsx` | `/(tabs)/settings` | Settings |
| `app/oauth/ticktick.tsx` | `/oauth/ticktick` | OAuth callback |

### Route Groups

The `(tabs)` folder is a **route group**:
- Parentheses make it a layout-only group
- Doesn't appear in the URL path
- All children share the tab bar layout

### Deep Linking

**Native**:
```
tomanage://oauth/ticktick?code=xxx&state=yyy
```

**Web**:
```
https://your-domain.com/oauth/ticktick?code=xxx&state=yyy
```

Both resolve to the same `app/oauth/ticktick.tsx` component!

## Benefits of This Approach

✅ **Web Support**: Proper URL routing on web
✅ **Type Safety**: expo-router generates TypeScript types
✅ **Deep Linking**: Automatic handling for both platforms
✅ **Shareable URLs**: Users can share links on web
✅ **Browser Navigation**: Back/forward buttons work
✅ **SEO**: Better for web deployment

## Migration from Custom Navigator

### Old Approach (React Navigation standalone)
```typescript
// src/navigation/AppNavigator.tsx
<NavigationContainer>
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
  </Tab.Navigator>
</NavigationContainer>
```

### New Approach (expo-router)
```
app/
├── (tabs)/
│   ├── _layout.tsx    # Tab configuration
│   ├── index.tsx      # Home screen
│   └── chat.tsx       # Chat screen
```

**Advantages**:
- File structure matches URLs
- Less boilerplate code
- Automatic type generation
- Better web support

## Navigation in Code

### Before (React Navigation)
```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('Chat');
```

### After (expo-router)
```typescript
import { router } from 'expo-router';

router.push('/(tabs)/chat');
// or
router.replace('/oauth/ticktick');
```

## Testing

### Development
```bash
# Mobile
yarn start

# Web
yarn web

# Test deep links
# iOS Simulator
xcrun simctl openurl booted "tomanage://oauth/ticktick?code=test"

# Web
http://localhost:8081/oauth/ticktick?code=test
```

### Production
```bash
# Build web
npx expo export:web

# Serve locally
npx serve web-build

# Test at http://localhost:3000
```

## Troubleshooting

### Error: "Can't resolve app"
**Cause**: Conflicting navigation setup
**Fix**: Ensure `app/index.tsx` doesn't import custom navigator

### Error: "Redirect loop"
**Cause**: Circular redirects
**Fix**: Check `Redirect` components don't create loops

### Web URLs not working
**Cause**: Missing route file
**Fix**: Create corresponding file in `app/` directory

## File Cleanup

You can now **optionally remove** these files if not needed:
- `src/navigation/AppNavigator.tsx` (navigation now in `app/`)

**Keep** these for reusability:
- `src/screens/HomeScreen.tsx`
- `src/screens/ChatScreen.tsx`
- `src/screens/SettingsScreen.tsx`

They're still used, just exported from `app/(tabs)/` files.

## Resources

- [expo-router Documentation](https://docs.expo.dev/router/introduction/)
- [File-based routing](https://docs.expo.dev/router/create-pages/)
- [Layouts](https://docs.expo.dev/router/layouts/)
- [Navigation](https://docs.expo.dev/router/navigating-pages/)
