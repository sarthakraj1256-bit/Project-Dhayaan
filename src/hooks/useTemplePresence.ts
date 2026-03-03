import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseTemplePresenceOptions {
  templeId: string;
  enabled?: boolean;
}

interface PresenceState {
  onlineCount: number;
  isConnected: boolean;
}

export const useTemplePresence = ({
  templeId,
  enabled = true,
}: UseTemplePresenceOptions): PresenceState => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const setupPresence = useCallback(async () => {
    if (!enabled || !templeId) return;

    // Get current user (optional - anonymous presence also works)
    const { data: { user } } = await supabase.auth.getUser();
    const uniqueId = user?.id || `anon-${Math.random().toString(36).substring(7)}`;

    // Create presence channel for this temple
    const channel = supabase.channel(`temple-presence-${templeId}`, {
      config: {
        presence: {
          key: uniqueId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // User joined
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // User left
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track this user's presence
          await channel.track({
            online_at: new Date().toISOString(),
            temple_id: templeId,
          });
        }
      });

    channelRef.current = channel;
  }, [enabled, templeId]);

  useEffect(() => {
    setupPresence();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
        setOnlineCount(0);
      }
    };
  }, [setupPresence]);

  return {
    onlineCount,
    isConnected,
  };
};

export default useTemplePresence;
