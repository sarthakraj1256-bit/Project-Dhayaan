import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dhyaanLogo from '@/assets/dhyaan-logo.png';

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
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(30 30% 96%), hsl(35 25% 93%))',
          }}
        >
          {/* Soft radial glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.4, 0.15] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(35 70% 55% / 0.25), transparent)',
            }}
          />

          {/* Main content */}
          <div className="relative flex flex-col items-center">
            {/* 3D rotating logo */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ 
                duration: 1, 
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="relative mb-8"
              style={{ perspective: '800px' }}
            >
              {/* Glow behind logo */}
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-[-20px] blur-2xl rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(35 70% 55% / 0.4), transparent)',
                }}
              />
              
              {/* 3D spinning logo */}
              <motion.div
                animate={{ 
                  rotateY: [0, 360],
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: 'linear',
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img 
                  src={dhyaanLogo} 
                  alt="Dhyaan" 
                  className="w-28 h-28 object-contain drop-shadow-lg"
                  style={{
                    filter: 'drop-shadow(0 0 20px hsl(35 70% 55% / 0.3))',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* App name */}
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
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                  className="font-display text-4xl tracking-[0.3em]"
                  style={{
                    color: 'hsl(35 55% 45%)',
                    textShadow: '0 0 20px hsl(35 70% 55% / 0.3)',
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
              className="mt-4 font-body text-sm tracking-[0.2em] uppercase"
              style={{ color: 'hsl(35 20% 55%)' }}
            >
              The Science of Silence
            </motion.p>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
              className="mt-12 w-32 h-0.5 rounded-full overflow-hidden"
              style={{ background: 'hsl(35 40% 80%)' }}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.2 }}
                className="h-full w-1/2 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(35 70% 55%), transparent)',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
