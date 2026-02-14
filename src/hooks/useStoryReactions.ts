import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReactionCount {
  story_id: string;
  reaction_type: string;
  reaction_count: number;
}

export const useStoryReactions = (storyIds: string[]) => {
  const [reactionCounts, setReactionCounts] = useState<Map<string, number>>(new Map());
  const [userReactions, setUserReactions] = useState<Map<string, string>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const fetchReactions = useCallback(async () => {
    if (storyIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Use RPC for aggregate counts (no user_id exposed)
      const { data: counts, error: countsError } = await supabase
        .rpc('get_story_reaction_counts', { story_ids: storyIds });

      if (countsError) throw countsError;

      const countsMap = new Map<string, number>();
      (counts || []).forEach((c: ReactionCount) => {
        const existing = countsMap.get(c.story_id) || 0;
        countsMap.set(c.story_id, existing + Number(c.reaction_count));
      });
      setReactionCounts(countsMap);

      // Fetch only the current user's own reactions (RLS restricts to own)
      if (userId) {
        const { data: ownReactions, error: ownError } = await supabase
          .from('story_reactions')
          .select('story_id, reaction_type')
          .in('story_id', storyIds);

        if (ownError) throw ownError;

        const userReactionsMap = new Map<string, string>();
        (ownReactions || []).forEach(r => {
          userReactionsMap.set(r.story_id, r.reaction_type);
        });
        setUserReactions(userReactionsMap);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  }, [storyIds, userId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const toggleReaction = useCallback(async (storyId: string, reactionType: string = 'like') => {
    if (!userId) {
      toast.error('Please sign in to react to stories');
      return;
    }

    const currentReaction = userReactions.get(storyId);
    
    try {
      if (currentReaction) {
        const { error } = await supabase
          .from('story_reactions')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', userId);

        if (error) throw error;

        setUserReactions(prev => {
          const next = new Map(prev);
          next.delete(storyId);
          return next;
        });
        setReactionCounts(prev => {
          const next = new Map(prev);
          next.set(storyId, Math.max(0, (next.get(storyId) || 1) - 1));
          return next;
        });
      } else {
        const { error } = await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: userId,
            reaction_type: reactionType
          });

        if (error) throw error;

        setUserReactions(prev => {
          const next = new Map(prev);
          next.set(storyId, reactionType);
          return next;
        });
        setReactionCounts(prev => {
          const next = new Map(prev);
          next.set(storyId, (next.get(storyId) || 0) + 1);
          return next;
        });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error('Failed to update reaction');
    }
  }, [userId, userReactions]);

  const getReactionCount = useCallback((storyId: string) => {
    return reactionCounts.get(storyId) || 0;
  }, [reactionCounts]);

  const hasUserReacted = useCallback((storyId: string) => {
    return userReactions.has(storyId);
  }, [userReactions]);

  return {
    reactions: reactionCounts,
    userReactions,
    loading,
    toggleReaction,
    getReactionCount,
    hasUserReacted,
    isAuthenticated: !!userId
  };
};
