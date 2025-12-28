/**
 * ChatInput Component
 * Input field for chat messages using ai-elements prompt-input
 */

import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { PromptInput, PromptInputTextarea } from '@/components/ai-elements/prompt-input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || disabled) return;

      onSend(input);
      setInput('');
    },
    [input, onSend, disabled]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <PromptInput
            onSubmit={(message) => {
              if (message.text) {
                onSend(message.text);
                setInput('');
              }
            }}
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={disabled}
              className="min-h-[60px] max-h-[200px] resize-none"
              rows={2}
            />
          </PromptInput>
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || disabled}
          className="h-[60px] w-[60px] shrink-0"
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}
