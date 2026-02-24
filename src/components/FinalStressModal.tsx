import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getInitialStress } from './StressCheckInModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface FinalStressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (finalStress: number, stressReduction: number | null) => void;
}

export default function FinalStressModal({ isOpen, onClose, onSubmit }: FinalStressModalProps) {
  const { t } = useLanguage();
  const [stressLevel, setStressLevel] = useState(5);
  const initialStress = getInitialStress();

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

  const calculateReduction = (): { percentage: number; improved: boolean } | null => {
    if (initialStress === null || initialStress === 0) return null;
    const reduction = ((initialStress - stressLevel) / initialStress) * 100;
    return { percentage: Math.abs(Math.round(reduction)), improved: reduction > 0 };
  };

  const handleSubmit = () => {
    const reduction = calculateReduction();
    onSubmit(stressLevel, reduction?.improved ? reduction.percentage : (reduction ? -reduction.percentage : null));
    onClose();
  };

  const reductionData = calculateReduction();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-card border-primary/20 max-w-md mx-auto bg-background/95 backdrop-blur-xl">
        <DialogHeader className="text-center space-y-4 pt-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-3xl">{getStressEmoji(stressLevel)}</span>
          </div>
          <DialogTitle className="font-display text-2xl text-gold-gradient tracking-wider">{t('stress.howFeelNow')}</DialogTitle>
          <DialogDescription className="font-body text-muted-foreground text-base">{t('stress.afterExploring')}</DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="text-center space-y-2">
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
          {initialStress !== null && reductionData && (
            <div className="glass-card p-4 bg-primary/5 border-primary/10 text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="text-center"><p className="text-muted-foreground text-xs tracking-wider">{t('stress.before')}</p><p className="font-display text-xl text-foreground">{initialStress}</p></div>
                <span className="text-primary text-xl">→</span>
                <div className="text-center"><p className="text-muted-foreground text-xs tracking-wider">{t('stress.now')}</p><p className="font-display text-xl text-gold-gradient">{stressLevel}</p></div>
              </div>
              <p className={`font-display text-lg tracking-wider ${reductionData.improved ? 'text-green-400' : 'text-amber-400'}`}>
                {reductionData.improved ? '↓' : '↑'} {reductionData.percentage}% {reductionData.improved ? t('stress.reduction') : t('stress.increase')}
              </p>
              {reductionData.improved && reductionData.percentage > 0 && (
                <p className="text-xs text-muted-foreground font-body">{t('stress.sacredWorking')}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 pb-2">
          <Button onClick={handleSubmit} className="w-full font-display tracking-wider uppercase text-sm bg-primary/90 hover:bg-primary text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20">
            {t('stress.submitExperience')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
