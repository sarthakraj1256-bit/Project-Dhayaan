import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center h-8 rounded-full bg-white/[0.08] border border-white/[0.12] p-0.5 relative overflow-hidden">
      {/* Sliding highlight */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-full"
        style={{ background: 'hsl(var(--primary) / 0.25)', border: '1px solid hsl(var(--primary) / 0.4)' }}
        initial={false}
        animate={{ left: language === 'en' ? 2 : '50%', right: language === 'hi' ? 2 : '50%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'relative z-10 px-2.5 py-1 text-xs font-medium rounded-full transition-colors duration-200 whitespace-nowrap',
          language === 'en' ? 'text-white' : 'text-white/40'
        )}
      >
        Eng
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={cn(
          'relative z-10 px-2.5 py-1 text-xs font-medium rounded-full transition-colors duration-200 whitespace-nowrap',
          language === 'hi' ? 'text-white' : 'text-white/40'
        )}
      >
        हिंदी
      </button>
    </div>
  );
}
