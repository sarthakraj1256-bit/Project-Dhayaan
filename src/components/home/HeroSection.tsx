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

        <h1 className="mt-2 relative">
          <span
            className="text-5xl font-extralight italic tracking-[0.15em] bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #FFC875 0%, #FFD9A0 30%, #33BECC 70%, #706FD3 100%)',
              fontFamily: "'Georgia', 'Times New Roman', serif",
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
            style={{ background: '#FFC875', boxShadow: '0 0 8px 2px rgba(255,200,117,0.5)' }}
          />
          {/* Shimmer line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-[1px] mt-1 origin-left"
            style={{
              background: 'linear-gradient(90deg, #FFC875 0%, #33BECC 50%, transparent 100%)',
              maxWidth: '180px',
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
