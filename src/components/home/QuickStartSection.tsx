import { Link } from 'react-router-dom';
import {
  Waves, Play, BookOpen, ScrollText, Sparkles, Eye, Flame, Tv,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const features = [
  { icon: Waves, label: 'Sonic Lab', description: 'Healing frequencies', href: '/sonic-lab', color: '#2EEAB4' },
  { icon: Play, label: 'Live Darshan', description: 'Temple streams', href: '/live-darshan', color: '#FF7A65' },
  { icon: BookOpen, label: 'Mantrochar', description: 'Learn mantras', href: '/mantrochar', color: '#3ED88A' },
  { icon: ScrollText, label: 'Jap Seva', description: 'Chanting log', href: '/jap-bank', color: '#FFB07A' },
  { icon: Sparkles, label: 'Lakshya', description: 'Spiritual progress', href: '/lakshya', color: '#B8A4F0' },
  { icon: Eye, label: 'Immersive', description: '360° darshan', href: '/immersive-darshan', color: '#5DD8EE' },
  { icon: Flame, label: 'Daily Aarti', description: 'Devotional videos', href: '/live-darshan?tab=content', color: '#FF9F43' },
  { icon: Tv, label: 'Kids Cartoons', description: 'Spiritual stories', href: '/children-cartoons', color: '#FF6B81' },
];

export default function QuickStartSection() {
  return (
    <section className="px-5 py-5">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
        Explore
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
          >
            <Link
              to={feature.href}
              className={cn(
                'flex items-center gap-3 px-4 py-[14px] rounded-2xl',
                'bg-white/[0.07] backdrop-blur-md border border-white/[0.12]',
                'shadow-[0_2px_16px_rgba(0,0,0,0.2)]',
                'hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.12]',
                'transition-all duration-200 active:scale-[0.96]',
                'h-[72px]'
              )}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${feature.color}40` }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color, filter: 'brightness(1.15)' }} strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="text-[13px] font-semibold text-white/90 leading-none tracking-tight">
                  {feature.label}
                </p>
                <p className="text-[11px] font-normal text-white/45 leading-none mt-[5px]">
                  {feature.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
