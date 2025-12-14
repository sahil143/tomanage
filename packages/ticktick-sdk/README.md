# @tomanage/ticktick-sdk

TypeScript SDK for TickTick API with OAuth 2.0 support and chainable API design.

## Features

- ✅ **Zero Dependencies** - No external dependencies, built with native fetch
- ✅ **Pure TickTick API Wrapper** - Returns raw TickTick API responses, no opinionated abstractions
- ✅ **OAuth 2.0 Authentication** - Secure authentication flow
- ✅ **Chainable API** - Intuitive and discoverable API design
- ✅ **TypeScript** - Full type safety and IntelliSense support
- ✅ **Platform Agnostic** - Works with React Native, Node.js, and web
- ✅ **Storage Abstraction** - Bring your own storage adapter
- ✅ **Comprehensive Error Handling** - Custom error classes for better debugging

## Installation

```bash
# In a monorepo workspace
yarn add @tomanage/ticktick-sdk
```

## Quick Start

### 1. Create a Storage Adapter

The SDK requires a storage adapter to persist the access token. Here's an example using Expo SecureStore:

```typescript
import * as ExpoSecureStore from 'expo-secure-store';
import { StorageAdapter } from '@tomanage/ticktick-sdk';

export function createTickTickStorageAdapter(): StorageAdapter {
  return {
    async getItem(key: string): Promise<string | null> {
      return await ExpoSecureStore.getItemAsync(key);
    },
    async setItem(key: string, value: string): Promise<void> {
      await ExpoSecureStore.setItemAsync(key, value);
    },
    async deleteItem(key: string): Promise<void> {
      await ExpoSecureStore.deleteItemAsync(key);
    },
  };
}
```

### 2. Initialize the SDK

```typescript
import { TickTickService } from '@tomanage/ticktick-sdk';
import { createTickTickStorageAdapter } from './utils/storage';

const ticktick = new TickTickService({
  clientId: 'your-ticktick-client-id',
  clientSecret: 'your-ticktick-client-secret',
  storage: createTickTickStorageAdapter(),
});
```

## API Reference

### Authentication

```typescript
// Exchange authorization code for access token
await ticktick.auth.exchangeCodeForToken(code, redirectUri);

// Check if user is authenticated
const isAuthenticated = await ticktick.auth.isAuthenticated();

// Get access token
const token = await ticktick.auth.getAccessToken();

// Logout
await ticktick.auth.logout();
```

### Tasks

**Note:** All methods return raw TickTick API types (`TickTickTask`). You'll need to handle conversion to your app's domain model in your application layer.

```typescript
// Get all tasks from all projects (returns TickTickTask[])
const tasks = await ticktick.tasks.getAll();

// Get a specific task (returns TickTickTask)
const task = await ticktick.tasks.get(projectId, taskId);

// Create a new task (accepts CreateTaskRequest, returns TickTickTask)
const newTask = await ticktick.tasks.create({
  title: 'New task',
  content: 'Task description',
  priority: 5, // TickTick uses: 0 (none), 1 (low), 3 (medium), 5 (high)
  tags: ['work'],
  dueDate: '2025-12-31T00:00:00.000Z',
  projectId: 'inbox123', // Optional: defaults to inbox
});

// Update a task (accepts UpdateTaskRequest, returns TickTickTask)
const updatedTask = await ticktick.tasks.update(taskId, {
  status: 2, // 0 = active, 2 = completed
  priority: 1,
});

// Delete a task
await ticktick.tasks.delete(taskId);

// Mark a task as completed (requires both projectId and taskId)
await ticktick.tasks.complete(projectId, taskId);
```

### Projects

```typescript
// Get all projects
const projects = await ticktick.projects.getAll();

// Get a specific project
const project = await ticktick.projects.get(projectId);

// Get project with tasks and columns
const projectData = await ticktick.projects.getWithData(projectId);

// Create a new project
const newProject = await ticktick.projects.create({
  name: 'My New Project',
  color: '#FF5733',
});

// Update a project
const updatedProject = await ticktick.projects.update(projectId, {
  name: 'Updated Project Name',
  closed: false,
});

// Delete a project
await ticktick.projects.delete(projectId);
```

## Type Definitions

### TickTick Task Type

```typescript
interface TickTickTask {
  id: string;
  projectId: string;
  title: string;
  content?: string;
  desc?: string;
  allDay?: boolean;
  isAllDay?: boolean;
  startDate?: string;
  dueDate?: string;
  timeZone?: string;
  reminders?: string[];
  repeat?: string;
  repeatFlag?: string;
  priority?: number; // 0 (none), 1 (low), 3 (medium), 5 (high)
  status?: number; // 0 (active), 2 (completed)
  completedTime?: string;
  createdTime?: string;
  modifiedTime?: string;
  sortOrder?: number;
  tags?: string[];
  items?: TickTickSubtask[]; // Checklist items
}
```

### Create/Update Request Types

```typescript
interface CreateTaskRequest {
  title: string;
  content?: string;
  allDay?: boolean;
  startDate?: string; // ISO 8601 format
  dueDate?: string; // ISO 8601 format
  timeZone?: string;
  reminders?: string[];
  repeat?: string;
  priority?: 0 | 1 | 3 | 5;
  sortOrder?: number;
  items?: CreateSubtaskRequest[];
  projectId?: string;
  tags?: string[];
}

interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: 0 | 2; // 0 = active, 2 = completed
  completedTime?: string;
}
```

### Configuration

```typescript
interface TickTickConfig {
  clientId: string;
  clientSecret: string;
  storage: StorageAdapter;
  baseUrl?: string; // Default: https://api.ticktick.com/open/v1
  oauthUrl?: string; // Default: https://ticktick.com/oauth
  timeout?: number; // Default: 30000 (30 seconds)
}
```

## Advanced Usage

### Storage Adapter Examples

#### Node.js (using fs)

```typescript
import fs from 'fs/promises';
import { StorageAdapter } from '@tomanage/ticktick-sdk';

const fsStorageAdapter: StorageAdapter = {
  async getItem(key: string) {
    try {
      return await fs.readFile(`./storage/${key}`, 'utf-8');
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string) {
    await fs.writeFile(`./storage/${key}`, value);
  },
  async deleteItem(key: string) {
    await fs.unlink(`./storage/${key}`);
  },
};
```

#### Web (using localStorage)

```typescript
import { StorageAdapter } from '@tomanage/ticktick-sdk';

const localStorageAdapter: StorageAdapter = {
  async getItem(key: string) {
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  },
  async deleteItem(key: string) {
    localStorage.removeItem(key);
  },
};
```

## Package Structure

```
@tomanage/ticktick-sdk/
├── src/
│   ├── auth/               # Authentication service
│   ├── tasks/              # Tasks service
│   ├── projects/           # Projects service
│   ├── converters/         # Todo ↔ TickTick converters
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Constants and utilities
│   ├── TickTickService.ts  # Main service orchestrator
│   └── index.ts            # Public exports
└── dist/                   # Compiled output
```

## Error Handling

The SDK provides comprehensive error handling with custom error classes:

```typescript
import {
  TickTickApiError,
  TickTickAuthError,
  TickTickNetworkError,
  TickTickTimeoutError
} from '@tomanage/ticktick-sdk';

try {
  await ticktick.tasks.create({ title: 'New task' });
} catch (error) {
  if (error instanceof TickTickApiError) {
    console.error(`API Error (${error.status}):`, error.message);
    console.error('Error code:', error.errorCode);
  } else if (error instanceof TickTickAuthError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof TickTickTimeoutError) {
    console.error('Request timed out:', error.message);
  } else if (error instanceof TickTickNetworkError) {
    console.error('Network error:', error.message);
  }
}
```

### Error Classes

- **`TickTickError`** - Base error class
- **`TickTickApiError`** - API errors (includes status code, error code, and response data)
- **`TickTickAuthError`** - Authentication/authorization errors
- **`TickTickNetworkError`** - Network connectivity errors
- **`TickTickTimeoutError`** - Request timeout errors

## License

MIT

## Contributing

Contributions are welcome! This SDK is part of the tomanage monorepo.

## Links

- [TickTick API Documentation](https://developer.ticktick.com/)
- [OAuth 2.0 Flow Documentation](https://developer.ticktick.com/api#/openapi?id=oauth2)
