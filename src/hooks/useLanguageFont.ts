import { useEffect, useRef } from 'react';
import { Language, getLanguageMeta } from '@/i18n/translations';

const fontUrls: Record<string, string> = {
  'Noto Sans Devanagari': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap',
  'Noto Sans Bengali': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap',
  'Noto Sans Telugu': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap',
  'Noto Sans Tamil': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap',
  'Noto Sans Gujarati': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap',
  'Noto Sans Kannada': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap',
  'Noto Sans Malayalam': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap',
  'Noto Sans Gurmukhi': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;600;700&display=swap',
  'Noto Sans Oriya': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Oriya:wght@400;700&display=swap',
  'Noto Nastaliq Urdu': 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap',
};

const loadedFonts = new Set<string>();

export function useLanguageFont(language: Language) {
  const prevLang = useRef<Language | null>(null);
  const meta = getLanguageMeta(language);

  useEffect(() => {
    if (prevLang.current === language) return;
    prevLang.current = language;

    const fontFamily = meta.fontFamily;
    if (fontFamily === 'Inter' || loadedFonts.has(fontFamily)) return;

    const url = fontUrls[fontFamily];
    if (!url) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.id = `font-${fontFamily.replace(/\s/g, '-')}`;
    document.head.appendChild(link);
    loadedFonts.add(fontFamily);
  }, [language, meta.fontFamily]);
}
