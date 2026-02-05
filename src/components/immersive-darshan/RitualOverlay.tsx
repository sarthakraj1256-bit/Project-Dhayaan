import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Bell, Flower2, Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RitualOverlayProps {
  ritualType: 'diya' | 'bell' | 'flower' | 'prasad' | null;
  onComplete: () => void;
  onRingBell: () => void;
}

const RitualOverlay = ({ ritualType, onComplete, onRingBell }: RitualOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!ritualType) return;
    
    setProgress(0);
    setIsComplete(false);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [ritualType]);

  useEffect(() => {
    if (ritualType === 'bell') {
      onRingBell();
    }
  }, [ritualType, onRingBell]);

  const ritualConfig = {
    diya: {
      icon: Flame,
      title: 'Lighting the Sacred Diya',
      titleHindi: 'पवित्र दीया प्रज्वलित',
      color: 'from-orange-500 to-yellow-400',
      message: 'May this light dispel all darkness 🪔'
    },
    bell: {
      icon: Bell,
      title: 'Ringing the Temple Bell',
      titleHindi: 'मंदिर की घंटी',
      color: 'from-yellow-500 to-amber-400',
      message: 'The divine sound awakens consciousness 🔔'
    },
    flower: {
      icon: Flower2,
      title: 'Offering Sacred Flowers',
      titleHindi: 'पुष्प अर्पण',
      color: 'from-pink-500 to-rose-400',
      message: 'With devotion, we offer these flowers 🌸'
    },
    prasad: {
      icon: Gift,
      title: 'Offering Prasad',
      titleHindi: 'प्रसाद अर्पण',
      color: 'from-green-500 to-emerald-400',
      message: 'May this offering be accepted with grace 🙏'
    }
  };

  if (!ritualType) return null;

  const config = ritualConfig[ritualType];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={() => isComplete && onComplete()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-md mx-4 p-8 rounded-3xl bg-gradient-to-br from-black/90 to-black/70 border border-primary/30"
          onClick={e => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onComplete}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="text-center space-y-6">
            {/* Animated Icon */}
            <motion.div
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}
              animate={isComplete ? { scale: [1, 1.1, 1] } : { scale: [1, 1.05, 1] }}
              transition={{ repeat: isComplete ? 0 : Infinity, duration: 1.5 }}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Title */}
            <div>
              <h2 className="text-xl font-display text-white">{config.title}</h2>
              <p className="text-sm text-primary mt-1">{config.titleHindi}</p>
            </div>

            {/* Progress */}
            {!isComplete && (
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${config.color}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Completion Message */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-white/80">{config.message}</p>
                <Button onClick={onComplete} className="bg-gradient-to-r from-primary to-orange-500">
                  Continue Darshan
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RitualOverlay;
