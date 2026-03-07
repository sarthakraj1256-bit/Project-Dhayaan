import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  frequency: number | null;
  getFrequencyData: () => Uint8Array;
}

const WaveformVisualizer = ({ isPlaying, frequency, getFrequencyData }: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = theme === 'dark';

    // Theme-adaptive colors
    const clearColor = isDark ? 'rgba(10, 6, 4, 0.1)' : 'rgba(242, 237, 232, 0.15)';
    const barGradientBottom = isDark ? 'rgba(201, 168, 76, 0.1)' : 'rgba(139, 105, 20, 0.08)';
    const barGradientMid = isDark ? 'rgba(201, 168, 76, 0.4)' : 'rgba(139, 105, 20, 0.3)';
    const barGradientTop = isDark ? 'rgba(201, 168, 76, 0.8)' : 'rgba(139, 105, 20, 0.7)';
    const waveStroke = isDark ? 'rgba(201, 168, 76, 0.6)' : 'rgba(139, 105, 20, 0.5)';
    const idleStroke = isDark ? 'rgba(201, 168, 76, 0.2)' : 'rgba(139, 105, 20, 0.15)';

    const draw = () => {
      const { width, height } = canvas;

      ctx.fillStyle = clearColor;
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        const frequencyData = getFrequencyData();
        const barCount = 64;
        const barWidth = width / barCount;
        const step = Math.floor(frequencyData.length / barCount);

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, barGradientBottom);
        gradient.addColorStop(0.5, barGradientMid);
        gradient.addColorStop(1, barGradientTop);

        ctx.fillStyle = gradient;

        for (let i = 0; i < barCount; i++) {
          const value = frequencyData[i * step] || 0;
          const barHeight = (value / 255) * height * 0.8;
          const x = i * barWidth;
          const y = height - barHeight;

          ctx.beginPath();
          ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.strokeStyle = waveStroke;
        ctx.lineWidth = 2;

        for (let i = 0; i < barCount; i++) {
          const value = frequencyData[i * step] || 0;
          const x = i * barWidth + barWidth / 2;
          const y = height / 2 + (value / 255 - 0.5) * height * 0.4;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      } else {
        const time = Date.now() * 0.001;
        ctx.beginPath();
        ctx.strokeStyle = idleStroke;
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin((x * 0.02) + time) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, getFrequencyData, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="relative w-full h-32 overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

      <canvas
        ref={canvasRef}
        className="w-full h-full no-theme-transition"
      />

      {isPlaying && frequency && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-display text-5xl md:text-7xl tracking-wider text-primary/20"
          >
            {frequency}Hz
          </motion.span>
        </motion.div>
      )}
    </div>
  );
};

export default WaveformVisualizer;
