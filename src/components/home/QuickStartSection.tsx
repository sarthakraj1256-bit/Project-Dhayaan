import { Link } from 'react-router-dom';
import { Brain, Radio, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const quickActions = [
  {
    icon: Brain,
    title: 'Calm My Mind',
    description: 'Soothing sound frequencies for relaxation and stress relief.',
    href: '/sonic-lab',
    gradient: 'from-violet-500/20 to-indigo-500/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: Radio,
    title: 'Watch Live Darshan',
    description: 'Live aarti and temple rituals happening right now.',
    href: '/live-darshan',
    gradient: 'from-red-500/20 to-orange-500/20',
    iconColor: 'text-red-400',
  },
  {
    icon: PlayCircle,
    title: 'Watch Recorded Darshan',
    description: 'Temple darshan available anytime, day or night.',
    href: '/live-darshan',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400',
  },
];

export default function QuickStartSection() {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">
            What would you like to do right now?
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Choose your path to inner peace
          </p>
        </motion.div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={action.href}
                className="group block h-full p-6 rounded-2xl bg-void-light/60 backdrop-blur-xl border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--gold)/0.1)]"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className={`w-7 h-7 ${action.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-muted-foreground font-body text-base leading-relaxed">
                  {action.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
