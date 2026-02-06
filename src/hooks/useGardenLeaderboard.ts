import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';

// Public leaderboard entry (no user_id exposed)
export interface LeaderboardEntry {
  id: string;
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
  updateUserStats: (stats: Partial<Omit<LeaderboardEntry, 'id'>>) => Promise<void>;
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

      // Use the anonymized view that doesn't expose user_id
      // Cast to 'any' since the view isn't in the generated types
      const { data, error: fetchError } = await supabase
        .from('garden_leaderboard')
        .select('*')
        .limit(50) as { data: LeaderboardEntry[] | null; error: any };

      if (fetchError) throw fetchError;

      const entries = data || [];
      setLeaderboard(entries);

      // Find user's rank if they're logged in (query their own stats via RLS)
      if (userId) {
        const { data: userStats } = await supabase
          .from('garden_stats')
          .select('total_karma_earned')
          .eq('user_id', userId)
          .maybeSingle();

        if (userStats) {
          // Find rank by counting entries with higher karma
          const userKarma = userStats.total_karma_earned;
          const rank = entries.filter(e => e.total_karma_earned > userKarma).length + 1;
          setUserRank(rank);
        }
      }
    } catch (err) {
      logError('Error fetching leaderboard', err);
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
      logError('Error updating garden stats', err);
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
