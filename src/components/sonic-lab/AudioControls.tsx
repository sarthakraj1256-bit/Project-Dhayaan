import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { Volume2, VolumeX, Layers, Loader2, Check, Cloud, Timer, Heart, ChevronUp, Square, GripHorizontal } from 'lucide-react';
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

const ExpandedControls = ({
  frequencyVolume,
  atmosphereVolume,
  currentAtmosphere,
  atmosphereLoading,
  atmosphereCached,
  atmosphereError,
  isFavorited,
  onSaveFavorite,
  onFrequencyVolumeChange,
  onAtmosphereVolumeChange,
  onAtmosphereChange,
}: Pick<
  AudioControlsProps,
  | 'frequencyVolume'
  | 'atmosphereVolume'
  | 'currentAtmosphere'
  | 'atmosphereLoading'
  | 'atmosphereCached'
  | 'atmosphereError'
  | 'isFavorited'
  | 'onSaveFavorite'
  | 'onFrequencyVolumeChange'
  | 'onAtmosphereVolumeChange'
  | 'onAtmosphereChange'
>) => (
  <div className="px-5 pb-5 pt-2 space-y-5">
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
    <div className="pt-3 border-t border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Atmosphere</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {atmospheres.map((atm) => (
          <button
            key={atm.id}
            onClick={() => !atmosphereLoading && onAtmosphereChange(atm.id)}
            disabled={atmosphereLoading && currentAtmosphere !== atm.id}
            className={`px-2.5 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 ${
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
        <div className="flex items-center gap-2 mb-3 text-xs text-primary">
          <Cloud className="w-3.5 h-3.5 animate-pulse" />
          <span>Generating atmosphere…</span>
        </div>
      )}

      {atmosphereError && (
        <p className="mb-3 text-xs text-destructive">{atmosphereError}</p>
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
);

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
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Swipe down to collapse
    if (info.velocity.y > 300 || info.offset.y > 80) {
      setExpanded(false);
    }
    // Swipe up to expand
    if (info.velocity.y < -300 || info.offset.y < -80) {
      setExpanded(true);
    }
  }, []);

  if (!isPlaying) return null;

  const sharedControlProps = {
    frequencyVolume,
    atmosphereVolume,
    currentAtmosphere,
    atmosphereLoading,
    atmosphereCached,
    atmosphereError,
    isFavorited,
    onSaveFavorite,
    onFrequencyVolumeChange,
    onAtmosphereVolumeChange,
    onAtmosphereChange,
  };

  return (
    <>
      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm md:hidden"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile: Bottom sheet that slides up */}
      <div className="md:hidden">
        <motion.div
          ref={sheetRef}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          {/* Expanded sheet content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.3}
                onDragEnd={handleDragEnd}
                className="mx-2 rounded-t-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, hsl(var(--void-light) / 0.98), hsl(var(--void) / 0.99))',
                  border: '1px solid hsl(var(--gold) / 0.2)',
                  borderBottom: 'none',
                  boxShadow: '0 -8px 40px -10px hsl(var(--gold) / 0.3)',
                }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="px-5 pb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Now Playing</p>
                    <p className="font-display text-2xl tracking-wider text-foreground">
                      {currentFrequency}Hz
                      {currentFrequencyName && (
                        <span className="text-muted-foreground text-sm ml-2 font-body">{currentFrequencyName}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <Timer className="w-3.5 h-3.5 text-primary/70" />
                      <span className="font-mono text-sm tracking-wider text-foreground">{sessionTime}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5">
                  <ExpandedControls {...sharedControlProps} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mini-player bar (always visible) */}
          <div
            className="px-3 pb-[calc(env(safe-area-inset-bottom,0px)+4.5rem)]"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--void-light) / 0.95), hsl(var(--void) / 0.98))',
              borderTop: '1px solid hsl(var(--gold) / 0.15)',
              boxShadow: '0 -2px 20px -6px hsl(var(--gold) / 0.15)',
            }}
          >
            <div
              className="flex items-center gap-3 py-2.5 cursor-pointer select-none"
              onClick={() => setExpanded((v) => !v)}
            >
              {/* Pulsing dot */}
              <div className="relative shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm tracking-wider text-foreground truncate">
                  {currentFrequency}Hz
                  {currentFrequencyName && (
                    <span className="text-muted-foreground text-xs ml-1.5 font-body">{currentFrequencyName}</span>
                  )}
                </p>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Timer className="w-3 h-3 text-primary/60" />
                <span className="font-mono text-xs tracking-wider">{sessionTime}</span>
              </div>

              {/* Stop */}
              <button
                onClick={(e) => { e.stopPropagation(); onStop(); }}
                className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                aria-label="Stop"
              >
                <Square className="w-3 h-3 text-foreground/80" />
              </button>

              {/* Chevron */}
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground"
              >
                <ChevronUp className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Desktop: Inline expandable panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-2xl"
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
          {/* Expanded above bar */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <ExpandedControls {...sharedControlProps} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bar */}
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
