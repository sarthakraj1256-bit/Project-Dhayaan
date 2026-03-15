import { memo, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Language, LanguageMeta } from '@/i18n/translations';

interface LanguageCardProps {
  lang: LanguageMeta;
  isSelected: boolean;
  onSelect: (code: Language) => void;
}

const LanguageCard = memo(forwardRef<HTMLButtonElement, LanguageCardProps>(
  function LanguageCard({ lang, isSelected, onSelect }, ref) {
    return (
      <motion.button
        ref={ref}
        onClick={() => onSelect(lang.code)}
        className={cn(
          'relative flex flex-col items-center justify-center gap-1 p-3 rounded-[20px] transition-colors duration-200',
          'min-h-[88px] touch-manipulation',
          isSelected
            ? 'border-2 border-[#C9A84C] bg-[rgba(201,168,76,0.08)]'
            : 'border border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.06]'
        )}
        whileTap={{ scale: 0.95 }}
        layout
      >
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-[20px] pointer-events-none"
            style={{ boxShadow: '0 0 16px rgba(201,168,76,0.25), inset 0 0 8px rgba(201,168,76,0.08)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <span
          className={cn(
            'text-[20px] leading-tight font-medium',
            isSelected ? 'text-[#C9A84C]' : 'text-[#F2EDE8]'
          )}
          dir={lang.isRTL ? 'rtl' : 'ltr'}
        >
          {lang.nativeName}
        </span>

        <span className={cn(
          'text-[11px] leading-none',
          isSelected ? 'text-[#C9A84C]/70' : 'text-[#F2EDE8]/40'
        )}>
          {lang.name}
        </span>
      </motion.button>
    );
  }
));

export default LanguageCard;
