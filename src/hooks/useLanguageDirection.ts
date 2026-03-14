import { useEffect } from 'react';
import { Language, getLanguageMeta } from '@/i18n/translations';

export function useLanguageDirection(locale: Language) {
  const meta = getLanguageMeta(locale);
  const isRTL = meta.isRTL;

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale, isRTL]);

  return { isRTL, dir: isRTL ? 'rtl' as const : 'ltr' as const };
}
