import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center h-8 rounded-full bg-foreground/[0.06] border border-border/60 p-0.5 relative overflow-hidden">
      {/* Sliding highlight */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-full bg-primary/15 border border-primary/30"
        initial={false}
        animate={{ left: language === 'en' ? 2 : '50%', right: language === 'hi' ? 2 : '50%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'relative z-10 px-2.5 py-1 text-xs font-medium rounded-full transition-colors duration-200 whitespace-nowrap',
          language === 'en' ? 'text-primary' : 'text-foreground/35'
        )}
      >
        Eng
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={cn(
          'relative z-10 px-2.5 py-1 text-xs font-medium rounded-full transition-colors duration-200 whitespace-nowrap',
          language === 'hi' ? 'text-primary' : 'text-foreground/35'
        )}
      >
        हिंदी
      </button>
    </div>
  );
}
