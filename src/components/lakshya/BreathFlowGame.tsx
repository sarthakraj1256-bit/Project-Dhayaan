import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useSpiritualProgress } from '@/hooks/useSpiritualProgress';
import { useBreathPreferences } from '@/hooks/useBreathPreferences';
import { supabase } from '@/integrations/backend/client';
import BreathSettings, { type BreathTimings } from './BreathSettings';

interface BreathFlowGameProps {
  onClose: () => void;
  onKarmaEarned: (points: number) => void;
}

type GameState = 'settings' | 'playing' | 'paused' | 'complete';

const BreathFlowGame = ({ onClose, onKarmaEarned }: BreathFlowGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const { addKarma, userId } = useSpiritualProgress();
  const { timings: savedTimings, loaded, save: saveTimings } = useBreathPreferences(userId);

  const [gameState, setGameState] = useState<GameState>('settings');
  const [activeTimings, setActiveTimings] = useState<BreathTimings>({ inhaleSeconds: 4, exhaleSeconds: 6, holdSeconds: 2 });
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);
  const [distance, setDistance] = useState(0);
  const [consistency, setConsistency] = useState(100);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [karmaEarned, setKarmaEarned] = useState(0);

  // Derived timing in ms
  const inhaleMs = activeTimings.inhaleSeconds * 1000;
  const holdMs = activeTimings.holdSeconds * 1000;
  const exhaleMs = activeTimings.exhaleSeconds * 1000;
  const cycleMs = inhaleMs + holdMs + exhaleMs;

  // Initialize audio
  useEffect(() => {
    if (soundEnabled && gameState === 'playing') {
      audioContextRef.current = new AudioContext();
      const oscillator = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 136.1;
      oscillator.connect(gain);
      gain.connect(audioContextRef.current.destination);
      gain.gain.value = 0;
      oscillator.start();
      oscillatorRef.current = oscillator;
      gainRef.current = gain;
    }
    return () => {
      oscillatorRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, [soundEnabled, gameState]);

  useEffect(() => {
    if (!gainRef.current || !soundEnabled) return;
    const targetVolume = breathPhase === 'inhale' ? 0.1 : breathPhase === 'exhale' ? 0.05 : 0.02;
    gainRef.current.gain.linearRampToValueAtTime(targetVolume, audioContextRef.current!.currentTime + 0.5);
  }, [breathPhase, soundEnabled]);

  // Game loop — uses dynamic timings
  useEffect(() => {
    if (gameState !== 'playing') return;
    let startTime = Date.now();
    let lastUpdate = startTime;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdate;
      lastUpdate = now;
      setElapsedTime(Math.floor((now - startTime) / 1000));

      const cyclePosition = now % cycleMs;
      if (cyclePosition < inhaleMs) {
        setBreathPhase('inhale');
        setBreathProgress(cyclePosition / inhaleMs);
      } else if (cyclePosition < inhaleMs + holdMs) {
        setBreathPhase('hold');
        setBreathProgress((cyclePosition - inhaleMs) / holdMs);
      } else {
        setBreathPhase('exhale');
        setBreathProgress((cyclePosition - inhaleMs - holdMs) / exhaleMs);
      }

      setDistance(d => d + (breathPhase === 'inhale' ? deltaTime * 0.01 : 0));
      setConsistency(c => Math.max(0, Math.min(100, c + (Math.random() - 0.3) * 0.5)));
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [gameState, breathPhase, cycleMs, inhaleMs, holdMs, exhaleMs]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, height / 2);
      ctx.lineTo(width - 100, height / 2);
      ctx.stroke();

      for (let i = 0; i < 10; i++) {
        const x = 100 + ((width - 200) / 10) * i;
        ctx.fillStyle = i * 10 <= Math.floor(distance / 10) ? 'rgba(100, 200, 255, 0.5)' : 'rgba(100, 150, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(x, height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      const orbSize = breathPhase === 'inhale' ? 20 + breathProgress * 15 : breathPhase === 'exhale' ? 35 - breathProgress * 15 : 35;
      const orbX = 100 + Math.min(distance * 2, width - 200);
      const orbY = height / 2 + Math.sin(Date.now() * 0.003) * 10;

      const gradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize * 2);
      gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.3)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbSize * 2, 0, Math.PI * 2);
      ctx.fill();

      const coreGradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize);
      coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      coreGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.9)');
      coreGradient.addColorStop(1, 'rgba(100, 150, 255, 0.5)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
      ctx.fill();

      if (gameState === 'playing') requestAnimationFrame(draw);
    };

    if (gameState === 'playing') draw();
  }, [gameState, breathPhase, breathProgress, distance]);

  const handleStart = async (timings: BreathTimings) => {
    setActiveTimings(timings);
    await saveTimings(timings);
    setGameState('playing');
    setDistance(0);
    setConsistency(100);
    setElapsedTime(0);
    setKarmaEarned(0);
  };

  const completeGame = useCallback(async () => {
    setGameState('complete');
    const timeBonus = Math.floor(elapsedTime / 10) * 5;
    const distanceBonus = Math.floor(distance / 10) * 2;
    const consistencyBonus = Math.floor(consistency / 10) * 3;
    // Intensity bonus for longer cycles
    const intensityMultiplier = (activeTimings.inhaleSeconds + activeTimings.exhaleSeconds) >= 16 ? 1.5 : 1;
    const totalKarma = Math.max(10, Math.floor((timeBonus + distanceBonus + consistencyBonus) * intensityMultiplier));
    setKarmaEarned(totalKarma);

    if (userId) {
      await addKarma(totalKarma, 'game');
      await supabase.from('breath_flow_sessions').insert({
        user_id: userId,
        duration_seconds: elapsedTime,
        max_distance_reached: Math.floor(distance),
        breath_consistency_score: consistency,
        karma_earned: totalKarma,
        chakra_fragments_earned: Math.floor(totalKarma / 20),
        inhale_seconds: activeTimings.inhaleSeconds,
        exhale_seconds: activeTimings.exhaleSeconds,
        hold_seconds: activeTimings.holdSeconds,
      });
    }
    onKarmaEarned(totalKarma);
  }, [elapsedTime, distance, consistency, userId, addKarma, onKarmaEarned, activeTimings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-foreground">Breath Flow Journey</h2>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-900/20 to-violet-900/20 border border-indigo-500/20">
        {/* Settings Screen */}
        <AnimatePresence>
          {gameState === 'settings' && loaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-gradient-to-b from-void/90 to-void/95"
            >
              <BreathSettings initialTimings={savedTimings} onStart={handleStart} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complete Screen */}
        <AnimatePresence>
          {gameState === 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-void/90 to-void/95"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-6xl mb-6">✨</motion.div>
              <h3 className="font-display text-2xl text-foreground mb-2">Journey Complete</h3>
              <p className="text-muted-foreground mb-6">Your breath has found its flow</p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center mb-8">
                <div className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2">+{karmaEarned}</div>
                <p className="text-amber-400">Karma Points Earned</p>
              </motion.div>
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xl font-display text-foreground">{formatTime(elapsedTime)}</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xl font-display text-foreground">{Math.floor(distance)}</p>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xl font-display text-foreground">{Math.floor(consistency)}%</p>
                  <p className="text-xs text-muted-foreground">Consistency</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Rhythm: {activeTimings.inhaleSeconds}s / {activeTimings.holdSeconds}s / {activeTimings.exhaleSeconds}s
              </p>
              <div className="flex gap-4">
                <button onClick={() => setGameState('settings')} className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
                <button onClick={onClose} className="px-6 py-2 rounded-full bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors">Done</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <canvas ref={canvasRef} width={800} height={400} className="w-full h-[400px]" />

        {/* Game UI Overlay */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <>
            <div className="absolute top-4 left-4 flex items-center gap-4">
              <div className="px-4 py-2 rounded-lg bg-void/80 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-lg font-mono text-foreground">{formatTime(elapsedTime)}</p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-void/80 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="text-lg font-mono text-foreground">{Math.floor(distance)}</p>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full bg-void/80 backdrop-blur-sm hover:bg-void transition-colors">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')} className="p-2 rounded-full bg-void/80 backdrop-blur-sm hover:bg-void transition-colors">
                {gameState === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] flex flex-col items-center gap-3">
              <div className="px-6 py-3 rounded-full bg-void/80 backdrop-blur-sm flex items-center gap-4">
                <motion.div
                  animate={{
                    scale: breathPhase === 'inhale' ? [1, 1.3] : breathPhase === 'exhale' ? [1.3, 1] : 1.3,
                    opacity: breathPhase === 'hold' ? [0.5, 1, 0.5] : 1,
                  }}
                  transition={{
                    duration: breathPhase === 'inhale' ? activeTimings.inhaleSeconds : breathPhase === 'exhale' ? activeTimings.exhaleSeconds : activeTimings.holdSeconds,
                    repeat: Infinity,
                  }}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400"
                />
                <div className="text-center">
                  <p className={`text-lg font-medium capitalize ${breathPhase === 'inhale' ? 'text-cyan-400' : breathPhase === 'hold' ? 'text-violet-400' : 'text-indigo-400'}`}>
                    {breathPhase}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {breathPhase === 'inhale' ? `Breathe in (${activeTimings.inhaleSeconds}s)...` :
                     breathPhase === 'hold' ? `Hold (${activeTimings.holdSeconds}s)...` :
                     `Release (${activeTimings.exhaleSeconds}s)...`}
                  </p>
                </div>
              </div>
              <button onClick={completeGame} className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm">
                End & Collect Karma
              </button>
            </div>

            {gameState === 'paused' && (
              <div className="absolute inset-0 flex items-center justify-center bg-void/50 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-2xl font-display text-foreground mb-4">Paused</p>
                  <button onClick={() => setGameState('playing')} className="px-6 py-2 rounded-full bg-primary/20 border border-primary/50 text-primary">Resume</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BreathFlowGame;
