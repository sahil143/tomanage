import { createFileRoute } from '@tanstack/react-router';
import { useChat } from '@/hooks/chat/useChat';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/chat')({
  component: ChatRoute,
});

function ChatRoute() {
  const { messages, onSendMessage, onClearChat, isLoading, error } = useChat();

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Talk to your AI assistant
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            onClick={onClearChat}
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 border rounded-lg overflow-hidden bg-card">
        <ChatContainer messages={messages} />
        <ChatInput onSend={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
