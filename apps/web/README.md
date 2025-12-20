# ToManage Web App

React + Vite web application. Can be deployed to the web or used by the desktop app.

## Features

- ⌨️ Command palette (⌘K)
- 🎨 Tailwind CSS
- 🤖 AI integration
- 📱 Responsive design
- 🚀 Fast Vite dev server

## Development

```bash
# From root
pnpm install

# Run web app
pnpm --filter @tomanage/web dev

# Or shorter
pnpm dev:web
```

Runs on `http://localhost:1420`

## Build

```bash
# Build for production
pnpm --filter @tomanage/web build

# Preview production build
pnpm --filter @tomanage/web preview
```

Output goes to `web/dist/`

## Deployment

The built `dist/` folder can be deployed to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting

## Used By

- **Web** - Direct deployment
- **Desktop** - Tauri wraps this app for native Mac features

