import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Star, Trophy, Clock, Move, Zap, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { LevelConfig, SYMBOL_CONFIG, DIVINE_MATCH_LEVELS, getLevel } from '@/data/divineMatchLevels';
import { useDivineMatchGame, Cell } from '@/hooks/useDivineMatchGame';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DivineMatchGameProps {
  onClose: () => void;
  onKarmaEarned: (points: number) => void;
}

// Game Cell Component
const GameCell = ({ 
  cell, 
  onClick, 
  size 
}: { 
  cell: Cell; 
  onClick: () => void; 
  size: number;
}) => {
  const symbolConfig = cell.symbol ? SYMBOL_CONFIG[cell.symbol] : null;
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative rounded-lg transition-all duration-200 flex items-center justify-center
        ${cell.isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent' : ''}
        ${cell.isDarkBlock ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 
          cell.isIllusionStone ? 'bg-gradient-to-br from-purple-900/80 to-indigo-900/80' :
          cell.isLamp ? (cell.lampLit ? 'bg-gradient-to-br from-amber-500/40 to-orange-500/40' : 'bg-gradient-to-br from-slate-700 to-slate-800') :
          cell.isChained ? 'bg-gradient-to-br from-slate-600 to-slate-700' :
          cell.isMist ? 'bg-gradient-to-br from-slate-500/50 to-slate-600/50' :
          'bg-gradient-to-br from-white/10 to-white/5'
        }
        border border-white/10
      `}
      style={{ width: size, height: size }}
    >
      {/* Dark block overlay */}
      {cell.isDarkBlock && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-lg opacity-60">🌑</div>
        </div>
      )}

      {/* Illusion stone layers */}
      {cell.isIllusionStone && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: cell.illusionLayers }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-1 rounded border-2 border-purple-400/40"
              style={{ margin: i * 2 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          <span className="text-sm opacity-70">💎</span>
        </div>
      )}

      {/* Lamp */}
      {cell.isLamp && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={cell.lampLit ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className={`text-lg ${cell.lampLit ? '' : 'opacity-40'}`}>
            {cell.lampLit ? '🪔' : '🕯️'}
          </span>
          {cell.lampLit && (
            <motion.div
              className="absolute inset-0 bg-amber-400/20 rounded-lg"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}

      {/* Chain overlay */}
      {cell.isChained && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="absolute inset-0 bg-slate-800/60 rounded-lg" />
          <span className="text-sm z-10">⛓️</span>
        </div>
      )}

      {/* Mist overlay */}
      {cell.isMist && (
        <motion.div
          className="absolute inset-0 bg-slate-500/40 rounded-lg backdrop-blur-[1px]"
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-sm opacity-50">🌫️</span>
        </motion.div>
      )}

      {/* Symbol */}
      {symbolConfig && !cell.isDarkBlock && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`relative z-5 ${cell.isChained ? 'opacity-60' : ''}`}
        >
          <span 
            className="text-xl sm:text-2xl"
            style={{ 
              filter: cell.isSpecial ? 'drop-shadow(0 0 8px gold)' : undefined 
            }}
          >
            {symbolConfig.emoji}
          </span>
          
          {/* Special power indicator */}
          {cell.isSpecial && (
            <motion.div
              className="absolute -inset-1 rounded-full"
              style={{
                background: cell.isSpecial === 'chakra_explosion' 
                  ? 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}

      {/* Match animation */}
      {cell.isMatched && (
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          className="absolute inset-0 bg-amber-400/30 rounded-lg"
        />
      )}
    </motion.button>
  );
};

// Level Selector Component
const LevelSelector = ({ 
  currentLevel, 
  onSelectLevel, 
  completedLevels 
}: { 
  currentLevel: number;
  onSelectLevel: (level: number) => void;
  completedLevels: Record<number, number>;
}) => {
  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {DIVINE_MATCH_LEVELS.map((level) => {
        const stars = completedLevels[level.id] || 0;
        const isUnlocked = level.id === 1 || completedLevels[level.id - 1] > 0;
        
        return (
          <motion.button
            key={level.id}
            onClick={() => isUnlocked && onSelectLevel(level.id)}
            whileHover={isUnlocked ? { scale: 1.05 } : {}}
            whileTap={isUnlocked ? { scale: 0.95 } : {}}
            className={`
              relative p-3 rounded-xl border transition-all
              ${currentLevel === level.id 
                ? 'bg-amber-500/20 border-amber-500/50' 
                : isUnlocked 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                  : 'bg-slate-800/50 border-slate-700/50 opacity-50 cursor-not-allowed'
              }
            `}
          >
            <div className="text-lg font-bold text-foreground">{level.id}</div>
            <div className="flex justify-center gap-0.5 mt-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                <span>🔒</span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// Main Game Component
const DivineMatchGame = ({ onClose, onKarmaEarned }: DivineMatchGameProps) => {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [completedLevels, setCompletedLevels] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('dhyaan-divine-match-progress');
    return saved ? JSON.parse(saved) : {};
  });

  const level = getLevel(currentLevelId)!;
  const { gameState, handleCellClick, resetGame } = useDivineMatchGame(level);

  // Calculate cell size based on grid
  const cellSize = Math.min(
    Math.floor((280 - (level.gridSize.cols - 1) * 4) / level.gridSize.cols),
    Math.floor((320 - (level.gridSize.rows - 1) * 4) / level.gridSize.rows)
  );

  // Handle level completion
  const handleLevelComplete = useCallback(() => {
    if (gameState.isVictory) {
      const currentStars = completedLevels[currentLevelId] || 0;
      if (gameState.stars > currentStars) {
        const newCompleted = { ...completedLevels, [currentLevelId]: gameState.stars };
        setCompletedLevels(newCompleted);
        localStorage.setItem('dhyaan-divine-match-progress', JSON.stringify(newCompleted));
      }
      onKarmaEarned(level.karmaReward * gameState.stars);
    }
  }, [gameState.isVictory, gameState.stars, currentLevelId, completedLevels, level.karmaReward, onKarmaEarned]);

  // Get progress percentage
  const getProgressPercent = () => {
    const targets = level.targets;
    const progress = gameState.progress;
    
    switch (level.taskType) {
      case 'clear_darkness':
        return (progress.darkBlocksCleared / (targets.darkBlocks || 1)) * 100;
      case 'break_illusion':
        return (progress.illusionsBroken / (targets.illusionStones || 1)) * 100;
      case 'activate_lamps':
        return (progress.lampsLit / (targets.lampsToLight || 1)) * 100;
      case 'unlock_chains':
        return (progress.chainsUnlocked / (targets.chainsToBreak || 1)) * 100;
      default:
        return 0;
    }
  };

  // Get target description
  const getTargetText = () => {
    const targets = level.targets;
    const progress = gameState.progress;
    
    switch (level.taskType) {
      case 'clear_darkness':
        return `Clear ${progress.darkBlocksCleared}/${targets.darkBlocks} dark blocks`;
      case 'break_illusion':
        return `Break ${progress.illusionsBroken}/${targets.illusionStones} illusions`;
      case 'activate_lamps':
        return `Light ${progress.lampsLit}/${targets.lampsToLight} lamps`;
      case 'unlock_chains':
        return `Unlock ${progress.chainsUnlocked}/${targets.chainsToBreak} chains`;
      case 'timed_challenge':
        return `Clear ${progress.darkBlocksCleared}/${targets.darkBlocks} blocks`;
      default:
        return 'Complete the puzzle';
    }
  };

  if (showLevelSelect) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">Divine Match</h2>
              <p className="text-xs text-muted-foreground">Spiritual Match-3 Puzzle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Level Grid */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">Select Level</h3>
          <LevelSelector
            currentLevel={currentLevelId}
            onSelectLevel={(id) => setCurrentLevelId(id)}
            completedLevels={completedLevels}
          />
        </div>

        {/* Selected Level Info */}
        <div className="p-4 bg-black/20 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-foreground">{level.name}</h4>
              <p className="text-xs text-muted-foreground">{level.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {level.movesLimit && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Move className="w-3 h-3" />
                  {level.movesLimit}
                </div>
              )}
              {level.timeLimit && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {level.timeLimit}s
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={() => {
              resetGame();
              setShowLevelSelect(false);
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Play Level {currentLevelId}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <button
          onClick={() => setShowLevelSelect(true)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="text-center">
          <h3 className="text-sm font-medium text-foreground">Level {currentLevelId}: {level.name}</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/20">
        <div className="flex items-center gap-4">
          {level.movesLimit && (
            <div className="flex items-center gap-1.5">
              <Move className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">{gameState.movesRemaining}</span>
            </div>
          )}
          {level.timeLimit && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400">{gameState.timeRemaining}s</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400">{gameState.score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{getTargetText()}</span>
          {gameState.combo > 0 && (
            <span className="text-xs text-amber-400">🔥 {gameState.combo}x Combo</span>
          )}
        </div>
        <Progress value={Math.min(getProgressPercent(), 100)} className="h-2" />
      </div>

      {/* Game Board */}
      <div className="p-4 flex justify-center">
        <div 
          className="grid gap-1 p-2 rounded-xl bg-black/30 border border-white/10"
          style={{
            gridTemplateColumns: `repeat(${level.gridSize.cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${level.gridSize.rows}, ${cellSize}px)`,
          }}
        >
          {gameState.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <GameCell
                key={cell.id}
                cell={cell}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                size={cellSize}
              />
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={resetGame}
          className="bg-white/5 border-white/10"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Restart
        </Button>
      </div>

      {/* Victory/Defeat Modal */}
      <AnimatePresence>
        {gameState.isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 rounded-2xl border border-white/10 text-center max-w-xs"
            >
              {gameState.isVictory ? (
                <>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                    className="text-5xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-xl font-display text-foreground mb-2">Level Complete!</h3>
                  <div className="flex justify-center gap-1 mb-4">
                    {[1, 2, 3].map((s) => (
                      <motion.div
                        key={s}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: s * 0.2 }}
                      >
                        <Star
                          className={`w-8 h-8 ${s <= gameState.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    +{level.karmaReward * gameState.stars} Karma Earned!
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLevelComplete();
                        resetGame();
                      }}
                      className="flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Replay
                    </Button>
                    <Button
                      onClick={() => {
                        handleLevelComplete();
                        if (currentLevelId < DIVINE_MATCH_LEVELS.length) {
                          setCurrentLevelId(currentLevelId + 1);
                        }
                        setShowLevelSelect(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">😔</div>
                  <h3 className="text-xl font-display text-foreground mb-2">Out of Moves</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Don't give up! Try again.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowLevelSelect(true)}
                      className="flex-1"
                    >
                      Levels
                    </Button>
                    <Button
                      onClick={resetGame}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Try Again
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DivineMatchGame;
