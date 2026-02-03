import { motion } from "framer-motion";

interface SriYantraBackgroundProps {
  spinSpeed?: number; // 1 = normal, higher = faster
}

const SriYantraBackground = ({ spinSpeed = 1 }: SriYantraBackgroundProps) => {
  const duration = Math.max(60 / spinSpeed, 5); // Faster spin = lower duration, min 5s
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Radial glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, hsl(var(--gold) / 0.08) 0%, transparent 50%)',
        }}
      />
      
      {/* Sri Yantra SVG */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1000px] md:h-[1000px]"
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          style={{ opacity: 0.15 }}
        >
          {/* Outer circle */}
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.5"
          />
          
          {/* Inner circles */}
          <circle
            cx="200"
            cy="200"
            r="160"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.5"
          />
          <circle
            cx="200"
            cy="200"
            r="140"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.3"
          />
          
          {/* Lotus petals outer */}
          {[...Array(16)].map((_, i) => {
            const angle = (i * 22.5 * Math.PI) / 180;
            const x1 = 200 + 160 * Math.cos(angle);
            const y1 = 200 + 160 * Math.sin(angle);
            const x2 = 200 + 140 * Math.cos(angle - 0.15);
            const y2 = 200 + 140 * Math.sin(angle - 0.15);
            const x3 = 200 + 140 * Math.cos(angle + 0.15);
            const y3 = 200 + 140 * Math.sin(angle + 0.15);
            return (
              <path
                key={`petal-${i}`}
                d={`M ${x1} ${y1} Q ${200 + 150 * Math.cos(angle)} ${200 + 150 * Math.sin(angle)} ${x2} ${y2} M ${x1} ${y1} Q ${200 + 150 * Math.cos(angle)} ${200 + 150 * Math.sin(angle)} ${x3} ${y3}`}
                fill="none"
                stroke="hsl(38, 70%, 50%)"
                strokeWidth="0.3"
              />
            );
          })}
          
          {/* Downward triangles (Shakti) */}
          <polygon
            points="200,60 320,280 80,280"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.5"
          />
          <polygon
            points="200,90 290,250 110,250"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.5"
          />
          <polygon
            points="200,110 270,230 130,230"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.4"
          />
          <polygon
            points="200,130 250,210 150,210"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.4"
          />
          
          {/* Upward triangles (Shiva) */}
          <polygon
            points="200,340 80,120 320,120"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.5"
          />
          <polygon
            points="200,310 110,150 290,150"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.5"
          />
          <polygon
            points="200,290 130,170 270,170"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.4"
          />
          <polygon
            points="200,270 150,190 250,190"
            fill="none"
            stroke="hsl(38, 70%, 50%)"
            strokeWidth="0.4"
          />
          
          {/* Bindu (center point) */}
          <circle
            cx="200"
            cy="200"
            r="4"
            fill="hsl(38, 70%, 50%)"
          />
          
          {/* Inner geometry lines */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            return (
              <line
                key={`line-${i}`}
                x1={200 + 20 * Math.cos(angle)}
                y1={200 + 20 * Math.sin(angle)}
                x2={200 + 120 * Math.cos(angle)}
                y2={200 + 120 * Math.sin(angle)}
                stroke="hsl(38, 70%, 50%)"
                strokeWidth="0.2"
              />
            );
          })}
        </svg>
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gold/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default SriYantraBackground;
