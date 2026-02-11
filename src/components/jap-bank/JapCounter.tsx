import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PRESET_MANTRAS } from '@/hooks/useJapBank';
import { triggerHaptic } from '@/hooks/useHapticFeedback';

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

  const mantraName = selectedMantra === 'custom' ? customMantra.trim() : selectedMantra;

  const handleTap = () => {
    setCount(prev => prev + 1);
    triggerHaptic('light');
  };

  const handleSave = () => {
    const finalCount = mode === 'tap' ? count : parseInt(manualCount) || 0;
    if (!mantraName || finalCount <= 0) return;
    onSave(mantraName, finalCount);
    setCount(0);
    setManualCount('');
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
                  max={100000}
                  className="bg-muted border-border text-lg h-12"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !mantraName || (mode === 'tap' ? count <= 0 : !manualCount || parseInt(manualCount) <= 0)}
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
