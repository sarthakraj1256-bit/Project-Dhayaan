import { motion } from 'framer-motion';

export default function HeroSection() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <section className="px-6 pt-14 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-muted-foreground text-sm">{greeting}</p>
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
