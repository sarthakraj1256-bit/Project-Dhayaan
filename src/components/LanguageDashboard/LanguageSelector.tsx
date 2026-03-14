import { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language, supportedLanguages, LanguageMeta } from '@/i18n/translations';
import { triggerHaptic } from '@/hooks/useHapticFeedback';
import LanguageCard from './LanguageCard';

interface LanguageSelectorProps {
  open: boolean;
  onClose: () => void;
}

export default function LanguageSelector({ open, onClose }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [selected, setSelected] = useState<Language>(language);
  const [search, setSearch] = useState('');

  const hasChanged = selected !== language;

  const popularLanguages = useMemo(
    () => supportedLanguages.filter(l => l.isPopular),
    []
  );

  const allLanguages = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return supportedLanguages.filter(l => !l.isPopular);
    return supportedLanguages.filter(
      l => l.name.toLowerCase().includes(q) ||
           l.nativeName.toLowerCase().includes(q) ||
           l.code.includes(q)
    );
  }, [search]);

  const handleSelect = useCallback((code: Language) => {
    triggerHaptic('selection');
    setSelected(code);
  }, []);

  const handleApply = useCallback(() => {
    if (!hasChanged) return;
    triggerHaptic('impact');
    setLanguage(selected);
    onClose();
  }, [hasChanged, selected, setLanguage, onClose]);

  return (
    createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[2000] bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed inset-0 z-[2001] flex items-end sm:items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={cn(
                  'relative w-full sm:max-w-lg max-h-[90vh] flex flex-col',
                  'rounded-t-3xl sm:rounded-3xl overflow-hidden',
                  'bg-[#0A0604] border border-[rgba(201,168,76,0.15)]'
                )}
                initial={{ y: '100%', scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: '100%', scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-[#C9A84C]" />
                    <span className="text-[15px] font-semibold text-[#F2EDE8]">Dhyaan</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-[#F2EDE8]/60" />
                  </button>
                </div>

                {/* Title */}
                <div className="px-5 pb-3">
                  <h2 className="text-lg font-semibold text-[#F2EDE8]">
                    Choose Your Language
                  </h2>
                  <p className="text-sm text-[#F2EDE8]/50 mt-0.5">अपनी भाषा चुनें</p>
                </div>

                {/* Search */}
                <div className="px-5 pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F2EDE8]/30" />
                    <input
                      type="text"
                      placeholder="Search languages..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className={cn(
                        'w-full h-10 pl-10 pr-4 rounded-xl text-sm',
                        'bg-white/[0.04] border border-white/[0.08]',
                        'text-[#F2EDE8] placeholder:text-[#F2EDE8]/30',
                        'focus:outline-none focus:border-[#C9A84C]/40'
                      )}
                    />
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
                  {/* Popular */}
                  {!search && (
                    <div>
                      <p className="text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-2.5">
                        ★ Popular
                      </p>
                      <div className="grid grid-cols-3 gap-2.5">
                        {popularLanguages.map(lang => (
                          <LanguageCard
                            key={lang.code}
                            lang={lang}
                            isSelected={selected === lang.code}
                            onSelect={handleSelect}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All / Search Results */}
                  <div>
                    <p className="text-xs font-semibold text-[#F2EDE8]/40 uppercase tracking-wider mb-2.5">
                      {search ? 'Search Results' : 'All Languages'}
                    </p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {allLanguages.map(lang => (
                        <LanguageCard
                          key={lang.code}
                          lang={lang}
                          isSelected={selected === lang.code}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                    {search && allLanguages.length === 0 && (
                      <p className="text-sm text-[#F2EDE8]/30 text-center py-6">No languages found</p>
                    )}
                  </div>
                </div>

                {/* Apply button */}
                <div className="px-5 pb-5 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={handleApply}
                    disabled={!hasChanged}
                    className={cn(
                      'w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300',
                      hasChanged
                        ? 'bg-gradient-to-r from-[#C9A84C] to-[#D4B85C] text-[#0A0604] shadow-[0_0_20px_rgba(201,168,76,0.3)]'
                        : 'bg-white/[0.06] text-[#F2EDE8]/30 cursor-not-allowed'
                    )}
                  >
                    <Check className="w-4 h-4" />
                    Apply — {supportedLanguages.find(l => l.code === selected)?.nativeName} Selected
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )
  );
}
