import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Medal, Trophy, Sparkles, RefreshCw, User } from 'lucide-react';
import { LeaderboardEntry } from '@/hooks/useGardenLeaderboard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface GardenLeaderboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  currentUserId?: string;
  isLoading: boolean;
  onRefresh: () => void;
}

const RANK_ICONS = {
  1: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  2: { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-400/20' },
  3: { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/20' },
};

const GardenLeaderboardPanel = ({
  isOpen,
  onClose,
  leaderboard,
  userRank,
  currentUserId,
  isLoading,
  onRefresh,
}: GardenLeaderboardPanelProps) => {
  const [sortBy, setSortBy] = useState<'karma' | 'achievements' | 'plants'>('karma');

  if (!isOpen) return null;

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (sortBy) {
      case 'achievements':
        return b.achievements_unlocked - a.achievements_unlocked;
      case 'plants':
        return b.total_plants - a.total_plants;
      default:
        return b.total_karma_earned - a.total_karma_earned;
    }
  });

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
              <h2 className="font-display text-lg text-foreground">Garden Leaderboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* User Rank Banner */}
          {userRank && (
            <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-foreground">Your Rank</span>
                </div>
                <span className="text-lg font-bold text-amber-400">#{userRank}</span>
              </div>
            </div>
          )}

          {/* Sort Tabs */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {[
              { key: 'karma', label: '✨ Karma' },
              { key: 'achievements', label: '🏆 Achievements' },
              { key: 'plants', label: '🌱 Plants' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as 'karma' | 'achievements' | 'plants')}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  sortBy === key
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Leaderboard List */}
          <div className="p-4 overflow-y-auto max-h-[400px] space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            ) : sortedLeaderboard.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No gardeners yet!</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to grow your garden 🌱</p>
              </div>
            ) : (
              sortedLeaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.user_id === currentUserId;
                const rankConfig = RANK_ICONS[rank as keyof typeof RANK_ICONS];
                const RankIcon = rankConfig?.icon;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`
                      relative p-3 rounded-xl border transition-all
                      ${isCurrentUser
                        ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                        ${rankConfig ? rankConfig.bg : 'bg-white/10'}
                        ${rankConfig ? rankConfig.color : 'text-muted-foreground'}
                      `}>
                        {RankIcon ? <RankIcon className="w-4 h-4" /> : rank}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-10 h-10 border-2 border-white/10">
                        {entry.avatar_url ? (
                          <AvatarImage src={entry.avatar_url} alt={entry.display_name || 'Gardener'} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
                          {getInitials(entry.display_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium truncate ${isCurrentUser ? 'text-amber-400' : 'text-foreground'}`}>
                            {entry.display_name || 'Anonymous'}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>Lv.{entry.garden_level}</span>
                          <span>🌱 {entry.total_plants}</span>
                          <span>🌸 {entry.flourishing_plants}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-400">
                          {entry.total_karma_earned.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Karma</p>
                      </div>
                    </div>

                    {/* Achievement badges */}
                    {entry.achievements_unlocked > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] text-muted-foreground">
                          {entry.achievements_unlocked} achievements
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-center text-muted-foreground">
              Rankings update as you grow your garden 🏆
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GardenLeaderboardPanel;
