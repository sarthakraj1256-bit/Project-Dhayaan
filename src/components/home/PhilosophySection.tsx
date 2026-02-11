import { motion } from 'framer-motion';

export default function PhilosophySection() {
  return (
    <section className="px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_2px_16px_rgba(0,0,0,0.2)] text-center"
      >
         <p className="text-base text-white/85 leading-relaxed italic">
           "Sound, devotion, and sacred traditions — pathways to inner balance."
         </p>
         <p className="text-xs text-white/40 mt-3">
          Bridging ancient wisdom with modern wellbeing.
        </p>
      </motion.div>
    </section>
  );
}
