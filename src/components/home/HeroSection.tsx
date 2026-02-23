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
      <div>
        <motion.p
          className="text-xs uppercase tracking-[0.2em] font-medium text-muted-foreground"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {greetingText}
        </motion.p>

        <div className="mt-3">
          <h1 className="relative inline-block overflow-hidden">
            {"Dhyaan".split("").map((char, i) => (
              <motion.span
                key={i}
                className="text-5xl font-extralight italic tracking-[0.12em] text-gold-gradient inline-block"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + i * 0.06,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {char}
              </motion.span>
            ))}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-[1.5px] mt-1.5 origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(35 80% 52%) 0%, hsl(12 65% 68%) 50%, transparent 100%)',
              }}
            />
          </h1>
        </div>

        <motion.p
          className="text-sm mt-3 leading-relaxed tracking-wide text-foreground/70"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
        >
          {t('hero.tagline')}
        </motion.p>
      </div>
    </section>
  );
}
