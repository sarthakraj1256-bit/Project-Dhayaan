import { useState, useCallback, useMemo } from 'react';

// Session multiplier tiers (games completed in current session)
const SESSION_MULTIPLIERS = [
  { games: 0, multiplier: 1.0 },
  { games: 1, multiplier: 1.15 },
  { games: 2, multiplier: 1.3 },
  { games: 3, multiplier: 1.5 },
  { games: 4, multiplier: 1.75 },
  { games: 5, multiplier: 2.0 }, // Max
];

// Streak multiplier tiers (consecutive days)
const STREAK_MULTIPLIERS = [
  { days: 0, multiplier: 1.0 },
  { days: 3, multiplier: 1.1 },
  { days: 7, multiplier: 1.25 },
  { days: 14, multiplier: 1.5 },
  { days: 30, multiplier: 2.0 }, // Max
];

export function getSessionMultiplier(gamesCompleted: number): number {
  const tier = [...SESSION_MULTIPLIERS]
    .reverse()
    .find(t => gamesCompleted >= t.games);
  return tier?.multiplier || 1.0;
}

export function getStreakMultiplier(streakDays: number): number {
  const tier = [...STREAK_MULTIPLIERS]
    .reverse()
    .find(t => streakDays >= t.days);
  return tier?.multiplier || 1.0;
}

export function useKarmaMultiplier(currentStreak: number = 0) {
  const [sessionGamesCompleted, setSessionGamesCompleted] = useState(0);

  const sessionMultiplier = useMemo(() => 
    getSessionMultiplier(sessionGamesCompleted), 
    [sessionGamesCompleted]
  );

  const streakMultiplier = useMemo(() => 
    getStreakMultiplier(currentStreak), 
    [currentStreak]
  );

  const totalMultiplier = useMemo(() => 
    Math.round(sessionMultiplier * streakMultiplier * 100) / 100,
    [sessionMultiplier, streakMultiplier]
  );

  const incrementSessionGames = useCallback(() => {
    setSessionGamesCompleted(prev => Math.min(prev + 1, 5));
  }, []);

  const applyMultiplier = useCallback((baseKarma: number): number => {
    return Math.round(baseKarma * totalMultiplier);
  }, [totalMultiplier]);

  const resetSession = useCallback(() => {
    setSessionGamesCompleted(0);
  }, []);

  return {
    sessionGamesCompleted,
    sessionMultiplier,
    streakMultiplier,
    totalMultiplier,
    incrementSessionGames,
    applyMultiplier,
    resetSession,
  };
}

// Export tiers for UI display
export const SESSION_TIERS = SESSION_MULTIPLIERS;
export const STREAK_TIERS = STREAK_MULTIPLIERS;
