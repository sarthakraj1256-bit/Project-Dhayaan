import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Lightbulb, Heart, Footprints, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Volume2, VolumeX, Zap } from 'lucide-react';
import { useSpiritualProgress } from '@/hooks/useSpiritualProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  generateMaze,
  findShortestPath,
  LEVEL_CONFIGS,
  PUZZLES,
  SUTRAS,
  ELEMENT_CONFIG,
  ELEMENT_HARMONY,
  ELEMENT_FREQUENCIES,
  PRANA_COST_DISHARMONY,
  PRANA_REGEN_HARMONY,
  STARTING_PRANA,
  type MazeCell,
  type LogicPuzzle,
} from '@/data/templeLabyrinthData';

interface Props {
  onClose: () => void;
  onKarmaEarned: (points: number) => void;
}

type GamePhase = 'intro' | 'playing' | 'puzzle' | 'levelComplete' | 'gameComplete' | 'gameOver';

const TempleLabyrinthGame = ({ onClose, onKarmaEarned }: Props) => {
  const { addKarma } = useSpiritualProgress();
  const { language } = useLanguage();

  const [phase, setPhase] = useState<GamePhase>('intro');
  const [level, setLevel] = useState(0);
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 0]);
  const [prana, setPrana] = useState(STARTING_PRANA);
  const [moves, setMoves] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<LogicPuzzle | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null);
  const [totalKarma, setTotalKarma] = useState(0);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shortestPathLen, setShortestPathLen] = useState(0);
  const [hintPath, setHintPath] = useState<Set<string>>(new Set());
  const [hintVisible, setHintVisible] = useState(false);
  const [pathHintsUsed, setPathHintsUsed] = useState(0);

  const [gatesSolved, setGatesSolved] = useState(0); // total gates solved across all levels

  const audioCtxRef = useRef<AudioContext | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Progressive soundscape layers
  const droneNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);

  // Chant layer frequencies — each gate unlocks the next harmonic
  const CHANT_LAYERS = [
    { freq: 136.1, type: 'sine' as OscillatorType, name: 'Earth OM' },        // Gate 1 — root drone
    { freq: 272.2, type: 'sine' as OscillatorType, name: 'Octave Harmonic' },  // Gate 2 — octave
    { freq: 528,   type: 'sine' as OscillatorType, name: 'Heart Resonance' },  // Gate 3 — solfeggio
    { freq: 639,   type: 'triangle' as OscillatorType, name: 'Connection' },   // Gate 4 — harmony
    { freq: 963,   type: 'sine' as OscillatorType, name: 'Crown Awakening' },  // Gate 5 — transcendence
    { freq: 432,   type: 'sine' as OscillatorType, name: 'Cosmic Tuning' },    // Bonus layers
    { freq: 852,   type: 'triangle' as OscillatorType, name: 'Intuition' },
  ];

  // Initialize audio context
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = 0.06;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    return audioCtxRef.current;
  }, []);

  // Add a new drone layer when a gate is solved
  const addDroneLayer = useCallback((layerIndex: number) => {
    if (!soundEnabled) return;
    if (layerIndex >= CHANT_LAYERS.length) return;
    try {
      const ctx = getAudioCtx();
      const master = masterGainRef.current;
      if (!master) return;

      const layer = CHANT_LAYERS[layerIndex];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = layer.type;
      osc.frequency.value = layer.freq;

      // Fade in gently over 2 seconds
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);

      osc.connect(gain).connect(master);
      osc.start();

      droneNodesRef.current.push({ osc, gain });

      // As more layers stack, reduce master gain slightly to avoid clipping
      const totalLayers = droneNodesRef.current.length;
      master.gain.linearRampToValueAtTime(
        Math.max(0.025, 0.06 / Math.sqrt(totalLayers)),
        ctx.currentTime + 1
      );
    } catch {}
  }, [soundEnabled, getAudioCtx]);

  // Stop all drone layers (on game end / close)
  const stopAllDrones = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    droneNodesRef.current.forEach(({ osc, gain }) => {
      try {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.6);
      } catch {}
    });
    droneNodesRef.current = [];
  }, []);

  // Play element tone (short one-shot)
  const playTone = useCallback((freq: number, duration = 0.15, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [soundEnabled, getAudioCtx]);

  // Start level
  const startLevel = useCallback((lvl: number) => {
    const config = LEVEL_CONFIGS[lvl];
    const newMaze = generateMaze(config.size);
    setMaze(newMaze);
    setPlayerPos([0, 0]);
    setPrana(STARTING_PRANA);
    setMoves(0);
    setVisitedCells(new Set(['0,0']));
    setShowHint(false);
    setPhase('playing');
    setHintPath(new Set());
    setHintVisible(false);

    const path = findShortestPath(newMaze, [0, 0], [config.size - 1, config.size - 1]);
    setShortestPathLen(path.length);
  }, []);

  // Handle player movement
  const movePlayer = useCallback((dr: number, dc: number) => {
    if (phase !== 'playing') return;
    // Clear hint path on movement
    if (hintVisible) { setHintVisible(false); setHintPath(new Set()); }

    const [r, c] = playerPos;
    const nr = r + dr;
    const nc = c + dc;
    const size = maze.length;

    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return;

    // Check walls
    const cell = maze[r][c];
    if (dr === -1 && cell.walls.top) return;
    if (dr === 1 && cell.walls.bottom) return;
    if (dc === -1 && cell.walls.left) return;
    if (dc === 1 && cell.walls.right) return;

    const nextCell = maze[nr][nc];
    const fromElement = cell.element;
    const toElement = nextCell.element;
    const isHarmonic = ELEMENT_HARMONY[fromElement].includes(toElement);

    // Update prana
    let newPrana = prana;
    if (!isHarmonic) {
      newPrana = Math.max(0, prana - PRANA_COST_DISHARMONY);
      playTone(200, 0.2, 'sawtooth'); // Dissonant
    } else {
      newPrana = Math.min(STARTING_PRANA, prana + PRANA_REGEN_HARMONY);
      playTone(ELEMENT_FREQUENCIES[toElement], 0.15);
    }

    setPrana(newPrana);
    setPlayerPos([nr, nc]);
    setMoves(m => m + 1);
    setVisitedCells(prev => new Set(prev).add(`${nr},${nc}`));

    // Check game over (prana depleted)
    if (newPrana <= 0) {
      stopAllDrones();
      setPhase('gameOver');
      return;
    }

    // Check gateway
    if (nextCell.isGateway) {
      const puzzles = PUZZLES[level];
      const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      setCurrentPuzzle(puzzle);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setShowHint(false);
      setPhase('puzzle');
      return;
    }

    // Check end
    if (nextCell.isEnd) {
      const efficiency = shortestPathLen > 0 ? Math.max(0, 1 - (moves / (shortestPathLen * 3))) : 0.5;
      const levelKarma = Math.round(20 + (level * 15) + (efficiency * 30) + (prana / 5));
      setTotalKarma(prev => prev + levelKarma);
      onKarmaEarned(levelKarma);
      addKarma(levelKarma, 'game');

      // Play harmonic resolution chord (richer at higher levels)
      playTone(528, 0.6);
      setTimeout(() => playTone(639, 0.5), 100);
      if (level >= 2) setTimeout(() => playTone(432, 0.4), 200);
      if (level >= 4) {
        // Final level: play full harmonic chord + slowly fade drones
        setTimeout(() => playTone(963, 0.8), 300);
        setTimeout(() => playTone(136.1, 1.0), 400);
        setTimeout(() => stopAllDrones(), 3000);
      }

      if (level < 4) {
        setPhase('levelComplete');
      } else {
        setPhase('gameComplete');
      }
    }
  }, [phase, playerPos, maze, prana, level, moves, shortestPathLen, playTone, onKarmaEarned, addKarma, stopAllDrones, hintVisible]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp': case 'w': movePlayer(-1, 0); break;
        case 'ArrowDown': case 's': movePlayer(1, 0); break;
        case 'ArrowLeft': case 'a': movePlayer(0, -1); break;
        case 'ArrowRight': case 'd': movePlayer(0, 1); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [movePlayer, phase]);

  // Touch swipe controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || phase !== 'playing') return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipe) movePlayer(0, dx > 0 ? 1 : -1);
    } else {
      if (Math.abs(dy) > minSwipe) movePlayer(dy > 0 ? 1 : -1, 0);
    }
    touchStartRef.current = null;
  }, [movePlayer, phase]);

  // Handle puzzle answer
  const handleAnswer = useCallback((idx: number) => {
    if (!currentPuzzle || answerResult) return;
    setSelectedAnswer(idx);

    if (idx === currentPuzzle.correctIndex) {
      setAnswerResult('correct');
      playTone(528, 0.3);
      
      // Add progressive drone layer
      const newGateCount = gatesSolved + 1;
      setGatesSolved(newGateCount);
      addDroneLayer(newGateCount - 1);
      
      setTimeout(() => {
        setPhase('playing');
        setCurrentPuzzle(null);
        setAnswerResult(null);
        const [r, c] = playerPos;
        maze[r][c].isGateway = false;
      }, 1000);
    } else {
      setAnswerResult('wrong');
      setPrana(p => Math.max(0, p - 15));
      playTone(150, 0.3, 'sawtooth');
      setTimeout(() => {
        setSelectedAnswer(null);
        setAnswerResult(null);
        if (prana - 15 <= 0) setPhase('gameOver');
      }, 1200);
    }
  }, [currentPuzzle, answerResult, playTone, playerPos, maze, prana, gatesSolved, addDroneLayer]);

  // Cleanup audio
  useEffect(() => {
    return () => { stopAllDrones(); audioCtxRef.current?.close(); };
  }, [stopAllDrones]);

  // Wrap onClose to stop drones
  const handleClose = useCallback(() => {
    stopAllDrones();
    onClose();
  }, [stopAllDrones, onClose]);

  const config = LEVEL_CONFIGS[level];
  const sutra = SUTRAS[level] || SUTRAS[0];

  // ─── INTRO ───
  if (phase === 'intro') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">🛕 Path to the Garbhagriha</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted/50"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="rounded-xl p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20 text-center space-y-4">
          <div className="text-5xl">🕉️</div>
          <h3 className="font-display text-lg text-foreground">The Pancha-Prakara Temple</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Navigate through five sacred layers of a temple complex. Solve logic gates at each Gopuram, 
            follow the Vastu Purusha Mandala, and reach the Garbhagriha — the innermost sanctum.
          </p>

          <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto pt-2">
            {LEVEL_CONFIGS.map((l, i) => (
              <div key={i} className="text-center">
                <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <p className="text-[9px] text-muted-foreground mt-1 truncate">{l.name}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> Prana = Life</span>
            <span className="flex items-center gap-1"><Footprints className="w-3 h-3 text-primary" /> Minimal Moves</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Logic Gates</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => startLevel(0)}
            className="px-8 py-3 rounded-full bg-primary/20 border border-primary/50 text-primary font-medium hover:bg-primary/30 transition-colors"
          >
            Begin the Journey
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ─── GAME OVER ───
  if (phase === 'gameOver') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">🛕 Prana Depleted</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted/50"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="rounded-xl p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 text-center space-y-4">
          <div className="text-5xl">💫</div>
          <h3 className="font-display text-lg text-foreground">Your Prana was Exhausted</h3>
          <p className="text-sm text-muted-foreground">
            Moving against the Vastu element flow drained your life force. 
            Follow the harmonic paths to preserve Prana.
          </p>
          <p className="text-xs text-muted-foreground">Reached Level {level + 1} · {moves} moves · {totalKarma} Karma earned</p>
          <div className="flex gap-3 justify-center">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { stopAllDrones(); setLevel(0); setTotalKarma(0); setGatesSolved(0); startLevel(0); }}
              className="px-6 py-2 rounded-full bg-primary/20 border border-primary/50 text-primary text-sm hover:bg-primary/30 transition-colors">
              <RotateCcw className="w-4 h-4 inline mr-1" /> Retry
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleClose}
              className="px-6 py-2 rounded-full bg-muted/50 border border-border text-muted-foreground text-sm hover:bg-muted transition-colors">
              Exit
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── GAME COMPLETE ───
  if (phase === 'gameComplete') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">🛕 Garbhagriha Reached!</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted/50"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="rounded-xl p-6 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15 border border-amber-500/30 text-center space-y-5">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl">🕉️</motion.div>
          <h3 className="font-display text-xl text-foreground">You Have Reached the Sanctum</h3>

          <div className="rounded-lg p-4 bg-background/50 border border-primary/20 max-w-sm mx-auto space-y-2">
            <p className="text-primary font-display text-lg">"{sutra.sanskrit}"</p>
            <p className="text-sm text-foreground italic">{sutra.english}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{sutra.coding}</p>
          </div>

          <p className="text-lg font-display text-primary">+{totalKarma} Total Karma</p>
          <p className="text-xs text-muted-foreground">{moves} total moves across 5 levels · {hintsUsed} hints used</p>

          <div className="flex gap-3 justify-center">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { stopAllDrones(); setLevel(0); setTotalKarma(0); setGatesSolved(0); startLevel(0); }}
              className="px-6 py-2 rounded-full bg-primary/20 border border-primary/50 text-primary text-sm hover:bg-primary/30 transition-colors">
              Play Again
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleClose}
              className="px-6 py-2 rounded-full bg-muted/50 border border-border text-muted-foreground text-sm hover:bg-muted transition-colors">
              Return
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── LEVEL COMPLETE ───
  if (phase === 'levelComplete') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">🛕 {config.prakara} Complete!</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted/50"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="rounded-xl p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center space-y-4">
          <div className="text-5xl">🏛️</div>
          <h3 className="font-display text-lg text-foreground">
            {language === 'hi' ? config.nameHi : config.name} — Cleared!
          </h3>
          <p className="text-sm text-muted-foreground">{moves} moves · {prana} Prana remaining</p>
          <p className="text-sm text-primary font-medium">Next: {LEVEL_CONFIGS[level + 1].name}</p>

          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { const next = level + 1; setLevel(next); startLevel(next); }}
            className="px-8 py-3 rounded-full bg-primary/20 border border-primary/50 text-primary font-medium hover:bg-primary/30 transition-colors">
            Enter Next Prakara →
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ─── PLAYING + PUZZLE ───
  const size = maze.length;
  const cellSize = Math.min(Math.floor((Math.min(window.innerWidth - 48, 500)) / size), 56);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base text-foreground">
            L{level + 1}: {language === 'hi' ? config.nameHi : config.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (!next) stopAllDrones();
          }} className="p-1.5 rounded-full hover:bg-muted/50">
            {soundEnabled ? <Volume2 className="w-4 h-4 text-muted-foreground" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-muted/50">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-red-400" />
          <div className="w-20 h-2 rounded-full bg-muted/30 overflow-hidden">
            <motion.div className="h-full rounded-full" animate={{ width: `${prana}%` }}
              style={{ background: prana > 50 ? '#22c55e' : prana > 25 ? '#f59e0b' : '#ef4444' }} />
          </div>
          <span className="text-muted-foreground w-7 text-right">{prana}</span>
        </div>
        <span className="text-muted-foreground">
          <Footprints className="w-3 h-3 inline" /> {moves}
        </span>
        <span className="text-primary text-xs ml-auto">+{totalKarma} ✦</span>
      </div>

      {/* Soundscape indicator */}
      {gatesSolved > 0 && soundEnabled && (
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <Volume2 className="w-3 h-3 text-primary/60" />
          <span>{gatesSolved} harmonic {gatesSolved === 1 ? 'layer' : 'layers'} active</span>
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(gatesSolved, 7) }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-primary"
              />
            ))}
          </div>
        </div>
      )}

      {/* Element legend */}
      <div className="flex gap-2 justify-center flex-wrap text-[10px]">
        {(['earth', 'water', 'fire', 'air', 'space'] as const).map(el => (
          <span key={el} className="flex items-center gap-0.5 text-muted-foreground">
            <span style={{ color: ELEMENT_CONFIG[el].color }}>{ELEMENT_CONFIG[el].emoji}</span>
            {language === 'hi' ? ELEMENT_CONFIG[el].nameHi : ELEMENT_CONFIG[el].name}
          </span>
        ))}
      </div>

      {/* Maze grid */}
      <div
        className="mx-auto relative select-none"
        style={{ width: cellSize * size, height: cellSize * size }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {maze.map((row, r) => row.map((cell, c) => {
          const isPlayer = r === playerPos[0] && c === playerPos[1];
          const isVisited = visitedCells.has(`${r},${c}`);
          const elConfig = ELEMENT_CONFIG[cell.element];

          const isHintCell = hintVisible && hintPath.has(`${r},${c}`);

          return (
            <div
              key={`${r}-${c}`}
              className={`absolute transition-colors duration-200 ${isHintCell ? 'z-10' : ''}`}
              style={{
                left: c * cellSize,
                top: r * cellSize,
                width: cellSize,
                height: cellSize,
                background: isPlayer
                  ? 'rgba(201,168,76,0.35)'
                  : isHintCell
                  ? 'hsl(var(--primary) / 0.25)'
                  : isVisited
                  ? `${elConfig.color}15`
                  : `${elConfig.color}08`,
                borderTop: cell.walls.top ? '2px solid hsl(var(--border))' : '1px solid transparent',
                borderRight: cell.walls.right ? '2px solid hsl(var(--border))' : '1px solid transparent',
                borderBottom: cell.walls.bottom ? '2px solid hsl(var(--border))' : '1px solid transparent',
                borderLeft: cell.walls.left ? '2px solid hsl(var(--border))' : '1px solid transparent',
                boxShadow: isHintCell ? 'inset 0 0 8px hsl(var(--primary) / 0.3)' : 'none',
              }}
            >
              {/* Element indicator */}
              {cellSize >= 28 && (
                <span className="absolute text-[8px] opacity-40" style={{ top: 1, left: 2, color: elConfig.color }}>
                  {elConfig.emoji}
                </span>
              )}

              {/* Player */}
              {isPlayer && (
                <motion.div
                  layoutId="player"
                  className="absolute inset-0 flex items-center justify-center"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-base">
                    🙏
                  </motion.span>
                </motion.div>
              )}

              {/* Start */}
              {cell.isStart && !isPlayer && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">▶</div>
              )}

              {/* End */}
              {cell.isEnd && (
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center text-sm">
                  🕉️
                </motion.div>
              )}

              {/* Gateway */}
              {cell.isGateway && !isPlayer && (
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 flex items-center justify-center text-sm">
                  ⚡
                </motion.div>
              )}
            </div>
          );
        }))}
      </div>

      {/* D-Pad + Hint button */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="grid grid-cols-3 gap-1 w-28">
          <div />
          <button onClick={() => movePlayer(-1, 0)} className="p-2 rounded-lg bg-muted/50 hover:bg-muted active:bg-primary/20 flex items-center justify-center">
            <ChevronUp className="w-5 h-5 text-foreground" />
          </button>
          <div />
          <button onClick={() => movePlayer(0, -1)} className="p-2 rounded-lg bg-muted/50 hover:bg-muted active:bg-primary/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="p-2 rounded-lg bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
            🙏
          </div>
          <button onClick={() => movePlayer(0, 1)} className="p-2 rounded-lg bg-muted/50 hover:bg-muted active:bg-primary/20 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
          <div />
          <button onClick={() => movePlayer(1, 0)} className="p-2 rounded-lg bg-muted/50 hover:bg-muted active:bg-primary/20 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-foreground" />
          </button>
          <div />
        </div>

        {/* Hint button */}
        <button
          onClick={() => {
            if (hintVisible || prana <= 15) return;
            const path = findShortestPath(
              maze,
              playerPos,
              [maze.length - 1, maze.length - 1]
            );
            if (path.length > 0) {
              const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));
              setHintPath(pathSet);
              setHintVisible(true);
              setPathHintsUsed(h => h + 1);
              setPrana(p => Math.max(0, p - 15));
              playTone(432, 0.2);
              // Auto-hide after 2.5 seconds
              setTimeout(() => {
                setHintVisible(false);
                setHintPath(new Set());
              }, 2500);
            }
          }}
          disabled={hintVisible || prana <= 15}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-colors ${
            hintVisible || prana <= 15
              ? 'bg-muted/20 border-border/30 opacity-40 cursor-not-allowed'
              : 'bg-primary/10 border-primary/30 hover:bg-primary/20 active:bg-primary/30'
          }`}
        >
          <Lightbulb className="w-5 h-5 text-primary" />
          <span className="text-[9px] text-muted-foreground leading-tight">Path<br/>−15 ♥</span>
        </button>
      </div>

      {/* Puzzle Modal */}
      <AnimatePresence>
        {phase === 'puzzle' && currentPuzzle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85 }}
              className="bg-background rounded-2xl p-6 max-w-sm w-full border border-border shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-display text-base text-foreground">Gopuram Logic Gate</h3>
              </div>

              <p className="text-sm text-foreground leading-relaxed">{currentPuzzle.question}</p>

              <div className="space-y-2">
                {currentPuzzle.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAnswer(i)}
                    disabled={answerResult !== null}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors border ${
                      selectedAnswer === i
                        ? answerResult === 'correct'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : answerResult === 'wrong'
                          ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : 'border-primary/50 bg-primary/10'
                        : 'border-border bg-muted/30 text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </motion.button>
                ))}
              </div>

              {showHint && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-amber-400/80 bg-amber-500/10 rounded-lg px-3 py-2">
                  💡 {currentPuzzle.hint}
                </motion.p>
              )}

              {!showHint && !answerResult && (
                <button onClick={() => { setShowHint(true); setHintsUsed(h => h + 1); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Lightbulb className="w-3 h-3" /> Show hint (-5 Prana)
                </button>
              )}

              {answerResult === 'correct' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-emerald-400 font-medium text-center">
                  ✓ Gopuram unlocked!
                </motion.p>
              )}
              {answerResult === 'wrong' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 text-center">
                  ✗ Wrong — try again (−15 Prana)
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TempleLabyrinthGame;
