import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  ChatMessage,
  RecommendationMethod,
  createChatMessage,
} from '../types/chat';
import { aiService } from '../services/aiService';
import { recommendationEngine } from '../services/recommendationEngine';
import { useTodoStore } from './todoStore';

interface ChatState {
  // State
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;

  // Actions
  sendMessage: (text: string, imageUri?: string) => Promise<void>;
  getRecommendation: (method: RecommendationMethod) => Promise<void>;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    // Initial state
    messages: [],
    loading: false,
    error: null,

    /**
     * Send a message to AI and extract todos
     */
    sendMessage: async (text: string, imageUri?: string) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        // Add user message to chat
        const userMessage = createChatMessage({
          role: 'user',
          content: text,
          hasImage: !!imageUri,
          imageUri,
        });

        set((state) => {
          state.messages.push(userMessage);
        });

        // Convert image to base64 if provided
        let imageBase64: string | undefined;
        if (imageUri) {
          // In React Native, you'd use expo-file-system or similar
          // For now, we'll pass the URI directly and handle it in the service
          // TODO: Implement proper image to base64 conversion
          imageBase64 = imageUri; // Placeholder
        }

        // Extract todos from text/image using AI
        const extractedTodos = await aiService.extractTodosFromText(
          text,
          imageBase64
        );

        // Create response message
        let responseContent = '';
        const createdTodoIds: string[] = [];

        if (extractedTodos.length === 0) {
          responseContent = "I couldn't find any todos in your message. Could you rephrase or provide more details?";
        } else {
          // Add todos to todo store
          const todoStore = useTodoStore.getState();

          for (const todoData of extractedTodos) {
            await todoStore.addTodo(todoData);
            // Get the ID of the last added todo
            const todos = todoStore.todos;
            if (todos.length > 0) {
              createdTodoIds.push(todos[todos.length - 1].id);
            }
          }

          // Create response
          responseContent = `Great! I've added ${extractedTodos.length} todo${extractedTodos.length > 1 ? 's' : ''} to your list:\n\n`;
          extractedTodos.forEach((todo, index) => {
            responseContent += `${index + 1}. ${todo.title}`;
            if (todo.priority && todo.priority !== 'none') {
              responseContent += ` (${todo.priority} priority)`;
            }
            if (todo.dueDate) {
              responseContent += ` - Due: ${new Date(todo.dueDate).toLocaleDateString()}`;
            }
            responseContent += '\n';
          });

          responseContent += '\nWould you like a recommendation on what to work on next?';
        }

        // Add assistant response to chat
        const assistantMessage = createChatMessage({
          role: 'assistant',
          content: responseContent,
          createdTodoIds,
        });

        set((state) => {
          state.messages.push(assistantMessage);
          state.loading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.loading = false;
          state.error = error.message || 'Failed to process message';
        });

        // Add error message to chat
        const errorMessage = createChatMessage({
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
        });

        set((state) => {
          state.messages.push(errorMessage);
        });

        throw error;
      }
    },

    /**
     * Get a recommendation for what to work on next
     */
    getRecommendation: async (method: RecommendationMethod) => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        // Get todos from todo store
        const todoStore = useTodoStore.getState();
        const todos = todoStore.todos;

        // Create user query message
        const methodNames: Record<RecommendationMethod, string> = {
          smart: 'Smart Recommendation',
          energy: 'Energy-Based Recommendation',
          quick: 'Quick Wins',
          eisenhower: 'Eisenhower Matrix',
          focus: 'Deep Work Session',
        };

        const userMessage = createChatMessage({
          role: 'user',
          content: `Give me a ${methodNames[method]}`,
        });

        set((state) => {
          state.messages.push(userMessage);
        });

        // Get recommendation from engine
        const recommendation = await recommendationEngine.getRecommendation(
          todos,
          method
        );

        // Add assistant recommendation to chat
        const assistantMessage = createChatMessage({
          role: 'assistant',
          content: recommendation,
        });

        set((state) => {
          state.messages.push(assistantMessage);
          state.loading = false;
        });
      } catch (error: any) {
        set((state) => {
          state.loading = false;
          state.error = error.message || 'Failed to get recommendation';
        });

        // Add error message to chat
        const errorMessage = createChatMessage({
          role: 'assistant',
          content: `Sorry, I couldn't generate a recommendation: ${error.message || 'Unknown error'}. Please try again.`,
        });

        set((state) => {
          state.messages.push(errorMessage);
        });

        throw error;
      }
    },

    /**
     * Clear all chat messages
     */
    clearChat: () => {
      set((state) => {
        state.messages = [];
        state.error = null;
      });
    },
  }))
);
