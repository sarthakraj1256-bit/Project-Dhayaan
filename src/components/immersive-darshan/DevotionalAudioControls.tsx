import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Bell, Mic2, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ImmersiveTemple } from '@/data/immersiveTemples';

interface DevotionalAudioControlsProps {
  temple: ImmersiveTemple;
  isPlaying: boolean;
  currentTrack: 'aarti' | 'kirtan' | 'ambience' | 'chanting' | null;
  volume: number;
  bellPlaying: boolean;
  onPlayAarti: () => void;
  onPlayKirtan: () => void;
  onPlayAmbience: () => void;
  onPlayChanting: () => void;
  onRingBell: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
}

const DevotionalAudioControls = ({
  temple,
  isPlaying,
  currentTrack,
  volume,
  bellPlaying,
  onPlayAarti,
  onPlayKirtan,
  onPlayAmbience,
  onPlayChanting,
  onRingBell,
  onStop,
  onVolumeChange
}: DevotionalAudioControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const audioOptions = [
    { id: 'aarti', label: 'Aarti', icon: Waves, action: onPlayAarti, color: 'text-orange-400' },
    { id: 'kirtan', label: 'Kirtan', icon: Music, action: onPlayKirtan, color: 'text-purple-400' },
    { id: 'ambience', label: 'Ambience', icon: Mic2, action: onPlayAmbience, color: 'text-blue-400' },
    { id: 'chanting', label: 'Chanting', icon: Waves, action: onPlayChanting, color: 'text-green-400' }
  ];

  return (
    <div className="absolute bottom-32 left-4 z-20">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-3 p-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-primary/30 min-w-[200px]"
          >
            <h3 className="text-sm font-medium text-white/90 mb-3">🎵 Devotional Audio</h3>
            
            {/* Audio options */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {audioOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={option.action}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    currentTrack === option.id
                      ? 'bg-primary/30 border border-primary'
                      : 'bg-white/10 hover:bg-white/20 border border-transparent'
                  }`}
                >
                  <option.icon className={`w-4 h-4 ${option.color}`} />
                  <span className="text-xs text-white/90">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Bell button */}
            <button
              onClick={onRingBell}
              disabled={bellPlaying}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg mb-4 transition-all ${
                bellPlaying
                  ? 'bg-primary/50 animate-pulse'
                  : 'bg-gradient-to-r from-primary/30 to-orange-500/30 hover:from-primary/50 hover:to-orange-500/50'
              } border border-primary/50`}
            >
              <Bell className={`w-4 h-4 text-primary ${bellPlaying ? 'animate-bounce' : ''}`} />
              <span className="text-sm text-white">{bellPlaying ? 'Ringing...' : 'Ring Bell'}</span>
            </button>

            {/* Volume control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Volume</span>
                <span className="text-xs text-white/70">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([v]) => onVolumeChange(v)}
                className="w-full"
              />
            </div>

            {/* Stop button */}
            {isPlaying && (
              <Button
                variant="outline"
                size="sm"
                onClick={onStop}
                className="w-full mt-3 border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                Stop Audio
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-4 rounded-full backdrop-blur-xl transition-all ${
          isPlaying
            ? 'bg-primary/40 border-2 border-primary shadow-lg shadow-primary/30'
            : 'bg-black/60 border border-white/20 hover:border-primary/50'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? (
          <Volume2 className="w-6 h-6 text-white" />
        ) : (
          <VolumeX className="w-6 h-6 text-white/70" />
        )}
        
        {/* Playing indicator */}
        {isPlaying && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.button>

      {/* Current track label */}
      {isPlaying && currentTrack && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/60 rounded-lg"
        >
          <span className="text-xs text-white/80 capitalize">{currentTrack}</span>
        </motion.div>
      )}
    </div>
  );
};

export default DevotionalAudioControls;
