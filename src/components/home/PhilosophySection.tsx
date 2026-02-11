import { motion } from 'framer-motion';

export default function PhilosophySection() {
  return (
    <section className="px-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-5 rounded-2xl bg-card border border-border text-center"
      >
        <p className="text-base text-foreground leading-relaxed italic">
          "Sound, devotion, and sacred traditions — pathways to inner balance."
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Bridging ancient wisdom with modern wellbeing.
        </p>
      </motion.div>
    </section>
  );
}
