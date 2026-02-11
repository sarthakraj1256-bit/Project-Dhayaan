import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/backend/client';
import { User } from '@supabase/supabase-js';

interface HeroSectionProps {
  user?: User | null;
}

export default function HeroSection({ user }: HeroSectionProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
        <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-medium">
          {greetingText}
        </p>

        <h1 className="mt-3 relative">
          <span
            className="text-5xl font-extralight italic tracking-[0.12em]"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: '#1E293B',
            }}
          >
            Dhyaan
          </span>
          {/* Decorative dot */}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
            className="inline-block w-2 h-2 rounded-full ml-1 align-super"
            style={{ background: '#2AA88A', boxShadow: '0 0 8px 2px rgba(42,168,138,0.35)' }}
          />
          {/* Shimmer line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-[1.5px] mt-1.5 origin-left rounded-full"
            style={{
              background: 'linear-gradient(90deg, #2AA88A 0%, #F0937A 50%, transparent 100%)',
              maxWidth: '160px',
            }}
          />
        </h1>

        <p className="text-muted-foreground text-sm mt-3 leading-relaxed tracking-wide">
          Your space for calm and connection.
        </p>
      </motion.div>
    </section>
  );
}
