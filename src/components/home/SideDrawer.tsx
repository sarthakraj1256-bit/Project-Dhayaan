import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Radio, Play, BookOpen, Heart, Sparkles, Bell,
  User, Settings, X, LogOut, LogIn, Sun, Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/backend/client';
import { User as SupaUser } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { triggerHaptic } from '@/hooks/useHapticFeedback';

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/', icon: Home, labelKey: 'nav.home' as const },
  { path: '/sonic-lab', icon: Radio, labelKey: 'nav.sonic' as const },
  { path: '/live-darshan', icon: Play, labelKey: 'nav.darshan' as const },
  { path: '/mantrochar', icon: BookOpen, labelKey: 'drawer.mantraLearning' as const },
  { path: '/jap-bank', icon: Heart, labelKey: 'drawer.japSeva' as const },
  { path: '/lakshya', icon: Sparkles, labelKey: 'nav.lakshya' as const },
  { path: '/daily-aarati', icon: Bell, labelKey: 'drawer.dailyAarati' as const },
  { path: '/profile', icon: User, labelKey: 'nav.profile' as const },
  { path: '/settings', icon: Settings, labelKey: 'drawer.settings' as const },
];

export default function SideDrawer({ open, onClose }: SideDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const [user, setUser] = useState<SupaUser | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null }>({ display_name: null, avatar_url: null });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('avatar_url, display_name').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Swipe-to-close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 60) onClose();
  }, [onClose]);

  const handleNav = (path: string) => {
    triggerHaptic('selection');
    navigate(path);
    onClose();
  };

  const getInitials = () => {
    if (profile.display_name) return profile.display_name.slice(0, 2).toUpperCase();
    return (user?.email || '??').slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[1100] bg-black/50 dark:bg-black/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            className="fixed top-0 left-0 bottom-0 z-[1100] w-[280px] md:w-[320px] flex flex-col safe-top"
            style={{ backgroundColor: 'hsl(var(--background))' }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full hover:bg-foreground/[0.06] transition-colors touch-target"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* User header */}
            <div className="px-6 pt-6 pb-5 border-b border-border/40">
              {user ? (
                <div className="flex flex-col items-start gap-2">
                  <Avatar className="w-14 h-14 border-2 border-primary/20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-1">
                    <p className="text-[15px] font-semibold text-foreground">
                      {profile.display_name || 'Devotee'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('/auth')}
                  className="flex items-center gap-3 text-sm font-medium text-primary"
                >
                  <LogIn className="w-5 h-5" />
                  {t('auth.signIn')}
                </button>
              )}
            </div>

            {/* Menu items */}
            <nav className="flex-1 overflow-y-auto py-3 px-3">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3.5 h-[52px] px-4 rounded-xl text-[15px] font-medium transition-colors duration-200 touch-target',
                      isActive
                        ? 'bg-primary/15 text-primary border-l-[3px] border-primary'
                        : 'text-foreground/70 hover:bg-foreground/[0.06]'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary' : 'text-foreground/50')} />
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </nav>

            {/* Theme toggle + logout */}
            <div className="border-t border-border/40 px-5 py-4 space-y-3">
              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  {theme === 'light' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
                  <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
                </div>
                <button
                  onClick={() => { triggerHaptic('selection'); toggleTheme(); }}
                  className={cn(
                    'relative w-[52px] h-7 rounded-full transition-colors duration-300',
                    theme === 'dark' ? 'bg-foreground/20' : 'bg-primary'
                  )}
                >
                  <motion.div
                    className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm"
                    animate={{ left: theme === 'dark' ? 27 : 3 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Sign out */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-1 py-2 text-sm text-destructive/80 hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('auth.signOut')}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
