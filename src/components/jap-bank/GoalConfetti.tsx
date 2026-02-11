import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CONFETTI_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--gold))',
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A855F7',
  '#FB923C',
];

const EMOJIS = ['🎯', '🙏', '🔥', '✨', '🕉️', '📿', '🪔', '💫'];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  emoji: string | null;
  rotation: number;
  scale: number;
  delay: number;
}

const GoalConfetti = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [message, setMessage] = useState('');

  const triggerConfetti = useCallback((detail?: { mantraName?: string }) => {
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 80,
      y: Math.random() * 30 + 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      emoji: i < 8 ? EMOJIS[i] : null,
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.6,
      delay: Math.random() * 0.4,
    }));
    setParticles(newParticles);
    setMessage(detail?.mantraName ? `🎯 ${detail.mantraName} Goal Complete!` : '🎯 Goal Complete!');
    setTimeout(() => { setParticles([]); setMessage(''); }, 3500);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => triggerConfetti((e as CustomEvent).detail);
    window.addEventListener('jap-goal-complete', handler);
    return () => window.removeEventListener('jap-goal-complete', handler);
  }, [triggerConfetti]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-primary/30 rounded-2xl px-6 py-4 shadow-lg"
          >
            <p className="text-lg font-bold text-primary font-[Cinzel] text-center whitespace-nowrap">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: '50vw', y: '40vh', opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: `${p.x}vw`,
            y: `${p.y + 80}vh`,
            opacity: 0,
            scale: p.scale,
            rotate: p.rotation,
          }}
          transition={{ duration: 2.5, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute text-lg"
          style={{ color: p.color }}
        >
          {p.emoji ? (
            <span className="text-2xl">{p.emoji}</span>
          ) : (
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: p.color }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default GoalConfetti;
