import { useState, useEffect, useCallback } from 'react';

interface PWASplashState {
  showSplash: boolean;
  isStandalone: boolean;
  completeSplash: () => void;
}

export const usePWASplash = (minDisplayTime = 2000): PWASplashState => {
  const [showSplash, setShowSplash] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect standalone/PWA mode
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    // Only show splash for PWA launches
    if (!standalone) {
      setShowSplash(false);
      return;
    }

    // Check if we've already shown splash this session
    const splashShown = sessionStorage.getItem('pwa-splash-shown');
    if (splashShown) {
      setShowSplash(false);
      return;
    }

    // Auto-hide after minimum display time
    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('pwa-splash-shown', 'true');
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  const completeSplash = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('pwa-splash-shown', 'true');
  }, []);

  return {
    showSplash: showSplash && isStandalone,
    isStandalone,
    completeSplash,
  };
};
