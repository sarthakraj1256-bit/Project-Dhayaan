import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PWASplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export const PWASplashScreen = ({ 
  onComplete, 
  minDisplayTime = 2000 
}: PWASplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA (standalone mode)
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    // Only show splash for standalone PWA
    if (!standalone) {
      setIsVisible(false);
      onComplete?.();
      return;
    }

    // Hide splash after animation completes
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onComplete]);

  if (!isStandalone) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(240 10% 4%), hsl(240 10% 8%))',
          }}
        >
          {/* Sacred geometry background pattern */}
          <div className="absolute inset-0 sacred-pattern opacity-20" />
          
          {/* Animated circles */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.3, 0.1] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--gold) / 0.3), transparent)',
            }}
          />
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 1.8], opacity: [0, 0.2, 0.05] }}
            transition={{ duration: 1.8, delay: 0.2, ease: 'easeOut' }}
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--gold) / 0.2), transparent)',
            }}
          />

          {/* Main content */}
          <div className="relative flex flex-col items-center">
            {/* Om symbol with glow */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.34, 1.56, 0.64, 1] // Spring-like
              }}
              className="relative mb-8"
            >
              {/* Glow effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
                className="absolute inset-0 blur-2xl"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--gold) / 0.6), transparent)',
                }}
              />
              
              {/* Om symbol container */}
              <motion.div
                animate={{ 
                  rotateY: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
                className="relative w-28 h-28 flex items-center justify-center rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))',
                  border: '2px solid hsl(var(--gold) / 0.3)',
                  boxShadow: '0 0 60px hsl(var(--gold) / 0.3), inset 0 0 30px hsl(var(--gold) / 0.1)',
                }}
              >
                <span className="text-6xl" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--gold) / 0.5))' }}>
                  🕉️
                </span>
              </motion.div>
            </motion.div>

            {/* App name with staggered letters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-1"
            >
              {'DHYAAN'.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.4 + i * 0.08, 
                    duration: 0.4,
                    ease: 'easeOut'
                  }}
                  className="font-display text-4xl tracking-[0.3em] text-gold"
                  style={{
                    textShadow: '0 0 20px hsl(var(--gold) / 0.5)',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-4 font-body text-sm tracking-[0.2em] text-muted-foreground uppercase"
            >
              The Science of Silence
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
              className="mt-12 w-32 h-0.5 rounded-full overflow-hidden"
              style={{
                background: 'hsl(var(--gold) / 0.2)',
              }}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                  repeatDelay: 0.2
                }}
                className="h-full w-1/2 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)',
                }}
              />
            </motion.div>
          </div>

          {/* Bottom decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-12 flex items-center gap-4"
          >
            <span className="text-gold/30">◆</span>
            <span className="text-gold/50">◆</span>
            <span className="text-gold/30">◆</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
