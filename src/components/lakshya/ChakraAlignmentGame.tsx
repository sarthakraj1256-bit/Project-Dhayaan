import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Sparkles, Volume2, VolumeX, Trophy, Zap } from 'lucide-react';
import { useSpiritualProgress, CHAKRA_THRESHOLDS } from '@/hooks/useSpiritualProgress';

interface ChakraAlignmentGameProps {
  onClose: () => void;
  onKarmaEarned: (points: number) => void;
}

interface ChakraPiece {
  id: string;
  name: string;
  color: string;
  frequency: number;
  currentSlot: number;
  correctSlot: number;
  isLocked: boolean;
}

interface GameLevel {
  level: number;
  chakrasToAlign: number;
  timeLimit: number;
  karmaReward: number;
  description: string;
}

const GAME_LEVELS: GameLevel[] = [
  { level: 1, chakrasToAlign: 3, timeLimit: 60, karmaReward: 15, description: 'Root to Solar Plexus' },
  { level: 2, chakrasToAlign: 5, timeLimit: 90, karmaReward: 30, description: 'Root to Throat' },
  { level: 3, chakrasToAlign: 7, timeLimit: 120, karmaReward: 50, description: 'Full Chakra Alignment' },
];

const ChakraAlignmentGame = ({ onClose, onKarmaEarned }: ChakraAlignmentGameProps) => {
  const { addKarma, userId } = useSpiritualProgress();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed' | 'failed'>('menu');
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(GAME_LEVELS[0]);
  const [chakraPieces, setChakraPieces] = useState<ChakraPiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [moves, setMoves] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alignedCount, setAlignedCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chakra pieces for the level
  const initializeGame = useCallback((level: GameLevel) => {
    const chakrasForLevel = CHAKRA_THRESHOLDS.slice(0, level.chakrasToAlign);
    
    // Create pieces with shuffled positions
    const shuffledPositions = [...Array(level.chakrasToAlign).keys()]
      .sort(() => Math.random() - 0.5);
    
    const pieces: ChakraPiece[] = chakrasForLevel.map((chakra, index) => ({
      id: chakra.id,
      name: chakra.name,
      color: chakra.color,
      frequency: 136.1 + index * 20, // Each chakra has a unique frequency
      currentSlot: shuffledPositions[index],
      correctSlot: index,
      isLocked: false,
    }));

    setChakraPieces(pieces);
    setTimeRemaining(level.timeLimit);
    setMoves(0);
    setAlignedCount(0);
    setSelectedPiece(null);
    setGameState('playing');
  }, []);

  // Play chakra sound
  const playChakraSound = useCallback((frequency: number, duration: number = 0.5) => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available - silent fail
    }
  }, [soundEnabled]);

  // Play alignment success sound (harmonic chord)
  const playAlignmentSound = useCallback((chakraIndex: number) => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const ctx = audioContextRef.current;
      const baseFreq = 136.1 + chakraIndex * 20;
      
      // Play harmonic chord
      [1, 1.25, 1.5].forEach((ratio, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(baseFreq * ratio, ctx.currentTime);
        
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(ctx.currentTime + i * 0.1);
        oscillator.stop(ctx.currentTime + 1);
      });
    } catch {
      // Audio not available - silent fail
    }
  }, [soundEnabled]);

  // Handle piece selection and swapping
  const handlePieceClick = useCallback((pieceId: string) => {
    const piece = chakraPieces.find(p => p.id === pieceId);
    if (!piece || piece.isLocked) return;

    playChakraSound(piece.frequency, 0.3);

    if (selectedPiece === null) {
      setSelectedPiece(pieceId);
    } else if (selectedPiece === pieceId) {
      setSelectedPiece(null);
    } else {
      // Swap pieces
      const otherPiece = chakraPieces.find(p => p.id === selectedPiece);
      if (!otherPiece || otherPiece.isLocked) {
        setSelectedPiece(pieceId);
        return;
      }

      setChakraPieces(prev => {
        const newPieces = prev.map(p => {
          if (p.id === pieceId) {
            return { ...p, currentSlot: otherPiece.currentSlot };
          }
          if (p.id === selectedPiece) {
            return { ...p, currentSlot: piece.currentSlot };
          }
          return p;
        });

        // Check for newly aligned pieces
        const aligned = newPieces.filter(p => p.currentSlot === p.correctSlot);
        const newlyAligned = aligned.filter(p => 
          !chakraPieces.find(cp => cp.id === p.id && cp.currentSlot === cp.correctSlot)
        );

        newlyAligned.forEach(p => {
          playAlignmentSound(p.correctSlot);
        });

        // Lock aligned pieces
        return newPieces.map(p => ({
          ...p,
          isLocked: p.currentSlot === p.correctSlot
        }));
      });

      setMoves(m => m + 1);
      setSelectedPiece(null);
    }
  }, [selectedPiece, chakraPieces, playChakraSound, playAlignmentSound]);

  // Check win condition
  useEffect(() => {
    if (gameState !== 'playing') return;

    const aligned = chakraPieces.filter(p => p.currentSlot === p.correctSlot).length;
    setAlignedCount(aligned);

    if (aligned === chakraPieces.length && chakraPieces.length > 0) {
      // All aligned - victory!
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const timeBonus = Math.floor(timeRemaining / 10) * 5;
      const moveBonus = Math.max(0, (currentLevel.chakrasToAlign * 3 - moves) * 2);
      const totalKarma = currentLevel.karmaReward + timeBonus + moveBonus;

      if (userId) {
        addKarma(totalKarma, 'game');
      }
      onKarmaEarned(totalKarma);
      setGameState('completed');
    }
  }, [chakraPieces, gameState, timeRemaining, moves, currentLevel, userId, addKarma, onKarmaEarned]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Sort pieces by current slot for display
  const sortedPieces = [...chakraPieces].sort((a, b) => a.currentSlot - b.currentSlot);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative rounded-2xl bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-violet-900/90 border border-indigo-500/30 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-display text-lg text-foreground">Chakra Alignment</h2>
            <p className="text-xs text-muted-foreground">Align the energy centers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Menu State */}
        {gameState === 'menu' && (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 mx-auto mb-6 relative"
            >
              {CHAKRA_THRESHOLDS.slice(0, 7).map((chakra, i) => (
                <motion.div
                  key={chakra.id}
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    background: chakra.color,
                    boxShadow: `0 0 10px ${chakra.color}`,
                    top: `${50 + Math.sin(i * (Math.PI * 2 / 7)) * 40}%`,
                    left: `${50 + Math.cos(i * (Math.PI * 2 / 7)) * 40}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </motion.div>

            <h3 className="font-display text-xl text-foreground mb-2">Choose Your Challenge</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Align the chakras in their correct order to restore energy flow
            </p>

            <div className="space-y-3 max-w-sm mx-auto">
              {GAME_LEVELS.map((level) => (
                <motion.button
                  key={level.level}
                  onClick={() => {
                    setCurrentLevel(level);
                    initializeGame(level);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Level {level.level}</p>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-indigo-400">+{level.karmaReward} Karma</p>
                      <p className="text-xs text-muted-foreground">{level.timeLimit}s</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && (
          <div>
            {/* Stats Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-display text-foreground">{formatTime(timeRemaining)}</p>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display text-foreground">{moves}</p>
                  <p className="text-xs text-muted-foreground">Moves</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display text-indigo-400">{alignedCount}/{chakraPieces.length}</p>
                  <p className="text-xs text-muted-foreground">Aligned</p>
                </div>
              </div>
              <button
                onClick={() => setShowHint(!showHint)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  showHint ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            </div>

            {/* Hint Display */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
                >
                  <p className="text-xs text-indigo-300 text-center">
                    Order: Root (Red) → Sacral (Orange) → Solar (Yellow) → Heart (Green) → Throat (Blue) → Third Eye (Indigo) → Crown (Violet)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game Board */}
            <div className="relative">
              {/* Slot indicators */}
              <div className="absolute inset-0 flex flex-col gap-2 pointer-events-none">
                {chakraPieces.map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-lg border border-dashed border-white/10 flex items-center justify-center"
                  >
                    <span className="text-xs text-muted-foreground/50">{index + 1}</span>
                  </div>
                ))}
              </div>

              {/* Chakra Pieces */}
              <div className="relative flex flex-col gap-2 min-h-[300px]">
                {sortedPieces.map((piece) => {
                  const isSelected = selectedPiece === piece.id;
                  const isAligned = piece.currentSlot === piece.correctSlot;

                  return (
                    <motion.button
                      key={piece.id}
                      onClick={() => handlePieceClick(piece.id)}
                      layout
                      layoutId={piece.id}
                      whileHover={!piece.isLocked ? { scale: 1.02 } : undefined}
                      whileTap={!piece.isLocked ? { scale: 0.98 } : undefined}
                      className={`
                        relative p-4 rounded-xl transition-all
                        ${piece.isLocked 
                          ? 'cursor-default' 
                          : 'cursor-pointer hover:bg-white/5'
                        }
                        ${isSelected ? 'ring-2 ring-white/50' : ''}
                      `}
                      style={{
                        background: isAligned
                          ? `linear-gradient(135deg, ${piece.color}30, ${piece.color}10)`
                          : 'rgba(255,255,255,0.03)',
                        borderWidth: 2,
                        borderStyle: 'solid',
                        borderColor: isAligned ? `${piece.color}50` : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Chakra Symbol */}
                        <motion.div
                          className="w-12 h-12 rounded-full flex items-center justify-center relative"
                          style={{
                            background: `radial-gradient(circle, ${piece.color}40, ${piece.color}10)`,
                            boxShadow: isAligned ? `0 0 20px ${piece.color}40` : 'none',
                          }}
                          animate={isAligned ? {
                            scale: [1, 1.1, 1],
                          } : undefined}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Zap 
                            className="w-6 h-6" 
                            style={{ color: piece.color }}
                          />
                          {isAligned && (
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{ border: `2px solid ${piece.color}` }}
                              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </motion.div>

                        {/* Chakra Info */}
                        <div className="flex-1 text-left">
                          <p 
                            className="font-medium"
                            style={{ color: isAligned ? piece.color : 'rgb(var(--foreground))' }}
                          >
                            {piece.name.split(' ')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {piece.name.split('(')[1]?.replace(')', '') || ''}
                          </p>
                        </div>

                        {/* Status */}
                        {isAligned && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: `${piece.color}30` }}
                          >
                            <Sparkles className="w-4 h-4" style={{ color: piece.color }} />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              Click two chakras to swap their positions
            </p>
          </div>
        )}

        {/* Completed State */}
        {gameState === 'completed' && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center"
            >
              <Trophy className="w-10 h-10 text-amber-400" />
            </motion.div>

            <h3 className="font-display text-2xl text-foreground mb-2">Chakras Aligned!</h3>
            <p className="text-muted-foreground mb-6">
              Energy flows freely through your centers
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xl font-display text-foreground">{moves}</p>
                <p className="text-xs text-muted-foreground">Moves</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xl font-display text-foreground">{formatTime(timeRemaining)}</p>
                <p className="text-xs text-muted-foreground">Time Left</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/20">
                <p className="text-xl font-display text-amber-400">
                  +{currentLevel.karmaReward + Math.floor(timeRemaining / 10) * 5}
                </p>
                <p className="text-xs text-muted-foreground">Karma</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setGameState('menu')}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Play Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors text-sm text-indigo-300"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Failed State */}
        {gameState === 'failed' && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center"
            >
              <RotateCcw className="w-10 h-10 text-red-400" />
            </motion.div>

            <h3 className="font-display text-2xl text-foreground mb-2">Time's Up</h3>
            <p className="text-muted-foreground mb-6">
              The energy dispersed before alignment completed
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => initializeGame(currentLevel)}
                className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors text-sm text-indigo-300"
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Try Again
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
              >
                Change Level
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChakraAlignmentGame;
