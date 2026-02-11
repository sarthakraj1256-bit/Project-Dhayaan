import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/hooks/useHapticFeedback';

const MANTRA_INFO: Record<string, { meaning: string; benefits: string }> = {
  'Radhe Radhe': {
    meaning: 'An invocation of Radha — the divine feminine energy of unconditional love and devotion.',
    benefits: 'Awakens pure love in the heart and cultivates surrender to the divine.',
  },
  'Om Namah Shivaya': {
    meaning: '"I bow to Shiva" — the five-syllable mantra representing the five elements of creation.',
    benefits: 'Destroys negativity, purifies the mind, and connects you to cosmic consciousness.',
  },
  'Om Gan Ganpataye Namo Namah': {
    meaning: 'Salutation to Lord Ganesha — the remover of obstacles and patron of new beginnings.',
    benefits: 'Clears blockages on your path and brings wisdom before undertaking any endeavor.',
  },
  'Jai Ram Jai Ram Jai Jai Ram': {
    meaning: '"Victory to Lord Rama" — a celebration of dharma, truth, and righteous living.',
    benefits: 'Instills courage, strengthens moral resolve, and brings peace to the mind.',
  },
  'Hare Krishna Hare Krishna Krishna Krishna Hare Hare': {
    meaning: 'The Maha Mantra — calling upon the divine energy of Krishna and Radha for liberation.',
    benefits: 'Purifies the soul, dissolves karma, and awakens transcendental bliss.',
  },
};

const DEFAULT_INFO = {
  meaning: 'A sacred vibration connecting you to the divine source of all creation.',
  benefits: 'Regular chanting purifies the mind and elevates spiritual consciousness.',
};

interface MantraBreakdownProps {
  mantraName: string;
  todayCount: number;
  lifetimeCount: number;
}

const MantraBreakdown = ({ mantraName, todayCount, lifetimeCount }: MantraBreakdownProps) => {
  const info = MANTRA_INFO[mantraName] || DEFAULT_INFO;

  const handlePronunciation = () => {
    triggerHaptic('light');
    // Use browser speech synthesis as a lightweight pronunciation guide
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(mantraName);
      utterance.rate = 0.7;
      utterance.pitch = 0.9;
      utterance.lang = 'hi-IN';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Mantra Display */}
      <div className="text-center py-2">
        <motion.h2
          key={mantraName}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl md:text-3xl font-bold text-primary font-[Cinzel] tracking-wide leading-relaxed"
        >
          {mantraName}
        </motion.h2>
        <div className="flex justify-center gap-4 mt-2">
          <span className="text-xs text-muted-foreground">
            Today: <span className="text-primary font-semibold">{todayCount.toLocaleString()}</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Lifetime: <span className="text-accent font-semibold">{lifetimeCount.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Meaning & Significance Card */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: 'hsl(var(--void-light) / 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid hsl(var(--gold) / 0.15)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">Meaning & Significance</p>
            <p className="text-sm text-foreground/90 leading-relaxed">{info.meaning}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePronunciation}
            className="flex-shrink-0 h-9 w-9 rounded-full border border-primary/20 text-primary hover:bg-primary/10"
            title="Hear pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Soft divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--gold) / 0.3), transparent)' }} />

        <p className="text-xs text-muted-foreground leading-relaxed">
          🪷 {info.benefits}
        </p>
      </div>
    </motion.div>
  );
};

export default MantraBreakdown;
