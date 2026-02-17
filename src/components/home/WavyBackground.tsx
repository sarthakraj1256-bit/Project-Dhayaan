import { useRef, useEffect } from 'react';

/**
 * Canvas-based parallax background — zero React re-renders on scroll.
 * Uses requestAnimationFrame + CSS will-change for GPU compositing.
 * Respects prefers-reduced-motion.
 */
export default function WavyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const drawWave = (
      y: number,
      amplitude: number,
      frequency: number,
      phase: number,
      color: string,
      opacity: number,
      fill: 'up' | 'down',
      w: number,
      h: number,
    ) => {
      ctx.beginPath();
      if (fill === 'down') {
        ctx.moveTo(0, 0);
        for (let x = 0; x <= w; x += 4) {
          const py = y + Math.sin((x * frequency) / w + phase) * amplitude;
          ctx.lineTo(x, py);
        }
        ctx.lineTo(w, 0);
      } else {
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const py = y + Math.sin((x * frequency) / w + phase) * amplitude;
          ctx.lineTo(x, py);
        }
        ctx.lineTo(w, h);
      }
      ctx.closePath();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const sy = prefersReducedMotion ? 0 : scrollRef.current;

      // Clear
      ctx.fillStyle = '#0B1D3A';
      ctx.fillRect(0, 0, w, h);

      // Top layers — slide down with negative parallax
      drawWave(h * 0.28 + sy * -0.04, 60, 6, 0.5, '#0F2847', 1, 'down', w, h);
      drawWave(h * 0.20 + sy * -0.06, 50, 5, 1.2, '#2DD4BF', 0.85, 'down', w, h);
      drawWave(h * 0.13 + sy * -0.07, 35, 7, 2.0, '#99F6E4', 0.7, 'down', w, h);

      // Bottom layers — slide up with positive parallax
      drawWave(h * 0.68 + sy * 0.04, 55, 5, 3.5, '#F87171', 0.5, 'up', w, h);
      drawWave(h * 0.75 + sy * 0.06, 40, 6, 4.2, '#FBBF24', 0.28, 'up', w, h);
      drawWave(h * 0.82 + sy * 0.07, 35, 7, 5.0, '#FB923C', 0.35, 'up', w, h);

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  );
}
