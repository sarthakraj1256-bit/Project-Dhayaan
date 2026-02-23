import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/backend/client';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/LanguageContext';


interface HeroSectionProps {
  user?: User | null;
}

export default function HeroSection({ user }: HeroSectionProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { t } = useLanguage();

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? t('greeting.morning') : h < 17 ? t('greeting.afternoon') : t('greeting.evening');
  };

  const [greeting, setGreeting] = useState(getGreeting);

  useEffect(() => {
    const update = () => setGreeting(getGreeting());
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [t]);

  useEffect(() => {
    setGreeting(getGreeting());
  }, [t]);

  useEffect(() => {
    if (!user) { setDisplayName(null); return; }
    supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setDisplayName(data?.display_name || user.user_metadata?.full_name || null);
      });
  }, [user]);

  const greetingText = displayName ? `${greeting}, ${displayName}` : greeting;

  return (
    <section className="px-6 pt-14 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground">
          {greetingText}
        </p>

        <div className="mt-3">
          <h1 className="relative">
            <span
              className="text-5xl font-extralight italic tracking-[0.12em] text-gold-gradient"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Dhyaan
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-[1.5px] mt-1.5 origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(35 80% 52%) 0%, hsl(12 65% 68%) 50%, transparent 100%)',
                maxWidth: '160px',
              }}
            />
          </h1>
        </div>

        <p className="text-sm mt-3 leading-relaxed tracking-wide text-foreground/70">
          {t('hero.tagline')}
        </p>
      </motion.div>
    </section>
  );
}
