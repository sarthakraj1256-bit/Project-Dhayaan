import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  temple_id: string;
  user_id: string;
  message: string;
  created_at: string;
  // Joined profile data
  display_name?: string;
  avatar_url?: string;
}

interface UseDarshanChatOptions {
  templeId: string;
  enabled?: boolean;
  limit?: number;
}

export const useDarshanChat = ({
  templeId,
  enabled = true,
  limit = 50,
}: UseDarshanChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const profileCacheRef = useRef<Map<string, { display_name: string; avatar_url: string | null }>>(new Map());

  // Fetch user profile for a message
  const fetchProfile = useCallback(async (userId: string) => {
    if (profileCacheRef.current.has(userId)) {
      return profileCacheRef.current.get(userId);
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', userId)
        .single();

      if (data) {
        profileCacheRef.current.set(userId, {
          display_name: data.display_name || 'Devotee',
          avatar_url: data.avatar_url,
        });
        return profileCacheRef.current.get(userId);
      }
    } catch {
      // Profile not found, use default
    }

    return { display_name: 'Devotee', avatar_url: null };
  }, []);

  // Enrich message with profile data
  const enrichMessage = useCallback(async (msg: ChatMessage): Promise<ChatMessage> => {
    const profile = await fetchProfile(msg.user_id);
    return {
      ...msg,
      display_name: profile?.display_name || 'Devotee',
      avatar_url: profile?.avatar_url || undefined,
    };
  }, [fetchProfile]);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!enabled || !templeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('darshan_chat_messages')
        .select('id, temple_id, user_id, message, created_at')
        .eq('temple_id', templeId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (fetchError) throw fetchError;

      // Enrich all messages with profile data
      const enrichedMessages = await Promise.all(
        (data || []).map(enrichMessage)
      );

      setMessages(enrichedMessages);
    } catch (err) {
      console.error('[useDarshanChat] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, templeId, limit, enrichMessage]);

  // Send a message
  const sendMessage = useCallback(async (messageText: string) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isSending) return false;

    // Validate message length
    if (trimmedMessage.length > 500) {
      setError('Message too long (max 500 characters)');
      return false;
    }

    setIsSending(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to chat');
        return false;
      }

      const { error: insertError } = await supabase
        .from('darshan_chat_messages')
        .insert({
          temple_id: templeId,
          user_id: user.id,
          message: trimmedMessage,
        });

      if (insertError) throw insertError;
      return true;
    } catch (err) {
      console.error('[useDarshanChat] Send error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [templeId, isSending]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('darshan_chat_messages')
        .delete()
        .eq('id', messageId);

      if (deleteError) throw deleteError;

      setMessages(prev => prev.filter(m => m.id !== messageId));
      return true;
    } catch (err) {
      console.error('[useDarshanChat] Delete error:', err);
      return false;
    }
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    if (!enabled || !templeId) return;

    // Initial fetch
    fetchMessages();

    // Subscribe to realtime updates
    channelRef.current = supabase
      .channel(`darshan-chat-${templeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'darshan_chat_messages',
          filter: `temple_id=eq.${templeId}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          const enrichedMessage = await enrichMessage(newMessage);
          setMessages(prev => [...prev, enrichedMessage].slice(-limit));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'darshan_chat_messages',
          filter: `temple_id=eq.${templeId}`,
        },
        (payload) => {
          const deletedId = payload.old.id;
          setMessages(prev => prev.filter(m => m.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, templeId, limit, fetchMessages, enrichMessage]);

  return {
    messages,
    isLoading,
    error,
    isSending,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
};

export default useDarshanChat;
