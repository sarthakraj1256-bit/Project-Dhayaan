import { useRef, useEffect, useState, useCallback } from 'react';

const INTRO_FLAG = '__hasPlayedHomepageIntro';

export default function WavyBackground() {
  const [animate, setAnimate] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const played = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (played.current) return;
    played.current = true;

    if (sessionStorage.getItem(INTRO_FLAG)) return;

    setAnimate(true);
    sessionStorage.setItem(INTRO_FLAG, '1');
  }, []);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setScrollY(window.scrollY);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const parallax = (speed: number): React.CSSProperties => ({
    transform: `translateY(${scrollY * speed}px)`,
  });

  const topStyle = (delay = 0): React.CSSProperties =>
    animate
      ? {
          animation: `slideDown 1100ms ease-in-out ${delay}ms both`,
        }
      : {};

  const bottomStyle = (delay = 0): React.CSSProperties =>
    animate
      ? {
          animation: `slideUp 1100ms ease-in-out ${delay}ms both`,
        }
      : {};

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-110%); }
          to   { transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(110%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base — deep midnight blue */}
        <div className="absolute inset-0" style={{ background: '#0B1D3A' }} />

        {/* Layer 1 — Deep dark-blue band (top-left sweep) */}
        <svg
          className="absolute top-0 left-0 w-full"
          viewBox="0 0 1440 700"
          preserveAspectRatio="none"
          style={{ height: '65vh', ...topStyle(0), ...parallax(-0.04) }}
        >
          <path
            d="M0,0 L1440,0 L1440,180 C1200,320 900,380 600,300 C300,220 120,350 0,280 Z"
            fill="#0F2847"
          />
        </svg>

        {/* Layer 2 — Teal ribbon over blue */}
        <svg
          className="absolute top-0 left-0 w-full"
          viewBox="0 0 1440 700"
          preserveAspectRatio="none"
          style={{ height: '60vh', ...topStyle(0), ...parallax(-0.06) }}
        >
          <path
            d="M0,0 L1440,0 L1440,120 C1100,260 800,200 500,260 C200,320 60,200 0,240 Z"
            fill="#2DD4BF"
          />
        </svg>

        {/* Layer 3 — Mint panel sliding from top */}
        <svg
          className="absolute top-0 left-0 w-full"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          style={{ height: '42vh', ...topStyle(0), ...parallax(-0.07) }}
        >
          <path
            d="M0,0 L1440,0 L1440,80 C1200,180 960,140 720,180 C480,220 240,140 0,190 Z"
            fill="#99F6E4"
          />
        </svg>

        {/* Layer 3.5 — Solid dark blue mid-section */}
        <div
          className="absolute left-0 w-full"
          style={{
            top: '30vh',
            height: '40vh',
            background: '#0B1D3A',
          }}
        />

        {/* Layer 4 — Coral / peach band (bottom sweep) */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          style={{ height: '50vh', ...bottomStyle(0), ...parallax(0.04) }}
        >
          <path
            d="M0,600 L1440,600 L1440,360 C1200,260 960,340 720,280 C480,220 240,310 0,260 Z"
            fill="#F87171"
            opacity="0.55"
          />
        </svg>

        {/* Layer 5 — Peach ribbon above coral */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 500"
          preserveAspectRatio="none"
          style={{ height: '40vh', ...bottomStyle(0), ...parallax(0.06) }}
        >
          <path
            d="M0,500 L1440,500 L1440,340 C1100,250 800,320 500,280 C200,240 80,310 0,300 Z"
            fill="#FBBF24"
            opacity="0.3"
          />
        </svg>

        {/* Layer 6 — Soft coral/peach bottom edge */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          style={{ height: '32vh', ...bottomStyle(0), ...parallax(0.07) }}
        >
          <path
            d="M0,400 L1440,400 L1440,280 C1200,200 900,300 600,240 C300,180 100,260 0,220 Z"
            fill="#FB923C"
            opacity="0.4"
          />
        </svg>
      </div>
    </>
  );
}
