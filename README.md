# ToManage

AI-powered todo management for Web, Mac, iOS, and Android.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Rust (for desktop app only)

### Installation

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Build shared packages
pnpm build:packages
```

### Development

```bash
# Web app (runs on localhost:1420)
pnpm dev:web

# Desktop app (Mac)
pnpm dev:desktop

# Mobile app (iOS/Android)
pnpm dev:mobile

# Backend server
pnpm dev:server

# Everything in parallel
pnpm dev
```

## 📁 Project Structure

```
tomanage/
├── apps/
│   ├── web/          React + Vite web app
│   ├── desktop/      Tauri wrapper for Mac
│   ├── mobile/       React Native (iOS + Android)
│   └── server/       tRPC backend with AI
└── packages/
    ├── shared-types/     TypeScript types
    ├── shared-logic/     Business logic
    └── ticktick-sdk/     TickTick integration
```

## 🛠️ Setup Details

### Environment Variables

**apps/server/.env:**
```bash
ANTHROPIC_API_KEY=your_key_here
PORT=3001
```

**apps/mobile/.env:**
```bash
TICKTICK_CLIENT_ID=your_client_id
TICKTICK_CLIENT_SECRET=your_secret
TICKTICK_REDIRECT_URI=your_redirect_uri
```

### Platform-Specific Setup

#### Desktop (Mac)
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify installation
rustc --version
```

#### Mobile (iOS)
```bash
# Install CocoaPods
sudo gem install cocoapods

# Install iOS dependencies
cd apps/mobile/ios && pod install && cd ../../..
```

#### Mobile (Android)
- Install Android Studio
- Set up Android SDK

## 📝 Commands

### Development
```bash
pnpm dev:web              # Web app
pnpm dev:desktop          # Desktop (includes web)
pnpm dev:mobile           # Mobile
pnpm dev:server           # Backend
pnpm dev                  # All services
```

### Build
```bash
pnpm build:web            # → apps/web/dist/
pnpm build:desktop        # → .app file
pnpm build:packages       # → packages/*/dist/
pnpm build                # Everything
```

### Mobile
```bash
pnpm mobile:ios           # iOS simulator
pnpm mobile:android       # Android emulator
```

## 🎯 Features

- **Web App** - Deploy to Vercel, Netlify, etc.
- **Mac Desktop** - Native menu bar, keyboard shortcuts
- **Mobile Apps** - iOS and Android
- **AI Assistant** - Chat to manage tasks
- **Screenshot → Todos** - Create tasks from screenshots
- **Smart Recommendations** - AI suggests what to work on next
- **TickTick Integration** - Sync with TickTick
- **iOS Widgets** - Coming soon

## 🏗️ Tech Stack

- **Web:** React 18, Vite, Tailwind CSS, cmdk
- **Desktop:** Tauri (Rust)
- **Mobile:** React Native, Expo
- **Backend:** tRPC, Express, Anthropic Claude
- **Monorepo:** pnpm workspaces

## 📦 Package Management

This project uses **pnpm workspaces** for monorepo management:

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

All apps can import from shared packages:
```typescript
import { Todo } from '@tomanage/shared-types'
import { sortTodos } from '@tomanage/shared-logic'
```

## 🚢 Deployment

### Web App
```bash
pnpm build:web
# Deploy apps/web/dist/ to Vercel, Netlify, etc.
```

### Desktop App
```bash
pnpm build:desktop
# Distribute apps/desktop/tauri/target/release/bundle/macos/ToManage.app
```

### Mobile Apps
```bash
cd apps/mobile
expo build:ios
expo build:android
```

## 🐛 Troubleshooting

### Desktop app won't start
- Verify Rust: `rustc --version`
- Clean build: `cd apps/desktop/tauri && cargo clean`

### Shared packages not found
```bash
pnpm build:packages
```

### Port conflicts
- Web/Desktop: 1420
- Server: 3001
- Mobile: 8081

### Clean install
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
pnpm build:packages
```

## 📚 Documentation

- **ARCHITECTURE.md** - Complete architecture and design decisions

## 📄 License

Private - All rights reserved
