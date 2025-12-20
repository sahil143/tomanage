# ToManage Architecture

> Complete architecture and design decisions for AI assistance and future development

## 🎯 Project Overview

ToManage is an AI-powered todo management application with a unified codebase supporting:
- Web app (deployable to hosting services)
- Mac desktop app (native features via Tauri)
- iOS and Android mobile apps (React Native)
- Backend API with AI integration

## 📐 Architecture Pattern

### Turborepo-Style Monorepo

```
tomanage/
├── apps/           # Deployable applications
│   ├── web/        # React + Vite (used by browser and desktop)
│   ├── desktop/    # Tauri wrapper (adds native Mac features)
│   ├── mobile/     # React Native (iOS + Android)
│   └── server/     # tRPC backend with AI
└── packages/       # Shared libraries
    ├── shared-types/   # TypeScript types
    ├── shared-logic/   # Business logic
    └── ticktick-sdk/   # TickTick API client
```

## 🏗️ Key Design Decisions

### 1. Web + Desktop Code Sharing

**Decision:** Desktop app wraps the web app instead of duplicating code.

```
┌─────────────────────────────────┐
│  apps/web/                      │
│  React + Vite                   │
│  ├── UI Components              │
│  ├── Command Palette            │
│  └── Business Logic             │
└─────────────────────────────────┘
          ↓               ↓
  ┌──────────────┐  ┌─────────────┐
  │   Browser    │  │  Desktop    │
  │   (Deploy)   │  │  (Tauri)    │
  └──────────────┘  └─────────────┘
```

**Benefits:**
- Single source of truth for UI
- Changes to web automatically update desktop
- Desktop adds native features (menu bar, shortcuts)
- Web can be deployed independently

**Implementation:**
- **Development:** Desktop runs `pnpm dev:web` and points to `localhost:1420`
- **Production:** Desktop builds web app and bundles into `.app`

### 2. pnpm Workspaces (Not Turborepo)

**Decision:** Use pnpm workspaces without Turborepo for now.

**Reasoning:**
- ✅ Simpler setup (no extra tooling)
- ✅ Fast enough for current scale
- ✅ Easy to add Turborepo later if needed
- ✅ Follows industry-standard folder structure

**Configuration:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 3. Shared Packages Architecture

All shared code lives in `packages/` and uses workspace protocol:

```json
{
  "dependencies": {
    "@tomanage/shared-types": "workspace:*",
    "@tomanage/shared-logic": "workspace:*"
  }
}
```

**Benefits:**
- Type safety across all apps
- Shared business logic (no duplication)
- Consistent data structures
- Easy to extract to npm packages later

## 📁 Detailed Structure

### `apps/web/` - React Web App

```
apps/web/
├── src/
│   ├── components/
│   │   ├── CommandPalette.tsx    # ⌘K command interface
│   │   ├── TodoList.tsx          # Todo display
│   │   └── ChatBubble.tsx        # AI chat
│   ├── styles/
│   │   └── globals.css           # Tailwind base
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── index.html
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind setup
└── package.json                  # Dependencies
```

**Tech Stack:**
- React 18 (UI library)
- Vite (build tool, dev server)
- Tailwind CSS (styling)
- cmdk (command palette)
- tRPC client (API communication)

**Key Features:**
- Command palette (⌘K)
- Todo management UI
- AI chat interface
- Responsive design

### `apps/desktop/` - Tauri Wrapper

```
apps/desktop/
├── tauri/
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   └── lib.rs                # Tauri app setup
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri configuration
│   └── build.rs                  # Build script
└── package.json                  # Minimal (just Tauri CLI)
```

**Tech Stack:**
- Tauri 2.x (desktop framework)
- Rust (native backend)
- No React code here (uses web app)

**Configuration:**
```json
{
  "build": {
    "beforeDevCommand": "pnpm --filter @tomanage/web dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "pnpm --filter @tomanage/web build",
    "frontendDist": "../../web/dist"
  }
}
```

**Native Features (Planned):**
- Menu bar integration
- Global keyboard shortcuts (Cmd+Shift+Space)
- System notifications
- Auto-launch on startup
- File system access

### `apps/mobile/` - React Native App

```
apps/mobile/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx             # Home screen
│   │   ├── chat.tsx              # AI chat
│   │   └── settings.tsx          # Settings
│   └── oauth/
│       └── ticktick.tsx          # OAuth flow
├── src/
│   ├── components/               # React Native components
│   ├── services/                 # API clients
│   ├── store/                    # Zustand state
│   └── types/                    # Local types
├── assets/                       # Images, fonts
└── ios-widgets/                  # Native Swift widgets (future)
```

**Tech Stack:**
- React Native 0.81.5
- Expo 54
- Expo Router (file-based routing)
- Zustand (state management)

**Key Differences from Web:**
- Native components (View, Text, ScrollView)
- Touch gestures (swipe, long-press)
- Mobile navigation patterns
- Platform-specific code (iOS/Android)

### `apps/server/` - tRPC Backend

```
apps/server/
├── src/
│   ├── index.ts                  # Server entry
│   ├── router.ts                 # Main tRPC router
│   ├── routers/
│   │   ├── ai.ts                 # AI endpoints
│   │   ├── storage.ts            # Todo CRUD
│   │   └── context.ts            # User context
│   ├── services/
│   │   ├── anthropic.ts          # Claude AI integration
│   │   ├── promptBuilder.ts      # AI prompt construction
│   │   └── storage.ts            # Data persistence
│   ├── schemas.ts                # Zod validation schemas
│   └── trpc.ts                   # tRPC setup
└── package.json
```

**Tech Stack:**
- tRPC 11 (type-safe API)
- Express (HTTP server)
- Anthropic SDK (Claude AI)
- Zod (validation)
- TypeScript

**API Patterns:**
```typescript
// Example tRPC endpoint
export const appRouter = router({
  storage: router({
    getTodos: publicProcedure.query(async () => {
      return await storage.getTodos()
    }),
    createTodo: publicProcedure
      .input(todoSchema)
      .mutation(async ({ input }) => {
        return await storage.createTodo(input)
      }),
  }),
})
```

### `packages/shared-types/`

```
packages/shared-types/
├── src/
│   ├── todo.ts                   # Todo interfaces
│   ├── chat.ts                   # Chat message types
│   └── index.ts                  # Barrel exports
└── package.json
```

**Key Types:**
```typescript
export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low' | 'none'
  dueDate?: Date | string
  tags: string[]
  energyRequired?: 'high' | 'medium' | 'low'
  estimatedDuration?: number
  urgency?: string
}

export type Priority = 'high' | 'medium' | 'low' | 'none'
```

**Used By:** All apps (web, desktop, mobile, server)

### `packages/shared-logic/`

```
packages/shared-logic/
├── src/
│   ├── todoHelpers.ts            # Todo utilities
│   └── index.ts
└── package.json
```

**Key Functions:**
```typescript
export function getPriorityColor(priority: Priority): string
export function getUrgency(dueDate: Date | string | undefined): string
export function sortTodos(todos: Todo[]): Todo[]
```

**Used By:** Web, desktop, mobile (not server - server has its own logic)

### `packages/ticktick-sdk/`

```
packages/ticktick-sdk/
├── src/
│   ├── TickTickService.ts        # Main service
│   ├── auth/                     # OAuth handling
│   ├── tasks/                    # Task operations
│   ├── projects/                 # Project operations
│   └── utils/                    # HTTP client
└── package.json
```

**Purpose:** Encapsulated TickTick API client that can be used across all apps or published to npm.

## 🔄 Data Flow

### Todo Creation Flow

```
1. User Input
   ├── Web: CommandPalette.tsx
   ├── Desktop: Same (uses web)
   └── Mobile: TodoScreen.tsx
           ↓
2. tRPC Client
   └── @trpc/client
           ↓
3. Network
   └── HTTP POST to server:3001
           ↓
4. tRPC Server
   └── apps/server/src/routers/storage.ts
           ↓
5. AI Processing (Optional)
   └── apps/server/src/services/anthropic.ts
           ↓
6. Storage
   └── apps/server/src/services/storage.ts
           ↓
7. Response
   └── New todo returned to client
           ↓
8. UI Update
   ├── Web: React state update
   └── Mobile: Zustand store update
```

### AI Chat Flow

```
1. User Message
   └── ChatScreen.tsx
           ↓
2. tRPC Call
   └── trpc.ai.chat.useMutation()
           ↓
3. Server Processing
   ├── Context Building (user's todos, time, etc.)
   ├── Prompt Construction
   └── Anthropic API Call
           ↓
4. AI Response
   └── Claude returns message + tool calls
           ↓
5. Tool Execution (if needed)
   └── Create/update todos, set reminders, etc.
           ↓
6. Response to Client
   └── Message + updated data
           ↓
7. UI Update
   └── Show message + refresh todos
```

## 🎨 UI Architecture

### Web/Desktop

**Component Hierarchy:**
```
App.tsx
├── CommandPalette
│   └── cmdk (keyboard-driven interface)
├── TodoList
│   └── TodoItem (×N)
└── ChatInterface
    └── ChatBubble (×N)
```

**Styling Pattern:**
- Tailwind utility classes for most styling
- CSS variables for theming
- Responsive design (mobile-first)

**State Management:**
- React Query (tRPC integration)
- Local component state (useState)
- No global state library (not needed yet)

### Mobile

**Navigation:**
```
ExpoRouter (file-based)
├── (tabs)/index.tsx       # Home
├── (tabs)/chat.tsx        # AI Chat
├── (tabs)/settings.tsx    # Settings
└── oauth/ticktick.tsx     # OAuth callback
```

**State Management:**
- Zustand (global state)
- React Query (server state)
- Local storage (persistence)

## 🔐 Authentication & API Keys

### Current Setup
- No user authentication yet (local storage only)
- API keys stored in `.env` files
- TickTick OAuth for third-party integration

### Future Considerations
- Add user authentication (Clerk, Auth0, or custom)
- Server-side session management
- Secure API key storage

## 🚀 Build & Deployment

### Web App
```bash
pnpm build:web
# Output: apps/web/dist/
# Deploy to: Vercel, Netlify, Cloudflare Pages
```

### Desktop App
```bash
pnpm build:desktop
# Process:
# 1. Builds web app (pnpm build:web)
# 2. Compiles Rust code
# 3. Bundles into .app
# Output: apps/desktop/tauri/target/release/bundle/macos/ToManage.app
```

### Mobile Apps
```bash
cd apps/mobile
expo build:ios      # iOS .ipa
expo build:android  # Android .apk/.aab
```

## 🔧 Development Workflow

### Adding a New Feature

**1. Define Types (if needed)**
```typescript
// packages/shared-types/src/todo.ts
export interface Todo {
  // Add new field
  subtasks?: Subtask[]
}
```

**2. Update Shared Logic (if needed)**
```typescript
// packages/shared-logic/src/todoHelpers.ts
export function hasSubtasks(todo: Todo): boolean {
  return (todo.subtasks?.length ?? 0) > 0
}
```

**3. Update Server API**
```typescript
// apps/server/src/routers/storage.ts
createTodo: publicProcedure
  .input(todoSchema.extend({ subtasks: z.array(subtaskSchema).optional() }))
  .mutation(async ({ input }) => {
    // Implementation
  })
```

**4. Update Web UI**
```typescript
// apps/web/src/components/TodoItem.tsx
import { hasSubtasks } from '@tomanage/shared-logic'
// Implement UI
```

**5. Update Mobile UI**
```typescript
// apps/mobile/src/components/TodoItem.tsx
import { hasSubtasks } from '@tomanage/shared-logic'
// Implement UI (different from web)
```

**6. Rebuild Shared Packages**
```bash
pnpm build:packages
```

## 🎯 Future Enhancements

### Planned Features
- [ ] Screenshot → Todo (AI vision)
- [ ] Menu bar integration (desktop)
- [ ] Global keyboard shortcuts (desktop)
- [ ] iOS widgets (mobile)
- [ ] Smart recommendations (AI)
- [ ] Offline support (all apps)
- [ ] User authentication
- [ ] Cloud sync

### Technical Improvements
- [ ] Add Turborepo (if team grows)
- [ ] Add end-to-end tests (Playwright)
- [ ] Add component tests (Vitest)
- [ ] Add Storybook (component library)
- [ ] Implement CI/CD pipeline
- [ ] Add performance monitoring
- [ ] Implement error tracking (Sentry)

## 📝 Conventions

### Naming
- **Packages:** `@tomanage/package-name`
- **Components:** PascalCase (TodoItem.tsx)
- **Functions:** camelCase (getTodos)
- **Types:** PascalCase (Todo, Priority)
- **Files:** kebab-case for configs, PascalCase for components

### Code Organization
- Keep components small and focused
- Extract logic to hooks or utilities
- Use shared types everywhere
- Validate inputs with Zod
- Handle errors explicitly

### Commits
- Use conventional commits (feat:, fix:, docs:, etc.)
- Keep commits atomic
- Write descriptive commit messages

## 🤖 AI Assistant Context

**This file is the source of truth for:**
- Project architecture
- Design decisions
- Folder structure
- Development patterns
- Future plans

**When making changes:**
- Update this file if architecture changes
- Keep README.md focused on setup/usage
- Document new patterns here
- Explain "why" not just "what"

**Key patterns to follow:**
- Web + desktop share code
- Mobile is separate but uses shared packages
- Server is the single source of truth for data
- Types are defined once in shared-types
- Business logic in shared-logic (when reusable)

---

**Last Updated:** December 2025
