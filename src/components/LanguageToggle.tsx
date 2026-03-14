import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import LanguageSelector from '@/components/LanguageDashboard/LanguageSelector';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [dashboardOpen, setDashboardOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'relative flex items-center h-8 rounded-[20px] p-[2px] overflow-hidden',
            'bg-[rgba(211,154,42,0.08)] border border-[rgba(211,154,42,0.4)]',
            'dark:bg-[rgba(211,154,42,0.06)] dark:border-[rgba(211,154,42,0.3)]'
          )}
        >
          {/* Sliding pill */}
          <motion.div
            className="absolute top-[2px] bottom-[2px] rounded-[16px] bg-[#D39A2A]"
            initial={false}
            animate={{
              left: language === 'en' ? 2 : '50%',
              right: language === 'hi' ? 2 : '50%',
            }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />

          <button
            onClick={() => setLanguage('en')}
            className={cn(
              'relative z-10 px-3 py-1 text-[13px] rounded-[16px] whitespace-nowrap touch-manipulation min-h-[28px] flex items-center justify-center transition-all duration-250 ease',
              language === 'en'
                ? 'text-white font-semibold'
                : 'text-[#9C8C7C] dark:text-[#6B5E4E] font-normal'
            )}
          >
            Eng
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={cn(
              'relative z-10 px-3 py-1 text-[13px] rounded-[16px] whitespace-nowrap touch-manipulation min-h-[28px] flex items-center justify-center transition-all duration-250 ease',
              language === 'hi'
                ? 'text-white font-semibold'
                : 'text-[#9C8C7C] dark:text-[#6B5E4E] font-normal'
            )}
          >
            हिंदी
          </button>
        </div>

        {/* More languages button */}
        <button
          onClick={() => setDashboardOpen(true)}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full touch-manipulation transition-colors',
            'bg-[rgba(211,154,42,0.08)] border border-[rgba(211,154,42,0.3)]',
            'hover:bg-[rgba(211,154,42,0.15)]'
          )}
          aria-label="More languages"
        >
          <Globe className="w-3.5 h-3.5 text-[#D39A2A]" />
        </button>
      </div>

      <LanguageSelector open={dashboardOpen} onClose={() => setDashboardOpen(false)} />
    </>
  );
}
