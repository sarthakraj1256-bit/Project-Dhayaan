import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { JapGoal } from '@/hooks/useJapBank';

const REMINDER_KEY = 'jap-goal-reminder-last';
const REMINDER_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours between reminders

function getDaysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function sendBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        tag: 'jap-goal-reminder',
      });
    } catch {
      // Fallback for environments where Notification constructor fails
    }
  }
}

export function useJapGoalReminders(goals: JapGoal[], isAuthenticated: boolean) {
  const checkAndRemind = useCallback(() => {
    if (!isAuthenticated || goals.length === 0) return;

    const lastReminder = localStorage.getItem(REMINDER_KEY);
    if (lastReminder && Date.now() - parseInt(lastReminder) < REMINDER_INTERVAL_MS) return;

    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length === 0) return;

    // Find urgent goals (deadline within 3 days)
    const urgentGoals = activeGoals.filter(g => {
      const days = getDaysUntil(g.deadline);
      return days !== null && days >= 0 && days <= 3;
    });

    // Find goals with low progress
    const behindGoals = activeGoals.filter(g => {
      const progress = g.current_count / g.target_count;
      const days = getDaysUntil(g.deadline);
      if (days === null) return progress < 0.1;
      // If more than halfway to deadline but less than 30% done
      const totalDays = (new Date(g.deadline!).getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const elapsed = totalDays - days;
      return totalDays > 0 && (elapsed / totalDays) > 0.5 && progress < 0.3;
    });

    let message = '';

    if (urgentGoals.length > 0) {
      const g = urgentGoals[0];
      const days = getDaysUntil(g.deadline);
      const remaining = g.target_count - g.current_count;
      message = `⏰ "${g.mantra_name}" goal — ${remaining.toLocaleString()} chants left, ${days === 0 ? 'due today!' : `${days} day${days === 1 ? '' : 's'} left!`}`;
    } else if (behindGoals.length > 0) {
      const g = behindGoals[0];
      const remaining = g.target_count - g.current_count;
      message = `📿 Keep going! ${remaining.toLocaleString()} "${g.mantra_name}" chants remaining for your goal.`;
    } else if (activeGoals.length > 0) {
      const totalRemaining = activeGoals.reduce((sum, g) => sum + (g.target_count - g.current_count), 0);
      message = `🙏 You have ${activeGoals.length} active jap goal${activeGoals.length > 1 ? 's' : ''} — ${totalRemaining.toLocaleString()} chants to go!`;
    }

    if (message) {
      localStorage.setItem(REMINDER_KEY, Date.now().toString());

      // In-app toast
      toast.info(message, { duration: 8000 });

      // Browser notification (if permitted)
      sendBrowserNotification('Jap Bank Reminder', message);
    }
  }, [goals, isAuthenticated]);

  // Request permission on mount & check reminders
  useEffect(() => {
    if (!isAuthenticated) return;
    requestNotificationPermission();
    // Small delay so page loads first
    const timeout = setTimeout(checkAndRemind, 3000);
    // Periodic check every 4 hours while app is open
    const interval = setInterval(checkAndRemind, REMINDER_INTERVAL_MS);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [isAuthenticated, checkAndRemind]);
}
