import { useState, useEffect, useCallback } from 'react';

export interface GardenAchievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'growth' | 'care' | 'seasonal' | 'mastery' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: 'plants_total' | 'plants_flourishing' | 'water_used' | 'karma_earned' | 'exclusive_plants' | 'plant_types' | 'sessions' | 'streak';
    value: number;
  };
  unlockedAt?: number;
}

const GARDEN_ACHIEVEMENTS: GardenAchievement[] = [
  // Growth achievements
  {
    id: 'first-seed',
    name: 'First Seed',
    description: 'Plant your first seed in the garden',
    emoji: '🌱',
    category: 'growth',
    rarity: 'common',
    requirement: { type: 'plants_total', value: 1 },
  },
  {
    id: 'budding-gardener',
    name: 'Budding Gardener',
    description: 'Grow 5 plants in your garden',
    emoji: '🌿',
    category: 'growth',
    rarity: 'common',
    requirement: { type: 'plants_total', value: 5 },
  },
  {
    id: 'green-thumb',
    name: 'Green Thumb',
    description: 'Grow 15 plants in your garden',
    emoji: '🪴',
    category: 'growth',
    rarity: 'uncommon',
    requirement: { type: 'plants_total', value: 15 },
  },
  {
    id: 'garden-keeper',
    name: 'Garden Keeper',
    description: 'Grow 30 plants in your garden',
    emoji: '🏡',
    category: 'growth',
    rarity: 'rare',
    requirement: { type: 'plants_total', value: 30 },
  },
  {
    id: 'master-gardener',
    name: 'Master Gardener',
    description: 'Grow 50 plants in your garden',
    emoji: '👨‍🌾',
    category: 'mastery',
    rarity: 'epic',
    requirement: { type: 'plants_total', value: 50 },
  },
  
  // Flourishing achievements
  {
    id: 'first-bloom',
    name: 'First Bloom',
    description: 'Watch your first plant reach full bloom',
    emoji: '🌸',
    category: 'growth',
    rarity: 'common',
    requirement: { type: 'plants_flourishing', value: 1 },
  },
  {
    id: 'blooming-garden',
    name: 'Blooming Garden',
    description: 'Have 5 fully flourishing plants',
    emoji: '🌺',
    category: 'growth',
    rarity: 'uncommon',
    requirement: { type: 'plants_flourishing', value: 5 },
  },
  {
    id: 'paradise-garden',
    name: 'Paradise Garden',
    description: 'Have 10 fully flourishing plants',
    emoji: '🏝️',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'plants_flourishing', value: 10 },
  },
  {
    id: 'eden-achieved',
    name: 'Eden Achieved',
    description: 'Have 20 fully flourishing plants',
    emoji: '✨',
    category: 'mastery',
    rarity: 'legendary',
    requirement: { type: 'plants_flourishing', value: 20 },
  },
  
  // Care achievements
  {
    id: 'first-drop',
    name: 'First Drop',
    description: 'Water a plant for the first time',
    emoji: '💧',
    category: 'care',
    rarity: 'common',
    requirement: { type: 'water_used', value: 1 },
  },
  {
    id: 'devoted-caretaker',
    name: 'Devoted Caretaker',
    description: 'Use 25 water drops on your plants',
    emoji: '🚿',
    category: 'care',
    rarity: 'uncommon',
    requirement: { type: 'water_used', value: 25 },
  },
  {
    id: 'water-bearer',
    name: 'Water Bearer',
    description: 'Use 100 water drops on your plants',
    emoji: '🌊',
    category: 'care',
    rarity: 'rare',
    requirement: { type: 'water_used', value: 100 },
  },
  {
    id: 'monsoon-master',
    name: 'Monsoon Master',
    description: 'Use 500 water drops on your plants',
    emoji: '⛈️',
    category: 'mastery',
    rarity: 'epic',
    requirement: { type: 'water_used', value: 500 },
  },
  
  // Karma achievements
  {
    id: 'karma-spark',
    name: 'Karma Spark',
    description: 'Earn 50 Karma from gardening',
    emoji: '⚡',
    category: 'special',
    rarity: 'common',
    requirement: { type: 'karma_earned', value: 50 },
  },
  {
    id: 'karma-flow',
    name: 'Karma Flow',
    description: 'Earn 250 Karma from gardening',
    emoji: '🌟',
    category: 'special',
    rarity: 'uncommon',
    requirement: { type: 'karma_earned', value: 250 },
  },
  {
    id: 'karma-tsunami',
    name: 'Karma Tsunami',
    description: 'Earn 1000 Karma from gardening',
    emoji: '🌠',
    category: 'mastery',
    rarity: 'epic',
    requirement: { type: 'karma_earned', value: 1000 },
  },
  
  // Seasonal/Exclusive achievements
  {
    id: 'seasonal-collector',
    name: 'Seasonal Collector',
    description: 'Plant your first exclusive seasonal plant',
    emoji: '🎋',
    category: 'seasonal',
    rarity: 'rare',
    requirement: { type: 'exclusive_plants', value: 1 },
  },
  {
    id: 'festival-gardener',
    name: 'Festival Gardener',
    description: 'Plant 5 exclusive seasonal plants',
    emoji: '🎊',
    category: 'seasonal',
    rarity: 'epic',
    requirement: { type: 'exclusive_plants', value: 5 },
  },
  {
    id: 'sacred-collector',
    name: 'Sacred Collector',
    description: 'Plant 10 exclusive seasonal plants',
    emoji: '🕉️',
    category: 'seasonal',
    rarity: 'legendary',
    requirement: { type: 'exclusive_plants', value: 10 },
  },
  
  // Variety achievements
  {
    id: 'plant-explorer',
    name: 'Plant Explorer',
    description: 'Grow 3 different types of plants',
    emoji: '🗺️',
    category: 'growth',
    rarity: 'uncommon',
    requirement: { type: 'plant_types', value: 3 },
  },
  {
    id: 'botanical-scholar',
    name: 'Botanical Scholar',
    description: 'Grow all 5 basic plant types',
    emoji: '📚',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'plant_types', value: 5 },
  },
];

interface GardenStats {
  plantsTotal: number;
  plantsFlourishing: number;
  waterUsed: number;
  karmaEarned: number;
  exclusivePlants: number;
  plantTypes: number;
}

interface AchievementState {
  achievements: GardenAchievement[];
  unlockedIds: string[];
  totalWaterUsed: number;
  totalKarmaEarned: number;
}

export const useGardenAchievements = () => {
  const [state, setState] = useState<AchievementState>({
    achievements: GARDEN_ACHIEVEMENTS,
    unlockedIds: [],
    totalWaterUsed: 0,
    totalKarmaEarned: 0,
  });
  const [newUnlock, setNewUnlock] = useState<GardenAchievement | null>(null);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem('dhyaan-garden-achievements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          unlockedIds: parsed.unlockedIds || [],
          totalWaterUsed: parsed.totalWaterUsed || 0,
          totalKarmaEarned: parsed.totalKarmaEarned || 0,
        }));
      } catch (e) {
        console.log('Could not load achievement state');
      }
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('dhyaan-garden-achievements', JSON.stringify({
      unlockedIds: state.unlockedIds,
      totalWaterUsed: state.totalWaterUsed,
      totalKarmaEarned: state.totalKarmaEarned,
    }));
  }, [state.unlockedIds, state.totalWaterUsed, state.totalKarmaEarned]);

  // Track water usage
  const trackWaterUsed = useCallback((drops: number) => {
    setState(prev => ({
      ...prev,
      totalWaterUsed: prev.totalWaterUsed + drops,
    }));
  }, []);

  // Track karma earned
  const trackKarmaEarned = useCallback((karma: number) => {
    setState(prev => ({
      ...prev,
      totalKarmaEarned: prev.totalKarmaEarned + karma,
    }));
  }, []);

  // Check and unlock achievements
  const checkAchievements = useCallback((stats: GardenStats) => {
    const currentStats = {
      ...stats,
      waterUsed: state.totalWaterUsed,
      karmaEarned: state.totalKarmaEarned,
    };

    const newlyUnlocked: GardenAchievement[] = [];

    state.achievements.forEach(achievement => {
      if (state.unlockedIds.includes(achievement.id)) return;

      let isUnlocked = false;

      switch (achievement.requirement.type) {
        case 'plants_total':
          isUnlocked = currentStats.plantsTotal >= achievement.requirement.value;
          break;
        case 'plants_flourishing':
          isUnlocked = currentStats.plantsFlourishing >= achievement.requirement.value;
          break;
        case 'water_used':
          isUnlocked = currentStats.waterUsed >= achievement.requirement.value;
          break;
        case 'karma_earned':
          isUnlocked = currentStats.karmaEarned >= achievement.requirement.value;
          break;
        case 'exclusive_plants':
          isUnlocked = currentStats.exclusivePlants >= achievement.requirement.value;
          break;
        case 'plant_types':
          isUnlocked = currentStats.plantTypes >= achievement.requirement.value;
          break;
      }

      if (isUnlocked) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: Date.now(),
        });
      }
    });

    if (newlyUnlocked.length > 0) {
      setState(prev => ({
        ...prev,
        unlockedIds: [...prev.unlockedIds, ...newlyUnlocked.map(a => a.id)],
      }));

      // Show the first newly unlocked achievement
      setNewUnlock(newlyUnlocked[0]);
    }
  }, [state.achievements, state.unlockedIds, state.totalWaterUsed, state.totalKarmaEarned]);

  // Clear new unlock notification
  const clearNewUnlock = useCallback(() => {
    setNewUnlock(null);
  }, []);

  // Get achievements with unlock status
  const getAchievementsWithStatus = useCallback(() => {
    return state.achievements.map(achievement => ({
      ...achievement,
      isUnlocked: state.unlockedIds.includes(achievement.id),
    }));
  }, [state.achievements, state.unlockedIds]);

  // Get stats
  const getStats = useCallback(() => {
    const unlocked = state.unlockedIds.length;
    const total = state.achievements.length;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
      totalWaterUsed: state.totalWaterUsed,
      totalKarmaEarned: state.totalKarmaEarned,
    };
  }, [state.unlockedIds, state.achievements, state.totalWaterUsed, state.totalKarmaEarned]);

  return {
    achievements: getAchievementsWithStatus(),
    newUnlock,
    stats: getStats(),
    checkAchievements,
    trackWaterUsed,
    trackKarmaEarned,
    clearNewUnlock,
  };
};

export default useGardenAchievements;
