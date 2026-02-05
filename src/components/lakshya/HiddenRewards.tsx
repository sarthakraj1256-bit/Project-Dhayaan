import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Lock, Sparkles, Eye, Music, Palette, Star } from 'lucide-react';

interface HiddenReward {
  id: string;
  name: string;
  description: string;
  type: 'environment' | 'sound' | 'mantra' | 'secret';
  icon: React.ReactNode;
  unlockCondition: string;
  karmaRequired: number;
  isSecret: boolean;
  rarity: 'common' | 'rare' | 'legendary';
}

const HIDDEN_REWARDS: HiddenReward[] = [
  {
    id: 'cosmic_void',
    name: 'Cosmic Void',
    description: 'A deep space meditation environment',
    type: 'environment',
    icon: <Palette className="w-5 h-5" />,
    unlockCondition: 'Start your journey',
    karmaRequired: 0,
    isSecret: false,
    rarity: 'common',
  },
  {
    id: 'temple_dawn',
    name: 'Temple at Dawn',
    description: 'Sacred temple bathed in golden sunrise light',
    type: 'environment',
    icon: <Palette className="w-5 h-5" />,
    unlockCondition: 'Reach 250 Karma',
    karmaRequired: 250,
    isSecret: false,
    rarity: 'common',
  },
  {
    id: 'himalayan_peaks',
    name: 'Himalayan Peaks',
    description: 'Meditate among the sacred mountains',
    type: 'environment',
    icon: <Palette className="w-5 h-5" />,
    unlockCondition: 'Reach 1000 Karma',
    karmaRequired: 1000,
    isSecret: false,
    rarity: 'rare',
  },
  {
    id: 'ancient_bells',
    name: 'Ancient Temple Bells',
    description: 'Sacred bell resonance from ancient times',
    type: 'sound',
    icon: <Music className="w-5 h-5" />,
    unlockCondition: 'Complete 5 meditation sessions',
    karmaRequired: 500,
    isSecret: false,
    rarity: 'common',
  },
  {
    id: 'celestial_choir',
    name: 'Celestial Choir',
    description: 'Divine harmonies from beyond',
    type: 'sound',
    icon: <Music className="w-5 h-5" />,
    unlockCondition: 'Reach Yogi level',
    karmaRequired: 2000,
    isSecret: false,
    rarity: 'rare',
  },
  {
    id: 'secret_gayatri',
    name: 'Secret Gayatri Variation',
    description: 'A rare ancient variation of the Gayatri Mantra',
    type: 'mantra',
    icon: <Star className="w-5 h-5" />,
    unlockCondition: '???',
    karmaRequired: 3000,
    isSecret: true,
    rarity: 'legendary',
  },
  {
    id: 'inner_sanctum',
    name: 'Inner Sanctum',
    description: 'The hidden chamber within the cosmic temple',
    type: 'environment',
    icon: <Eye className="w-5 h-5" />,
    unlockCondition: '???',
    karmaRequired: 5000,
    isSecret: true,
    rarity: 'legendary',
  },
  {
    id: 'om_resonance',
    name: 'Primordial Om',
    description: 'The original sound of creation',
    type: 'sound',
    icon: <Music className="w-5 h-5" />,
    unlockCondition: '???',
    karmaRequired: 10000,
    isSecret: true,
    rarity: 'legendary',
  },
];

interface HiddenRewardsProps {
  currentKarma: number;
  unlockedRewards: string[];
}

const RARITY_COLORS = {
  common: { bg: 'from-slate-500/20 to-slate-600/10', border: 'border-slate-500/30', text: 'text-slate-400' },
  rare: { bg: 'from-violet-500/20 to-purple-600/10', border: 'border-violet-500/30', text: 'text-violet-400' },
  legendary: { bg: 'from-amber-500/20 to-orange-600/10', border: 'border-amber-500/30', text: 'text-amber-400' },
};

const HiddenRewards = ({ currentKarma, unlockedRewards }: HiddenRewardsProps) => {
  const [selectedReward, setSelectedReward] = useState<HiddenReward | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<string[]>([]);

  // Check which rewards are unlocked
  const getRewardStatus = (reward: HiddenReward) => {
    const isUnlocked = currentKarma >= reward.karmaRequired || unlockedRewards.includes(reward.id);
    const isRevealed = !reward.isSecret || revealedSecrets.includes(reward.id) || isUnlocked;
    return { isUnlocked, isRevealed };
  };

  // Try to reveal a secret (chance-based for discovered secrets)
  const tryRevealSecret = (reward: HiddenReward) => {
    if (reward.isSecret && !revealedSecrets.includes(reward.id)) {
      // 20% chance to reveal the secret name on click
      if (Math.random() < 0.2) {
        setRevealedSecrets(prev => [...prev, reward.id]);
      }
    }
    setSelectedReward(reward);
  };

  // Group rewards by type
  const groupedRewards = HIDDEN_REWARDS.reduce((acc, reward) => {
    if (!acc[reward.type]) acc[reward.type] = [];
    acc[reward.type].push(reward);
    return acc;
  }, {} as Record<string, HiddenReward[]>);

  const typeLabels = {
    environment: '🌌 Meditation Environments',
    sound: '🎵 Sacred Sounds',
    mantra: '🕉️ Hidden Mantras',
    secret: '✨ Mysteries',
  };

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-indigo-500/10 border border-purple-500/20 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Gift className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="font-display text-lg tracking-wider text-foreground">
            Hidden Discoveries
          </h2>
          <p className="text-xs text-muted-foreground">
            Unlock secrets as you progress • {HIDDEN_REWARDS.filter(r => getRewardStatus(r).isUnlocked).length}/{HIDDEN_REWARDS.length} discovered
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedRewards).map(([type, rewards]) => (
          <div key={type}>
            <p className="text-sm text-muted-foreground mb-3">
              {typeLabels[type as keyof typeof typeLabels]}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {rewards.map((reward) => {
                const { isUnlocked, isRevealed } = getRewardStatus(reward);
                const colors = RARITY_COLORS[reward.rarity];

                return (
                  <motion.button
                    key={reward.id}
                    onClick={() => tryRevealSecret(reward)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative p-3 rounded-xl text-left transition-all
                      bg-gradient-to-br ${colors.bg} ${colors.border} border
                      ${isUnlocked ? 'opacity-100' : 'opacity-60'}
                    `}
                  >
                    {/* Lock overlay for locked items */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 rounded-xl bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}

                    {/* Glow for unlocked */}
                    {isUnlocked && (
                      <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: reward.rarity === 'legendary' 
                            ? 'radial-gradient(circle, rgba(251,191,36,0.2), transparent)'
                            : reward.rarity === 'rare'
                            ? 'radial-gradient(circle, rgba(139,92,246,0.2), transparent)'
                            : 'transparent',
                        }}
                      />
                    )}

                    <div className="relative z-10">
                      <div className={`mb-2 ${colors.text}`}>
                        {reward.icon}
                      </div>
                      <p className={`text-xs font-medium truncate ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {isRevealed ? reward.name : '???'}
                      </p>
                      {reward.rarity !== 'common' && isRevealed && (
                        <span className={`text-[10px] ${colors.text} uppercase tracking-wider`}>
                          {reward.rarity}
                        </span>
                      )}
                    </div>

                    {/* Secret indicator */}
                    {reward.isSecret && !isUnlocked && (
                      <div className="absolute top-1 right-1">
                        <Sparkles className="w-3 h-3 text-amber-400/50" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReward(null)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`
                relative max-w-sm w-full p-6 rounded-2xl border
                bg-gradient-to-br ${RARITY_COLORS[selectedReward.rarity].bg}
                ${RARITY_COLORS[selectedReward.rarity].border}
              `}
            >
              <div className="text-center">
                <div className={`
                  w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center
                  bg-gradient-to-br ${RARITY_COLORS[selectedReward.rarity].bg}
                `}>
                  {getRewardStatus(selectedReward).isUnlocked ? (
                    selectedReward.icon
                  ) : (
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                <h3 className={`font-display text-xl mb-1 ${RARITY_COLORS[selectedReward.rarity].text}`}>
                  {getRewardStatus(selectedReward).isRevealed ? selectedReward.name : '???'}
                </h3>
                
                <p className={`text-xs uppercase tracking-wider mb-3 ${RARITY_COLORS[selectedReward.rarity].text}`}>
                  {selectedReward.rarity}
                </p>

                <p className="text-sm text-muted-foreground mb-4">
                  {getRewardStatus(selectedReward).isUnlocked 
                    ? selectedReward.description 
                    : 'This reward is still locked...'}
                </p>

                <div className="p-3 rounded-lg bg-white/5 text-xs text-muted-foreground">
                  {getRewardStatus(selectedReward).isUnlocked ? (
                    <span className="text-primary">✓ Unlocked!</span>
                  ) : (
                    <>
                      <span>Unlock: </span>
                      <span className="text-foreground">
                        {selectedReward.isSecret ? '???' : selectedReward.unlockCondition}
                      </span>
                      {!selectedReward.isSecret && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary/50 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min((currentKarma / selectedReward.karmaRequired) * 100, 100)}%` 
                              }}
                            />
                          </div>
                          <p className="mt-1">{currentKarma}/{selectedReward.karmaRequired} Karma</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={() => setSelectedReward(null)}
                  className="mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HiddenRewards;
