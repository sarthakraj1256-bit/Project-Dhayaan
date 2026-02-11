import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PRESET_MANTRAS } from '@/hooks/useJapBank';
import { triggerHaptic } from '@/hooks/useHapticFeedback';

// Average chanting speed: ~10 chants/minute is fast, ~15/min is extreme
const MAX_CHANTS_PER_MINUTE = 15;
const MANUAL_WARNING_THRESHOLD = 1080; // ~1hr at max speed
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

interface JapCounterProps {
  onSave: (mantraName: string, count: number) => void;
  isSaving: boolean;
}

const JapCounter = ({ onSave, isSaving }: JapCounterProps) => {
  const [selectedMantra, setSelectedMantra] = useState(PRESET_MANTRAS[0]);
  const [customMantra, setCustomMantra] = useState('');
  const [count, setCount] = useState(0);
  const [manualCount, setManualCount] = useState('');
  const [mode, setMode] = useState<'tap' | 'manual'>('tap');
  const tapStartTime = useRef<number | null>(null);

  const mantraName = selectedMantra === 'custom' ? customMantra.trim() : selectedMantra;

  // Reset timer when count resets
  useEffect(() => {
    if (count === 0) tapStartTime.current = null;
  }, [count]);

  const handleTap = () => {
    if (tapStartTime.current === null) tapStartTime.current = Date.now();
    setCount(prev => prev + 1);
    triggerHaptic('light');
  };

  // Validation state
  const tapElapsed = tapStartTime.current ? Date.now() - tapStartTime.current : 0;
  const tapValidation = validateTapSpeed(count, tapElapsed);
  const manualParsed = parseInt(manualCount) || 0;
  const manualValidation = validateManualEntry(manualParsed);

  const currentValidation = mode === 'tap' ? tapValidation : manualValidation;
  const finalCount = mode === 'tap' ? count : manualParsed;

  const handleSave = () => {
    if (!mantraName || finalCount <= 0 || !currentValidation.valid) return;
    onSave(mantraName, finalCount);
    setCount(0);
    setManualCount('');
    tapStartTime.current = null;
    triggerHaptic('success');
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary">🙏 Chant Counter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mantra Selection */}
        <div className="space-y-2">
          <Select value={selectedMantra} onValueChange={setSelectedMantra}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Select Mantra" />
            </SelectTrigger>
            <SelectContent>
              {PRESET_MANTRAS.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
              <SelectItem value="custom">✏️ Custom Mantra</SelectItem>
            </SelectContent>
          </Select>
          {selectedMantra === 'custom' && (
            <Input
              placeholder="Enter your mantra..."
              value={customMantra}
              onChange={e => setCustomMantra(e.target.value)}
              maxLength={200}
              className="bg-muted border-border"
            />
          )}
        </div>

        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={v => setMode(v as 'tap' | 'manual')}>
          <TabsList className="w-full">
            <TabsTrigger value="tap" className="flex-1">Tap Counter</TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="tap" className="mt-4">
            <div className="flex flex-col items-center gap-4">
              {/* Big counter display */}
              <motion.div
                key={count}
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-primary font-[Cinzel]"
              >
                {count}
              </motion.div>

              {/* Tap button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleTap}
                className="w-28 h-28 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg touch-target"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold-light)))',
                  boxShadow: '0 0 30px hsl(var(--gold) / 0.4)',
                }}
              >
                <Plus className="w-10 h-10" />
              </motion.button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCount(prev => Math.max(0, prev - 1)); triggerHaptic('light'); }}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCount(0); triggerHaptic('light'); }}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter chant count"
                  value={manualCount}
                  onChange={e => setManualCount(e.target.value)}
                  min={1}
                  max={MANUAL_HARD_LIMIT}
                  className="bg-muted border-border text-lg h-12"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Speed Validation Warning */}
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

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !mantraName || finalCount <= 0 || !currentValidation.valid}
          className="w-full"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save to Jap Bank'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JapCounter;
