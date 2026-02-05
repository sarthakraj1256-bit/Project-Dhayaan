import { useState, useEffect, useCallback, useMemo } from 'react';

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'water' | 'plant' | 'grow' | 'karma' | 'flourish' | 'exclusive';
  target: number;
  progress: number;
  reward: {
    type: 'water_drops' | 'karma_bonus' | 'karma_multiplier';
    value: number;
    label: string;
  };
  completed: boolean;
  claimed: boolean;
}

interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: DailyChallenge['type'];
  targetRange: [number, number];
  reward: DailyChallenge['reward'];
  difficulty: 'easy' | 'medium' | 'hard';
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // Easy challenges
  {
    id: 'water-basic',
    name: 'Gentle Rain',
    description: 'Water {target} plants today',
    emoji: '💧',
    type: 'water',
    targetRange: [3, 5],
    reward: { type: 'water_drops', value: 2, label: '+2 Water Drops' },
    difficulty: 'easy',
  },
  {
    id: 'plant-seed',
    name: 'New Beginnings',
    description: 'Plant {target} new seeds',
    emoji: '🌱',
    type: 'plant',
    targetRange: [1, 2],
    reward: { type: 'karma_bonus', value: 15, label: '+15 Karma' },
    difficulty: 'easy',
  },
  {
    id: 'karma-gather',
    name: 'Karma Collector',
    description: 'Earn {target} karma from gardening',
    emoji: '✨',
    type: 'karma',
    targetRange: [20, 30],
    reward: { type: 'water_drops', value: 3, label: '+3 Water Drops' },
    difficulty: 'easy',
  },
  // Medium challenges
  {
    id: 'water-dedicated',
    name: 'Devoted Gardener',
    description: 'Water plants {target} times',
    emoji: '🚿',
    type: 'water',
    targetRange: [8, 12],
    reward: { type: 'karma_bonus', value: 30, label: '+30 Karma' },
    difficulty: 'medium',
  },
  {
    id: 'grow-plants',
    name: 'Growth Spurt',
    description: 'Help {target} plants grow a stage',
    emoji: '🌿',
    type: 'grow',
    targetRange: [2, 4],
    reward: { type: 'water_drops', value: 5, label: '+5 Water Drops' },
    difficulty: 'medium',
  },
  {
    id: 'flourish-count',
    name: 'Garden Paradise',
    description: 'Have {target} flourishing plants',
    emoji: '🌸',
    type: 'flourish',
    targetRange: [3, 5],
    reward: { type: 'karma_multiplier', value: 2, label: '2x Karma (next session)' },
    difficulty: 'medium',
  },
  // Hard challenges
  {
    id: 'water-master',
    name: 'Monsoon Master',
    description: 'Water plants {target} times today',
    emoji: '🌊',
    type: 'water',
    targetRange: [15, 20],
    reward: { type: 'karma_bonus', value: 50, label: '+50 Karma' },
    difficulty: 'hard',
  },
  {
    id: 'exclusive-plant',
    name: 'Rare Collector',
    description: 'Plant {target} exclusive seasonal plant',
    emoji: '🌺',
    type: 'exclusive',
    targetRange: [1, 1],
    reward: { type: 'water_drops', value: 8, label: '+8 Water Drops' },
    difficulty: 'hard',
  },
  {
    id: 'karma-master',
    name: 'Karma Tsunami',
    description: 'Earn {target} karma from gardening',
    emoji: '🌟',
    type: 'karma',
    targetRange: [75, 100],
    reward: { type: 'karma_multiplier', value: 3, label: '3x Karma (next session)' },
    difficulty: 'hard',
  },
];

interface DailyChallengesState {
  challenges: DailyChallenge[];
  lastRefresh: string; // ISO date string
  todayStats: {
    waterCount: number;
    plantCount: number;
    growCount: number;
    karmaEarned: number;
    exclusivePlanted: number;
  };
}

const getToday = () => new Date().toISOString().split('T')[0];

const generateDailyChallenges = (): DailyChallenge[] => {
  // Pick 3 challenges: 1 easy, 1 medium, 1 hard
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  
  const easy = shuffled.find(c => c.difficulty === 'easy')!;
  const medium = shuffled.find(c => c.difficulty === 'medium')!;
  const hard = shuffled.find(c => c.difficulty === 'hard')!;
  
  return [easy, medium, hard].map(template => {
    const target = Math.floor(
      Math.random() * (template.targetRange[1] - template.targetRange[0] + 1)
    ) + template.targetRange[0];
    
    return {
      id: `${template.id}-${getToday()}`,
      name: template.name,
      description: template.description.replace('{target}', target.toString()),
      emoji: template.emoji,
      type: template.type,
      target,
      progress: 0,
      reward: template.reward,
      completed: false,
      claimed: false,
    };
  });
};

export const useGardenChallenges = () => {
  const [state, setState] = useState<DailyChallengesState>({
    challenges: [],
    lastRefresh: '',
    todayStats: {
      waterCount: 0,
      plantCount: 0,
      growCount: 0,
      karmaEarned: 0,
      exclusivePlanted: 0,
    },
  });

  // Load saved state and check for daily refresh
  useEffect(() => {
    const saved = localStorage.getItem('dhyaan-garden-challenges');
    const today = getToday();
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DailyChallengesState;
        
        // Check if we need to refresh for a new day
        if (parsed.lastRefresh !== today) {
          // New day - generate new challenges
          setState({
            challenges: generateDailyChallenges(),
            lastRefresh: today,
            todayStats: {
              waterCount: 0,
              plantCount: 0,
              growCount: 0,
              karmaEarned: 0,
              exclusivePlanted: 0,
            },
          });
        } else {
          setState(parsed);
        }
      } catch (e) {
        // Invalid state - generate fresh
        setState({
          challenges: generateDailyChallenges(),
          lastRefresh: today,
          todayStats: {
            waterCount: 0,
            plantCount: 0,
            growCount: 0,
            karmaEarned: 0,
            exclusivePlanted: 0,
          },
        });
      }
    } else {
      // First time - generate challenges
      setState({
        challenges: generateDailyChallenges(),
        lastRefresh: today,
        todayStats: {
          waterCount: 0,
          plantCount: 0,
          growCount: 0,
          karmaEarned: 0,
          exclusivePlanted: 0,
        },
      });
    }
  }, []);

  // Save state
  useEffect(() => {
    if (state.challenges.length > 0) {
      localStorage.setItem('dhyaan-garden-challenges', JSON.stringify(state));
    }
  }, [state]);

  // Track water action
  const trackWater = useCallback(() => {
    setState(prev => {
      const newStats = { ...prev.todayStats, waterCount: prev.todayStats.waterCount + 1 };
      const newChallenges = prev.challenges.map(c => {
        if (c.type === 'water' && !c.completed) {
          const newProgress = Math.min(c.progress + 1, c.target);
          return { ...c, progress: newProgress, completed: newProgress >= c.target };
        }
        return c;
      });
      return { ...prev, todayStats: newStats, challenges: newChallenges };
    });
  }, []);

  // Track plant action
  const trackPlant = useCallback((isExclusive: boolean = false) => {
    setState(prev => {
      const newStats = { 
        ...prev.todayStats, 
        plantCount: prev.todayStats.plantCount + 1,
        exclusivePlanted: isExclusive ? prev.todayStats.exclusivePlanted + 1 : prev.todayStats.exclusivePlanted,
      };
      const newChallenges = prev.challenges.map(c => {
        if (c.type === 'plant' && !c.completed) {
          const newProgress = Math.min(c.progress + 1, c.target);
          return { ...c, progress: newProgress, completed: newProgress >= c.target };
        }
        if (c.type === 'exclusive' && isExclusive && !c.completed) {
          const newProgress = Math.min(c.progress + 1, c.target);
          return { ...c, progress: newProgress, completed: newProgress >= c.target };
        }
        return c;
      });
      return { ...prev, todayStats: newStats, challenges: newChallenges };
    });
  }, []);

  // Track grow action
  const trackGrow = useCallback(() => {
    setState(prev => {
      const newStats = { ...prev.todayStats, growCount: prev.todayStats.growCount + 1 };
      const newChallenges = prev.challenges.map(c => {
        if (c.type === 'grow' && !c.completed) {
          const newProgress = Math.min(c.progress + 1, c.target);
          return { ...c, progress: newProgress, completed: newProgress >= c.target };
        }
        return c;
      });
      return { ...prev, todayStats: newStats, challenges: newChallenges };
    });
  }, []);

  // Track karma earned
  const trackKarma = useCallback((amount: number) => {
    setState(prev => {
      const newStats = { ...prev.todayStats, karmaEarned: prev.todayStats.karmaEarned + amount };
      const newChallenges = prev.challenges.map(c => {
        if (c.type === 'karma' && !c.completed) {
          const newProgress = Math.min(c.progress + amount, c.target);
          return { ...c, progress: newProgress, completed: newProgress >= c.target };
        }
        return c;
      });
      return { ...prev, todayStats: newStats, challenges: newChallenges };
    });
  }, []);

  // Update flourishing progress (called with current count)
  const updateFlourishProgress = useCallback((flourishingCount: number) => {
    setState(prev => {
      const newChallenges = prev.challenges.map(c => {
        if (c.type === 'flourish') {
          const newProgress = flourishingCount;
          return { ...c, progress: newProgress, completed: newProgress >= c.target };
        }
        return c;
      });
      return { ...prev, challenges: newChallenges };
    });
  }, []);

  // Claim reward
  const claimReward = useCallback((challengeId: string): DailyChallenge['reward'] | null => {
    let reward: DailyChallenge['reward'] | null = null;
    
    setState(prev => {
      const challenge = prev.challenges.find(c => c.id === challengeId);
      if (challenge && challenge.completed && !challenge.claimed) {
        reward = challenge.reward;
        return {
          ...prev,
          challenges: prev.challenges.map(c =>
            c.id === challengeId ? { ...c, claimed: true } : c
          ),
        };
      }
      return prev;
    });
    
    return reward;
  }, []);

  // Get time until next refresh
  const timeUntilRefresh = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, []);

  const completedCount = state.challenges.filter(c => c.completed).length;
  const claimedCount = state.challenges.filter(c => c.claimed).length;

  return {
    challenges: state.challenges,
    todayStats: state.todayStats,
    timeUntilRefresh,
    completedCount,
    claimedCount,
    trackWater,
    trackPlant,
    trackGrow,
    trackKarma,
    updateFlourishProgress,
    claimReward,
  };
};

export default useGardenChallenges;
