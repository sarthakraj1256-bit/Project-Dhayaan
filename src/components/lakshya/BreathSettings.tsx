import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { HapticSwitch } from '@/components/ui/HapticSwitch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export interface BreathTimings {
  inhaleSeconds: number;
  exhaleSeconds: number;
  holdSeconds: number;
}

interface BreathSettingsProps {
  initialTimings: BreathTimings;
  onStart: (timings: BreathTimings) => void;
}

const BreathSettings = ({ initialTimings, onStart }: BreathSettingsProps) => {
  const [inhale, setInhale] = useState(initialTimings.inhaleSeconds);
  const [exhale, setExhale] = useState(initialTimings.exhaleSeconds);
  const [hold, setHold] = useState(initialTimings.holdSeconds);
  const [autoBalance, setAutoBalance] = useState(false);

  const isAdvanced = inhale >= 8 || exhale >= 10;

  useEffect(() => {
    if (autoBalance) {
      setExhale(Math.min(inhale * 2, 12));
    }
  }, [inhale, autoBalance]);

  const handleAutoBalanceChange = (checked: boolean) => {
    setAutoBalance(checked);
    if (checked) {
      setExhale(Math.min(inhale * 2, 12));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-6 sm:p-8 min-h-[400px]"
    >
      <div className="text-5xl mb-4">🌬️</div>
      <h3 className="font-display text-2xl text-foreground mb-1">Breath Flow Journey</h3>
      <p className="text-muted-foreground text-sm text-center max-w-sm mb-6">
        Set your personal lung rhythm before you begin.
      </p>

      {isAdvanced && (
        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
          <Zap className="w-3 h-3 mr-1" /> Advanced Practice
        </Badge>
      )}

      <div className="w-full max-w-sm space-y-6">
        {/* Inhale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Inhale Duration</Label>
            <span className="text-sm font-mono text-primary font-semibold">{inhale}s</span>
          </div>
          <Slider
            value={[inhale]}
            onValueChange={([v]) => setInhale(v)}
            min={2}
            max={12}
            step={1}
            className="[&_[role=slider]]:border-primary [&_[role=slider]]:bg-background [&_.relative>span]:bg-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>2s</span><span>12s</span>
          </div>
        </div>

        {/* Exhale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Exhale Duration</Label>
            <span className="text-sm font-mono text-primary font-semibold">{exhale}s</span>
          </div>
          <Slider
            value={[exhale]}
            onValueChange={([v]) => { if (!autoBalance) setExhale(v); }}
            min={2}
            max={12}
            step={1}
            disabled={autoBalance}
            className="[&_[role=slider]]:border-primary [&_[role=slider]]:bg-background [&_.relative>span]:bg-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>2s</span><span>12s</span>
          </div>
        </div>

        {/* Auto-Balance Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#C9A84C]/5 border border-[#C9A84C]/15">
          <div>
            <Label className="text-sm text-foreground">Auto-Balance (1:2)</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">Traditional Pranayama ratio</p>
          </div>
          <HapticSwitch
            checked={autoBalance}
            onCheckedChange={handleAutoBalanceChange}
          />
        </div>

        {/* Cycle Preview */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-cyan-400 font-medium">Inhale</p>
            <p className="text-lg font-mono text-foreground">{inhale}s</p>
          </div>
          <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <p className="text-xs text-violet-400 font-medium">Hold</p>
            <p className="text-lg font-mono text-foreground">{hold}s</p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs text-indigo-400 font-medium">Exhale</p>
            <p className="text-lg font-mono text-foreground">{exhale}s</p>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          One cycle = {inhale + hold + exhale}s total
        </p>

        {/* Start Button */}
        <button
          onClick={() => onStart({ inhaleSeconds: inhale, exhaleSeconds: exhale, holdSeconds: hold })}
          className="w-full py-3 rounded-full bg-gradient-to-r from-[#C9A84C] to-amber-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Begin Journey
        </button>
      </div>
    </motion.div>
  );
};

export default BreathSettings;
