import { Link } from 'react-router-dom';
import { Waves, Moon, Focus, Music, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const frequencies = [
  {
    icon: Waves,
    title: 'Deep Relaxation',
    description: 'Let go of tension with calming frequencies',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Focus,
    title: 'Meditation & Focus',
    description: 'Enhance clarity and concentration',
    color: 'from-purple-500/20 to-violet-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Moon,
    title: 'Sleep & Stress Relief',
    description: 'Drift into peaceful rest',
    color: 'from-indigo-500/20 to-blue-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: Music,
    title: 'Chanting & Mantras',
    description: 'Sacred sounds for spiritual connection',
    color: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
  },
];

export default function RelaxationSection() {
  return (
    <section className="px-6 py-16 md:py-24 bg-gradient-to-b from-transparent via-void-light/30 to-transparent">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-3 block">
            Healing Frequencies
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Relax & Restore
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Simple sounds for peace of mind. No complexity, just calm.
          </p>
        </motion.div>

        {/* Frequency Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {frequencies.map((freq, index) => (
            <motion.div
              key={freq.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-5 rounded-xl bg-void-light/40 border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer hover:bg-void-light/60"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${freq.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <freq.icon className={`w-6 h-6 ${freq.iconColor}`} />
              </div>
              <h3 className="font-display text-base md:text-lg text-foreground mb-1">
                {freq.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {freq.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/sonic-lab"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary font-display text-sm tracking-wider hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
          >
            Explore All Frequencies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
