import { useRef, useEffect } from 'react';

/**
 * Theme-aware spiritual background — soft warm gradient with subtle golden curves.
 * Adapts to light/dark mode by reading the current theme class.
 * Only redraws on scroll/resize/theme-change (no continuous RAF loop).
 * Respects prefers-reduced-motion.
 */
export default function WavyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const scheduledRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let dpr = 1;

    const isDark = () => document.documentElement.classList.contains('dark');

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const drawWave = (
      y: number, amplitude: number, frequency: number, phase: number,
      color: string, opacity: number, fill: 'up' | 'down', w: number, h: number,
    ) => {
      ctx.beginPath();
      const step = 6;
      if (fill === 'down') {
        ctx.moveTo(0, 0);
        for (let x = 0; x <= w; x += step) {
          ctx.lineTo(x, y + Math.sin((x * frequency) / w + phase) * amplitude);
        }
        ctx.lineTo(w, 0);
      } else {
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += step) {
          ctx.lineTo(x, y + Math.sin((x * frequency) / w + phase) * amplitude);
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
      scheduledRef.current = false;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const sy = prefersReducedMotion ? 0 : scrollRef.current;
      const dark = isDark();

      // Background fill
      ctx.fillStyle = dark ? '#1C1714' : '#FAF6F0';
      ctx.fillRect(0, 0, w, h);

      // Wave colors adapted by theme
      if (dark) {
        drawWave(h * 0.22 + sy * -0.03, 40, 5, 0.5, '#2A2118', 0.6, 'down', w, h);
        drawWave(h * 0.16 + sy * -0.04, 30, 6, 1.2, '#231C14', 0.4, 'down', w, h);
      } else {
        drawWave(h * 0.22 + sy * -0.03, 40, 5, 0.5, '#F5EDE0', 0.6, 'down', w, h);
        drawWave(h * 0.16 + sy * -0.04, 30, 6, 1.2, '#EDE4D3', 0.4, 'down', w, h);
      }

      // Radial gold glow
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.6);
      const glowAlpha = dark ? 0.08 : 0.06;
      grd.addColorStop(0, `rgba(212, 175, 55, ${glowAlpha})`);
      grd.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      if (dark) {
        drawWave(h * 0.75 + sy * 0.03, 35, 5, 3.0, '#251E16', 0.35, 'up', w, h);
        drawWave(h * 0.82 + sy * 0.04, 25, 6, 4.0, '#201A12', 0.25, 'up', w, h);
      } else {
        drawWave(h * 0.75 + sy * 0.03, 35, 5, 3.0, '#F0E6D6', 0.35, 'up', w, h);
        drawWave(h * 0.82 + sy * 0.04, 25, 6, 4.0, '#E8DCC8', 0.25, 'up', w, h);
      }
    };

    const scheduleRedraw = () => {
      if (!scheduledRef.current) {
        scheduledRef.current = true;
        requestAnimationFrame(draw);
      }
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
      scheduleRedraw();
    };

    // Watch for theme changes via MutationObserver on <html> class
    const observer = new MutationObserver(() => scheduleRedraw());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
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
