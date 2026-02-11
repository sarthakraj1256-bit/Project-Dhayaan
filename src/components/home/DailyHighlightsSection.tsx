import { Link } from 'react-router-dom';
import { Sparkles, Building2, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

const highlights = [
  { icon: Sparkles, label: "Today's Pick", title: 'Kashi Ganga Aarti', href: '/live-darshan' },
  { icon: Waves, label: 'Recommended', title: '528 Hz Healing', href: '/sonic-lab' },
  { icon: Building2, label: 'Featured Temple', title: 'Tirupati Balaji', href: '/live-darshan' },
];

export default function DailyHighlightsSection() {
  return (
    <section className="px-6 py-5">
      <h2 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest mb-3">
        Highlights
      </h2>
      <div className="space-y-2.5">
        {highlights.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
          >
            <Link
              to={item.href}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:bg-white/75 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(42,168,138,0.1)' }}>
                <item.icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {item.title}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
