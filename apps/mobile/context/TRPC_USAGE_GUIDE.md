# tRPC Usage Guide for Components

## Quick Reference

### Import tRPC Hooks
```typescript
import { trpc } from '../utils/trpc';
```

### Import Vanilla Client (for non-React contexts)
```typescript
import { trpcClient } from '../utils/trpc';
```

## Common Patterns

### 1. Get User Profile with Context
```typescript
function ProfileScreen() {
  const { data, isLoading, error } = trpc.context.getUserProfile.useQuery({});

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <View>
      <Text>Role: {data.preferences.role}</Text>
      <Text>Energy: {data.currentContext.predictedEnergy}</Text>
      <Text>Work Hours: {data.currentContext.isWorkHours ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

### 2. Get Task Recommendation
```typescript
function RecommendationButton() {
  const todos = useTodoStore((state) => state.todos);

  const { mutate, data, isPending } = trpc.ai.getRecommendation.useMutation({
    onSuccess: (result) => {
      console.log('Got recommendation:', result.recommendation);
      // Show in modal or alert
    },
    onError: (error) => {
      console.error('Failed:', error);
    },
  });

  return (
    <Button
      onPress={() => mutate({ todos, method: 'smart' })}
      disabled={isPending}
    >
      {isPending ? 'Getting recommendation...' : 'Get Smart Recommendation'}
    </Button>
  );
}
```

### 3. Extract Todos from Text/Image
```typescript
function QuickAddScreen() {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>();

  const { mutate: extractTodos, isPending } = trpc.ai.extractTodos.useMutation({
    onSuccess: (result) => {
      console.log(`Extracted ${result.count} todos:`, result.todos);
      // Add to todo store
      result.todos.forEach((todo) => addTodo(todo));
    },
  });

  const handleExtract = () => {
    const content = [];
    if (image) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: image },
      });
    }
    content.push({ type: 'text', text });

    extractTodos({ content });
  };

  return (
    <View>
      <TextInput value={text} onChangeText={setText} />
      <Button onPress={handleExtract} disabled={isPending}>
        Extract Todos
      </Button>
    </View>
  );
}
```

### 4. Chat with AI for Task Creation
```typescript
function ChatTaskCreation() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant'; content: string}>>([]);
  const [input, setInput] = useState('');

  const { mutate: sendMessage, isPending } = trpc.ai.chat.useMutation({
    onSuccess: (result) => {
      setMessages([...messages, { role: 'assistant', content: result.message }]);
    },
  });

  const handleSend = () => {
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    sendMessage({ messages: newMessages });
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />
      <TextInput value={input} onChangeText={setInput} />
      <Button onPress={handleSend} disabled={isPending}>Send</Button>
    </View>
  );
}
```

### 5. Save User Preferences
```typescript
function SettingsScreen() {
  const { mutate: savePreferences } = trpc.storage.savePreferences.useMutation({
    onSuccess: () => {
      console.log('Preferences saved!');
    },
  });

  const handleSave = () => {
    savePreferences({
      preferences: {
        role: 'Senior Frontend Engineer',
        focus_areas: ['React', 'TypeScript'],
        current_goals: ['job_search'],
        work_hours: { start: '09:00', end: '17:00' },
        peak_focus_times: ['09:00-12:00'],
        energy_by_hour: { '9': 'high', '10': 'high' },
        preferred_morning_contexts: ['frontend'],
        preferred_afternoon_contexts: ['review'],
        preferred_evening_contexts: ['learning'],
      },
    });
  };

  return <Button onPress={handleSave}>Save Preferences</Button>;
}
```

### 6. Get Analytics Data
```typescript
function AnalyticsDashboard() {
  const { data, isLoading } = trpc.storage.getAnalytics.useQuery({
    limit: 30, // Last 30 entries
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      <Text>Completed Tasks: {data?.count}</Text>
      <FlatList
        data={data?.entries}
        renderItem={({ item }) => (
          <View>
            <Text>{item.taskId} - {item.completedAt}</Text>
            <Text>Energy: {item.energyLevel}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

### 7. Using Vanilla Client (Non-Hook)
```typescript
// In stores, services, or utility functions
async function analyzeWorkload(todos: Todo[]) {
  try {
    const recommendation = await trpcClient.ai.getRecommendation.mutate({
      todos,
      method: 'eisenhower',
    });

    return recommendation.recommendation;
  } catch (error) {
    console.error('Failed to analyze:', error);
    throw error;
  }
}
```

## React Query Features

### Automatic Caching
```typescript
// First call - fetches from server
const { data } = trpc.context.getUserProfile.useQuery({});

// Second call (within 5 minutes) - returns cached data
const { data: cachedData } = trpc.context.getUserProfile.useQuery({});
```

### Invalidate Cache
```typescript
const utils = trpc.useUtils();

// After updating preferences
savePreferences(newPrefs);
utils.context.getUserProfile.invalidate(); // Refetch profile
```

### Optimistic Updates
```typescript
const { mutate } = trpc.storage.savePreferences.useMutation({
  onMutate: async (newPrefs) => {
    // Cancel outgoing queries
    await utils.storage.getPreferences.cancel();

    // Snapshot current value
    const prev = utils.storage.getPreferences.getData();

    // Optimistically update
    utils.storage.getPreferences.setData({}, newPrefs);

    return { prev };
  },
  onError: (err, newPrefs, context) => {
    // Roll back on error
    utils.storage.getPreferences.setData({}, context?.prev);
  },
});
```

### Dependent Queries
```typescript
function DependentData({ userId }: { userId: string }) {
  // First query
  const { data: prefs } = trpc.storage.getPreferences.useQuery({
    userId,
  });

  // Second query depends on first
  const { data: patterns } = trpc.storage.getAllPatterns.useQuery(
    { userId },
    {
      enabled: !!prefs, // Only run if prefs loaded
    }
  );

  return <View>...</View>;
}
```

### Background Refetching
```typescript
const { data } = trpc.context.getCurrentContext.useQuery(
  {},
  {
    refetchInterval: 60000, // Refetch every minute
    refetchIntervalInBackground: true,
  }
);
```

### Retry on Error
```typescript
const { data } = trpc.ai.getRecommendation.useMutation({
  retry: 3, // Retry 3 times on failure
  retryDelay: 1000, // Wait 1 second between retries
});
```

## Error Handling

### Global Error Handler
```typescript
// In TRPCProvider.tsx
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          onError: (error) => {
            console.error('Query error:', error);
            // Show toast or alert
          },
        },
        mutations: {
          onError: (error) => {
            console.error('Mutation error:', error);
            // Show error message
          },
        },
      },
    })
);
```

### Per-Query Error Handling
```typescript
const { error, isError } = trpc.ai.getRecommendation.useMutation({
  onError: (error) => {
    if (error.message.includes('Network')) {
      Alert.alert('Network Error', 'Please check your connection');
    } else {
      Alert.alert('Error', error.message);
    }
  },
});
```

## Loading States

### Show Loading Spinner
```typescript
function MyComponent() {
  const { data, isPending, isFetching } = trpc.context.getUserProfile.useQuery({});

  if (isPending) return <LoadingSpinner />;
  if (isFetching) return <PullToRefreshIndicator />;

  return <View>...</View>;
}
```

### Mutation Loading
```typescript
function SaveButton() {
  const { mutate, isPending } = trpc.storage.savePreferences.useMutation();

  return (
    <Button disabled={isPending} onPress={() => mutate(...)}>
      {isPending ? 'Saving...' : 'Save'}
    </Button>
  );
}
```

## Best Practices

### 1. Use Hooks in Components
✅ Do:
```typescript
function MyScreen() {
  const { data } = trpc.context.getUserProfile.useQuery({});
  // ...
}
```

❌ Don't:
```typescript
function MyScreen() {
  useEffect(() => {
    trpcClient.context.getUserProfile.query({}).then(...)
  }, []);
}
```

### 2. Use Vanilla Client in Services
✅ Do:
```typescript
// In todoStore.ts
async function enrichTodo(todo: Todo) {
  const context = await trpcClient.context.getCurrentContext.query({});
  // ...
}
```

### 3. Invalidate After Mutations
✅ Do:
```typescript
const { mutate } = trpc.storage.savePreferences.useMutation({
  onSuccess: () => {
    utils.storage.getPreferences.invalidate();
    utils.context.getUserProfile.invalidate();
  },
});
```

### 4. Handle Errors Gracefully
✅ Do:
```typescript
const { data, error, isError } = trpc.ai.extractTodos.useMutation();

if (isError) {
  return <ErrorMessage error={error.message} onRetry={refetch} />;
}
```

## TypeScript Tips

### Infer Types from Backend
```typescript
import type { AppRouter } from '../../server/src/router';
import type { inferRouterOutputs } from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>;
type UserProfile = RouterOutput['context']['getUserProfile'];
```

### Type-Safe Inputs
```typescript
import { z } from 'zod';
import { recommendationMethodSchema } from '../../server/src/schemas';

type RecommendationMethod = z.infer<typeof recommendationMethodSchema>;
// 'smart' | 'energy' | 'quick' | 'eisenhower' | 'focus'
```

---

**Happy coding with tRPC! 🚀**
