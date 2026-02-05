import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface KarmaGainAnimationProps {
  isVisible: boolean;
  karmaGained: number;
  multiplier: number;
  bonusMessage?: string;
}

// Golden floating particle
const FloatingParticle = ({ delay, index }: { delay: number; index: number }) => {
  const angle = (index / 20) * Math.PI * 2;
  const distance = 60 + Math.random() * 100;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance - 50;
  const size = 3 + Math.random() * 6;

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
      animate={{ 
        x, 
        y: [0, y - 30, y],
        scale: [0, 1.2, 0],
        opacity: [0, 1, 0],
      }}
      transition={{ 
        duration: 1.5, 
        delay, 
        ease: 'easeOut',
      }}
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
      }}
    />
  );
};

const KarmaGainAnimation = ({ 
  isVisible, 
  karmaGained, 
  multiplier,
  bonusMessage,
}: KarmaGainAnimationProps) => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.3,
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 15 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="relative text-center">
            {/* Particle burst */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {particles.map((p) => (
                <FloatingParticle key={p.id} delay={p.delay} index={p.id} />
              ))}
            </div>

            {/* Glow backdrop */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0.4] }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.4), transparent)',
              }}
            />

            {/* Main karma number */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.4, repeat: 3 }}
              className="relative"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 8 }}
                className="text-7xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"
                style={{
                  textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
                }}
              >
                +{karmaGained}
              </motion.div>
              
              {/* Sparkle icon */}
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="absolute -top-4 -right-8"
              >
                <Sparkles className="w-8 h-8 text-amber-400" />
              </motion.div>
            </motion.div>

            {/* Karma label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-amber-400/90 mt-2"
            >
              Karma Points
            </motion.p>

            {/* Multiplier badge */}
            {multiplier > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-lg"
                >
                  ✨
                </motion.span>
                <span className="text-amber-300 font-medium">
                  {multiplier.toFixed(2)}x Multiplier Applied!
                </span>
              </motion.div>
            )}

            {/* Bonus message */}
            {bonusMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-3 text-sm text-primary/80"
              >
                {bonusMessage}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KarmaGainAnimation;
