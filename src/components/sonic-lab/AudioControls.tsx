import { useState, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Layers,
  Loader2,
  Check,
  Cloud,
  Timer,
  Heart,
  ChevronUp,
  Square,
  RefreshCw,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { atmospheres } from '@/data/soundLibrary';
import { useLanguage } from '@/contexts/LanguageContext';

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
  atmosphereNeedsInteraction?: boolean;
  sessionTime?: string;
  isFavorited?: boolean;
  isAuthenticated?: boolean;
  onSaveFavorite?: () => void;
  onFrequencyVolumeChange: (volume: number) => void;
  onAtmosphereVolumeChange: (volume: number) => void;
  onAtmosphereChange: (atmosphereId: string) => void;
  onReconnectAudio?: () => void;
  onStop: () => void;
}

const atmosphereNameKeys: Record<string, string> = {
  none: 'sound.atm.none',
  rain: 'sound.atm.rain',
  river: 'sound.atm.river',
  bells: 'sound.atm.bells',
  forest: 'sound.atm.forest',
  chimes: 'sound.atm.chimes',
  ocean: 'sound.atm.ocean',
  thunder: 'sound.atm.thunder',
  crickets: 'sound.atm.crickets',
  wind: 'sound.atm.wind',
  om: 'sound.atm.om',
  bowl: 'sound.atm.bowl',
  flute: 'sound.atm.flute',
  mantra: 'sound.atm.mantra',
  waterfall: 'sound.atm.waterfall',
  fireplace: 'sound.atm.fireplace',
};

/* ── Expanded controls (shared between mobile sheet & desktop panel) ── */
const ExpandedControls = ({
  frequencyVolume,
  atmosphereVolume,
  currentAtmosphere,
  atmosphereLoading,
  atmosphereCached,
  atmosphereError,
  atmosphereNeedsInteraction,
  isFavorited,
  onSaveFavorite,
  onFrequencyVolumeChange,
  onAtmosphereVolumeChange,
  onAtmosphereChange,
  onReconnectAudio,
  t,
}: Pick<
  AudioControlsProps,
  | 'frequencyVolume'
  | 'atmosphereVolume'
  | 'currentAtmosphere'
  | 'atmosphereLoading'
  | 'atmosphereCached'
  | 'atmosphereError'
  | 'atmosphereNeedsInteraction'
  | 'isFavorited'
  | 'onSaveFavorite'
  | 'onFrequencyVolumeChange'
  | 'onAtmosphereVolumeChange'
  | 'onAtmosphereChange'
  | 'onReconnectAudio'
> & { t: (key: any) => string }) => (
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
              : 'bg-foreground/5 border border-border/50 hover:bg-primary/20 hover:text-primary text-muted-foreground'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-primary' : ''}`} />
          {isFavorited ? t('sonic.saved') : t('sonic.save')}
        </button>
      </div>
    )}

    {/* Frequency Volume */}
    <div className="flex items-center gap-3">
      <Volume2 className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-1.5">{t('sonic.frequency')}</p>
        <Slider
          value={[frequencyVolume * 100]}
          onValueChange={([v]) => onFrequencyVolumeChange(v / 100)}
          max={100}
          step={1}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8">
        {Math.round(frequencyVolume * 100)}%
      </span>
    </div>

    {/* Atmosphere Layer */}
    <div className="pt-3 border-t border-border/30">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {t('sonic.atmosphere')}
        </p>
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
                : 'bg-foreground/5 border border-border/50 text-foreground/70 hover:bg-foreground/10'
            } ${
              atmosphereLoading && currentAtmosphere !== atm.id
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <span>{atm.icon}</span>
            {t(atmosphereNameKeys[atm.id] as any) || atm.name}
            {atmosphereLoading && currentAtmosphere === atm.id && (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            {!atmosphereLoading &&
              atmosphereCached &&
              currentAtmosphere === atm.id && <Check className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {atmosphereLoading && currentAtmosphere !== 'none' && (
        <div className="flex items-center gap-2 mb-3 text-xs text-primary">
          <Cloud className="w-3.5 h-3.5 animate-pulse" />
          <span>{t('sonic.generatingAtmosphere')}</span>
        </div>
      )}

      {atmosphereError && !atmosphereNeedsInteraction && onReconnectAudio && (
        <div className="mb-3 flex justify-end">
          <button
            onClick={onReconnectAudio}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-void/85 px-3 py-1.5 text-xs text-gold shadow-[0_0_0_1px_hsl(var(--gold)/0.12)] backdrop-blur-sm hover:bg-gold/10 transition-colors"
            aria-label="Reconnect atmosphere audio"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reconnect
          </button>
        </div>
      )}

      {/* Unlock/retry feedback now handled via toast to keep UI clean */}

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
          <span className="text-xs text-muted-foreground w-8">
            {Math.round(atmosphereVolume * 100)}%
          </span>
        </div>
      )}
    </div>
  </div>
);

/* ── Main AudioControls ── */
const AudioControls = forwardRef<HTMLDivElement, AudioControlsProps>(
  (
    {
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
      atmosphereNeedsInteraction = false,
      sessionTime = '00:00',
      isFavorited = false,
      isAuthenticated = false,
      onSaveFavorite,
      onFrequencyVolumeChange,
      onAtmosphereVolumeChange,
      onAtmosphereChange,
      onReconnectAudio,
      onStop,
    },
    _ref,
  ) => {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);

    const handleDragEnd = useCallback(
      (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.velocity.y > 300 || info.offset.y > 80) setExpanded(false);
        if (info.velocity.y < -300 || info.offset.y < -80) setExpanded(true);
      },
      [],
    );

    if (!isPlaying) return null;

    const sharedControlProps = {
      frequencyVolume,
      atmosphereVolume,
      currentAtmosphere,
      atmosphereLoading,
      atmosphereCached,
      atmosphereError,
      atmosphereNeedsInteraction,
      isFavorited,
      onSaveFavorite,
      onFrequencyVolumeChange,
      onAtmosphereVolumeChange,
      onAtmosphereChange,
      onReconnectAudio,
      t,
    };

    const glassStyle = {
      background: 'hsl(var(--void-light) / 0.92)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid hsl(var(--border))',
      boxShadow: '0 -4px 24px -8px hsl(var(--gold) / 0.1), 0 1px 3px hsl(24 10% 15% / 0.06)',
    } as React.CSSProperties;

    return (
      <>
        {/* ═══════════ MOBILE ═══════════ */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-void/60 backdrop-blur-sm md:hidden"
              onClick={() => setExpanded(false)}
            />
          )}
        </AnimatePresence>

        <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 safe-bottom">
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.25}
                onDragEnd={handleDragEnd}
                className="mx-2 mb-1 rounded-2xl overflow-hidden"
                style={{
                  ...glassStyle,
                  border: '1px solid hsl(var(--gold) / 0.2)',
                  boxShadow:
                    '0 -8px 40px -10px hsl(var(--gold) / 0.25), inset 0 1px 0 0 hsl(var(--gold) / 0.1)',
                }}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-foreground/15" />
                </div>

                <div className="px-5 pb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {t('sonic.nowPlaying')}
                    </p>
                    <p className="font-display text-2xl tracking-wider text-foreground">
                      {currentFrequency}Hz
                      {currentFrequencyName && (
                        <span className="text-muted-foreground text-sm ml-2 font-body">
                          {currentFrequencyName}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 border border-border/50">
                    <Timer className="w-3.5 h-3.5 text-primary/70" />
                    <span className="font-mono text-sm tracking-wider text-foreground">
                      {sessionTime}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/30">
                  <ExpandedControls {...sharedControlProps} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="mx-2 rounded-xl overflow-hidden"
            style={glassStyle}
          >
          <div
            className="flex items-center gap-3 px-4 py-4 cursor-pointer select-none min-h-[56px]"
            onClick={() => setExpanded((v) => !v)}
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-primary shrink-0"
            />

            <div className="flex-1 min-w-0">
              <p className="font-display text-base tracking-wider text-foreground truncate">
                {currentFrequency}Hz
                {currentFrequencyName && (
                  <span className="text-muted-foreground text-xs ml-1.5 font-body">
                    {currentFrequencyName}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Timer className="w-4 h-4 text-primary/60" />
              <span className="font-mono text-sm tracking-wider">
                {sessionTime}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStop();
              }}
              className="p-2.5 rounded-full bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors"
              aria-label="Stop"
            >
              <Square className="w-4 h-4 text-foreground/80" />
            </button>

            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.div>
          </div>
          </div>
        </div>

        {/* ═══════════ DESKTOP ═══════════ */}
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
              ...glassStyle,
              border: '1px solid hsl(var(--gold) / 0.25)',
              borderTop: '1px solid hsl(var(--gold) / 0.25)',
              boxShadow: '0 -4px 40px -10px hsl(var(--gold) / 0.25)',
            }}
          >
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

            <div
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none ${
                expanded ? 'border-t border-border/30' : ''
              }`}
              onClick={() => setExpanded((v) => !v)}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-primary shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="font-display text-base tracking-wider text-foreground truncate">
                  {currentFrequency}Hz
                  {currentFrequencyName && (
                    <span className="text-muted-foreground text-xs ml-2 font-body">
                      {currentFrequencyName}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Timer className="w-3.5 h-3.5 text-primary/70" />
                <span className="font-mono text-sm tracking-wider">
                  {sessionTime}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStop();
                }}
                className="p-2 rounded-full bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors"
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
  },
);

AudioControls.displayName = 'AudioControls';

export default AudioControls;
