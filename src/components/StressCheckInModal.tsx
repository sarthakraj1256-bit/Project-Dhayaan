import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';

const STRESS_STORAGE_KEY = 'dhyaan-initial-stress';
const STRESS_TIMESTAMP_KEY = 'dhyaan-stress-timestamp';
const SESSION_DURATION = 30 * 60 * 1000;

interface StressCheckInModalProps { onComplete?: (stressLevel: number) => void; }

export default function StressCheckInModal({ onComplete }: StressCheckInModalProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [stressLevel, setStressLevel] = useState(5);

  useEffect(() => {
    const storedTimestamp = localStorage.getItem(STRESS_TIMESTAMP_KEY);
    const storedStress = localStorage.getItem(STRESS_STORAGE_KEY);
    if (storedTimestamp && storedStress) {
      const elapsed = Date.now() - parseInt(storedTimestamp, 10);
      if (elapsed < SESSION_DURATION) return;
    }
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStressLabel = (level: number) => {
    if (level <= 2) return t('stress.veryCalmLabel');
    if (level <= 4) return t('stress.relaxedLabel');
    if (level <= 6) return t('stress.moderateLabel');
    if (level <= 8) return t('stress.stressedLabel');
    return t('stress.veryStressedLabel');
  };

  const getStressEmoji = (level: number) => {
    if (level <= 2) return '😌'; if (level <= 4) return '🙂'; if (level <= 6) return '😐'; if (level <= 8) return '😟'; return '😰';
  };

  const handleSubmit = () => {
    localStorage.setItem(STRESS_STORAGE_KEY, stressLevel.toString());
    localStorage.setItem(STRESS_TIMESTAMP_KEY, Date.now().toString());
    onComplete?.(stressLevel); setIsOpen(false);
  };

  const handleDismiss = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-card border-primary/20 max-w-md mx-auto bg-background/95 backdrop-blur-xl">
        <button onClick={handleDismiss} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors" aria-label={t('common.close')}><X className="w-5 h-5" /></button>
        <DialogHeader className="text-center space-y-4 pt-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-3xl">{getStressEmoji(stressLevel)}</span>
          </div>
          <DialogTitle className="font-display text-2xl text-gold-gradient tracking-wider">{t('stress.welcomeSeeker')}</DialogTitle>
          <DialogDescription className="font-body text-muted-foreground text-base">{t('stress.beforeJourney')}</DialogDescription>
        </DialogHeader>
        <div className="py-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="font-display text-sm text-muted-foreground tracking-widest uppercase">{t('stress.currentLevel')}</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-display text-5xl text-gold-gradient gold-glow">{stressLevel}</span>
              <span className="text-2xl text-muted-foreground">/10</span>
            </div>
            <p className="font-display text-lg text-foreground tracking-wider">{getStressLabel(stressLevel)}</p>
          </div>
          <div className="px-4 space-y-4">
            <Slider value={[stressLevel]} onValueChange={(value) => setStressLevel(value[0])} min={1} max={10} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground font-display tracking-wider">
              <span>{t('stress.calm')}</span><span>{t('stress.stressed')}</span>
            </div>
          </div>
          <div className="glass-card p-4 bg-primary/5 border-primary/10">
            <p className="text-xs text-muted-foreground text-center font-body leading-relaxed">
              <span className="text-primary">॥</span> {t('stress.scientificContext')} <span className="text-primary">॥</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 pb-2">
          <Button onClick={handleSubmit} className="w-full font-display tracking-wider uppercase text-sm bg-primary/90 hover:bg-primary text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20">
            {t('stress.beginJourney')}
          </Button>
          <button onClick={handleDismiss} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">{t('stress.skipForNow')}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getInitialStress(): number | null {
  const stored = localStorage.getItem('dhyaan-initial-stress');
  return stored ? parseInt(stored, 10) : null;
}
