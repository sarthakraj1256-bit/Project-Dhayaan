import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Layers, Loader2, Check, Cloud, Timer, Heart, ChevronUp, ChevronDown, Pause, Square } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { atmospheres } from '@/data/soundLibrary';

interface AudioControlsProps {
  isPlaying: boolean;
  currentFrequency: number | null;
  currentFrequencyName?: string;
  currentFrequencyCategory?: string;
  frequencyVolume: number;
  atmosphereVolume: number;
  currentAtmosphere: string;
  atmosphereLoading?: boolean;
  atmosphereCached?: boolean;
  atmosphereError?: string | null;
  sessionTime?: string;
  isFavorited?: boolean;
  isAuthenticated?: boolean;
  onSaveFavorite?: () => void;
  onFrequencyVolumeChange: (volume: number) => void;
  onAtmosphereVolumeChange: (volume: number) => void;
  onAtmosphereChange: (atmosphereId: string) => void;
  onStop: () => void;
}

const AudioControls = ({
  isPlaying,
  currentFrequency,
  currentFrequencyName,
  currentFrequencyCategory,
  frequencyVolume,
  atmosphereVolume,
  currentAtmosphere,
  atmosphereLoading = false,
  atmosphereCached = false,
  atmosphereError = null,
  sessionTime = '00:00',
  isFavorited = false,
  isAuthenticated = false,
  onSaveFavorite,
  onFrequencyVolumeChange,
  onAtmosphereVolumeChange,
  onAtmosphereChange,
  onStop,
}: AudioControlsProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!isPlaying) return null;

  return (
    <>
      {/* Backdrop overlay when expanded on mobile */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-void/60 backdrop-blur-sm md:hidden"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-2xl"
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--void-light) / 0.95), hsl(var(--void) / 0.98))',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid hsl(var(--gold) / 0.25)',
            boxShadow: '0 -4px 40px -10px hsl(var(--gold) / 0.25)',
          }}
        >
          {/* ── Expanded Controls (renders ABOVE the bar) ── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 pt-4 space-y-4 max-h-[50vh] overflow-y-auto">
                  {/* Favorite */}
                  {onSaveFavorite && (
                    <div className="flex justify-end">
                      <button
                        onClick={onSaveFavorite}
                        disabled={isFavorited}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                          isFavorited
                            ? 'bg-primary/20 text-primary cursor-default'
                            : 'bg-white/5 border border-white/10 hover:bg-primary/20 hover:text-primary text-muted-foreground'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-primary' : ''}`} />
                        {isFavorited ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  )}

                  {/* Frequency Volume */}
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1.5">Frequency</p>
                      <Slider
                        value={[frequencyVolume * 100]}
                        onValueChange={([v]) => onFrequencyVolumeChange(v / 100)}
                        max={100}
                        step={1}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{Math.round(frequencyVolume * 100)}%</span>
                  </div>

                  {/* Atmosphere Layer */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">Atmosphere</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {atmospheres.map((atm) => (
                        <button
                          key={atm.id}
                          onClick={() => !atmosphereLoading && onAtmosphereChange(atm.id)}
                          disabled={atmosphereLoading && currentAtmosphere !== atm.id}
                          className={`px-2.5 py-1 rounded-full text-xs transition-all flex items-center gap-1 ${
                            currentAtmosphere === atm.id
                              ? 'bg-primary/20 border border-primary/50 text-primary'
                              : 'bg-white/5 border border-white/10 text-foreground/70 hover:bg-white/10'
                          } ${atmosphereLoading && currentAtmosphere !== atm.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span>{atm.icon}</span>
                          {atm.name}
                          {atmosphereLoading && currentAtmosphere === atm.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          {!atmosphereLoading && atmosphereCached && currentAtmosphere === atm.id && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>

                    {atmosphereLoading && currentAtmosphere !== 'none' && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-primary">
                        <Cloud className="w-3.5 h-3.5 animate-pulse" />
                        <span>Generating atmosphere…</span>
                      </div>
                    )}

                    {atmosphereError && (
                      <p className="mb-2 text-xs text-destructive">{atmosphereError}</p>
                    )}

                    {currentAtmosphere !== 'none' && !atmosphereLoading && (
                      <div className="flex items-center gap-3">
                        <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Slider
                          value={[atmosphereVolume * 100]}
                          onValueChange={([v]) => onAtmosphereVolumeChange(v / 100)}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8">{Math.round(atmosphereVolume * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Collapsed Mini-Player Bar ── */}
          <div
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none ${expanded ? 'border-t border-white/5' : ''}`}
            onClick={() => setExpanded((v) => !v)}
          >
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-primary"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-display text-base tracking-wider text-foreground truncate">
                {currentFrequency}Hz
                {currentFrequencyName && (
                  <span className="text-muted-foreground text-xs ml-2 font-body">{currentFrequencyName}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Timer className="w-3.5 h-3.5 text-primary/70" />
              <span className="font-mono text-sm tracking-wider">{sessionTime}</span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onStop(); }}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              aria-label="Stop"
            >
              <Square className="w-3.5 h-3.5 text-foreground/80" />
            </button>

            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="text-muted-foreground"
            >
              <ChevronUp className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AudioControls;
