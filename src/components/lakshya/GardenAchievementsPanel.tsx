import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Lock, Sparkles, Star } from 'lucide-react';
import { GardenAchievement } from '@/hooks/useGardenAchievements';

interface GardenAchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: (GardenAchievement & { isUnlocked: boolean })[];
  stats: {
    unlocked: number;
    total: number;
    percentage: number;
    totalWaterUsed: number;
    totalKarmaEarned: number;
  };
}

const RARITY_COLORS = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-emerald-400 to-emerald-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-amber-400 to-orange-500',
};

const RARITY_BORDER = {
  common: 'border-slate-500/30',
  uncommon: 'border-emerald-500/30',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-amber-500/30',
};

const CATEGORY_NAMES = {
  growth: 'Growth',
  care: 'Care',
  seasonal: 'Seasonal',
  mastery: 'Mastery',
  special: 'Special',
};

const GardenAchievementsPanel = ({ isOpen, onClose, achievements, stats }: GardenAchievementsPanelProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['growth', 'care', 'seasonal', 'mastery', 'special'] as const;
  
  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;

  const unlockedFirst = [...filteredAchievements].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    return 0;
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="font-display text-lg text-foreground">Garden Achievements</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-3 bg-black/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground">{stats.unlocked} / {stats.total} Achievements</span>
              <span className="text-sm text-amber-400">{stats.percentage}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>💧 {stats.totalWaterUsed} drops used</span>
              <span>✨ {stats.totalKarmaEarned} Karma earned</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                {CATEGORY_NAMES[cat]}
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="p-4 overflow-y-auto max-h-[400px] space-y-3">
            {unlockedFirst.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  relative p-4 rounded-xl border transition-all
                  ${achievement.isUnlocked
                    ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}10 ${RARITY_BORDER[achievement.rarity]}`
                    : 'bg-white/5 border-white/10 opacity-60'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                    ${achievement.isUnlocked
                      ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}20`
                      : 'bg-white/10'
                    }
                  `}>
                    {achievement.isUnlocked ? (
                      achievement.emoji
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                    {achievement.isUnlocked && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1"
                      >
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </motion.div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${achievement.isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {achievement.name}
                      </h3>
                      <span className={`
                        px-2 py-0.5 rounded-full text-[10px] font-medium
                        bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white
                      `}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>

                {/* Unlock sparkle effect */}
                {achievement.isUnlocked && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-2 right-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-center text-muted-foreground">
              Keep growing your garden to unlock more achievements! 🌱
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GardenAchievementsPanel;
