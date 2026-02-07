import { useCallback, useMemo } from 'react';

// Vibration patterns for different feedback types (in milliseconds)
const HAPTIC_PATTERNS: Record<string, number[]> = {
  // Light tap - quick single vibration
  light: [10],
  // Medium tap - slightly longer vibration
  medium: [20],
  // Heavy/strong tap - more pronounced
  heavy: [30],
  // Success - two quick pulses
  success: [10, 50, 10],
  // Warning - three quick pulses
  warning: [15, 30, 15, 30, 15],
  // Error - longer buzz
  error: [50, 30, 50],
  // Selection change - very subtle
  selection: [5],
  // Impact - sharp tap
  impact: [15],
  // Notification - attention-grabbing pattern
  notification: [20, 100, 20, 100, 40],
  // Toggle on
  toggleOn: [10, 30, 20],
  // Toggle off
  toggleOff: [20],
  // Swipe complete
  swipe: [5, 20, 10],
  // Long press activated
  longPress: [40],
  // Button press
  button: [12],
  // Slider tick
  tick: [3],
};

export type HapticType = keyof typeof HAPTIC_PATTERNS;

interface HapticFeedbackOptions {
  enabled?: boolean;
  respectUserPreference?: boolean;
}

interface HapticFeedbackResult {
  trigger: (type?: HapticType) => void;
  isSupported: boolean;
  isEnabled: boolean;
  triggerLight: () => void;
  triggerMedium: () => void;
  triggerHeavy: () => void;
  triggerSuccess: () => void;
  triggerError: () => void;
  triggerSelection: () => void;
  triggerButton: () => void;
  triggerToggle: (isOn: boolean) => void;
}

/**
 * Hook for providing haptic feedback on touch interactions
 * Uses the Web Vibration API (supported on most Android browsers, limited iOS support)
 */
export function useHapticFeedback(
  options: HapticFeedbackOptions = {}
): HapticFeedbackResult {
  const { enabled = true, respectUserPreference = true } = options;

  // Check if Vibration API is supported
  const isSupported = useMemo(() => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }, []);

  // Check if user prefers reduced motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Determine if haptic feedback should be active
  const isEnabled = useMemo(() => {
    if (!isSupported) return false;
    if (!enabled) return false;
    if (respectUserPreference && prefersReducedMotion) return false;
    return true;
  }, [isSupported, enabled, respectUserPreference, prefersReducedMotion]);

  // Main trigger function
  const trigger = useCallback(
    (type: HapticType = 'light') => {
      if (!isEnabled) return;

      try {
        const pattern = HAPTIC_PATTERNS[type];
        navigator.vibrate(pattern);
      } catch (error) {
        // Silently fail - haptic feedback is not critical
        if (import.meta.env.DEV) {
          console.warn('Haptic feedback failed:', error);
        }
      }
    },
    [isEnabled]
  );

  // Convenience methods for common feedback types
  const triggerLight = useCallback(() => trigger('light'), [trigger]);
  const triggerMedium = useCallback(() => trigger('medium'), [trigger]);
  const triggerHeavy = useCallback(() => trigger('heavy'), [trigger]);
  const triggerSuccess = useCallback(() => trigger('success'), [trigger]);
  const triggerError = useCallback(() => trigger('error'), [trigger]);
  const triggerSelection = useCallback(() => trigger('selection'), [trigger]);
  const triggerButton = useCallback(() => trigger('button'), [trigger]);
  
  const triggerToggle = useCallback(
    (isOn: boolean) => trigger(isOn ? 'toggleOn' : 'toggleOff'),
    [trigger]
  );

  return {
    trigger,
    isSupported,
    isEnabled,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerError,
    triggerSelection,
    triggerButton,
    triggerToggle,
  };
}

/**
 * Standalone function for triggering haptic feedback without a hook
 * Useful for event handlers outside of React components
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  try {
    const pattern = HAPTIC_PATTERNS[type];
    navigator.vibrate(pattern);
  } catch {
    // Silently fail
  }
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch {
      // Silently fail
    }
  }
}

export default useHapticFeedback;
