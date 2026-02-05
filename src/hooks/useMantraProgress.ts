 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/backend/client';
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { toast } from 'sonner';
 
 export interface MantraProgress {
   id: string;
   user_id: string;
   mantra_id: string;
   completed: boolean;
   completed_syllables: number[];
   total_repetitions: number;
   last_practiced_at: string;
   completed_at: string | null;
   created_at: string;
   updated_at: string;
 }
 
 export function useMantraProgress() {
   const queryClient = useQueryClient();
   const [userId, setUserId] = useState<string | null>(null);
 
   // Get current user
   useEffect(() => {
     const getUser = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       setUserId(user?.id || null);
     };
     getUser();
 
     const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
       setUserId(session?.user?.id || null);
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   // Fetch all progress for user
   const { data: progressList = [], isLoading } = useQuery({
     queryKey: ['mantra-progress', userId],
     queryFn: async () => {
       if (!userId) return [];
       
       const { data, error } = await supabase
         .from('mantra_progress')
         .select('*')
         .eq('user_id', userId)
         .order('last_practiced_at', { ascending: false });
       
       if (error) {
         console.error('Error fetching mantra progress:', error);
         return [];
       }
       
       return data as MantraProgress[];
     },
     enabled: !!userId,
   });
 
   // Get progress for a specific mantra
   const getMantraProgress = useCallback((mantraId: string): MantraProgress | null => {
     return progressList.find(p => p.mantra_id === mantraId) || null;
   }, [progressList]);
 
   // Calculate completion percentage for a mantra
   const getCompletionPercent = useCallback((mantraId: string, totalSyllables: number): number => {
     const progress = getMantraProgress(mantraId);
     if (!progress) return 0;
     if (progress.completed) return 100;
     
     const syllableProgress = (progress.completed_syllables.length / totalSyllables) * 50;
     const hasReps = progress.total_repetitions > 0 ? 25 : 0;
     return Math.min(syllableProgress + hasReps, 99);
   }, [getMantraProgress]);
 
   // Get list of completed mantra IDs
   const completedMantraIds = progressList
     .filter(p => p.completed)
     .map(p => p.mantra_id);
 
   // Update or create progress
   const updateProgressMutation = useMutation({
     mutationFn: async ({
       mantraId,
       completedSyllables,
       totalRepetitions,
       markComplete,
     }: {
       mantraId: string;
       completedSyllables?: number[];
       totalRepetitions?: number;
       markComplete?: boolean;
     }) => {
       if (!userId) throw new Error('User not authenticated');
 
       const existing = getMantraProgress(mantraId);
       
       if (existing) {
         // Update existing record
         const updates: Partial<MantraProgress> = {
           last_practiced_at: new Date().toISOString(),
         };
         
         if (completedSyllables !== undefined) {
           // Merge with existing syllables (unique)
           const merged = [...new Set([...existing.completed_syllables, ...completedSyllables])];
           updates.completed_syllables = merged;
         }
         
         if (totalRepetitions !== undefined) {
           updates.total_repetitions = existing.total_repetitions + totalRepetitions;
         }
         
         if (markComplete) {
           updates.completed = true;
           updates.completed_at = new Date().toISOString();
         }
         
         const { error } = await supabase
           .from('mantra_progress')
           .update(updates)
           .eq('id', existing.id);
         
         if (error) throw error;
       } else {
         // Create new record
         const { error } = await supabase
           .from('mantra_progress')
           .insert({
             user_id: userId,
             mantra_id: mantraId,
             completed_syllables: completedSyllables || [],
             total_repetitions: totalRepetitions || 0,
             completed: markComplete || false,
             completed_at: markComplete ? new Date().toISOString() : null,
           });
         
         if (error) throw error;
       }
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['mantra-progress', userId] });
     },
     onError: (error) => {
       console.error('Error updating mantra progress:', error);
       toast.error('Failed to save progress');
     },
   });
 
   // Convenience methods
   const saveSyllableProgress = useCallback((mantraId: string, syllableIndices: number[]) => {
     if (!userId) return;
     updateProgressMutation.mutate({ mantraId, completedSyllables: syllableIndices });
   }, [userId, updateProgressMutation]);
 
   const saveRepetitions = useCallback((mantraId: string, reps: number) => {
     if (!userId) return;
     updateProgressMutation.mutate({ mantraId, totalRepetitions: reps });
   }, [userId, updateProgressMutation]);
 
   const markMantraComplete = useCallback((mantraId: string) => {
     if (!userId) return;
     updateProgressMutation.mutate({ mantraId, markComplete: true });
   }, [userId, updateProgressMutation]);
 
   return {
     isLoading,
     isAuthenticated: !!userId,
     progressList,
     completedMantraIds,
     getMantraProgress,
     getCompletionPercent,
     saveSyllableProgress,
     saveRepetitions,
     markMantraComplete,
     isSaving: updateProgressMutation.isPending,
   };
 }