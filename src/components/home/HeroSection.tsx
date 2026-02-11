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
    <section className="px-6 pt-14 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-muted-foreground text-sm">{greetingText}</p>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mt-0.5">
          Dhyaan
        </h1>
        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
          Your space for calm and connection.
        </p>
      </motion.div>
    </section>
  );
}
