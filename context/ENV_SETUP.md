# Environment Variables Setup Guide

## Overview

ToManage uses environment variables to securely store API keys and configuration values. This guide explains how to set up and use environment variables in the app.

## Quick Start

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your actual values**:
   ```bash
   # .env
   EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-xxx...
   EXPO_PUBLIC_TICKTICK_CLIENT_ID=your_client_id_here
   EXPO_PUBLIC_TICKTICK_CLIENT_SECRET=your_client_secret_here
   ```

3. **Restart the dev server**:
   ```bash
   yarn start --clear
   ```

## Environment Variables

### Required Variables

#### `EXPO_PUBLIC_ANTHROPIC_API_KEY`
- **Purpose**: API key for Claude AI integration
- **Where to get it**: [Anthropic Console](https://console.anthropic.com/)
- **Format**: `sk-ant-api03-...`
- **Used for**:
  - Extracting todos from text/images
  - Generating AI recommendations
  - Chat functionality

#### `EXPO_PUBLIC_TICKTICK_CLIENT_ID`
- **Purpose**: OAuth client ID for TickTick integration
- **Where to get it**: [TickTick Developer Console](https://developer.ticktick.com/)
- **Format**: String identifier
- **Used for**: OAuth authentication flow

#### `EXPO_PUBLIC_TICKTICK_CLIENT_SECRET`
- **Purpose**: OAuth client secret for TickTick integration
- **Where to get it**: [TickTick Developer Console](https://developer.ticktick.com/)
- **Format**: Secret string
- **Used for**: Exchanging OAuth code for access token

### Optional Variables

#### `EXPO_PUBLIC_TICKTICK_BASE_URL`
- **Purpose**: Custom TickTick API endpoint (for testing)
- **Default**: `https://api.ticktick.com/open/v1`
- **Format**: URL string

#### `EXPO_PUBLIC_ANTHROPIC_BASE_URL`
- **Purpose**: Custom Claude API endpoint (for testing)
- **Default**: `https://api.anthropic.com/v1/messages`
- **Format**: URL string

## How It Works

### 1. Configuration File

The app uses `app.config.js` (not `app.json`) to support dynamic environment variables:

```javascript
// app.config.js
module.exports = {
  expo: {
    extra: {
      anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
      ticktickClientId: process.env.EXPO_PUBLIC_TICKTICK_CLIENT_ID,
      ticktickClientSecret: process.env.EXPO_PUBLIC_TICKTICK_CLIENT_SECRET,
    },
  },
};
```

### 2. Constants File

Values are accessed through `src/utils/constants.ts`:

```typescript
import Constants from 'expo-constants';

export const API_CONFIG = {
  ANTHROPIC_API_KEY: Constants.expoConfig?.extra?.anthropicApiKey || '',
  TICKTICK_CLIENT_ID: Constants.expoConfig?.extra?.ticktickClientId || '',
  TICKTICK_CLIENT_SECRET: Constants.expoConfig?.extra?.ticktickClientSecret || '',
};
```

### 3. Service Usage

Services import and use these constants:

```typescript
import { API_CONFIG } from '../utils/constants';

class AIService {
  constructor() {
    this.apiKey = API_CONFIG.ANTHROPIC_API_KEY;
  }
}
```

## Security Best Practices

### ✅ DO

- **Keep `.env` private**: Never commit `.env` to version control
- **Use `.env.example`**: Commit this with placeholder values
- **Rotate keys regularly**: Change API keys periodically
- **Use different keys per environment**: Separate keys for dev/staging/prod
- **Validate on startup**: Check if required keys are present

### ❌ DON'T

- **Don't commit `.env`**: It's in `.gitignore` for a reason
- **Don't hardcode keys**: Always use environment variables
- **Don't share keys**: Each developer should have their own keys
- **Don't use production keys in dev**: Keep environments separate

## Getting API Keys

### Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-`)
6. Add to `.env` as `EXPO_PUBLIC_ANTHROPIC_API_KEY`

**Pricing**: Pay-as-you-go, ~$3 per million tokens

### TickTick OAuth Credentials

1. Visit [TickTick Developer Console](https://developer.ticktick.com/)
2. Create a developer account
3. Register a new application
4. Set redirect URI to: `tomanage://oauth/ticktick`
5. Copy Client ID and Client Secret
6. Add to `.env`:
   ```
   EXPO_PUBLIC_TICKTICK_CLIENT_ID=<your_client_id>
   EXPO_PUBLIC_TICKTICK_CLIENT_SECRET=<your_client_secret>
   ```

## Troubleshooting

### Issue: "Missing API key" warning

**Cause**: Environment variable not loaded or `.env` file missing

**Solution**:
1. Ensure `.env` file exists in project root
2. Check variable names match exactly (case-sensitive)
3. Restart dev server with `--clear` flag:
   ```bash
   yarn start --clear
   ```

### Issue: Changes to `.env` not reflected

**Cause**: Expo caches the config

**Solution**:
```bash
# Clear cache and restart
yarn start --clear

# Or manually clear
rm -rf node_modules/.cache
```

### Issue: Environment variables undefined in app

**Cause**: Variable name doesn't start with `EXPO_PUBLIC_`

**Solution**: All Expo environment variables must be prefixed with `EXPO_PUBLIC_`:
```bash
# ❌ Wrong
ANTHROPIC_API_KEY=sk-ant...

# ✅ Correct
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant...
```

### Issue: "Invalid API key" error

**Cause**: API key is incorrect or expired

**Solution**:
1. Verify the key in Anthropic Console
2. Check for extra spaces or newlines in `.env`
3. Regenerate the API key if needed
4. Update `.env` with new key
5. Restart dev server

## Development vs Production

### Development

For local development, use `.env`:
```bash
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-dev-key...
EXPO_PUBLIC_TICKTICK_CLIENT_ID=dev_client_id
```

### Production (EAS Build)

For production builds with EAS, use EAS Secrets:

```bash
# Set secrets
eas secret:create --scope project --name EXPO_PUBLIC_ANTHROPIC_API_KEY --value sk-ant-api03-prod-key...
eas secret:create --scope project --name EXPO_PUBLIC_TICKTICK_CLIENT_ID --value prod_client_id
eas secret:create --scope project --name EXPO_PUBLIC_TICKTICK_CLIENT_SECRET --value prod_secret

# List secrets
eas secret:list

# Build with secrets
eas build --platform all
```

## Checking Configuration

You can verify environment variables are loaded correctly:

```typescript
// In any component/service
import { API_CONFIG } from './src/utils/constants';

console.log('Anthropic API Key:', API_CONFIG.ANTHROPIC_API_KEY ? '✓ Set' : '✗ Missing');
console.log('TickTick Client ID:', API_CONFIG.TICKTICK_CLIENT_ID ? '✓ Set' : '✗ Missing');
```

**Note**: Never log the actual key values in production!

## Example `.env` File

```bash
# ToManage Environment Variables

# Anthropic Claude API
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# TickTick OAuth
EXPO_PUBLIC_TICKTICK_CLIENT_ID=your_client_id_12345
EXPO_PUBLIC_TICKTICK_CLIENT_SECRET=your_secret_abcdefgh

# Optional: Custom endpoints for testing
# EXPO_PUBLIC_TICKTICK_BASE_URL=http://localhost:3000/api
# EXPO_PUBLIC_ANTHROPIC_BASE_URL=http://localhost:3001/v1/messages
```

## Additional Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [TickTick API Docs](https://developer.ticktick.com/api)
- [EAS Secrets](https://docs.expo.dev/build-reference/variables/#using-secrets-in-environment-variables)
