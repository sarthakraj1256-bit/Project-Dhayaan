import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TempleStory {
  id: string;
  user_id: string;
  temple_id: string;
  story: string;
  visit_date: string | null;
  rating: number | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useTempleStories = (templeId?: string) => {
  const [stories, setStories] = useState<TempleStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('temple_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (templeId) {
        query = query.eq('temple_id', templeId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Fetch profiles for each story
      const userIds = [...new Set(data?.map(s => s.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const storiesWithProfiles = (data || []).map(story => ({
        ...story,
        profile: profileMap.get(story.user_id)
      }));

      setStories(storiesWithProfiles);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }, [templeId]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const addStory = useCallback(async (
    templeId: string,
    story: string,
    rating?: number,
    visitDate?: string
  ) => {
    if (!userId) {
      toast.error('Please sign in to share your experience');
      return false;
    }

    try {
      const { error } = await supabase
        .from('temple_stories')
        .insert({
          user_id: userId,
          temple_id: templeId,
          story: story.trim(),
          rating: rating || null,
          visit_date: visitDate || null
        });

      if (error) throw error;
      
      toast.success('Your experience has been shared! 🙏');
      await fetchStories();
      return true;
    } catch (error) {
      console.error('Error adding story:', error);
      toast.error('Failed to share your experience');
      return false;
    }
  }, [userId, fetchStories]);

  const deleteStory = useCallback(async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('temple_stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;
      
      toast.success('Story deleted');
      setStories(prev => prev.filter(s => s.id !== storyId));
      return true;
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
      return false;
    }
  }, []);

  return {
    stories,
    loading,
    addStory,
    deleteStory,
    refreshStories: fetchStories,
    isAuthenticated: !!userId,
    userId
  };
};
