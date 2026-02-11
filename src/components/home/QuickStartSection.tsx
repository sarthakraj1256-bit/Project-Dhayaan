import { Link } from 'react-router-dom';
import {
  Radio, BookOpen, Sparkles, Play, ScrollText, Waves, Eye, Gamepad2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Waves,
    label: 'Sonic Lab',
    description: 'Healing frequencies',
    href: '/sonic-lab',
  },
  {
    icon: Play,
    label: 'Live Darshan',
    description: 'Temple streams',
    href: '/live-darshan',
  },
  {
    icon: BookOpen,
    label: 'Mantrochar',
    description: 'Learn mantras',
    href: '/mantrochar',
  },
  {
    icon: ScrollText,
    label: 'Jap Seva',
    description: 'Chanting log',
    href: '/jap-bank',
  },
  {
    icon: Sparkles,
    label: 'Lakshya',
    description: 'Spiritual progress',
    href: '/lakshya',
  },
  {
    icon: Eye,
    label: 'Immersive',
    description: '360° darshan',
    href: '/immersive-darshan',
  },
];

export default function QuickStartSection() {
  return (
    <section className="px-5 py-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Explore
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Link
              to={feature.href}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-2xl',
                'bg-card border border-border',
                'hover:border-primary/40 hover:bg-secondary/50',
                'transition-all duration-200 active:scale-95',
                'min-h-[100px] justify-center'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {feature.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
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
