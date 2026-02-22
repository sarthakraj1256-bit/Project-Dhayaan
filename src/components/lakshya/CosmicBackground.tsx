import { motion } from 'framer-motion';

const CosmicBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Soft warm gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(36, 40%, 97%) 0%, hsl(36, 30%, 93%) 50%, hsl(36, 35%, 95%) 100%)',
        }}
      />

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 30%, hsl(38, 70%, 50%, 0.06) 0%, transparent 60%)',
        }}
      />

      {/* Floating subtle particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            background: 'hsl(38, 70%, 50%, 0.15)',
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
};

export default CosmicBackground;
