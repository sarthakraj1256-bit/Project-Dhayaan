 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/backend/client';
 import { toast } from 'sonner';
 import { logError } from '@/lib/logger';
 
 export interface MeditationSession {
   id: string;
   user_id: string;
   frequency_value: number;
   frequency_name: string;
   frequency_category: string;
   atmosphere_id: string;
   duration_seconds: number;
   started_at: string;
   ended_at: string;
   created_at: string;
 }
 
 export interface SessionStats {
   totalSessions: number;
   totalMinutes: number;
   totalHours: number;
   averageSessionMinutes: number;
   longestSessionMinutes: number;
   mostUsedFrequency: { value: number; name: string; count: number } | null;
 }
 
 export const useSessionHistory = () => {
   const [sessions, setSessions] = useState<MeditationSession[]>([]);
   const [stats, setStats] = useState<SessionStats | null>(null);
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
 
   // Fetch sessions when authenticated
   useEffect(() => {
     if (isAuthenticated) {
       fetchSessions();
     } else {
       setSessions([]);
       setStats(null);
     }
   }, [isAuthenticated]);
 
   const calculateStats = useCallback((sessionData: MeditationSession[]): SessionStats => {
     if (sessionData.length === 0) {
       return {
         totalSessions: 0,
         totalMinutes: 0,
         totalHours: 0,
         averageSessionMinutes: 0,
         longestSessionMinutes: 0,
         mostUsedFrequency: null,
       };
     }
 
     const totalSeconds = sessionData.reduce((sum, s) => sum + s.duration_seconds, 0);
     const totalMinutes = Math.round(totalSeconds / 60);
     const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
     const longestSession = Math.max(...sessionData.map(s => s.duration_seconds));
 
     // Find most used frequency
     const frequencyCount: Record<string, { value: number; name: string; count: number }> = {};
     sessionData.forEach(s => {
       const key = `${s.frequency_value}`;
       if (!frequencyCount[key]) {
         frequencyCount[key] = { value: s.frequency_value, name: s.frequency_name, count: 0 };
       }
       frequencyCount[key].count++;
     });
     const mostUsed = Object.values(frequencyCount).sort((a, b) => b.count - a.count)[0] || null;
 
     return {
       totalSessions: sessionData.length,
       totalMinutes,
       totalHours,
       averageSessionMinutes: Math.round(totalMinutes / sessionData.length),
       longestSessionMinutes: Math.round(longestSession / 60),
       mostUsedFrequency: mostUsed,
     };
   }, []);
 
   const fetchSessions = useCallback(async () => {
     setIsLoading(true);
     try {
       const { data, error } = await supabase
         .from('meditation_sessions')
         .select('*')
         .order('started_at', { ascending: false })
         .limit(100);
 
       if (error) throw error;
       
       const sessionData = data || [];
       setSessions(sessionData);
       setStats(calculateStats(sessionData));
     } catch (error) {
       logError('Error fetching session history', error);
     } finally {
       setIsLoading(false);
     }
   }, [calculateStats]);
 
   const saveSession = useCallback(async (
     frequencyValue: number,
     frequencyName: string,
     frequencyCategory: string,
     atmosphereId: string,
     durationSeconds: number,
     startedAt: Date
   ) => {
     if (!isAuthenticated) {
       return false;
     }
 
     // Only save sessions longer than 30 seconds
     if (durationSeconds < 30) {
       return false;
     }
 
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return false;
 
       const { error } = await supabase
         .from('meditation_sessions')
         .insert({
           user_id: user.id,
           frequency_value: frequencyValue,
           frequency_name: frequencyName,
           frequency_category: frequencyCategory,
           atmosphere_id: atmosphereId,
           duration_seconds: durationSeconds,
           started_at: startedAt.toISOString(),
           ended_at: new Date().toISOString(),
         });
 
       if (error) throw error;
 
       // Refresh sessions after saving
       await fetchSessions();
       return true;
     } catch (error) {
       logError('Error saving session', error);
       return false;
     }
   }, [isAuthenticated, fetchSessions]);
 
   const deleteSession = useCallback(async (id: string) => {
     try {
       const { error } = await supabase
         .from('meditation_sessions')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
 
       setSessions(prev => prev.filter(s => s.id !== id));
       toast.success('Session deleted');
       return true;
     } catch (error) {
       logError('Error deleting session', error);
       toast.error('Failed to delete session');
       return false;
     }
   }, []);
 
   return {
     sessions,
     stats,
     isLoading,
     isAuthenticated,
     saveSession,
     deleteSession,
     refetch: fetchSessions,
   };
 };