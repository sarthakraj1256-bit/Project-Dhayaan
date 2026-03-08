import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Global capture — catches the event even before React mounts
declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent | null;
    __pwaInstallPromptCaptured?: boolean;
  }
}

// Self-executing: attach listener immediately on module load
if (typeof window !== 'undefined' && !window.__pwaInstallPromptCaptured) {
  window.__pwaInstallPromptCaptured = true;
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    window.__pwaInstallPrompt = e as BeforeInstallPromptEvent;
    console.log('🔔 PWA: beforeinstallprompt captured globally');
  });
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  install: () => Promise<boolean>;
  dismiss: () => void;
}

export const usePWAInstall = (): PWAInstallState => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => (typeof window !== 'undefined' ? window.__pwaInstallPrompt ?? null : null)
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check dismissed (reset after 3 days instead of 7 for better re-engagement)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 3 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }

    // Pick up globally captured prompt if we don't have one yet
    if (!deferredPrompt && window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      window.__pwaInstallPrompt = prompt;
      setDeferredPrompt(prompt);
      console.log('🔔 PWA: beforeinstallprompt received in hook');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaInstallPrompt = null;
      console.log('✅ PWA: App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone, deferredPrompt]);

  const install = useCallback(async (): Promise<boolean> => {
    const prompt = deferredPrompt || window.__pwaInstallPrompt;
    if (!prompt) {
      console.warn('⚠️ PWA: No install prompt available');
      return false;
    }

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        window.__pwaInstallPrompt = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA install error:', error);
      return false;
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  return {
    isInstallable: (!!deferredPrompt || !!window.__pwaInstallPrompt) && !isDismissed && !isInstalled,
    isInstalled,
    isIOS,
    isAndroid,
    isStandalone,
    install,
    dismiss,
  };
};
