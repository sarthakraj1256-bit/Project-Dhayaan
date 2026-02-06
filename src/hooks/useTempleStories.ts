import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

// Public story interface (no user_id exposed)
export interface TempleStory {
  id: string;
  temple_id: string;
  story: string;
  rating: number | null;
  photos: string[] | null;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
}

// Private story for user's own stories (includes user_id for delete operations)
interface OwnStory {
  id: string;
  user_id: string;
  temple_id: string;
  story: string;
  rating: number | null;
  photos: string[] | null;
  created_at: string;
}

export const useTempleStories = (templeId?: string) => {
  const [stories, setStories] = useState<TempleStory[]>([]);
  const [ownStoryIds, setOwnStoryIds] = useState<Set<string>>(new Set());
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
      // Use the RPC function that safely exposes stories without user_id
      const { data, error } = await supabase
        .rpc('get_temple_stories_public', { 
          temple_filter: templeId || null,
          limit_count: 50 
        });

      if (error) throw error;

      setStories((data || []) as TempleStory[]);

      // Fetch user's own stories to know which ones they can delete
      if (userId) {
        const { data: ownStories } = await supabase
          .from('temple_stories')
          .select('id')
          .eq('user_id', userId);
        
        setOwnStoryIds(new Set(ownStories?.map(s => s.id) || []));
      }
    } catch (error) {
      logError('Error fetching stories', error);
    } finally {
      setLoading(false);
    }
  }, [templeId, userId]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const uploadPhotos = useCallback(async (files: File[]): Promise<string[]> => {
    if (!userId) return [];
    
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('temple-story-photos')
        .upload(fileName, file);
      
      if (error) {
        logError('Upload error', error);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('temple-story-photos')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  }, [userId]);

  const addStory = useCallback(async (
    templeId: string,
    story: string,
    rating?: number,
    visitDate?: string,
    photos?: string[]
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
          visit_date: visitDate || null,
          photos: photos || []
        });

      if (error) throw error;
      
      toast.success('Your experience has been shared! 🙏');
      await fetchStories();
      return true;
    } catch (error) {
      logError('Error adding story', error);
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
      logError('Error deleting story', error);
      toast.error('Failed to delete story');
      return false;
    }
  }, []);

  // Helper to check if user can delete a story
  const canDeleteStory = useCallback((storyId: string) => {
    return ownStoryIds.has(storyId);
  }, [ownStoryIds]);

  return {
    stories,
    loading,
    addStory,
    deleteStory,
    uploadPhotos,
    refreshStories: fetchStories,
    isAuthenticated: !!userId,
    canDeleteStory
  };
};
