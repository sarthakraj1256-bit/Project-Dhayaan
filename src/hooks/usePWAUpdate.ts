import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface PWAUpdateState {
  needsRefresh: boolean;
  updateServiceWorker: () => void;
}

/**
 * Custom hook to handle PWA service worker updates with automatic refresh.
 * Detects when a new version is available and forces an immediate update.
 */
export const usePWAUpdate = (): PWAUpdateState => {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const updateServiceWorker = useCallback(() => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting and activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  useEffect(() => {
    // Only run in production with service worker support
    if (!('serviceWorker' in navigator) || import.meta.env.DEV) {
      return;
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        
        setRegistration(reg);

        // Check for updates immediately
        reg.update();

        // Listen for new service worker installation
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            // New service worker is installed and waiting
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setNeedsRefresh(true);
              
              // Show toast notification
              toast.info('New version available! Refreshing...', {
                id: 'pwa-update',
                duration: 2000,
                icon: '🔄',
              });

              // Auto-refresh after a short delay for smooth UX
              setTimeout(() => {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }, 1500);
            }
          });
        });

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Reload the page to get the new version
          window.location.reload();
        });

        // Check for updates periodically (every 60 seconds)
        const updateInterval = setInterval(() => {
          reg.update();
        }, 60 * 1000);

        return () => clearInterval(updateInterval);
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    registerSW();
  }, []);

  return { needsRefresh, updateServiceWorker };
};

/**
 * Register service worker with immediate update behavior.
 * Call this in main.tsx for automatic PWA updates.
 */
export const registerServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Don't register in development - sw.js doesn't exist
  if (import.meta.env.DEV) {
    return;
  }

  // Wait for window load to not block initial render
  if (document.readyState === 'complete') {
    await initSW();
  } else {
    window.addEventListener('load', initSW);
  }
};

async function initSW(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Immediate check for updates
    registration.update();

    // Handle update found
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New update available - show notification and refresh
            // New PWA version available
            
            toast.info('New version available! Refreshing...', {
              id: 'pwa-update',
              duration: 2000,
              icon: '🔄',
            });

            // Force skip waiting after brief delay
            setTimeout(() => {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }, 1500);
          } else {
            // First install - content cached
            // PWA cached for offline use
          }
        }
      });
    });

    // Reload page when new SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    console.log('✅ Service worker registered');
  } catch (error) {
    console.error('❌ Service worker registration failed:', error);
  }
}
