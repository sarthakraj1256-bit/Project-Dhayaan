import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/backend/client';

export type SpiritualLevel = 'novice' | 'seeker' | 'yogi' | 'sage' | 'enlightened';

export interface SpiritualProgress {
  id: string;
  user_id: string;
  karma_points: number;
  current_level: SpiritualLevel;
  total_meditation_minutes: number;
  total_chanting_sessions: number;
  total_mantra_lessons: number;
  total_games_played: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  unlocked_chakras: string[];
  unlocked_environments: string[];
  unlocked_wallpapers: string[];
}

// Level thresholds
export const LEVEL_THRESHOLDS: Record<SpiritualLevel, number> = {
  novice: 0,
  seeker: 500,
  yogi: 2000,
  sage: 5000,
  enlightened: 15000,
};

// Chakra unlock thresholds (karma points)
export const CHAKRA_THRESHOLDS = [
  { id: 'root', name: 'Root (Muladhara)', points: 100, color: '#FF0000' },
  { id: 'sacral', name: 'Sacral (Svadhisthana)', points: 300, color: '#FF7F00' },
  { id: 'solar', name: 'Solar Plexus (Manipura)', points: 700, color: '#FFFF00' },
  { id: 'heart', name: 'Heart (Anahata)', points: 1500, color: '#00FF00' },
  { id: 'throat', name: 'Throat (Vishuddha)', points: 3000, color: '#00BFFF' },
  { id: 'third_eye', name: 'Third Eye (Ajna)', points: 6000, color: '#4B0082' },
  { id: 'crown', name: 'Crown (Sahasrara)', points: 12000, color: '#9400D3' },
];

export function getLevelFromKarma(karma: number): SpiritualLevel {
  if (karma >= LEVEL_THRESHOLDS.enlightened) return 'enlightened';
  if (karma >= LEVEL_THRESHOLDS.sage) return 'sage';
  if (karma >= LEVEL_THRESHOLDS.yogi) return 'yogi';
  if (karma >= LEVEL_THRESHOLDS.seeker) return 'seeker';
  return 'novice';
}

export function getNextLevelThreshold(currentLevel: SpiritualLevel): number {
  const levels: SpiritualLevel[] = ['novice', 'seeker', 'yogi', 'sage', 'enlightened'];
  const currentIndex = levels.indexOf(currentLevel);
  if (currentIndex === levels.length - 1) return LEVEL_THRESHOLDS.enlightened;
  return LEVEL_THRESHOLDS[levels[currentIndex + 1]];
}

export function useSpiritualProgress() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: progress, isLoading } = useQuery({
    queryKey: ['spiritual-progress', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_spiritual_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      // Create initial record if none exists
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('user_spiritual_progress')
          .insert({ user_id: userId })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData as SpiritualProgress;
      }
      
      return data as SpiritualProgress;
    },
    enabled: !!userId,
  });

  const addKarmaMutation = useMutation({
    mutationFn: async ({ points, source }: { points: number; source: string }) => {
      if (!userId || !progress) throw new Error('No user or progress');

      const newKarma = progress.karma_points + points;
      const newLevel = getLevelFromKarma(newKarma);
      
      // Check for newly unlocked chakras
      const newUnlockedChakras = CHAKRA_THRESHOLDS
        .filter(c => newKarma >= c.points && !progress.unlocked_chakras.includes(c.id))
        .map(c => c.id);
      
      const updates: Partial<SpiritualProgress> = {
        karma_points: newKarma,
        current_level: newLevel,
        unlocked_chakras: [...progress.unlocked_chakras, ...newUnlockedChakras],
      };

      // Update activity-specific counters
      if (source === 'meditation') {
        updates.total_meditation_minutes = (progress.total_meditation_minutes || 0) + Math.floor(points / 10);
      } else if (source === 'chanting') {
        updates.total_chanting_sessions = (progress.total_chanting_sessions || 0) + 1;
      } else if (source === 'mantra') {
        updates.total_mantra_lessons = (progress.total_mantra_lessons || 0) + 1;
      } else if (source === 'game') {
        updates.total_games_played = (progress.total_games_played || 0) + 1;
      }

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = progress.last_activity_date;
      
      if (lastActivity !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastActivity === yesterday) {
          updates.current_streak = (progress.current_streak || 0) + 1;
          if ((updates.current_streak || 0) > (progress.longest_streak || 0)) {
            updates.longest_streak = updates.current_streak;
          }
        } else if (lastActivity !== today) {
          updates.current_streak = 1;
        }
        updates.last_activity_date = today;
      }

      const { error } = await supabase
        .from('user_spiritual_progress')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      return {
        pointsAdded: points,
        newTotal: newKarma,
        leveledUp: newLevel !== progress.current_level,
        newLevel,
        newChakras: newUnlockedChakras,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spiritual-progress', userId] });
    },
  });

  const addKarma = useCallback((points: number, source: string) => {
    return addKarmaMutation.mutateAsync({ points, source });
  }, [addKarmaMutation]);

  return {
    progress,
    isLoading,
    userId,
    addKarma,
    isAddingKarma: addKarmaMutation.isPending,
  };
}
