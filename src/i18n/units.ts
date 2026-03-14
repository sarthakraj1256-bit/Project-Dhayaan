import type { Language } from './translations';

const unitMap: Record<string, Partial<Record<Language, string>>> = {
  min: { en: 'min', hi: 'मिनट' },
  mins: { en: 'mins', hi: 'मिनट' },
  minutes: { en: 'minutes', hi: 'मिनट' },
  hour: { en: 'hour', hi: 'घंटा' },
  hours: { en: 'hours', hi: 'घंटे' },
  h: { en: 'h', hi: 'घं' },
  m: { en: 'm', hi: 'मि' },
  day: { en: 'day', hi: 'दिन' },
  days: { en: 'days', hi: 'दिन' },
  chants: { en: 'chants', hi: 'जप' },
  chant: { en: 'chant', hi: 'जप' },
  episode: { en: 'Episode', hi: 'एपिसोड' },
  episodes: { en: 'Episodes', hi: 'एपिसोड' },
  parts: { en: 'parts', hi: 'भाग' },
  part: { en: 'part', hi: 'भाग' },
  sessions: { en: 'sessions', hi: 'सत्र' },
  session: { en: 'session', hi: 'सत्र' },
  more: { en: 'more', hi: 'और' },
  level: { en: 'Level', hi: 'स्तर' },
  points: { en: 'points', hi: 'अंक' },
};

/**
 * Localize a unit string. Numbers are preserved, only the unit word is translated.
 * Falls back to English if the language doesn't have a translation.
 */
export function localizeUnit(value: number | string, unit: string, language: Language): string {
  const localizedUnit = unitMap[unit]?.[language] || unitMap[unit]?.en || unit;
  return `${value} ${localizedUnit}`;
}

/**
 * Get just the localized unit word without value.
 */
export function getLocalizedUnit(unit: string, language: Language): string {
  return unitMap[unit]?.[language] || unitMap[unit]?.en || unit;
}

/**
 * Format date using locale-appropriate formatting.
 */
export function localizeDate(date: Date | string, language: Language, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap: Partial<Record<Language, string>> = {
    hi: 'hi-IN', en: 'en-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN',
    ta: 'ta-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN',
    or: 'or-IN', as: 'as-IN', ur: 'ur-IN', sa: 'sa-IN', mai: 'hi-IN',
  };
  const locale = localeMap[language] || 'en-IN';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  return d.toLocaleDateString(locale, options || defaultOptions);
}
