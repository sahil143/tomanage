import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { SecureStore } from '../utils/storage';
import { Todo, createTodo, updateTodo as updateTodoHelper } from '../types/todo';
import { ticktickService } from '../services/ticktickService';
import { contextBuilder } from '../services/contextBuilder';

// Custom storage adapter for cross-platform secure storage
const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

interface TodoState {
  // State
  todos: Todo[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;

  // Actions
  loadTodos: () => Promise<void>;
  addTodo: (todo: Partial<Todo>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  syncWithTickTick: () => Promise<void>;
}

export const useTodoStore = create<TodoState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      todos: [],
      loading: false,
      error: null,
      lastSync: null,

      /**
       * Load todos from local storage (automatically handled by persist middleware)
       * This can also trigger a sync with TickTick if needed
       */
      loadTodos: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Check if we should sync with TickTick
          const { lastSync } = get();
          const shouldSync =
            !lastSync ||
            Date.now() - new Date(lastSync).getTime() > 5 * 60 * 1000; // 5 minutes

          if (shouldSync) {
            await get().syncWithTickTick();
          }

          set((state) => {
            state.loading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.loading = false;
            state.error = error.message || 'Failed to load todos';
          });
        }
      },

      /**
       * Add a new todo
       */
      addTodo: async (todoData: Partial<Todo>) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Create todo with defaults
          const newTodo = createTodo(todoData);

          // Enrich with context
          const enrichedTodos = contextBuilder.enrichTodos([newTodo]);
          const enrichedTodo = enrichedTodos[0];

          // Add to local state
          set((state) => {
            state.todos.push(enrichedTodo);
            state.loading = false;
          });

          // Sync to TickTick in background (don't wait)
          if (enrichedTodo.ticktickId) {
            ticktickService
              .updateTask(enrichedTodo.ticktickId, enrichedTodo)
              .catch((err) => console.error('Failed to sync to TickTick:', err));
          } else {
            ticktickService
              .createTask(enrichedTodo)
              .then((syncedTodo) => {
                // Update with TickTick ID
                set((state) => {
                  const index = state.todos.findIndex(
                    (t: Todo) => t.id === enrichedTodo.id
                  );
                  if (index !== -1) {
                    state.todos[index].ticktickId = syncedTodo.ticktickId;
                    state.todos[index].synced = true;
                  }
                });
              })
              .catch((err) => console.error('Failed to sync to TickTick:', err));
          }
        } catch (error: any) {
          set((state) => {
            state.loading = false;
            state.error = error.message || 'Failed to add todo';
          });
          throw error;
        }
      },

      /**
       * Update an existing todo
       */
      updateTodo: async (id: string, updates: Partial<Todo>) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const { todos } = get();
          const todoIndex = todos.findIndex((t) => t.id === id);

          if (todoIndex === -1) {
            throw new Error('Todo not found');
          }

          const existingTodo = todos[todoIndex];
          const updatedTodo = updateTodoHelper(existingTodo, updates);

          // Update local state
          set((state) => {
            state.todos[todoIndex] = updatedTodo;
            state.loading = false;
          });

          // Sync to TickTick in background
          if (updatedTodo.ticktickId) {
            ticktickService
              .updateTask(updatedTodo.ticktickId, updatedTodo)
              .catch((err) => console.error('Failed to sync to TickTick:', err));
          }
        } catch (error: any) {
          set((state) => {
            state.loading = false;
            state.error = error.message || 'Failed to update todo';
          });
          throw error;
        }
      },

      /**
       * Toggle todo completion status
       */
      toggleComplete: async (id: string) => {
        const { todos } = get();
        const todo = todos.find((t) => t.id === id);

        if (!todo) {
          throw new Error('Todo not found');
        }

        await get().updateTodo(id, { completed: !todo.completed });

        // If completing and has TickTick ID, mark as complete in TickTick
        if (!todo.completed && todo.ticktickId) {
          ticktickService
            .completeTask(todo.ticktickId)
            .catch((err) =>
              console.error('Failed to complete in TickTick:', err)
            );
        }
      },

      /**
       * Delete a todo
       */
      deleteTodo: async (id: string) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const { todos } = get();
          const todo = todos.find((t) => t.id === id);

          // Remove from local state
          set((state) => {
            state.todos = state.todos.filter((t: Todo) => t.id !== id);
            state.loading = false;
          });

          // Delete from TickTick in background
          if (todo?.ticktickId) {
            ticktickService
              .deleteTask(todo.ticktickId)
              .catch((err) =>
                console.error('Failed to delete from TickTick:', err)
              );
          }
        } catch (error: any) {
          set((state) => {
            state.loading = false;
            state.error = error.message || 'Failed to delete todo';
          });
          throw error;
        }
      },

      /**
       * Sync todos with TickTick
       */
      syncWithTickTick: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Fetch todos from TickTick
          const ticktickTodos = await ticktickService.getTasks();

          // Enrich with context
          const enrichedTodos = contextBuilder.enrichTodos(ticktickTodos);

          // Merge with local todos
          set((state) => {
            // Create a map of existing local todos by ticktickId
            const localTodosMap = new Map<string, Todo>(
              state.todos
                .filter((t: Todo) => t.ticktickId)
                .map((t: Todo) => [t.ticktickId!, t])
            );

            // Merge: prefer TickTick data for synced todos
            const mergedTodos = enrichedTodos.map((ticktickTodo: Todo) => {
              const localTodo = localTodosMap.get(ticktickTodo.ticktickId!);
              if (localTodo) {
                // Update local todo with TickTick data
                return { ...ticktickTodo, id: localTodo.id };
              }
              return ticktickTodo;
            });

            // Add local-only todos (not synced to TickTick)
            const localOnlyTodos = state.todos.filter((t: Todo) => !t.ticktickId);

            state.todos = [...mergedTodos, ...localOnlyTodos];
            state.lastSync = new Date();
            state.loading = false;
          });
        } catch (error: any) {
          set((state) => {
            state.loading = false;
            state.error = error.message || 'Failed to sync with TickTick';
          });
          console.error('Sync error:', error);
        }
      },
    })),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => secureStorage),
      // Serialize dates properly
      partialize: (state) => ({
        todos: state.todos,
        lastSync: state.lastSync,
      }),
    }
  )
);
