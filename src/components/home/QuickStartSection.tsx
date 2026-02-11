import { Link } from 'react-router-dom';
import {
  Waves, Play, BookOpen, ScrollText, Sparkles, Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const features = [
  { icon: Waves, label: 'Sonic Lab', description: 'Healing frequencies', href: '/sonic-lab' },
  { icon: Play, label: 'Live Darshan', description: 'Temple streams', href: '/live-darshan' },
  { icon: BookOpen, label: 'Mantrochar', description: 'Learn mantras', href: '/mantrochar' },
  { icon: ScrollText, label: 'Jap Seva', description: 'Chanting log', href: '/jap-bank' },
  { icon: Sparkles, label: 'Lakshya', description: 'Spiritual progress', href: '/lakshya' },
  { icon: Eye, label: 'Immersive', description: '360° darshan', href: '/immersive-darshan' },
];

export default function QuickStartSection() {
  return (
    <section className="px-6 py-5">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        Explore
      </h2>
      <div className="grid grid-cols-3 gap-3">
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
                'flex flex-col items-center gap-2.5 p-4 rounded-2xl',
                'bg-card border border-border/60',
                'hover:border-primary/30 hover:shadow-sm',
                'transition-all duration-200 active:scale-[0.96]',
                'min-h-[104px] justify-center'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {feature.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
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
