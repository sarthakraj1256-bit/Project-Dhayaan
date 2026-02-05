import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoryReaction {
  id: string;
  story_id: string;
  user_id: string;
  reaction_type: string;
}

export const useStoryReactions = (storyIds: string[]) => {
  const [reactions, setReactions] = useState<Map<string, StoryReaction[]>>(new Map());
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
      const { data, error } = await supabase
        .from('story_reactions')
        .select('*')
        .in('story_id', storyIds);

      if (error) throw error;

      // Group reactions by story_id
      const reactionsMap = new Map<string, StoryReaction[]>();
      const userReactionsMap = new Map<string, string>();

      (data || []).forEach(reaction => {
        const existing = reactionsMap.get(reaction.story_id) || [];
        reactionsMap.set(reaction.story_id, [...existing, reaction]);
        
        if (userId && reaction.user_id === userId) {
          userReactionsMap.set(reaction.story_id, reaction.reaction_type);
        }
      });

      setReactions(reactionsMap);
      setUserReactions(userReactionsMap);
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
        // Remove existing reaction
        const { error } = await supabase
          .from('story_reactions')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', userId);

        if (error) throw error;

        // Update local state
        setUserReactions(prev => {
          const next = new Map(prev);
          next.delete(storyId);
          return next;
        });
        
        setReactions(prev => {
          const next = new Map(prev);
          const storyReactions = (next.get(storyId) || []).filter(r => r.user_id !== userId);
          next.set(storyId, storyReactions);
          return next;
        });
      } else {
        // Add new reaction
        const { data, error } = await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: userId,
            reaction_type: reactionType
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setUserReactions(prev => {
          const next = new Map(prev);
          next.set(storyId, reactionType);
          return next;
        });
        
        setReactions(prev => {
          const next = new Map(prev);
          const storyReactions = next.get(storyId) || [];
          next.set(storyId, [...storyReactions, data]);
          return next;
        });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error('Failed to update reaction');
    }
  }, [userId, userReactions]);

  const getReactionCount = useCallback((storyId: string) => {
    return reactions.get(storyId)?.length || 0;
  }, [reactions]);

  const hasUserReacted = useCallback((storyId: string) => {
    return userReactions.has(storyId);
  }, [userReactions]);

  return {
    reactions,
    userReactions,
    loading,
    toggleReaction,
    getReactionCount,
    hasUserReacted,
    isAuthenticated: !!userId
  };
};
