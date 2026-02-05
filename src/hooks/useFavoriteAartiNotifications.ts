import { useEffect, useRef, useCallback } from 'react';
import { temples, Temple, AartiSchedule } from '@/data/templeStreams';
import { useTempleFavorites } from './useTempleFavorites';

interface UpcomingAarti {
  temple: Temple;
  aarti: AartiSchedule;
  minutesUntil: number;
}

export const useFavoriteAartiNotifications = () => {
  const { favorites, isNotificationsEnabled } = useTempleFavorites();
  const notifiedAartis = useRef<Set<string>>(new Set());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const showNotification = useCallback((temple: Temple, aarti: AartiSchedule, minutesUntil: number) => {
    if (Notification.permission !== 'granted') return;

    const notificationKey = `${temple.id}-${aarti.time}-${new Date().toDateString()}`;
    if (notifiedAartis.current.has(notificationKey)) return;
    
    notifiedAartis.current.add(notificationKey);

    const timeText = minutesUntil <= 5 
      ? 'Starting now!' 
      : `Starting in ${minutesUntil} minutes`;

    const notification = new Notification(`🔔 ${aarti.name}`, {
      body: `${temple.name}\n${timeText}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notificationKey,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  const getUpcomingFavoriteAartis = useCallback((): UpcomingAarti[] => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const upcoming: UpcomingAarti[] = [];

    // Get favorite temple IDs with notifications enabled
    const favoriteTempleIds = favorites
      .filter(f => f.notifications_enabled)
      .map(f => f.temple_id);

    if (favoriteTempleIds.length === 0) return [];

    temples.forEach(temple => {
      if (!favoriteTempleIds.includes(temple.id)) return;
      if (!temple.aartiSchedule) return;

      temple.aartiSchedule.forEach(aarti => {
        const [hours, minutes] = aarti.time.split(':').map(Number);
        const aartiMinutes = hours * 60 + minutes;
        const minutesUntil = aartiMinutes - currentMinutes;

        // Notify 15 minutes before and 5 minutes before
        if (minutesUntil === 15 || minutesUntil === 5 || (minutesUntil >= 0 && minutesUntil <= 1)) {
          upcoming.push({ temple, aarti, minutesUntil });
        }
      });
    });

    return upcoming;
  }, [favorites]);

  const checkAndNotify = useCallback(async () => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    const upcomingAartis = getUpcomingFavoriteAartis();
    
    upcomingAartis.forEach(({ temple, aarti, minutesUntil }) => {
      showNotification(temple, aarti, minutesUntil);
    });
  }, [getUpcomingFavoriteAartis, requestNotificationPermission, showNotification]);

  // Start checking when favorites with notifications exist
  useEffect(() => {
    const hasNotificationsEnabled = favorites.some(f => f.notifications_enabled);
    
    if (hasNotificationsEnabled) {
      // Check immediately
      checkAndNotify();
      
      // Then check every 30 seconds
      checkIntervalRef.current = setInterval(checkAndNotify, 30000);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [favorites, checkAndNotify]);

  // Clear old notification keys at midnight
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      notifiedAartis.current.clear();
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return {
    getUpcomingFavoriteAartis,
    requestNotificationPermission,
    notificationPermission: typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'denied'
  };
};
