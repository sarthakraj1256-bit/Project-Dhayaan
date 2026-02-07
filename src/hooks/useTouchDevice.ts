import { useState, useEffect } from 'react';

interface TouchDeviceInfo {
  isTouchDevice: boolean;
  isCoarsePointer: boolean;
  hasHover: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isPortrait: boolean;
  hasSafeAreaInsets: boolean;
}

export function useTouchDevice(): TouchDeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<TouchDeviceInfo>({
    isTouchDevice: false,
    isCoarsePointer: false,
    hasHover: true,
    isMobile: false,
    isTablet: false,
    isPortrait: false,
    hasSafeAreaInsets: false,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      
      // Check for safe area insets (notched devices)
      const hasSafeAreaInsets = CSS.supports('padding-bottom: env(safe-area-inset-bottom)') &&
        getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') !== '';

      setDeviceInfo({
        isTouchDevice,
        isCoarsePointer,
        hasHover,
        isMobile,
        isTablet,
        isPortrait,
        hasSafeAreaInsets,
      });
    };

    updateDeviceInfo();

    // Update on resize and orientation change
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

export default useTouchDevice;
