import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="px-5 pt-14 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-muted-foreground text-sm mb-1">Welcome back</p>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Dhyaan
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your space for calm and connection.
        </p>
      </motion.div>
    </section>
  );
}
