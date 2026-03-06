import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

const sections = [
  { id: 'hero', labelKey: 'sectionNav.home' as TranslationKey },
  { id: 'explore', labelKey: 'sectionNav.explore' as TranslationKey },
  { id: 'relaxation', labelKey: 'sectionNav.relax' as TranslationKey },
  { id: 'darshan', labelKey: 'sectionNav.darshan' as TranslationKey },
  { id: 'daily-aarti', labelKey: 'sectionNav.aarti' as TranslationKey },
  { id: 'cartoons', labelKey: 'sectionNav.cartoons' as TranslationKey },
  { id: 'highlights', labelKey: 'sectionNav.highlights' as TranslationKey },
  { id: 'philosophy', labelKey: 'sectionNav.philosophy' as TranslationKey },
];

interface SectionNavProps {
  onMenuOpen: () => void;
}

export default function SectionNav({ onMenuOpen }: SectionNavProps) {
  const [active, setActive] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      let current = 'hero';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) current = section.id;
        }
      }
      setActive(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const btn = pillRefs.current[active];
    if (btn && navRef.current) {
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [active]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 64;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] w-full transition-shadow duration-300 safe-top',
        'h-16 md:h-[72px]'
      )}
      style={{
        backgroundColor: 'hsl(var(--background))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 4px 20px -4px hsla(24, 10%, 15%, 0.12)' : 'none',
      }}
    >
      <div className={cn('h-full border-b transition-colors duration-300', scrolled ? 'border-border/50' : 'border-transparent')}>
        <div className="flex items-center h-full px-3 gap-1">
          {/* Hamburger menu */}
          <button
            onClick={onMenuOpen}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-foreground/[0.06] transition-colors touch-target shrink-0 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-foreground/60" />
          </button>

          {/* Section pills - scrollable */}
          <div
            ref={navRef}
            className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-hide pr-24 sm:pr-28"
          >
            {sections.map((section) => (
              <button
                key={section.id}
                ref={(el) => { pillRefs.current[section.id] = el; }}
                onClick={() => scrollTo(section.id)}
                className={cn(
                  'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap touch-target',
                  active === section.id
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-foreground/40 hover:text-foreground/60 hover:bg-foreground/[0.04]'
                )}
              >
                {t(section.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
