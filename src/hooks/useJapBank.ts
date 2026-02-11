import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface JapEntry {
  id: string;
  user_id: string;
  mantra_name: string;
  chant_count: number;
  created_at: string;
}

export interface JapGoal {
  id: string;
  user_id: string;
  mantra_name: string;
  target_count: number;
  current_count: number;
  deadline: string | null;
  dedication: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface JapRequest {
  id: string;
  requester_id: string;
  performer_id: string | null;
  mantra_name: string;
  required_count: number;
  completed_count: number;
  dedicated_to: string | null;
  deadline: string | null;
  karma_reward: number;
  status: string;
  rating: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface JapProof {
  id: string;
  request_id: string;
  performer_id: string;
  proof_type: string;
  proof_url: string;
  notes: string | null;
  created_at: string;
}

export const PRESET_MANTRAS = [
  'Radhe Radhe',
  'Om Namah Shivaya',
  'Om Gan Ganpataye Namo Namah',
  'Jai Ram Jai Ram Jai Jai Ram',
  'Hare Krishna Hare Krishna Krishna Krishna Hare Hare',
];

export function useJapBank() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

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

  // --- Jap Entries ---
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['jap-entries', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('jap_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) { console.error(error); return []; }
      return data as JapEntry[];
    },
    enabled: !!userId,
  });

  const addEntry = useMutation({
    mutationFn: async ({ mantraName, count }: { mantraName: string; count: number }) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase.from('jap_entries').insert({
        user_id: userId,
        mantra_name: mantraName,
        chant_count: count,
      });
      if (error) throw error;

      // Auto-update matching active goals
      const matchingGoals = goals.filter(g => g.mantra_name === mantraName && g.status === 'active');
      for (const goal of matchingGoals) {
        const newCount = Math.min(goal.current_count + count, goal.target_count);
        const newStatus = newCount >= goal.target_count ? 'completed' : 'active';
        await supabase.from('jap_goals').update({
          current_count: newCount,
          status: newStatus,
        }).eq('id', goal.id);
        if (newStatus === 'completed') {
          toast.success(`🎯 Goal completed: ${goal.target_count.toLocaleString()} ${mantraName}!`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jap-entries', userId] });
      queryClient.invalidateQueries({ queryKey: ['jap-goals', userId] });
      queryClient.invalidateQueries({ queryKey: ['jap-leaderboard'] });
      toast.success('🙏 Jap recorded in your bank!');
    },
    onError: () => toast.error('Failed to save jap entry'),
  });

  // --- Totals ---
  const getTotalForMantra = useCallback((mantraName: string) => {
    return entries.filter(e => e.mantra_name === mantraName).reduce((sum, e) => sum + e.chant_count, 0);
  }, [entries]);

  const lifetimeTotal = entries.reduce((sum, e) => sum + e.chant_count, 0);

  const todayTotal = entries
    .filter(e => new Date(e.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.chant_count, 0);

  // --- Jap Goals ---
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['jap-goals', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('jap_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) { console.error(error); return []; }
      return data as JapGoal[];
    },
    enabled: !!userId,
  });

  const createGoal = useMutation({
    mutationFn: async (goal: { mantraName: string; targetCount: number; deadline?: string; dedication?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase.from('jap_goals').insert({
        user_id: userId,
        mantra_name: goal.mantraName,
        target_count: goal.targetCount,
        deadline: goal.deadline || null,
        dedication: goal.dedication || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jap-goals', userId] });
      toast.success('🎯 Jap goal created!');
    },
    onError: () => toast.error('Failed to create goal'),
  });

  const updateGoalProgress = useMutation({
    mutationFn: async ({ goalId, addCount }: { goalId: string; addCount: number }) => {
      if (!userId) throw new Error('Not authenticated');
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');
      const newCount = Math.min(goal.current_count + addCount, goal.target_count);
      const newStatus = newCount >= goal.target_count ? 'completed' : 'active';
      const { error } = await supabase.from('jap_goals').update({
        current_count: newCount,
        status: newStatus,
      }).eq('id', goalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jap-goals', userId] });
    },
  });

  // --- Jap Requests ---
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['jap-requests', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('jap_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { console.error(error); return []; }
      return data as JapRequest[];
    },
    enabled: !!userId,
  });

  const createRequest = useMutation({
    mutationFn: async (req: { mantraName: string; requiredCount: number; dedicatedTo?: string; deadline?: string; karmaReward?: number }) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase.from('jap_requests').insert({
        requester_id: userId,
        mantra_name: req.mantraName,
        required_count: req.requiredCount,
        dedicated_to: req.dedicatedTo || null,
        deadline: req.deadline || null,
        karma_reward: req.karmaReward || 50,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jap-requests', userId] });
      toast.success('🙏 Jap request created!');
    },
    onError: () => toast.error('Failed to create request'),
  });

  const acceptRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase.from('jap_requests').update({
        performer_id: userId,
        status: 'accepted',
      }).eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jap-requests', userId] });
      toast.success('You accepted the jap request!');
    },
  });

  const submitProof = useMutation({
    mutationFn: async ({ requestId, proofType, proofUrl, notes }: { requestId: string; proofType: string; proofUrl: string; notes?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      const { error: proofError } = await supabase.from('jap_proofs').insert({
        request_id: requestId,
        performer_id: userId,
        proof_type: proofType,
        proof_url: proofUrl,
        notes: notes || null,
      });
      if (proofError) throw proofError;
      const { error } = await supabase.from('jap_requests').update({
        status: 'proof_submitted',
      }).eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jap-requests', userId] });
      toast.success('✅ Proof submitted!');
    },
  });

  const completeRequest = useMutation({
    mutationFn: async ({ requestId, rating, feedback }: { requestId: string; rating?: number; feedback?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase.from('jap_requests').update({
        status: 'completed',
        rating: rating || null,
        feedback: feedback || null,
      }).eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jap-requests', userId] });
      toast.success('🎉 Jap request completed!');
    },
  });

  // --- Leaderboard ---
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['jap-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_jap_leaderboard', { limit_count: 20 });
      if (error) { console.error(error); return []; }
      return data as { user_id: string; display_name: string; avatar_url: string; total_chants: number; mantra_name: string }[];
    },
  });

  return {
    userId,
    isAuthenticated: !!userId,
    entries, entriesLoading,
    goals, goalsLoading,
    requests, requestsLoading,
    leaderboard,
    lifetimeTotal, todayTotal,
    getTotalForMantra,
    addEntry, createGoal, updateGoalProgress,
    createRequest, acceptRequest, submitProof, completeRequest,
  };
}
