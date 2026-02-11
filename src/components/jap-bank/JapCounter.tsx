import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, Save, AlertTriangle, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PRESET_MANTRAS } from '@/hooks/useJapBank';
import { triggerHaptic } from '@/hooks/useHapticFeedback';

const MAX_CHANTS_PER_MINUTE = 15;
const MANUAL_WARNING_THRESHOLD = 1080;
const MANUAL_HARD_LIMIT = 100000;

const validateTapSpeed = (count: number, elapsedMs: number): { valid: boolean; warning: string | null } => {
  if (count <= 0) return { valid: true, warning: null };
  const minutes = elapsedMs / 60000;
  if (minutes < 0.1) return { valid: true, warning: null };
  const rate = count / minutes;
  if (rate > MAX_CHANTS_PER_MINUTE * 2) {
    return { valid: false, warning: `Speed of ${Math.round(rate)}/min seems unrealistic. Average is 5–10/min.` };
  }
  if (rate > MAX_CHANTS_PER_MINUTE) {
    return { valid: true, warning: `Chanting at ${Math.round(rate)}/min — that's very fast!` };
  }
  return { valid: true, warning: null };
};

const validateManualEntry = (count: number): { valid: boolean; warning: string | null } => {
  if (count > MANUAL_HARD_LIMIT) return { valid: false, warning: `Maximum ${MANUAL_HARD_LIMIT.toLocaleString()} per entry.` };
  if (count > MANUAL_WARNING_THRESHOLD) return { valid: true, warning: `${count.toLocaleString()} chants is a large claim. Please ensure accuracy. 🙏` };
  return { valid: true, warning: null };
};

interface RippleItem {
  id: number;
  x: number;
  y: number;
}

interface JapCounterProps {
  onSave: (mantraName: string, count: number) => void;
  isSaving: boolean;
  selectedMantra: string;
}

const JapCounter = ({ onSave, isSaving, selectedMantra }: JapCounterProps) => {
  const [count, setCount] = useState(0);
  const [manualCount, setManualCount] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const tapStartTime = useRef<number | null>(null);
  const rippleId = useRef(0);

  const mantraName = selectedMantra;

  useEffect(() => {
    if (count === 0) tapStartTime.current = null;
  }, [count]);

  const handleTap = useCallback(() => {
    if (tapStartTime.current === null) tapStartTime.current = Date.now();
    setCount(prev => prev + 1);
    triggerHaptic('light');

    // Spawn ripple
    const id = ++rippleId.current;
    const xOffset = (Math.random() - 0.5) * 40;
    setRipples(prev => [...prev, { id, x: xOffset, y: 0 }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1200);
  }, []);

  const tapElapsed = tapStartTime.current ? Date.now() - tapStartTime.current : 0;
  const tapValidation = validateTapSpeed(count, tapElapsed);
  const manualParsed = parseInt(manualCount) || 0;
  const manualValidation = validateManualEntry(manualParsed);

  const currentValidation = showManual ? manualValidation : tapValidation;
  const finalCount = showManual ? manualParsed : count;

  const handleSave = () => {
    if (!mantraName || finalCount <= 0 || !currentValidation.valid) return;
    onSave(mantraName, finalCount);
    setCount(0);
    setManualCount('');
    tapStartTime.current = null;
    triggerHaptic('success');
  };

  return (
    <div className="space-y-3">
      {/* Ripples that float upward */}
      <div className="relative h-0 overflow-visible pointer-events-none">
        <AnimatePresence>
          {ripples.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0.7, y: 0, x: r.x, scale: 0.5 }}
              animate={{ opacity: 0, y: -120, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 bottom-0"
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--gold) / 0.6), transparent)',
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Validation Warning */}
      <AnimatePresence>
        {currentValidation.warning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
              currentValidation.valid
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{currentValidation.warning}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {showManual ? (
        /* Manual Entry Mode */
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Enter chant count"
            value={manualCount}
            onChange={e => setManualCount(e.target.value)}
            min={1}
            max={MANUAL_HARD_LIMIT}
            className="bg-muted border-border text-lg h-12 flex-1"
            autoFocus
          />
          <Button
            onClick={handleSave}
            disabled={isSaving || manualParsed <= 0 || !manualValidation.valid}
            size="lg"
            className="h-12 px-5"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setShowManual(false)}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        /* Tap Counter Mode */
        <div className="flex items-center gap-4">
          {/* Controls left */}
          <div className="flex flex-col gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-border/50 text-muted-foreground"
              onClick={() => { setCount(prev => Math.max(0, prev - 1)); triggerHaptic('light'); }}
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-border/50 text-muted-foreground"
              onClick={() => { setCount(0); triggerHaptic('light'); }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-border/50 text-muted-foreground"
              onClick={() => setShowManual(true)}
              title="Manual entry"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Big tap button */}
          <div className="flex-1 flex flex-col items-center gap-2 relative">
            <motion.div
              key={count}
              initial={{ scale: 1.2, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold text-primary font-[Cinzel]"
            >
              {count}
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleTap}
              className="w-24 h-24 rounded-full flex items-center justify-center text-primary-foreground font-bold touch-target select-touch-none"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold-light)))',
                boxShadow: count > 0
                  ? '0 0 40px hsl(var(--gold) / 0.5), 0 0 80px hsl(var(--gold) / 0.2)'
                  : '0 0 20px hsl(var(--gold) / 0.3)',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <Plus className="w-9 h-9" />
            </motion.button>
          </div>

          {/* Save button right */}
          <div className="flex flex-col items-center gap-1.5">
            <Button
              onClick={handleSave}
              disabled={isSaving || count <= 0 || !tapValidation.valid}
              size="icon"
              className="h-12 w-12 rounded-full"
              style={{
                background: count > 0 ? 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--gold-light)))' : undefined,
              }}
            >
              <Save className="w-5 h-5" />
            </Button>
            <span className="text-[10px] text-muted-foreground">Save</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JapCounter;
