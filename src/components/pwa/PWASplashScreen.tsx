import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dhyaanLogo from '@/assets/dhyaan-logo.png';

interface PWASplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export const PWASplashScreen = ({ 
  onComplete, 
  minDisplayTime = 2500 
}: PWASplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    if (!standalone) {
      setIsVisible(false);
      onComplete?.();
      return;
    }

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, hsl(36 35% 96%) 0%, hsl(34 30% 93%) 40%, hsl(32 28% 91%) 70%, hsl(35 32% 94%) 100%)',
          }}
        >
          {/* Ultra-soft radial warmth — center glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 45%, hsl(35 50% 75% / 0.12), transparent)',
            }}
          />

          {/* Main content */}
          <div className="relative flex flex-col items-center">
            {/* Logo with breathing aura */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 1.4, 
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.3,
              }}
              className="relative mb-10"
            >
              {/* Breathing aura — very subtle */}
              <motion.div
                animate={{ 
                  scale: [1, 1.08, 1],
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                }}
                className="absolute inset-[-32px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(35 45% 65% / 0.2), hsl(35 40% 70% / 0.05) 60%, transparent 80%)',
                }}
              />
              
              {/* Logo — clean, no container */}
              <img 
                src={dhyaanLogo} 
                alt="Dhyaan" 
                className="w-24 h-24 object-contain relative"
                style={{
                  filter: 'drop-shadow(0 2px 12px hsl(35 40% 55% / 0.15))',
                }}
              />
            </motion.div>

            {/* App name — gentle fade */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1, ease: 'easeOut' }}
              className="font-display text-3xl tracking-[0.35em] uppercase"
              style={{
                color: 'hsl(35 40% 38%)',
                letterSpacing: '0.35em',
              }}
            >
              Dhyaan
            </motion.h1>

            {/* Tagline — softest fade */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1.2, ease: 'easeOut' }}
              className="mt-3 font-body text-xs tracking-[0.25em] uppercase"
              style={{ color: 'hsl(35 20% 58%)' }}
            >
              The Science of Silence
            </motion.p>

            {/* Minimal loading indicator — subtle breathing dot */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="mt-14"
            >
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'hsl(35 45% 60%)',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
