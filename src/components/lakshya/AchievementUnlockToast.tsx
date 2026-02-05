import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star } from 'lucide-react';
import { GardenAchievement } from '@/hooks/useGardenAchievements';

interface AchievementUnlockToastProps {
  achievement: GardenAchievement | null;
  onClose: () => void;
}

const RARITY_COLORS = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-emerald-400 to-emerald-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-amber-400 to-orange-500',
};

const AchievementUnlockToast = ({ achievement, onClose }: AchievementUnlockToastProps) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto"
          onClick={onClose}
        >
          <div className={`
            relative px-6 py-4 rounded-2xl border shadow-2xl cursor-pointer
            bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-amber-500/30
          `}>
            {/* Glow effect */}
            <motion.div
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl"
            />

            {/* Content */}
            <div className="relative flex items-center gap-4">
              {/* Trophy icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-3xl
                  bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}20
                  border ${achievement.rarity === 'legendary' ? 'border-amber-500/50' : 'border-white/10'}
                `}>
                  {achievement.emoji}
                </div>
              </motion.div>

              {/* Text */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">Achievement Unlocked!</span>
                </div>
                <h3 className="font-display text-lg text-foreground">{achievement.name}</h3>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>

              {/* Sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
              </motion.div>

              {/* Rarity badge */}
              <div className="absolute -bottom-2 right-4">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white shadow-lg
                `}>
                  {achievement.rarity}
                </span>
              </div>
            </div>

            {/* Particle effects */}
            {achievement.rarity === 'legendary' && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 10)],
                      y: [0, -20 - i * 5],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="absolute top-1/2 left-1/2"
                  >
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementUnlockToast;
