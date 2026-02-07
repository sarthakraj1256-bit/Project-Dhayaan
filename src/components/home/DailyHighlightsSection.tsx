import { Link } from 'react-router-dom';
import { Sparkles, Building2, Waves, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamic content that could be fetched from backend
const highlights = [
  {
    icon: Sparkles,
    label: "Today's Featured",
    title: 'Kashi Vishwanath Ganga Aarti',
    description: 'Experience the divine evening aarti at the sacred ghats',
    href: '/live-darshan',
    color: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-400',
  },
  {
    icon: Building2,
    label: 'Temple of the Day',
    title: 'Tirupati Balaji Temple',
    description: 'One of the most visited sacred pilgrimage sites in the world',
    href: '/live-darshan',
    color: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Waves,
    label: 'Recommended Frequency',
    title: '528 Hz - Love & Healing',
    description: 'The miracle tone for transformation and DNA repair',
    href: '/sonic-lab',
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
];

export default function DailyHighlightsSection() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <section className="px-6 py-16 md:py-24 bg-gradient-to-b from-transparent via-void-light/30 to-transparent">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <Calendar className="w-4 h-4" />
            <span className="font-body">{today}</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
            Daily Highlights
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Curated experiences for your spiritual journey today
          </p>
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={highlight.href}
                className="group block h-full p-6 rounded-2xl bg-void-light/60 backdrop-blur-xl border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--gold)/0.1)]"
              >
                {/* Label */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${highlight.color} flex items-center justify-center`}>
                    <highlight.icon className={`w-4 h-4 ${highlight.iconColor}`} />
                  </div>
                  <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">
                    {highlight.label}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {highlight.title}
                </h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {highlight.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
