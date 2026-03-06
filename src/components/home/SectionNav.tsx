import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import LanguageToggle from '@/components/LanguageToggle';

interface SectionNavProps {
  onMenuOpen: () => void;
}

export default function SectionNav({ onMenuOpen }: SectionNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] w-full',
        'h-[60px] md:h-16 lg:h-[68px]',
        'transition-[box-shadow,background] duration-300'
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {/* Light/dark backgrounds via classes */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-[#F5F0EA] dark:bg-[#0C0A09]',
          'border-b border-[rgba(92,81,69,0.1)] dark:border-[rgba(255,255,255,0.06)]'
        )}
      />

      <div className="relative h-full max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-5 lg:px-8">
        {/* LEFT — Hamburger */}
        <button
          onClick={onMenuOpen}
          className={cn(
            'w-11 h-11 flex items-center justify-center rounded-lg shrink-0',
            'text-[#5C5145] dark:text-[#E9E2D9]',
            'hover:bg-[rgba(92,81,69,0.1)] dark:hover:bg-[rgba(233,226,217,0.06)]',
            'transition-colors duration-200 touch-manipulation'
          )}
          aria-label="Open menu"
        >
          <Menu className="w-[22px] h-[22px]" />
        </button>

        {/* CENTER — intentionally empty */}

        {/* RIGHT — Language toggle */}
        <LanguageToggle />
      </div>
    </header>
  );
}
