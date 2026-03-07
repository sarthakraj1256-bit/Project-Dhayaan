import { Sun, Moon, ArrowLeft, Shield, LogIn, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/hooks/useHapticFeedback';
import LanguageToggle from '@/components/LanguageToggle';
import { useState } from 'react';
import { supabase } from '@/integrations/backend/client';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginError, setLoginError] = useState('');

  const handleAdminLogin = async () => {
    setLoginError('');
    if (!email || !password) {
      setLoginError('Please enter email and password.');
      toast({ title: 'Please enter email and password', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      // Sign out any existing session first to avoid conflicts
      await supabase.auth.signOut();

      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setLoginError(error.message);
        toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
        return;
      }

      const user = signInData?.user;
      if (!user) {
        setLoginError('Sign-in succeeded but no user returned.');
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        setLoginError(`Role check failed: ${roleError.message}`);
        toast({ title: 'Role check failed', description: roleError.message, variant: 'destructive' });
        return;
      }

      if (roleData) {
        toast({ title: '🙏 Welcome, Admin' });
        navigate('/admin');
      } else {
        setLoginError('This account does not have admin privileges.');
        toast({ title: 'Access denied', description: 'You do not have admin privileges.', variant: 'destructive' });
      }
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong';
      setLoginError(msg);
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-14 flex items-center gap-3 px-4 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <Link to="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/[0.06] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5 text-foreground/70" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">{t('drawer.settings')}</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Appearance */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h2>
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
              <div>
                <p className="text-sm font-medium text-foreground">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
                <p className="text-xs text-muted-foreground">Switch app appearance</p>
              </div>
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
        </section>

        {/* Language */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Language</h2>
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
            <p className="text-sm font-medium text-foreground">App Language</p>
            <LanguageToggle />
          </div>
        </section>

        {/* Admin Login */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4" /> Admin
          </h2>
          <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
            <p className="text-xs text-muted-foreground">Sign in with admin credentials to access the dashboard.</p>
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full h-10 px-3 pr-16 rounded-lg bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              onClick={handleAdminLogin}
              disabled={isLoading}
              className={cn(
                'w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors',
                'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
              )}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isLoading ? 'Signing in…' : 'Admin Login'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}