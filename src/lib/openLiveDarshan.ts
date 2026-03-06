import type { LiveTemple } from '@/data/liveDarshanTemples';

const isMobile = () => /iPhone|iPad|Android/i.test(navigator.userAgent);

export function openLiveDarshan(temple: LiveTemple) {
  if (isMobile()) {
    // Try YouTube app deep link first
    const appUrl = temple.liveUrl.replace('https://www.', 'youtube://www.');
    window.location.href = appUrl;

    // Fallback to browser after a delay if app didn't open
    setTimeout(() => {
      window.open(temple.liveUrl, '_blank', 'noopener,noreferrer');
    }, 1500);
  } else {
    window.open(temple.liveUrl, '_blank', 'noopener,noreferrer');
  }
}
