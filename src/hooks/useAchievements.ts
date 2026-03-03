 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/backend/client';
 import { toast } from 'sonner';
 import { logError } from '@/lib/logger';
 
 export interface Achievement {
   id: string;
   name: string;
   description: string;
   icon: string;
   rarity: 'common' | 'rare' | 'epic' | 'legendary';
 }
 
 export interface UnlockedAchievement {
   id: string;
   achievement_id: string;
   unlocked_at: string;
 }
 
 export interface AchievementWithStatus extends Achievement {
   unlocked: boolean;
   unlockedAt: string | null;
   progress?: number; // 0-100
   progressText?: string;
 }
 
 // Achievement definitions
 export const ACHIEVEMENTS: Achievement[] = [
   {
     id: 'first_session',
     name: 'First Steps',
     description: 'Complete your first meditation session',
     icon: '🌱',
     rarity: 'common',
   },
   {
     id: 'streak_3',
     name: 'Building Momentum',
     description: 'Meditate for 3 days in a row',
     icon: '🔥',
     rarity: 'common',
   },
   {
     id: 'streak_7',
     name: 'Week Warrior',
     description: 'Meditate for 7 days in a row',
     icon: '⚡',
     rarity: 'rare',
   },
   {
     id: 'streak_30',
     name: 'Monthly Master',
     description: 'Meditate for 30 days in a row',
     icon: '👑',
     rarity: 'legendary',
   },
   {
     id: 'hours_1',
     name: 'Hour of Power',
     description: 'Accumulate 1 hour of meditation',
     icon: '⏱️',
     rarity: 'common',
   },
   {
     id: 'hours_10',
     name: 'Dedicated Seeker',
     description: 'Accumulate 10 hours of meditation',
     icon: '🧘',
     rarity: 'rare',
   },
   {
     id: 'hours_100',
     name: 'Enlightened One',
     description: 'Accumulate 100 hours of meditation',
     icon: '✨',
     rarity: 'legendary',
   },
   {
     id: 'frequencies_5',
     name: 'Frequency Explorer',
     description: 'Try 5 different frequencies',
     icon: '🎵',
     rarity: 'common',
   },
   {
     id: 'early_bird',
     name: 'Early Bird',
     description: 'Complete a session before 7 AM',
     icon: '🌅',
     rarity: 'rare',
   },
   {
     id: 'night_owl',
     name: 'Night Owl',
     description: 'Complete a session after 10 PM',
     icon: '🦉',
     rarity: 'rare',
   },
   {
     id: 'goal_crusher',
     name: 'Goal Crusher',
     description: 'Complete a weekly meditation goal',
     icon: '🎯',
     rarity: 'epic',
   },
   {
     id: 'long_session',
     name: 'Deep Dive',
     description: 'Complete a 30+ minute session',
     icon: '🌊',
     rarity: 'epic',
   },
 ];
 
 export const useAchievements = () => {
   const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
   const [achievementsWithStatus, setAchievementsWithStatus] = useState<AchievementWithStatus[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
 
   // Check auth state
   useEffect(() => {
     const checkAuth = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       setIsAuthenticated(!!session);
     };
     checkAuth();
 
     const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
       setIsAuthenticated(!!session);
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   // Fetch achievements when authenticated
   useEffect(() => {
     if (isAuthenticated) {
       fetchAchievements();
     } else {
       setUnlockedAchievements([]);
       setAchievementsWithStatus([]);
     }
   }, [isAuthenticated]);
 
   const fetchAchievements = useCallback(async () => {
     setIsLoading(true);
     try {
       const { data, error } = await supabase
         .from('user_achievements')
         .select('id, achievement_id, unlocked_at');
 
       if (error) throw error;
 
       const unlocked = data || [];
       setUnlockedAchievements(unlocked);
 
       // Calculate progress for each achievement
       const withProgress = await calculateProgress(unlocked);
       setAchievementsWithStatus(withProgress);
     } catch (error) {
       logError('Error fetching achievements', error);
     } finally {
       setIsLoading(false);
     }
   }, []);
 
   const calculateProgress = async (unlocked: UnlockedAchievement[]): Promise<AchievementWithStatus[]> => {
     const unlockedIds = new Set(unlocked.map(u => u.achievement_id));
     
     // Fetch session data for progress calculation
     let sessions: { duration_seconds: number; started_at: string; frequency_value: number }[] = [];
     try {
       const { data } = await supabase
         .from('meditation_sessions')
         .select('duration_seconds, started_at, frequency_value')
         .order('started_at', { ascending: false });
       sessions = data || [];
     } catch {
       // Silently fail
     }
 
     const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_seconds / 60, 0);
     const uniqueFrequencies = new Set(sessions.map(s => s.frequency_value)).size;
     const currentStreak = calculateStreak(sessions.map(s => s.started_at));
 
     return ACHIEVEMENTS.map(achievement => {
       const unlockedEntry = unlocked.find(u => u.achievement_id === achievement.id);
       const isUnlocked = unlockedIds.has(achievement.id);
       
       let progress = 0;
       let progressText = '';
 
       // Calculate progress for each achievement type
       switch (achievement.id) {
         case 'first_session':
           progress = sessions.length > 0 ? 100 : 0;
           progressText = sessions.length > 0 ? 'Completed!' : '0/1 sessions';
           break;
         case 'streak_3':
           progress = Math.min((currentStreak / 3) * 100, 100);
           progressText = `${currentStreak}/3 days`;
           break;
         case 'streak_7':
           progress = Math.min((currentStreak / 7) * 100, 100);
           progressText = `${currentStreak}/7 days`;
           break;
         case 'streak_30':
           progress = Math.min((currentStreak / 30) * 100, 100);
           progressText = `${currentStreak}/30 days`;
           break;
         case 'hours_1':
           progress = Math.min((totalMinutes / 60) * 100, 100);
           progressText = `${Math.round(totalMinutes)}/60 min`;
           break;
         case 'hours_10':
           progress = Math.min((totalMinutes / 600) * 100, 100);
           progressText = `${Math.round(totalMinutes / 60 * 10) / 10}/10 hrs`;
           break;
         case 'hours_100':
           progress = Math.min((totalMinutes / 6000) * 100, 100);
           progressText = `${Math.round(totalMinutes / 60)}/100 hrs`;
           break;
         case 'frequencies_5':
           progress = Math.min((uniqueFrequencies / 5) * 100, 100);
           progressText = `${uniqueFrequencies}/5 frequencies`;
           break;
         default:
           progress = isUnlocked ? 100 : 0;
       }
 
       return {
         ...achievement,
         unlocked: isUnlocked,
         unlockedAt: unlockedEntry?.unlocked_at || null,
         progress: isUnlocked ? 100 : progress,
         progressText: isUnlocked ? 'Unlocked!' : progressText,
       };
     });
   };
 
   const calculateStreak = (dates: string[]): number => {
     if (dates.length === 0) return 0;
     
     const uniqueDays = new Set(
       dates.map(d => new Date(d).toDateString())
     );
     const sortedDays = Array.from(uniqueDays)
       .map(d => new Date(d))
       .sort((a, b) => b.getTime() - a.getTime());
 
     if (sortedDays.length === 0) return 0;
 
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     const yesterday = new Date(today);
     yesterday.setDate(yesterday.getDate() - 1);
 
     const lastSession = sortedDays[0];
     lastSession.setHours(0, 0, 0, 0);
 
     // Streak broken if last session wasn't today or yesterday
     if (lastSession.getTime() !== today.getTime() && lastSession.getTime() !== yesterday.getTime()) {
       return 0;
     }
 
     let streak = 1;
     for (let i = 1; i < sortedDays.length; i++) {
       const current = sortedDays[i];
       const previous = sortedDays[i - 1];
       const diffDays = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
       
       if (diffDays === 1) {
         streak++;
       } else {
         break;
       }
     }
 
     return streak;
   };
 
   const unlockAchievement = useCallback(async (achievementId: string) => {
     if (!isAuthenticated) return false;
     if (unlockedAchievements.some(u => u.achievement_id === achievementId)) return false;
 
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return false;
 
       const { error } = await supabase
         .from('user_achievements')
         .insert({
           user_id: user.id,
           achievement_id: achievementId,
         });
 
       if (error) {
         if (error.code === '23505') return false; // Already exists
         throw error;
       }
 
       const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
       if (achievement) {
         setNewlyUnlocked(achievement);
         toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
           description: achievement.description,
           duration: 5000,
         });
       }
 
       await fetchAchievements();
       return true;
     } catch (error) {
       logError('Error unlocking achievement', error);
       return false;
     }
   }, [isAuthenticated, unlockedAchievements, fetchAchievements]);
 
   const checkAndUnlockAchievements = useCallback(async () => {
     if (!isAuthenticated) return;
 
     try {
       // Fetch session data
       const { data: sessions } = await supabase
         .from('meditation_sessions')
         .select('duration_seconds, started_at, frequency_value')
         .order('started_at', { ascending: false });
 
       if (!sessions || sessions.length === 0) return;
 
       const totalSeconds = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
       const totalMinutes = totalSeconds / 60;
       const uniqueFrequencies = new Set(sessions.map(s => s.frequency_value)).size;
       const currentStreak = calculateStreak(sessions.map(s => s.started_at));
       const latestSession = sessions[0];
       const latestHour = new Date(latestSession.started_at).getHours();
       const longestSession = Math.max(...sessions.map(s => s.duration_seconds));
 
       // Check each achievement
       if (sessions.length >= 1) await unlockAchievement('first_session');
       if (currentStreak >= 3) await unlockAchievement('streak_3');
       if (currentStreak >= 7) await unlockAchievement('streak_7');
       if (currentStreak >= 30) await unlockAchievement('streak_30');
       if (totalMinutes >= 60) await unlockAchievement('hours_1');
       if (totalMinutes >= 600) await unlockAchievement('hours_10');
       if (totalMinutes >= 6000) await unlockAchievement('hours_100');
       if (uniqueFrequencies >= 5) await unlockAchievement('frequencies_5');
       if (latestHour < 7) await unlockAchievement('early_bird');
       if (latestHour >= 22) await unlockAchievement('night_owl');
       if (longestSession >= 1800) await unlockAchievement('long_session');
 
       // Check goal completion
       const { data: goals } = await supabase
         .from('meditation_goals')
         .select('*')
         .eq('goal_type', 'weekly')
         .maybeSingle();
 
       if (goals) {
         const weekStart = getWeekStart();
         const weekSessions = sessions.filter(s => new Date(s.started_at) >= weekStart);
         const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration_seconds / 60, 0);
         if (weekMinutes >= goals.target_minutes) {
           await unlockAchievement('goal_crusher');
         }
       }
     } catch (error) {
       logError('Error checking achievements', error);
     }
   }, [isAuthenticated, unlockAchievement]);
 
   const clearNewlyUnlocked = useCallback(() => {
     setNewlyUnlocked(null);
   }, []);
 
   return {
     achievements: achievementsWithStatus,
     unlockedCount: unlockedAchievements.length,
     totalCount: ACHIEVEMENTS.length,
     isLoading,
     isAuthenticated,
     newlyUnlocked,
     clearNewlyUnlocked,
     checkAndUnlockAchievements,
     refetch: fetchAchievements,
   };
 };
 
 // Helper to get start of current week (Monday)
 const getWeekStart = () => {
   const now = new Date();
   const day = now.getDay();
   const diff = now.getDate() - day + (day === 0 ? -6 : 1);
   const weekStart = new Date(now.setDate(diff));
   weekStart.setHours(0, 0, 0, 0);
   return weekStart;
 };