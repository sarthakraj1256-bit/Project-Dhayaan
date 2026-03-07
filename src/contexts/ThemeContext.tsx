import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

const applyThemeClass = (t: Theme) => {
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dhyaan_theme') as Theme | null;
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });
  const [mounted, setMounted] = useState(false);

  // Initial load: check Supabase metadata, then localStorage, then system
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.theme) {
          const t = user.user_metadata.theme as Theme;
          applyThemeClass(t);
          setThemeState(t);
          localStorage.setItem('dhyaan_theme', t);
          setMounted(true);
          return;
        }
      } catch {
        // Supabase unreachable — continue with local fallback
      }

      const stored = localStorage.getItem('dhyaan_theme') as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        applyThemeClass(stored);
        setThemeState(stored);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const t = prefersDark ? 'dark' : 'light';
        applyThemeClass(t);
        setThemeState(t);
      }
      setMounted(true);
    };

    loadTheme();

    // Listen for system preference changes (only if user has no stored preference)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('dhyaan_theme');
      if (!stored) {
        const t: Theme = e.matches ? 'dark' : 'light';
        applyThemeClass(t);
        setThemeState(t);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sync theme on auth state change (cross-device sync)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const savedTheme = session.user.user_metadata?.theme as Theme | undefined;
          if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
            applyThemeClass(savedTheme);
            setThemeState(savedTheme);
            localStorage.setItem('dhyaan_theme', savedTheme);
          }
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // Apply class whenever theme changes
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const persistTheme = async (t: Theme) => {
    localStorage.setItem('dhyaan_theme', t);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { theme: t, theme_updated_at: new Date().toISOString() },
        });
      }
    } catch {
      // Offline fallback — localStorage already saved
    }
  };

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    persistTheme(next);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    persistTheme(t);
  };

  // Prevent flash of wrong theme — inline script in index.html handles the initial class
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
