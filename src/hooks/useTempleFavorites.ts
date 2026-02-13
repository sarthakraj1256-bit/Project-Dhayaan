import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TempleFavorite {
  id: string;
  temple_id: string;
  notifications_enabled: boolean;
  created_at: string;
}

const FAVORITES_QUERY_KEY = ['temple-favorites'];

export const useTempleFavorites = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Check auth state
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

  // Use react-query to deduplicate requests across all component instances
  const { data: favorites = [], isLoading: loading } = useQuery({
    queryKey: [...FAVORITES_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) {
        // Load from localStorage for non-authenticated users
        const stored = localStorage.getItem('temple_favorites');
        if (stored) {
          try {
            return JSON.parse(stored) as TempleFavorite[];
          } catch {
            return [];
          }
        }
        return [];
      }

      const { data, error } = await supabase
        .from('temple_favorites')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return (data || []) as TempleFavorite[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents refetching
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (!userId && favorites.length > 0) {
      localStorage.setItem('temple_favorites', JSON.stringify(favorites));
    }
  }, [favorites, userId]);

  const isFavorite = useCallback((templeId: string) => {
    return favorites.some(f => f.temple_id === templeId);
  }, [favorites]);

  const isNotificationsEnabled = useCallback((templeId: string) => {
    const fav = favorites.find(f => f.temple_id === templeId);
    return fav?.notifications_enabled ?? false;
  }, [favorites]);

  const toggleFavorite = useCallback(async (templeId: string) => {
    const existing = favorites.find(f => f.temple_id === templeId);

    if (existing) {
      // Remove favorite
      if (userId) {
        try {
          const { error } = await supabase
            .from('temple_favorites')
            .delete()
            .eq('id', existing.id);

          if (error) throw error;
          queryClient.setQueryData([...FAVORITES_QUERY_KEY, userId], (old: TempleFavorite[] | undefined) =>
            (old || []).filter(f => f.id !== existing.id)
          );
          toast.success('Removed from favorites');
        } catch (error) {
          console.error('Error removing favorite:', error);
          toast.error('Failed to remove favorite');
        }
      } else {
        queryClient.setQueryData([...FAVORITES_QUERY_KEY, userId], (old: TempleFavorite[] | undefined) =>
          (old || []).filter(f => f.temple_id !== templeId)
        );
        toast.success('Removed from favorites');
      }
    } else {
      // Add favorite
      const newFavorite: TempleFavorite = {
        id: crypto.randomUUID(),
        temple_id: templeId,
        notifications_enabled: true,
        created_at: new Date().toISOString()
      };

      if (userId) {
        try {
          const { data, error } = await supabase
            .from('temple_favorites')
            .insert({
              user_id: userId,
              temple_id: templeId,
              notifications_enabled: true
            })
            .select()
            .single();

          if (error) throw error;
          queryClient.setQueryData([...FAVORITES_QUERY_KEY, userId], (old: TempleFavorite[] | undefined) =>
            [...(old || []), data]
          );
          toast.success('Added to favorites with notifications enabled');
        } catch (error) {
          console.error('Error adding favorite:', error);
          toast.error('Failed to add favorite');
        }
      } else {
        queryClient.setQueryData([...FAVORITES_QUERY_KEY, userId], (old: TempleFavorite[] | undefined) =>
          [...(old || []), newFavorite]
        );
        toast.success('Added to favorites');
      }
    }
  }, [favorites, userId, queryClient]);

  const toggleNotifications = useCallback(async (templeId: string) => {
    const existing = favorites.find(f => f.temple_id === templeId);
    if (!existing) return;

    const newValue = !existing.notifications_enabled;

    if (userId) {
      try {
        const { error } = await supabase
          .from('temple_favorites')
          .update({ notifications_enabled: newValue })
          .eq('id', existing.id);

        if (error) throw error;
        queryClient.setQueryData([...FAVORITES_QUERY_KEY, userId], (old: TempleFavorite[] | undefined) =>
          (old || []).map(f =>
            f.id === existing.id ? { ...f, notifications_enabled: newValue } : f
          )
        );
        toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
      } catch (error) {
        console.error('Error updating notifications:', error);
        toast.error('Failed to update notifications');
      }
    } else {
      queryClient.setQueryData([...FAVORITES_QUERY_KEY, userId], (old: TempleFavorite[] | undefined) =>
        (old || []).map(f =>
          f.temple_id === templeId ? { ...f, notifications_enabled: newValue } : f
        )
      );
      toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
    }
  }, [favorites, userId, queryClient]);

  return {
    favorites,
    loading,
    isFavorite,
    isNotificationsEnabled,
    toggleFavorite,
    toggleNotifications,
    isAuthenticated: !!userId
  };
};
