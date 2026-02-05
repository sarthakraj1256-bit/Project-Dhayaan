import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Star } from 'lucide-react';
import { type SpiritualLevel } from '@/hooks/useSpiritualProgress';

interface LevelUpCelebrationProps {
  isVisible: boolean;
  newLevel: SpiritualLevel;
  onComplete: () => void;
}

const LEVEL_INFO: Record<SpiritualLevel, { 
  title: string; 
  sanskrit: string; 
  description: string;
  color: string;
  glow: string;
}> = {
  novice: {
    title: 'Novice',
    sanskrit: 'अभ्यासी',
    description: 'The journey begins',
    color: '#8B7355',
    glow: 'rgba(139, 115, 85, 0.5)',
  },
  seeker: {
    title: 'Seeker',
    sanskrit: 'साधक',
    description: 'Walking the path of discovery',
    color: '#4A90D9',
    glow: 'rgba(74, 144, 217, 0.5)',
  },
  yogi: {
    title: 'Yogi',
    sanskrit: 'योगी',
    description: 'Mastering the inner arts',
    color: '#9B59B6',
    glow: 'rgba(155, 89, 182, 0.5)',
  },
  sage: {
    title: 'Sage',
    sanskrit: 'ऋषि',
    description: 'Wisdom flows through you',
    color: '#F39C12',
    glow: 'rgba(243, 156, 18, 0.5)',
  },
  enlightened: {
    title: 'Enlightened',
    sanskrit: 'ज्ञानी',
    description: 'You have transcended',
    color: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.6)',
  },
};

// Golden particle component
const GoldenParticle = ({ delay, duration }: { delay: number; duration: number }) => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 100 + Math.random() * 200;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const size = 4 + Math.random() * 8;

  return (
    <motion.div
      initial={{ 
        x: 0, 
        y: 0, 
        scale: 0, 
        opacity: 1 
      }}
      animate={{ 
        x, 
        y, 
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
      }}
      transition={{ 
        duration, 
        delay, 
        ease: 'easeOut' 
      }}
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, #FFD700, #FFA500)`,
        boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
      }}
    />
  );
};

// Sparkling star component
const SparkStar = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0, rotate: 0 }}
    animate={{ 
      scale: [0, 1.2, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180],
    }}
    transition={{ 
      duration: 1.5, 
      delay, 
      ease: 'easeOut' 
    }}
    className="absolute"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
  </motion.div>
);

const LevelUpCelebration = ({ isVisible, newLevel, onComplete }: LevelUpCelebrationProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [showContent, setShowContent] = useState(false);
  const levelInfo = LEVEL_INFO[newLevel];

  // Play celebration sound
  useEffect(() => {
    if (!isVisible) return;

    // Delay content for dramatic effect
    const contentTimer = setTimeout(() => setShowContent(true), 500);

    // Play ascending celebration tones
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      // Play ascending chord
      const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.15 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 1.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 1.5);
      });
    } catch (error) {
      console.log('Audio not available');
    }

    // Auto-close after animation
    const closeTimer = setTimeout(onComplete, 5000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(closeTimer);
    };
  }, [isVisible, onComplete]);

  // Cleanup audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
  }));

  // Generate sparkle stars
  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: 0.3 + Math.random() * 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onComplete}
        >
          {/* Backdrop with radial glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
            style={{
              background: `radial-gradient(circle at center, ${levelInfo.glow} 0%, rgba(0,0,0,0.95) 70%)`,
            }}
          />

          {/* Sparkle stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {stars.map((star) => (
              <SparkStar key={star.id} delay={star.delay} x={star.x} y={star.y} />
            ))}
          </div>

          {/* Center content */}
          <div className="relative z-10 text-center">
            {/* Particle burst */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {particles.map((p) => (
                <GoldenParticle key={p.id} delay={p.delay} duration={p.duration} />
              ))}
            </div>

            {/* Level badge */}
            <AnimatePresence>
              {showContent && (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                    className="relative mx-auto mb-6"
                  >
                    {/* Outer ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-2 border-dashed"
                      style={{ 
                        borderColor: levelInfo.color,
                        width: '140%',
                        height: '140%',
                        left: '-20%',
                        top: '-20%',
                      }}
                    />
                    
                    {/* Glow effect */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${levelInfo.color}40, transparent)`,
                        width: '150%',
                        height: '150%',
                        left: '-25%',
                        top: '-25%',
                      }}
                    />

                    {/* Main badge */}
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${levelInfo.color}30, ${levelInfo.color}10)`,
                        border: `3px solid ${levelInfo.color}`,
                        boxShadow: `0 0 40px ${levelInfo.glow}, inset 0 0 20px ${levelInfo.glow}`,
                      }}
                    >
                      <Crown 
                        className="w-16 h-16" 
                        style={{ color: levelInfo.color }}
                      />
                    </div>
                  </motion.div>

                  {/* Text content */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm text-muted-foreground mb-2 tracking-widest uppercase">
                      Level Achieved
                    </p>
                    
                    <motion.h2
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.6 }}
                      className="font-display text-5xl mb-2"
                      style={{ color: levelInfo.color }}
                    >
                      {levelInfo.title}
                    </motion.h2>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="font-display text-2xl text-muted-foreground mb-4"
                    >
                      {levelInfo.sanskrit}
                    </motion.p>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-foreground/80 mb-8"
                    >
                      {levelInfo.description}
                    </motion.p>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onComplete}
                      className="px-8 py-3 rounded-full font-medium transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${levelInfo.color}30, ${levelInfo.color}10)`,
                        border: `1px solid ${levelInfo.color}50`,
                        color: levelInfo.color,
                      }}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Continue Journey
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpCelebration;
