 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/backend/client';
 import { toast } from 'sonner';
 import { logError } from '@/lib/logger';
 
 export type GoalType = 'weekly' | 'monthly';
 
 export interface MeditationGoal {
   id: string;
   user_id: string;
   goal_type: GoalType;
   target_minutes: number;
   created_at: string;
   updated_at: string;
 }
 
 export interface GoalProgress {
   goal: MeditationGoal | null;
   currentMinutes: number;
   percentage: number;
   isComplete: boolean;
   daysRemaining: number;
 }
 
 // Helper to get start of current week (Monday)
 const getWeekStart = () => {
   const now = new Date();
   const day = now.getDay();
   const diff = now.getDate() - day + (day === 0 ? -6 : 1);
   const weekStart = new Date(now.setDate(diff));
   weekStart.setHours(0, 0, 0, 0);
   return weekStart;
 };
 
 // Helper to get start of current month
 const getMonthStart = () => {
   const now = new Date();
   return new Date(now.getFullYear(), now.getMonth(), 1);
 };
 
 // Helper to get days remaining in period
 const getDaysRemaining = (type: GoalType) => {
   const now = new Date();
   if (type === 'weekly') {
     const weekEnd = new Date(getWeekStart());
     weekEnd.setDate(weekEnd.getDate() + 7);
     return Math.ceil((weekEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
   } else {
     const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
     return Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
   }
 };
 
 export const useMeditationGoals = () => {
   const [goals, setGoals] = useState<MeditationGoal[]>([]);
   const [weeklyProgress, setWeeklyProgress] = useState<GoalProgress | null>(null);
   const [monthlyProgress, setMonthlyProgress] = useState<GoalProgress | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
 
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
 
   // Fetch goals and calculate progress when authenticated
   useEffect(() => {
     if (isAuthenticated) {
       fetchGoalsAndProgress();
     } else {
       setGoals([]);
       setWeeklyProgress(null);
       setMonthlyProgress(null);
     }
   }, [isAuthenticated]);
 
   const calculateProgress = useCallback(async (
     goal: MeditationGoal | null,
     type: GoalType
   ): Promise<GoalProgress> => {
     if (!goal) {
       return {
         goal: null,
         currentMinutes: 0,
         percentage: 0,
         isComplete: false,
         daysRemaining: getDaysRemaining(type),
       };
     }
 
     const startDate = type === 'weekly' ? getWeekStart() : getMonthStart();
 
     try {
       const { data, error } = await supabase
         .from('meditation_sessions')
         .select('duration_seconds')
         .gte('started_at', startDate.toISOString());
 
       if (error) throw error;
 
       const totalSeconds = (data || []).reduce((sum, s) => sum + s.duration_seconds, 0);
       const currentMinutes = Math.round(totalSeconds / 60);
       const percentage = Math.min(Math.round((currentMinutes / goal.target_minutes) * 100), 100);
 
       return {
         goal,
         currentMinutes,
         percentage,
         isComplete: currentMinutes >= goal.target_minutes,
         daysRemaining: getDaysRemaining(type),
       };
     } catch (error) {
       logError('Error calculating progress', error);
       return {
         goal,
         currentMinutes: 0,
         percentage: 0,
         isComplete: false,
         daysRemaining: getDaysRemaining(type),
       };
     }
   }, []);
 
   const fetchGoalsAndProgress = useCallback(async () => {
     setIsLoading(true);
     try {
       const { data, error } = await supabase
         .from('meditation_goals')
         .select('*');
 
       if (error) throw error;
 
       const goalsData = data || [];
      setGoals(goalsData as MeditationGoal[]);
 
      const weeklyGoal = (goalsData.find(g => g.goal_type === 'weekly') as MeditationGoal | undefined) || null;
      const monthlyGoal = (goalsData.find(g => g.goal_type === 'monthly') as MeditationGoal | undefined) || null;
 
       const [weekly, monthly] = await Promise.all([
         calculateProgress(weeklyGoal, 'weekly'),
         calculateProgress(monthlyGoal, 'monthly'),
       ]);
 
       setWeeklyProgress(weekly);
       setMonthlyProgress(monthly);
     } catch (error) {
       logError('Error fetching goals', error);
     } finally {
       setIsLoading(false);
     }
   }, [calculateProgress]);
 
   const setGoal = useCallback(async (type: GoalType, targetMinutes: number) => {
     if (!isAuthenticated) {
       toast.error('Please sign in to set goals');
       return false;
     }
 
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return false;
 
       const existingGoal = goals.find(g => g.goal_type === type);
 
       if (existingGoal) {
         const { error } = await supabase
           .from('meditation_goals')
           .update({ target_minutes: targetMinutes })
           .eq('id', existingGoal.id);
 
         if (error) throw error;
       } else {
         const { error } = await supabase
           .from('meditation_goals')
           .insert({
             user_id: user.id,
             goal_type: type,
             target_minutes: targetMinutes,
           });
 
         if (error) throw error;
       }
 
       toast.success(`${type === 'weekly' ? 'Weekly' : 'Monthly'} goal updated!`);
       await fetchGoalsAndProgress();
       return true;
     } catch (error) {
       logError('Error setting goal', error);
       toast.error('Failed to update goal');
       return false;
     }
   }, [isAuthenticated, goals, fetchGoalsAndProgress]);
 
   const removeGoal = useCallback(async (type: GoalType) => {
     const goal = goals.find(g => g.goal_type === type);
     if (!goal) return false;
 
     try {
       const { error } = await supabase
         .from('meditation_goals')
         .delete()
         .eq('id', goal.id);
 
       if (error) throw error;
 
       toast.success('Goal removed');
       await fetchGoalsAndProgress();
       return true;
     } catch (error) {
       logError('Error removing goal', error);
       toast.error('Failed to remove goal');
       return false;
     }
   }, [goals, fetchGoalsAndProgress]);
 
   return {
     goals,
     weeklyProgress,
     monthlyProgress,
     isLoading,
     isAuthenticated,
     setGoal,
     removeGoal,
     refetch: fetchGoalsAndProgress,
   };
 };