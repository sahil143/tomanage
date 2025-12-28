/**
 * useChat Hook
 * Business logic for chat/AI interactions
 */

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTRPCClient } from '@/utils/trpc';
import type { ChatMessage } from '@/types';
import { createChatMessage } from '@/types';

export function useChat() {
  const trpcClient = useTRPCClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: (input: { messages: Array<{ role: 'user' | 'assistant'; content: string }> }) =>
      trpcClient.ai.chat.mutate(input),
    onSuccess: (response) => {
      // Extract text content from response
      const textContent = extractTextContent(response.message);

      // Add assistant response to messages
      const assistantMessage = createChatMessage({
        role: 'assistant',
        content: textContent,
      });

      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error: Error) => {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage = createChatMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
      });
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  // Send message handler
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;

      // Add user message
      const userMessage = createChatMessage({
        role: 'user',
        content: content.trim(),
      });

      setMessages((prev) => [...prev, userMessage]);

      // Send to AI
      chatMutation.mutate({
        messages: [
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          {
            role: 'user',
            content: content.trim(),
          },
        ],
      });
    },
    [messages, chatMutation]
  );

  // Clear chat
  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    onSendMessage: handleSendMessage,
    onClearChat: handleClearChat,
    isLoading: chatMutation.isPending,
    error: chatMutation.error?.message,
  };
}

// Helper to extract text from AI response
function extractTextContent(content: any): string {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (block.type === 'text') return block.text || '';
        return '';
      })
      .join('\n\n');
  }

  return 'No response';
}
