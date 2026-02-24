import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface AartiReminder {
  id: string;
  name: string;
  time: string; // HH:MM format
  enabled: boolean;
  temple?: string;
}

interface AartiRemindersState {
  morningReminder: AartiReminder;
  eveningReminder: AartiReminder;
  customReminders: AartiReminder[];
  notificationsEnabled: boolean;
  permissionGranted: boolean;
}

const DEFAULT_STATE: AartiRemindersState = {
  morningReminder: {
    id: 'morning',
    name: 'Morning Aarati',
    time: '06:00',
    enabled: true,
    temple: 'All Temples'
  },
  eveningReminder: {
    id: 'evening',
    name: 'Evening Aarati',
    time: '19:00',
    enabled: true,
    temple: 'All Temples'
  },
  customReminders: [],
  notificationsEnabled: false,
  permissionGranted: false
};

const STORAGE_KEY = 'dhyaan_aarti_reminders';

export const useAartiReminders = () => {
  const [state, setState] = useState<AartiRemindersState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });

  const [lastNotificationTime, setLastNotificationTime] = useState<string | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setState(prev => ({
        ...prev,
        permissionGranted: Notification.permission === 'granted'
      }));
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in your browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      setState(prev => ({ ...prev, permissionGranted: true, notificationsEnabled: true }));
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Notifications are blocked. Please enable them in your browser settings.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setState(prev => ({ 
        ...prev, 
        permissionGranted: granted,
        notificationsEnabled: granted 
      }));
      
      if (granted) {
        toast.success('Notifications enabled! You will receive Aarati reminders.');
      } else {
        toast.error('Notification permission denied');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Show notification
  const showNotification = useCallback((reminder: AartiReminder) => {
    if (!state.notificationsEnabled || !state.permissionGranted) return;

    const notification = new Notification(`🪔 ${reminder.name}`, {
      body: `It's time for ${reminder.name}${reminder.temple ? ` at ${reminder.temple}` : ''}. Open Dhyaan for Live Darshan.`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: reminder.id,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, [state.notificationsEnabled, state.permissionGranted]);

  // Check for due reminders
  useEffect(() => {
    if (!state.notificationsEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = now.toDateString();

      // Prevent duplicate notifications within the same minute
      const notificationKey = `${today}_${currentTime}`;
      if (lastNotificationTime === notificationKey) return;

      const allReminders = [
        state.morningReminder,
        state.eveningReminder,
        ...state.customReminders
      ];

      allReminders.forEach(reminder => {
        if (reminder.enabled && reminder.time === currentTime) {
          showNotification(reminder);
          setLastNotificationTime(notificationKey);
        }
      });
    };

    // Check immediately and then every 30 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 30000);

    return () => clearInterval(interval);
  }, [state, showNotification, lastNotificationTime]);

  // Update morning reminder
  const updateMorningReminder = useCallback((updates: Partial<AartiReminder>) => {
    setState(prev => ({
      ...prev,
      morningReminder: { ...prev.morningReminder, ...updates }
    }));
  }, []);

  // Update evening reminder
  const updateEveningReminder = useCallback((updates: Partial<AartiReminder>) => {
    setState(prev => ({
      ...prev,
      eveningReminder: { ...prev.eveningReminder, ...updates }
    }));
  }, []);

  // Toggle notifications
  const toggleNotifications = useCallback(async (enabled: boolean) => {
    if (enabled && !state.permissionGranted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setState(prev => ({ ...prev, notificationsEnabled: enabled }));
  }, [state.permissionGranted, requestPermission]);

  // Add custom reminder
  const addCustomReminder = useCallback((reminder: Omit<AartiReminder, 'id'>) => {
    const newReminder: AartiReminder = {
      ...reminder,
      id: `custom_${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      customReminders: [...prev.customReminders, newReminder]
    }));
  }, []);

  // Remove custom reminder
  const removeCustomReminder = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      customReminders: prev.customReminders.filter(r => r.id !== id)
    }));
  }, []);

  // Test notification
  const testNotification = useCallback(() => {
    if (!state.permissionGranted) {
      toast.error('Please enable notifications first');
      return;
    }
    
    showNotification({
      id: 'test',
      name: 'Test Notification',
      time: '',
      enabled: true,
      temple: 'Dhyaan App'
    });
    
    toast.success('Test notification sent!');
  }, [state.permissionGranted, showNotification]);

  return {
    morningReminder: state.morningReminder,
    eveningReminder: state.eveningReminder,
    customReminders: state.customReminders,
    notificationsEnabled: state.notificationsEnabled,
    permissionGranted: state.permissionGranted,
    requestPermission,
    toggleNotifications,
    updateMorningReminder,
    updateEveningReminder,
    addCustomReminder,
    removeCustomReminder,
    testNotification
  };
};
