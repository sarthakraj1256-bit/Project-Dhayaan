import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Loader2, 
  ChevronDown,
  User,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDarshanChat, ChatMessage } from '@/hooks/useDarshanChat';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface DarshanChatPanelProps {
  templeId: string;
  templeName: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const DarshanChatPanel = memo(({
  templeId,
  templeName,
  isOpen,
  onToggle,
  className,
}: DarshanChatPanelProps) => {
  const [inputValue, setInputValue] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    error,
    isSending,
    sendMessage,
    deleteMessage,
  } = useDarshanChat({
    templeId,
    enabled: isOpen,
  });

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const success = await sendMessage(inputValue);
    if (success) {
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Toggle Button (when closed) */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-24 right-4 z-40 md:absolute md:bottom-20 md:right-4"
        >
          <Button
            onClick={onToggle}
            size="lg"
            className="rounded-full shadow-lg gap-2 bg-primary hover:bg-primary/90"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Chat</span>
            {messages.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                {messages.length}
              </span>
            )}
          </Button>
        </motion.div>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 h-full w-full sm:w-96 bg-background/95 backdrop-blur-xl border-l border-border z-50 flex flex-col',
              'md:absolute md:h-full md:rounded-r-2xl',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Devotee Chat</h3>
                  <p className="text-xs text-muted-foreground">{templeName}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Be the first to share your thoughts 🙏
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={message.user_id === currentUserId}
                      onDelete={deleteMessage}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Error Display */}
            {error && (
              <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
              {currentUserId ? (
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share your thoughts..."
                    maxLength={500}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-2">
                  Sign in to join the conversation
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {inputValue.length}/500 characters
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

DarshanChatPanel.displayName = 'DarshanChatPanel';

// Message Bubble Component
interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  onDelete: (id: string) => Promise<boolean>;
}

const MessageBubble = memo(({ message, isOwnMessage, onDelete }: MessageBubbleProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(message.id);
    setIsDeleting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-2',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={message.avatar_url} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {message.display_name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn('max-w-[75%]', isOwnMessage ? 'items-end' : 'items-start')}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground/80">
            {message.display_name || 'Devotee'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {isOwnMessage && (
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5 opacity-50 hover:opacity-100"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm break-words',
            isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-secondary text-secondary-foreground rounded-tl-sm'
          )}
        >
          {message.message}
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default DarshanChatPanel;
