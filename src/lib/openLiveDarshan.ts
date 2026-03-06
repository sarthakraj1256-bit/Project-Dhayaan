import type { LiveTemple } from '@/data/liveDarshanTemples';
import { toast } from '@/hooks/use-toast';

const isMobile = () => /iPhone|iPad|Android/i.test(navigator.userAgent);

export function openLiveDarshan(temple: LiveTemple) {
  // Show fallback toast with direct link
  toast({
    title: 'Opening YouTube…',
    description: "If it doesn't open, copy this link: " + temple.liveUrl,
    duration: 3000,
  });

  if (isMobile()) {
    // Try YouTube app via vnd.youtube:// scheme
    const appUrl = temple.liveUrl.replace('https://www.youtube.com', 'vnd.youtube://');
    window.location.href = appUrl;

    // Fallback to browser after 1.5s if app not installed
    setTimeout(() => {
      window.open(temple.liveUrl, '_blank', 'noopener,noreferrer');
    }, 1500);
  } else {
    // Desktop: open in new browser tab
    window.open(temple.liveUrl, '_blank', 'noopener,noreferrer');
  }
}
