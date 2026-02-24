import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/hooks/useHapticFeedback';
import { useLanguage } from '@/contexts/LanguageContext';

const MANTRA_INFO: Record<string, { meaning: string; meaningHi: string; benefits: string; benefitsHi: string }> = {
  'Radhe Radhe': {
    meaning: 'An invocation of Radha — the divine feminine energy of unconditional love and devotion.',
    meaningHi: 'राधा का आह्वान — बिना शर्त प्रेम और भक्ति की दिव्य स्त्री ऊर्जा।',
    benefits: 'Awakens pure love in the heart and cultivates surrender to the divine.',
    benefitsHi: 'हृदय में शुद्ध प्रेम जगाता है और ईश्वर के प्रति समर्पण विकसित करता है।',
  },
  'Om Namah Shivaya': {
    meaning: '"I bow to Shiva" — the five-syllable mantra representing the five elements of creation.',
    meaningHi: '"मैं शिव को नमन करता हूँ" — सृष्टि के पंच तत्वों का प्रतिनिधित्व करने वाला पंचाक्षर मंत्र।',
    benefits: 'Destroys negativity, purifies the mind, and connects you to cosmic consciousness.',
    benefitsHi: 'नकारात्मकता नष्ट करता है, मन शुद्ध करता है, और ब्रह्मांडीय चेतना से जोड़ता है।',
  },
  'Om Gan Ganpataye Namo Namah': {
    meaning: 'Salutation to Lord Ganesha — the remover of obstacles and patron of new beginnings.',
    meaningHi: 'भगवान गणेश को नमस्कार — विघ्नहर्ता और नई शुरुआत के संरक्षक।',
    benefits: 'Clears blockages on your path and brings wisdom before undertaking any endeavor.',
    benefitsHi: 'आपके मार्ग की बाधाएं दूर करता है और किसी भी प्रयास से पहले ज्ञान लाता है।',
  },
  'Jai Ram Jai Ram Jai Jai Ram': {
    meaning: '"Victory to Lord Rama" — a celebration of dharma, truth, and righteous living.',
    meaningHi: '"श्री राम की जय" — धर्म, सत्य और सदाचार का उत्सव।',
    benefits: 'Instills courage, strengthens moral resolve, and brings peace to the mind.',
    benefitsHi: 'साहस भरता है, नैतिक संकल्प मजबूत करता है, और मन को शांति देता है।',
  },
  'Hare Krishna Hare Krishna Krishna Krishna Hare Hare': {
    meaning: 'The Maha Mantra — calling upon the divine energy of Krishna and Radha for liberation.',
    meaningHi: 'महामंत्र — मुक्ति के लिए कृष्ण और राधा की दिव्य ऊर्जा का आह्वान।',
    benefits: 'Purifies the soul, dissolves karma, and awakens transcendental bliss.',
    benefitsHi: 'आत्मा शुद्ध करता है, कर्म का क्षय करता है, और पारलौकिक आनंद जगाता है।',
  },
};

const DEFAULT_INFO = {
  meaning: 'A sacred vibration connecting you to the divine source of all creation.',
  meaningHi: 'सभी सृष्टि के दिव्य स्रोत से जोड़ने वाली पवित्र कंपन।',
  benefits: 'Regular chanting purifies the mind and elevates spiritual consciousness.',
  benefitsHi: 'नियमित जप मन को शुद्ध करता है और आध्यात्मिक चेतना को ऊपर उठाता है।',
};

interface MantraBreakdownProps {
  mantraName: string;
  todayCount: number;
  lifetimeCount: number;
}

const MantraBreakdown = ({ mantraName, todayCount, lifetimeCount }: MantraBreakdownProps) => {
  const { t, language } = useLanguage();
  const infoRaw = MANTRA_INFO[mantraName] || DEFAULT_INFO;
  const meaning = language === 'hi' ? infoRaw.meaningHi : infoRaw.meaning;
  const benefits = language === 'hi' ? infoRaw.benefitsHi : infoRaw.benefits;

  const handlePronunciation = () => {
    triggerHaptic('light');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(mantraName);
      utterance.rate = 0.7; utterance.pitch = 0.9; utterance.lang = 'hi-IN';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
      <div className="text-center py-2">
        <motion.h2 key={mantraName} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-2xl md:text-3xl font-bold text-primary font-[Cinzel] tracking-wide leading-relaxed">{mantraName}</motion.h2>
        <div className="flex justify-center gap-4 mt-2">
          <span className="text-xs text-muted-foreground">{t('common.today')}: <span className="text-primary font-semibold">{todayCount.toLocaleString()}</span></span>
          <span className="text-xs text-muted-foreground">{t('common.lifetime')}: <span className="text-accent font-semibold">{lifetimeCount.toLocaleString()}</span></span>
        </div>
      </div>
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'hsl(var(--void-light) / 0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid hsl(var(--gold) / 0.15)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider">{t('jap.meaningSignificance')}</p>
            <p className="text-sm text-foreground/90 leading-relaxed">{meaning}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handlePronunciation} className="flex-shrink-0 h-9 w-9 rounded-full border border-primary/20 text-primary hover:bg-primary/10">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--gold) / 0.3), transparent)' }} />
        <p className="text-xs text-muted-foreground leading-relaxed">🪷 {benefits}</p>
      </div>
    </motion.div>
  );
};

export default MantraBreakdown;
