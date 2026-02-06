import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface Plant {
  id: string;
  type: string;
  stage: number;
  health: number;
  lastWatered: number;
  emoji?: string;
}

interface NotificationSettings {
  enabled: boolean;
  healthThreshold: number; // Notify when health drops below this
  checkInterval: number; // Minutes between checks
  lastNotified: number; // Timestamp of last notification
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  healthThreshold: 50,
  checkInterval: 30, // 30 minutes
  lastNotified: 0,
};

const NOTIFICATION_COOLDOWN = 10 * 60 * 1000; // 10 minutes between notifications

export const useGardenNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dhyaan-garden-notifications');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // Silent fail for localStorage parse errors
      }
    }

    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('dhyaan-garden-notifications', JSON.stringify(settings));
  }, [settings]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled! 🔔');
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      } else if (result === 'denied') {
        toast.error('Notification permission denied');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Could not request notification permission');
      return false;
    }
  }, []);

  // Send a notification
  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    if (permission !== 'granted' || !settings.enabled) return;

    // Check cooldown
    const now = Date.now();
    if (now - settings.lastNotified < NOTIFICATION_COOLDOWN) {
      return; // Still in cooldown
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'garden-reminder',
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Update last notified time
      setSettings(prev => ({ ...prev, lastNotified: now }));
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [permission, settings.enabled, settings.lastNotified]);

  // Check plants and send notification if needed
  const checkPlantsHealth = useCallback((plants: Plant[]) => {
    if (!settings.enabled || permission !== 'granted') return;

    const unhealthyPlants = plants.filter(p => p.health < settings.healthThreshold);
    
    if (unhealthyPlants.length === 0) return;

    const plantNames = unhealthyPlants
      .slice(0, 3)
      .map(p => p.emoji || '🌱')
      .join(' ');
    
    const message = unhealthyPlants.length === 1
      ? `Your ${unhealthyPlants[0].type} needs water! Health: ${unhealthyPlants[0].health}%`
      : `${unhealthyPlants.length} plants need water! ${plantNames}`;

    sendNotification(
      '🌱 Garden Needs Attention',
      message,
      '/favicon.ico'
    );
  }, [settings.enabled, settings.healthThreshold, permission, sendNotification]);

  // Start periodic health checks
  const startHealthChecks = useCallback((getPlants: () => Plant[]) => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    if (!settings.enabled) return;

    // Check every interval
    checkIntervalRef.current = setInterval(() => {
      const plants = getPlants();
      checkPlantsHealth(plants);
    }, settings.checkInterval * 60 * 1000);

    // Also check immediately
    checkPlantsHealth(getPlants());
  }, [settings.enabled, settings.checkInterval, checkPlantsHealth]);

  // Stop health checks
  const stopHealthChecks = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (settings.enabled) {
      setSettings(prev => ({ ...prev, enabled: false }));
      stopHealthChecks();
      toast.success('Notifications disabled');
    } else {
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        toast.success('Notifications enabled! 🔔');
      } else {
        await requestPermission();
      }
    }
  }, [settings.enabled, permission, requestPermission, stopHealthChecks]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // Test notification
  const sendTestNotification = useCallback(() => {
    if (permission !== 'granted') {
      toast.error('Please enable notifications first');
      return;
    }
    
    sendNotification(
      '🌱 Test Notification',
      'Your garden notification system is working!',
      '/favicon.ico'
    );
    toast.success('Test notification sent!');
  }, [permission, sendNotification]);

  return {
    permission,
    settings,
    isSupported: 'Notification' in window,
    requestPermission,
    toggleNotifications,
    updateSettings,
    checkPlantsHealth,
    startHealthChecks,
    stopHealthChecks,
    sendTestNotification,
  };
};

export default useGardenNotifications;
