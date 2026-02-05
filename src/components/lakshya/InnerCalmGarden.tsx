import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Sun, Sparkles, Flower2, TreeDeciduous, Heart, Volume2, VolumeX, Calendar } from 'lucide-react';
import { useSpiritualProgress } from '@/hooks/useSpiritualProgress';
import { subscribeToGardenEvents } from '@/hooks/useGardenResources';
import SeasonalEvents, { ExclusivePlant, BonusReward, getActiveEvents } from './SeasonalEvents';

interface InnerCalmGardenProps {
  onClose: () => void;
  onKarmaEarned: (points: number) => void;
}

type PlantType = 'lotus' | 'bodhi' | 'tulsi' | 'jasmine' | 'bamboo' | string;
type PlantEmotion = 'peace' | 'joy' | 'love' | 'wisdom' | 'clarity' | 'devotion' | 'prosperity' | 'renewal' | 'gratitude' | 'celebration';

interface Plant {
  id: string;
  type: PlantType;
  stage: number; // 0-4 (seed, sprout, growing, blooming, flourishing)
  x: number;
  y: number;
  lastWatered: number;
  health: number; // 0-100
  emotion: PlantEmotion;
  isExclusive?: boolean;
  rarity?: 'rare' | 'epic' | 'legendary';
  karmaBonus?: number;
  emoji?: string;
  color?: string;
}

interface GardenState {
  plants: Plant[];
  waterDrops: number;
  sunlight: number;
  gardenLevel: number;
  totalGrowth: number;
  claimedRewards: string[];
}

const PLANT_TYPES = {
  lotus: { 
    name: 'Sacred Lotus', 
    emoji: '🪷', 
    color: '#F472B6',
    emotion: 'peace' as const,
    growthTime: 3,
  },
  bodhi: { 
    name: 'Bodhi Tree', 
    emoji: '🌳', 
    color: '#22C55E',
    emotion: 'wisdom' as const,
    growthTime: 5,
  },
  tulsi: { 
    name: 'Holy Tulsi', 
    emoji: '🌿', 
    color: '#4ADE80',
    emotion: 'love' as const,
    growthTime: 2,
  },
  jasmine: { 
    name: 'Night Jasmine', 
    emoji: '🌸', 
    color: '#FDE047',
    emotion: 'joy' as const,
    growthTime: 3,
  },
  bamboo: { 
    name: 'Zen Bamboo', 
    emoji: '🎋', 
    color: '#86EFAC',
    emotion: 'clarity' as const,
    growthTime: 4,
  },
};

const STAGE_NAMES = ['Seed', 'Sprout', 'Growing', 'Blooming', 'Flourishing'];

const InnerCalmGarden = ({ onClose, onKarmaEarned }: InnerCalmGardenProps) => {
  const { progress, addKarma, userId } = useSpiritualProgress();
  const [gardenState, setGardenState] = useState<GardenState>({
    plants: [],
    waterDrops: 5,
    sunlight: 100,
    gardenLevel: 1,
    totalGrowth: 0,
    claimedRewards: [],
  });
  const [selectedPlantType, setSelectedPlantType] = useState<keyof typeof PLANT_TYPES | null>(null);
  const [selectedExclusivePlant, setSelectedExclusivePlant] = useState<ExclusivePlant | null>(null);
  const [isPlanting, setIsPlanting] = useState(false);
  const [showPlantMenu, setShowPlantMenu] = useState(false);
  const [showSeasonalEvents, setShowSeasonalEvents] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [activeEvents] = useState(getActiveEvents());
  const [karmaEarned, setKarmaEarned] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gardenRef = useRef<HTMLDivElement>(null);

  // Load garden state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dhyaan-garden');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGardenState(parsed);
      } catch (e) {
        console.log('Could not load garden state');
      }
    }
  }, []);

  // Save garden state
  useEffect(() => {
    if (gardenState.plants.length > 0 || gardenState.totalGrowth > 0) {
      localStorage.setItem('dhyaan-garden', JSON.stringify(gardenState));
    }
  }, [gardenState]);

  // Regenerate water drops over time (1 drop per minute of meditation)
  useEffect(() => {
    if (!progress) return;
    
    const meditationMinutes = progress.total_meditation_minutes || 0;
    const baseDrops = Math.min(5 + Math.floor(meditationMinutes / 10), 20);
    
    setGardenState(prev => ({
      ...prev,
      waterDrops: Math.max(prev.waterDrops, baseDrops),
    }));
  }, [progress?.total_meditation_minutes]);

  // Note: Subscribe to garden water events after showMessage is defined (see below)

  // Play nature sound
  const playSound = useCallback((type: 'water' | 'grow' | 'bloom' | 'plant') => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      
      const frequencies = {
        water: [400, 500, 600],
        grow: [300, 400, 500],
        bloom: [500, 600, 700, 800],
        plant: [200, 300, 400],
      };
      
      const freqs = frequencies[type];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type === 'water' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.5);
      });
    } catch (error) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  // Show temporary message
  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  }, []);

  // Subscribe to real-time water drop events from Sonic Lab meditation sessions
  useEffect(() => {
    const unsubscribe = subscribeToGardenEvents((dropsEarned) => {
      setGardenState(prev => ({
        ...prev,
        waterDrops: Math.min(prev.waterDrops + dropsEarned, 30), // Max 30 drops
      }));
      setMessage(`🧘 Meditation complete! +${dropsEarned} water drop${dropsEarned > 1 ? 's' : ''} 💧`);
      setTimeout(() => setMessage(null), 3000);
    });

    return () => unsubscribe();
  }, []);

  const plantSeed = useCallback((x: number, y: number) => {
    // Handle exclusive plant planting
    if (selectedExclusivePlant) {
      if (gardenState.waterDrops < 2) {
        showMessage('Exclusive plants need 2 water drops!');
        return;
      }

      const newPlant: Plant = {
        id: `plant-${Date.now()}`,
        type: selectedExclusivePlant.type,
        stage: 0,
        x,
        y,
        lastWatered: Date.now(),
        health: 100,
        emotion: selectedExclusivePlant.emotion,
        isExclusive: true,
        rarity: selectedExclusivePlant.rarity,
        karmaBonus: selectedExclusivePlant.karmaBonus,
        emoji: selectedExclusivePlant.emoji,
        color: selectedExclusivePlant.color,
      };

      setGardenState(prev => ({
        ...prev,
        plants: [...prev.plants, newPlant],
        waterDrops: prev.waterDrops - 2,
      }));

      playSound('bloom');
      showMessage(`Planted a ${selectedExclusivePlant.rarity} ${selectedExclusivePlant.name}! ✨`);
      setSelectedExclusivePlant(null);
      setIsPlanting(false);
      
      const karma = 10 + (selectedExclusivePlant.rarity === 'legendary' ? 20 : selectedExclusivePlant.rarity === 'epic' ? 10 : 5);
      setKarmaEarned(prev => prev + karma);
      return;
    }

    if (!selectedPlantType || gardenState.waterDrops < 1) {
      showMessage('Need water to plant!');
      return;
    }

    const newPlant: Plant = {
      id: `plant-${Date.now()}`,
      type: selectedPlantType,
      stage: 0,
      x,
      y,
      lastWatered: Date.now(),
      health: 100,
      emotion: PLANT_TYPES[selectedPlantType].emotion,
    };

    setGardenState(prev => ({
      ...prev,
      plants: [...prev.plants, newPlant],
      waterDrops: prev.waterDrops - 1,
    }));

    playSound('plant');
    showMessage(`Planted a ${PLANT_TYPES[selectedPlantType].name} seed 🌱`);
    setSelectedPlantType(null);
    setIsPlanting(false);
    
    const karma = 5;
    setKarmaEarned(prev => prev + karma);
  }, [selectedPlantType, selectedExclusivePlant, gardenState.waterDrops, playSound, showMessage]);

  // Handle exclusive plant selection from seasonal events
  const handleExclusivePlantSelect = useCallback((plant: ExclusivePlant) => {
    setSelectedExclusivePlant(plant);
    setSelectedPlantType(null);
    setIsPlanting(true);
    setShowPlantMenu(false);
    setShowSeasonalEvents(false);
    showMessage(`Tap to plant your ${plant.rarity} ${plant.name}!`);
  }, [showMessage]);

  // Handle claiming seasonal rewards
  const handleClaimReward = useCallback((reward: BonusReward) => {
    if (gardenState.claimedRewards.includes(reward.id)) return;

    setGardenState(prev => ({
      ...prev,
      claimedRewards: [...prev.claimedRewards, reward.id],
      waterDrops: reward.type === 'water_drops' 
        ? Math.min(prev.waterDrops + reward.value, 30) 
        : prev.waterDrops,
    }));

    playSound('bloom');

    if (reward.type === 'water_drops') {
      showMessage(`Claimed ${reward.value} water drops! 💧`);
    } else if (reward.type === 'karma_multiplier') {
      showMessage(`${reward.value}x Karma activated! ✨`);
      setKarmaEarned(prev => prev + 25);
    } else if (reward.type === 'instant_growth') {
      // Grow the first non-flourishing plant
      const plantToGrow = gardenState.plants.find(p => p.stage < 4);
      if (plantToGrow) {
        setGardenState(prev => ({
          ...prev,
          plants: prev.plants.map(p => 
            p.id === plantToGrow.id ? { ...p, stage: Math.min(p.stage + 2, 4), health: 100 } : p
          ),
        }));
        showMessage('A plant grew instantly! 🌱➡️🌸');
      }
    }
  }, [gardenState.claimedRewards, gardenState.plants, playSound, showMessage]);

  // Water a plant
  const waterPlant = useCallback((plantId: string) => {
    if (gardenState.waterDrops < 1) {
      showMessage('No water drops left! Meditate to earn more 💧');
      return;
    }

    setGardenState(prev => ({
      ...prev,
      waterDrops: prev.waterDrops - 1,
      plants: prev.plants.map(p => {
        if (p.id === plantId) {
          const newHealth = Math.min(p.health + 25, 100);
          const canGrow = p.stage < 4 && newHealth >= 80;
          
          if (canGrow) {
            playSound('grow');
            const karma = (p.stage + 1) * 5;
            setKarmaEarned(k => k + karma);
            showMessage(`${PLANT_TYPES[p.type].name} is growing! +${karma} Karma ✨`);
          } else {
            playSound('water');
            showMessage('Plant watered 💧');
          }
          
          return {
            ...p,
            health: newHealth,
            lastWatered: Date.now(),
            stage: canGrow ? p.stage + 1 : p.stage,
          };
        }
        return p;
      }),
      totalGrowth: prev.totalGrowth + 1,
    }));
  }, [gardenState.waterDrops, playSound, showMessage]);

  // Handle garden click for planting
  const handleGardenClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlanting || (!selectedPlantType && !selectedExclusivePlant) || !gardenRef.current) return;
    
    const rect = gardenRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Keep plants in a reasonable area
    const clampedX = Math.max(10, Math.min(90, x));
    const clampedY = Math.max(30, Math.min(85, y));
    
    plantSeed(clampedX, clampedY);
  }, [isPlanting, selectedPlantType, selectedExclusivePlant, plantSeed]);

  // Save karma when closing
  const handleClose = useCallback(() => {
    if (karmaEarned > 0 && userId) {
      addKarma(karmaEarned, 'game');
      onKarmaEarned(karmaEarned);
    }
    onClose();
  }, [karmaEarned, userId, addKarma, onKarmaEarned, onClose]);

  // Calculate garden stats
  const flourishingPlants = gardenState.plants.filter(p => p.stage === 4).length;
  const totalPlants = gardenState.plants.length;
  const gardenHealth = totalPlants > 0 
    ? Math.round(gardenState.plants.reduce((sum, p) => sum + p.health, 0) / totalPlants)
    : 100;

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Flower2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-display text-lg text-foreground">Inner Calm Garden</h2>
            <p className="text-xs text-muted-foreground">Grow peace through practice</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400">{gardenState.waterDrops}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">{gardenHealth}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TreeDeciduous className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">{flourishingPlants}/{totalPlants}</span>
          </div>
        </div>
        {karmaEarned > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/20">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-amber-400">+{karmaEarned} Karma</span>
          </div>
        )}
      </div>

      {/* Garden Area */}
      <div
        ref={gardenRef}
        onClick={handleGardenClick}
        className={`relative h-80 sm:h-96 overflow-hidden ${isPlanting ? 'cursor-crosshair' : ''}`}
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(34, 197, 94, 0.1) 100%)',
        }}
      >
        {/* Ground gradient */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(34, 197, 94, 0.15) 50%, rgba(34, 197, 94, 0.25) 100%)',
          }}
        />

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-4xl opacity-30">🌙</div>
        <div className="absolute top-8 left-8 text-2xl opacity-20">✨</div>
        <div className="absolute top-16 right-16 text-xl opacity-20">✨</div>

        {/* Plants */}
        <AnimatePresence>
          {gardenState.plants.map((plant) => {
            const plantInfo = plant.isExclusive 
              ? { name: plant.type, emoji: plant.emoji || '🌸', color: plant.color || '#8B5CF6' }
              : PLANT_TYPES[plant.type as keyof typeof PLANT_TYPES] || { name: plant.type, emoji: '🌱', color: '#22C55E' };
            const scale = 0.5 + (plant.stage * 0.25);
            
            return (
              <motion.button
                key={plant.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isPlanting) waterPlant(plant.id);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${plant.x}%`,
                  top: `${plant.y}%`,
                }}
                whileHover={{ scale: scale * 1.1 }}
                whileTap={{ scale: scale * 0.95 }}
              >
                {/* Glow effect - enhanced for exclusive plants */}
                <motion.div
                  animate={{ 
                    opacity: plant.isExclusive ? [0.4, 0.8, 0.4] : [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: plant.isExclusive ? 1.5 : 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{ 
                    background: plant.isExclusive 
                      ? `radial-gradient(circle, ${plantInfo.color}, transparent)` 
                      : plantInfo.color,
                    transform: `scale(${scale * (plant.isExclusive ? 1.5 : 1)})`,
                  }}
                />

                {/* Rarity indicator for exclusive plants */}
                {plant.isExclusive && plant.stage === 4 && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-2 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, transparent, ${plantInfo.color}40, transparent)`,
                    }}
                  />
                )}
                
                {/* Plant emoji */}
                <motion.span
                  animate={plant.stage === 4 ? { 
                    rotate: [-2, 2, -2],
                    scale: plant.isExclusive ? [1, 1.1, 1] : 1,
                  } : undefined}
                  transition={{ duration: plant.isExclusive ? 2 : 3, repeat: Infinity }}
                  className="relative z-10 block"
                  style={{ 
                    fontSize: `${1.5 + plant.stage * 0.5}rem`,
                    filter: plant.health < 50 ? 'grayscale(50%)' : 'none',
                  }}
                >
                  {plant.stage === 0 ? '🌱' : 
                   plant.stage === 1 ? '🌿' :
                   plant.stage === 2 ? '🌾' :
                   plantInfo.emoji}
                </motion.span>

                {/* Health indicator */}
                {plant.health < 80 && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${plant.health}%`,
                        background: plant.health > 50 ? '#22C55E' : '#EF4444',
                      }}
                    />
                  </div>
                )}

                {/* Tooltip on hover */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-black/80 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="font-medium text-foreground flex items-center gap-1">
                    {plantInfo.name}
                    {plant.isExclusive && (
                      <span className={`text-[10px] px-1 rounded ${
                        plant.rarity === 'legendary' ? 'bg-amber-500/30 text-amber-400' :
                        plant.rarity === 'epic' ? 'bg-purple-500/30 text-purple-400' :
                        'bg-cyan-500/30 text-cyan-400'
                      }`}>
                        {plant.rarity}
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground">{STAGE_NAMES[plant.stage]} • {plant.health}% health</p>
                  {plant.karmaBonus && plant.stage === 4 && (
                    <p className="text-amber-400">+{plant.karmaBonus} Karma bonus</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Empty garden message */}
        {gardenState.plants.length === 0 && !isPlanting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                🌱
              </motion.div>
              <p className="text-muted-foreground mb-2">Your garden awaits</p>
              <p className="text-xs text-muted-foreground">Tap "Plant Seed" to begin</p>
            </div>
          </div>
        )}

        {/* Planting mode indicator */}
        {isPlanting && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`px-4 py-2 rounded-full backdrop-blur-sm ${
                selectedExclusivePlant 
                  ? 'bg-gradient-to-r from-purple-500/30 to-amber-500/30 border border-amber-500/30' 
                  : 'bg-black/50'
              }`}
            >
              <p className="text-sm text-foreground">
                {selectedExclusivePlant 
                  ? `Tap to plant your ${selectedExclusivePlant.rarity} ${selectedExclusivePlant.name} ✨`
                  : `Tap to plant your ${selectedPlantType && PLANT_TYPES[selectedPlantType].name}`
                }
              </p>
            </motion.div>
          </div>
        )}

        {/* Message toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm"
            >
              <p className="text-sm text-foreground">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowPlantMenu(!showPlantMenu);
              setShowSeasonalEvents(false);
              setIsPlanting(false);
            }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all
              ${showPlantMenu 
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' 
                : 'bg-white/5 hover:bg-white/10 text-foreground'
              }
            `}
          >
            <Flower2 className="w-4 h-4" />
            <span className="text-sm">Plant Seed</span>
          </button>

          {activeEvents.length > 0 && (
            <button
              onClick={() => {
                setShowSeasonalEvents(!showSeasonalEvents);
                setShowPlantMenu(false);
                setIsPlanting(false);
              }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${showSeasonalEvents 
                  ? 'bg-gradient-to-r from-purple-500/30 to-amber-500/30 text-amber-300 border border-amber-500/50' 
                  : 'bg-gradient-to-r from-purple-500/20 to-amber-500/20 hover:from-purple-500/30 hover:to-amber-500/30 text-foreground border border-transparent'
                }
              `}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{activeEvents[0].emoji} Events</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-400 text-[10px]">
                {activeEvents.length}
              </span>
            </button>
          )}
          
          <button
            onClick={() => {
              if (gardenState.waterDrops < gardenState.plants.length) {
                showMessage('Not enough water for all plants!');
                return;
              }
              gardenState.plants.forEach(p => waterPlant(p.id));
            }}
            disabled={gardenState.plants.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Droplets className="w-4 h-4" />
            <span className="text-sm">Water All</span>
          </button>
        </div>

        {/* Plant type selector */}
        <AnimatePresence>
          {showPlantMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <p className="text-xs text-muted-foreground mb-2">Choose a plant to grow:</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(PLANT_TYPES) as [keyof typeof PLANT_TYPES, typeof PLANT_TYPES[keyof typeof PLANT_TYPES]][]).map(([type, info]) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedPlantType(type);
                      setIsPlanting(true);
                      setShowPlantMenu(false);
                    }}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                      ${selectedPlantType === type 
                        ? 'bg-white/20 border border-white/30' 
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }
                    `}
                  >
                    <span className="text-lg">{info.emoji}</span>
                    <div className="text-left">
                      <p className="text-xs font-medium text-foreground">{info.name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Heart className="w-2 h-2" style={{ color: info.color }} />
                        {info.emotion}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seasonal Events Panel */}
        <AnimatePresence>
          {showSeasonalEvents && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <SeasonalEvents
                onPlantSelect={handleExclusivePlantSelect}
                onClaimReward={handleClaimReward}
                claimedRewards={gardenState.claimedRewards}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meditation tip */}
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-muted-foreground">
            💡 <span className="text-foreground">Tip:</span> Meditate in Sonic Lab to earn more water drops! 
            Each 10 minutes of meditation gives you 1 drop.
            {activeEvents.length > 0 && (
              <span className="text-amber-400"> Check the Events tab for exclusive seasonal plants!</span>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InnerCalmGarden;
