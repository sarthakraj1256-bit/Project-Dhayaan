import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center h-9 rounded-full bg-card/80 border border-border/60 p-0.5 relative overflow-hidden backdrop-blur-sm shadow-sm">
      {/* Sliding highlight */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-full bg-primary/15 border border-primary/30"
        initial={false}
        animate={{ left: language === 'en' ? 2 : '50%', right: language === 'hi' ? 2 : '50%' }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />

      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'relative z-10 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-150 whitespace-nowrap touch-manipulation min-w-[44px] min-h-[36px] flex items-center justify-center',
          language === 'en' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        Eng
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={cn(
          'relative z-10 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-150 whitespace-nowrap touch-manipulation min-w-[44px] min-h-[36px] flex items-center justify-center',
          language === 'hi' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        हिंदी
      </button>
    </div>
  );
}
