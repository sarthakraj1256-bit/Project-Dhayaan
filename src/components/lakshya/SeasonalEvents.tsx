import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Sparkles, Gift, Star } from 'lucide-react';

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  emoji: string;
  theme: {
    primary: string;
    secondary: string;
    glow: string;
  };
  exclusivePlants: ExclusivePlant[];
  bonusRewards: BonusReward[];
}

export interface ExclusivePlant {
  id: string;
  type: string;
  name: string;
  emoji: string;
  color: string;
  emotion: 'devotion' | 'prosperity' | 'renewal' | 'gratitude' | 'celebration';
  rarity: 'rare' | 'epic' | 'legendary';
  karmaBonus: number;
}

export interface BonusReward {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'water_drops' | 'karma_multiplier' | 'instant_growth';
  value: number;
}

// Define seasonal events based on Hindu calendar
const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: 'diwali-2025',
    name: 'Festival of Lights',
    description: 'Celebrate Diwali with radiant blooms and divine blessings',
    startDate: new Date('2025-10-20'),
    endDate: new Date('2025-10-25'),
    emoji: '🪔',
    theme: {
      primary: '#F59E0B',
      secondary: '#7C3AED',
      glow: '#FCD34D',
    },
    exclusivePlants: [
      {
        id: 'golden-marigold',
        type: 'marigold',
        name: 'Golden Marigold',
        emoji: '🌼',
        color: '#F59E0B',
        emotion: 'prosperity',
        rarity: 'epic',
        karmaBonus: 50,
      },
      {
        id: 'diya-lotus',
        type: 'diya-lotus',
        name: 'Diya Lotus',
        emoji: '🪷',
        color: '#FCD34D',
        emotion: 'devotion',
        rarity: 'legendary',
        karmaBonus: 100,
      },
    ],
    bonusRewards: [
      {
        id: 'diwali-drops',
        name: 'Divine Water',
        description: '+5 bonus water drops',
        emoji: '✨',
        type: 'water_drops',
        value: 5,
      },
      {
        id: 'diwali-karma',
        name: 'Festival Blessing',
        description: '2x Karma for 24 hours',
        emoji: '🪔',
        type: 'karma_multiplier',
        value: 2,
      },
    ],
  },
  {
    id: 'holi-2025',
    name: 'Festival of Colors',
    description: 'Plant vibrant blooms celebrating spring and new beginnings',
    startDate: new Date('2025-03-14'),
    endDate: new Date('2025-03-16'),
    emoji: '🎨',
    theme: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      glow: '#F472B6',
    },
    exclusivePlants: [
      {
        id: 'rainbow-gulmohar',
        type: 'gulmohar',
        name: 'Rainbow Gulmohar',
        emoji: '🌺',
        color: '#EC4899',
        emotion: 'celebration',
        rarity: 'epic',
        karmaBonus: 50,
      },
      {
        id: 'spring-champa',
        type: 'champa',
        name: 'Spring Champa',
        emoji: '🌸',
        color: '#FBBF24',
        emotion: 'renewal',
        rarity: 'rare',
        karmaBonus: 30,
      },
    ],
    bonusRewards: [
      {
        id: 'holi-growth',
        name: 'Spring Blessing',
        description: 'Instant growth for one plant',
        emoji: '🌱',
        type: 'instant_growth',
        value: 1,
      },
    ],
  },
  {
    id: 'navaratri-2025',
    name: 'Nine Nights of Shakti',
    description: 'Honor the divine feminine with sacred plants',
    startDate: new Date('2025-09-29'),
    endDate: new Date('2025-10-07'),
    emoji: '🔱',
    theme: {
      primary: '#DC2626',
      secondary: '#7C3AED',
      glow: '#F87171',
    },
    exclusivePlants: [
      {
        id: 'shakti-hibiscus',
        type: 'hibiscus',
        name: 'Shakti Hibiscus',
        emoji: '🌺',
        color: '#DC2626',
        emotion: 'devotion',
        rarity: 'legendary',
        karmaBonus: 100,
      },
      {
        id: 'durga-lotus',
        type: 'durga-lotus',
        name: 'Durga Lotus',
        emoji: '🪷',
        color: '#7C3AED',
        emotion: 'devotion',
        rarity: 'epic',
        karmaBonus: 60,
      },
    ],
    bonusRewards: [
      {
        id: 'navaratri-karma',
        name: 'Divine Grace',
        description: '3x Karma during event',
        emoji: '🔱',
        type: 'karma_multiplier',
        value: 3,
      },
    ],
  },
  {
    id: 'makar-sankranti-2025',
    name: 'Harvest Festival',
    description: 'Welcome the sun with golden harvest blooms',
    startDate: new Date('2025-01-14'),
    endDate: new Date('2025-01-15'),
    emoji: '☀️',
    theme: {
      primary: '#F97316',
      secondary: '#EAB308',
      glow: '#FDBA74',
    },
    exclusivePlants: [
      {
        id: 'sun-sunflower',
        type: 'sunflower',
        name: 'Solar Sunflower',
        emoji: '🌻',
        color: '#F97316',
        emotion: 'gratitude',
        rarity: 'rare',
        karmaBonus: 35,
      },
    ],
    bonusRewards: [
      {
        id: 'sankranti-drops',
        name: 'Morning Dew',
        description: '+10 bonus water drops',
        emoji: '💧',
        type: 'water_drops',
        value: 10,
      },
    ],
  },
  {
    id: 'guru-purnima-2025',
    name: 'Day of the Guru',
    description: 'Honor spiritual teachers with wisdom plants',
    startDate: new Date('2025-07-10'),
    endDate: new Date('2025-07-11'),
    emoji: '🧘',
    theme: {
      primary: '#8B5CF6',
      secondary: '#6366F1',
      glow: '#A78BFA',
    },
    exclusivePlants: [
      {
        id: 'guru-bodhi',
        type: 'ancient-bodhi',
        name: 'Ancient Bodhi',
        emoji: '🌳',
        color: '#8B5CF6',
        emotion: 'devotion',
        rarity: 'legendary',
        karmaBonus: 150,
      },
    ],
    bonusRewards: [
      {
        id: 'guru-blessing',
        name: 'Guru\'s Blessing',
        description: '5x Karma for 12 hours',
        emoji: '🙏',
        type: 'karma_multiplier',
        value: 5,
      },
    ],
  },
];

// For demo purposes, create a "always active" demo event
const DEMO_EVENT: SeasonalEvent = {
  id: 'spiritual-awakening',
  name: 'Spiritual Awakening',
  description: 'A special time for inner growth and divine connection',
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started yesterday
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ends in 7 days
  emoji: '🕉️',
  theme: {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    glow: '#A78BFA',
  },
  exclusivePlants: [
    {
      id: 'celestial-lotus',
      type: 'celestial-lotus',
      name: 'Celestial Lotus',
      emoji: '🪷',
      color: '#8B5CF6',
      emotion: 'devotion',
      rarity: 'legendary',
      karmaBonus: 100,
    },
    {
      id: 'moonlight-jasmine',
      type: 'moonlight-jasmine',
      name: 'Moonlight Jasmine',
      emoji: '🌸',
      color: '#06B6D4',
      emotion: 'renewal',
      rarity: 'epic',
      karmaBonus: 50,
    },
    {
      id: 'sacred-banyan',
      type: 'sacred-banyan',
      name: 'Sacred Banyan',
      emoji: '🌳',
      color: '#22C55E',
      emotion: 'gratitude',
      rarity: 'rare',
      karmaBonus: 30,
    },
  ],
  bonusRewards: [
    {
      id: 'awakening-drops',
      name: 'Sacred Waters',
      description: '+3 bonus water drops',
      emoji: '💧',
      type: 'water_drops',
      value: 3,
    },
    {
      id: 'awakening-karma',
      name: 'Divine Blessing',
      description: '1.5x Karma during event',
      emoji: '✨',
      type: 'karma_multiplier',
      value: 1.5,
    },
  ],
};

export const getActiveEvents = (): SeasonalEvent[] => {
  const now = new Date();
  const activeEvents = SEASONAL_EVENTS.filter(
    event => now >= event.startDate && now <= event.endDate
  );
  
  // Always include demo event for testing
  if (activeEvents.length === 0) {
    return [DEMO_EVENT];
  }
  
  return activeEvents;
};

export const getUpcomingEvents = (limit = 3): SeasonalEvent[] => {
  const now = new Date();
  return SEASONAL_EVENTS
    .filter(event => event.startDate > now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, limit);
};

interface SeasonalEventsProps {
  onPlantSelect: (plant: ExclusivePlant) => void;
  onClaimReward: (reward: BonusReward) => void;
  claimedRewards: string[];
}

const SeasonalEvents = ({ onPlantSelect, onClaimReward, claimedRewards }: SeasonalEventsProps) => {
  const [activeEvents, setActiveEvents] = useState<SeasonalEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<SeasonalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SeasonalEvent | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    setActiveEvents(getActiveEvents());
    setUpcomingEvents(getUpcomingEvents());
  }, []);

  useEffect(() => {
    if (!selectedEvent && activeEvents.length > 0) {
      setSelectedEvent(activeEvents[0]);
    }
  }, [activeEvents, selectedEvent]);

  // Update countdown timer
  useEffect(() => {
    if (!selectedEvent) return;

    const updateTimer = () => {
      const now = new Date();
      const end = selectedEvent.endDate;
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Event ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeRemaining(`${minutes}m remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const getRarityColor = (rarity: ExclusivePlant['rarity']) => {
    switch (rarity) {
      case 'rare': return 'from-blue-500 to-cyan-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'legendary': return 'from-amber-500 to-orange-500';
    }
  };

  const getRarityBorder = (rarity: ExclusivePlant['rarity']) => {
    switch (rarity) {
      case 'rare': return 'border-cyan-500/50';
      case 'epic': return 'border-purple-500/50';
      case 'legendary': return 'border-amber-500/50';
    }
  };

  if (activeEvents.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Active Event Banner */}
      {selectedEvent && (
        <motion.div
          className="relative overflow-hidden rounded-xl p-4"
          style={{
            background: `linear-gradient(135deg, ${selectedEvent.theme.primary}20, ${selectedEvent.theme.secondary}20)`,
            borderColor: `${selectedEvent.theme.primary}40`,
            borderWidth: 1,
          }}
        >
          {/* Animated glow */}
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl"
            style={{ background: selectedEvent.theme.glow }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedEvent.emoji}</span>
                <div>
                  <h3 className="font-display text-sm text-foreground">{selectedEvent.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {timeRemaining}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-400">Limited Time</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4">{selectedEvent.description}</p>

            {/* Exclusive Plants */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Gift className="w-3 h-3" /> Exclusive Plants
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedEvent.exclusivePlants.map((plant) => (
                  <motion.button
                    key={plant.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPlantSelect(plant)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border ${getRarityBorder(plant.rarity)} transition-all hover:bg-black/40`}
                  >
                    <span className="text-xl">{plant.emoji}</span>
                    <div className="text-left">
                      <p className="text-xs font-medium text-foreground">{plant.name}</p>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r ${getRarityColor(plant.rarity)} text-white`}>
                          {plant.rarity}
                        </span>
                        <span className="text-[10px] text-amber-400">+{plant.karmaBonus} Karma</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Bonus Rewards */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Star className="w-3 h-3" /> Event Rewards
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedEvent.bonusRewards.map((reward) => {
                  const isClaimed = claimedRewards.includes(reward.id);
                  return (
                    <motion.button
                      key={reward.id}
                      whileHover={{ scale: isClaimed ? 1 : 1.05 }}
                      whileTap={{ scale: isClaimed ? 1 : 0.95 }}
                      onClick={() => !isClaimed && onClaimReward(reward)}
                      disabled={isClaimed}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        isClaimed 
                          ? 'bg-white/5 opacity-50 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:border-amber-500/50'
                      }`}
                    >
                      <span className="text-lg">{reward.emoji}</span>
                      <div className="text-left">
                        <p className="text-xs font-medium text-foreground">{reward.name}</p>
                        <p className="text-[10px] text-muted-foreground">{reward.description}</p>
                      </div>
                      {isClaimed && (
                        <span className="text-[10px] text-emerald-400">✓ Claimed</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming Events Preview */}
      {upcomingEvents.length > 0 && (
        <div className="px-1">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Upcoming Festivals
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex-shrink-0"
              >
                <span>{event.emoji}</span>
                <div>
                  <p className="text-xs text-foreground whitespace-nowrap">{event.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {event.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SeasonalEvents;
