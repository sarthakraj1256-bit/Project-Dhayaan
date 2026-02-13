import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/backend/client';
import { User } from '@supabase/supabase-js';
import { Radio, BookOpen, Flame, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  user?: User | null;
}

const masonryItems = [
  { label: 'Sonic Lab', icon: Radio, to: '/sonic-lab', h: 'h-28', color: '#34D9A8' },
  { label: 'Live Darshan', icon: Play, to: '/live-darshan', h: 'h-36', color: '#F5816E' },
  { label: 'Mantrochar', icon: BookOpen, to: '/mantrochar', h: 'h-32', color: '#7EC8E3' },
  { label: 'Jap Bank', icon: Flame, to: '/jap-bank', h: 'h-28', color: '#FBBF24' },
  { label: 'Lakshya', icon: Sparkles, to: '/lakshya', h: 'h-36', color: '#C084FC' },
  { label: 'Dashboard', icon: Radio, to: '/dashboard', h: 'h-24', color: '#34D9A8' },
];

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
        <p className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: '#111111' }}>
          {greetingText}
        </p>

        <h1 className="mt-3 relative">
          <span
            className="text-5xl font-extralight italic tracking-[0.12em]"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: '#000000',
            }}
          >
            Dhyaan
          </span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
            className="inline-block w-2 h-2 rounded-full ml-1 align-super"
            style={{ background: '#34D9A8', boxShadow: '0 0 10px 3px rgba(52,217,168,0.4)' }}
          />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-[1.5px] mt-1.5 origin-left rounded-full"
            style={{
              background: 'linear-gradient(90deg, #34D9A8 0%, #F5816E 50%, transparent 100%)',
              maxWidth: '160px',
            }}
          />
        </h1>

        <p className="text-sm mt-3 leading-relaxed tracking-wide" style={{ color: '#222222' }}>
          Your space for calm and connection.
        </p>
      </motion.div>

      {/* Masonry Quick-Access Grid */}
      <div className="mt-6 columns-2 gap-3 space-y-3">
        {masonryItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} to={item.to} className="block break-inside-avoid">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
                className={`${item.h} rounded-2xl p-4 flex flex-col justify-between`}
                style={{
                  background: `linear-gradient(145deg, ${item.color}18, ${item.color}08)`,
                  border: `1px solid ${item.color}25`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} strokeWidth={2} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: '#1a1a1a' }}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
