import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_plants: number;
  flourishing_plants: number;
  total_karma_earned: number;
  achievements_unlocked: number;
  garden_level: number;
  total_water_used: number;
  last_active_at: string;
}

interface UseGardenLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  isLoading: boolean;
  error: string | null;
  refreshLeaderboard: () => Promise<void>;
  updateUserStats: (stats: Partial<LeaderboardEntry>) => Promise<void>;
}

export const useGardenLeaderboard = (userId?: string): UseGardenLeaderboardReturn => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch top 50 gardeners sorted by karma and achievements
      const { data, error: fetchError } = await supabase
        .from('garden_stats')
        .select('*')
        .order('total_karma_earned', { ascending: false })
        .order('achievements_unlocked', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const entries = (data || []) as LeaderboardEntry[];
      setLeaderboard(entries);

      // Find user's rank if they're logged in
      if (userId) {
        const userIndex = entries.findIndex(e => e.user_id === userId);
        if (userIndex !== -1) {
          setUserRank(userIndex + 1);
        } else {
          // User might not be in top 50, fetch their specific rank
          const { count } = await supabase
            .from('garden_stats')
            .select('*', { count: 'exact', head: true })
            .or(`total_karma_earned.gt.${entries[entries.length - 1]?.total_karma_earned || 0}`);
          
          if (count !== null) {
            // Check if user exists in stats
            const { data: userData } = await supabase
              .from('garden_stats')
              .select('total_karma_earned')
              .eq('user_id', userId)
              .maybeSingle();
            
            if (userData) {
              const { count: betterCount } = await supabase
                .from('garden_stats')
                .select('*', { count: 'exact', head: true })
                .gt('total_karma_earned', userData.total_karma_earned);
              
              setUserRank((betterCount || 0) + 1);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateUserStats = useCallback(async (stats: Partial<LeaderboardEntry>) => {
    if (!userId) return;

    try {
      // First check if user has existing stats
      const { data: existing } = await supabase
        .from('garden_stats')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing stats
        await supabase
          .from('garden_stats')
          .update({
            ...stats,
            last_active_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } else {
        // Get user profile for display name and avatar
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', userId)
          .maybeSingle();

        // Insert new stats
        await supabase
          .from('garden_stats')
          .insert({
            user_id: userId,
            display_name: profile?.display_name || 'Anonymous Gardener',
            avatar_url: profile?.avatar_url,
            ...stats,
            last_active_at: new Date().toISOString(),
          });
      }

      // Refresh leaderboard after update
      await fetchLeaderboard();
    } catch (err) {
      console.error('Error updating garden stats:', err);
    }
  }, [userId, fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    userRank,
    isLoading,
    error,
    refreshLeaderboard: fetchLeaderboard,
    updateUserStats,
  };
};

export default useGardenLeaderboard;
