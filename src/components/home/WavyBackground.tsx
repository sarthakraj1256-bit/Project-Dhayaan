import { useRef, useEffect } from 'react';

/**
 * Light spiritual background — soft warm gradient with subtle golden curves.
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

      // Warm cream base
      ctx.fillStyle = '#FAF6F0';
      ctx.fillRect(0, 0, w, h);

      // Soft warm beige top waves
      drawWave(h * 0.22 + sy * -0.03, 40, 5, 0.5, '#F5EDE0', 0.6, 'down', w, h);
      drawWave(h * 0.16 + sy * -0.04, 30, 6, 1.2, '#EDE4D3', 0.4, 'down', w, h);

      // Subtle golden glow — radial center
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.6);
      grd.addColorStop(0, 'rgba(212, 175, 55, 0.06)');
      grd.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Bottom warm waves
      drawWave(h * 0.75 + sy * 0.03, 35, 5, 3.0, '#F0E6D6', 0.35, 'up', w, h);
      drawWave(h * 0.82 + sy * 0.04, 25, 6, 4.0, '#E8DCC8', 0.25, 'up', w, h);

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
