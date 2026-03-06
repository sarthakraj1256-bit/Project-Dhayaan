import type { LiveTemple } from '@/data/liveDarshanTemples';
import { toast } from '@/hooks/use-toast';

const isMobile = () => /iPhone|iPad|Android/i.test(navigator.userAgent);

export function openLiveDarshan(temple: LiveTemple) {
  // Desktop: open directly in browser tab
  if (!isMobile()) {
    window.open(temple.liveUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // Mobile: prefer YouTube app via intent/deep link
  const appUrl = temple.liveUrl.replace('https://www.youtube.com', 'vnd.youtube://');
  const fallbackUrl = temple.liveUrl;

  let didFallback = false;

  const fallbackTimer = window.setTimeout(() => {
    if (document.visibilityState === 'visible' && !didFallback) {
      didFallback = true;
      window.location.href = fallbackUrl;
      toast({
        title: 'Opening YouTube…',
        description: "If it doesn't open, use the stream link below.",
        duration: 3000,
      });
    }
  }, 1500);

  window.location.href = appUrl;

  const clearOnHide = () => {
    if (document.visibilityState === 'hidden') {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', clearOnHide);
    }
  };

  document.addEventListener('visibilitychange', clearOnHide);
}
