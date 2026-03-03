import { useState, useEffect, useCallback } from 'react';

interface GardenResources {
  waterDrops: number;
  lastMeditationSync: string | null;
  totalDropsEarned: number;
}

const STORAGE_KEY = 'dhyaan-garden-resources';
const DROPS_PER_10_MINUTES = 1;
const MAX_WATER_DROPS = 30;

export const useGardenResources = () => {
  const [resources, setResources] = useState<GardenResources>({
    waterDrops: 5, // Starting drops
    lastMeditationSync: null,
    totalDropsEarned: 0,
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setResources(JSON.parse(saved));
      } catch (e) {
        // Could not load garden resources
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }, [resources]);

  // Grant water drops based on meditation duration
  const grantWaterDrops = useCallback((durationSeconds: number): number => {
    const minutes = Math.floor(durationSeconds / 60);
    const dropsEarned = Math.floor(minutes / 10) * DROPS_PER_10_MINUTES;
    
    if (dropsEarned > 0) {
      setResources(prev => ({
        ...prev,
        waterDrops: Math.min(prev.waterDrops + dropsEarned, MAX_WATER_DROPS),
        totalDropsEarned: prev.totalDropsEarned + dropsEarned,
        lastMeditationSync: new Date().toISOString(),
      }));
    }
    
    return dropsEarned;
  }, []);

  // Consume water drops (for planting/watering)
  const consumeWaterDrops = useCallback((amount: number): boolean => {
    if (resources.waterDrops < amount) {
      return false;
    }
    
    setResources(prev => ({
      ...prev,
      waterDrops: prev.waterDrops - amount,
    }));
    
    return true;
  }, [resources.waterDrops]);

  // Add drops manually (bonus rewards, etc.)
  const addWaterDrops = useCallback((amount: number) => {
    setResources(prev => ({
      ...prev,
      waterDrops: Math.min(prev.waterDrops + amount, MAX_WATER_DROPS),
      totalDropsEarned: prev.totalDropsEarned + amount,
    }));
  }, []);

  // Get current water drops
  const getWaterDrops = useCallback(() => resources.waterDrops, [resources.waterDrops]);

  return {
    waterDrops: resources.waterDrops,
    totalDropsEarned: resources.totalDropsEarned,
    lastMeditationSync: resources.lastMeditationSync,
    maxWaterDrops: MAX_WATER_DROPS,
    grantWaterDrops,
    consumeWaterDrops,
    addWaterDrops,
    getWaterDrops,
  };
};

// Singleton event emitter for cross-component communication
type GardenEventListener = (dropsEarned: number) => void;
const gardenEventListeners: GardenEventListener[] = [];

export const emitGardenWaterEarned = (dropsEarned: number) => {
  gardenEventListeners.forEach(listener => listener(dropsEarned));
};

export const subscribeToGardenEvents = (listener: GardenEventListener) => {
  gardenEventListeners.push(listener);
  return () => {
    const index = gardenEventListeners.indexOf(listener);
    if (index > -1) {
      gardenEventListeners.splice(index, 1);
    }
  };
};
