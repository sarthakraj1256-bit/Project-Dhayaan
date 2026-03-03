import { motion } from 'framer-motion';
import { CHAKRA_THRESHOLDS, type SpiritualProgress } from '@/hooks/useSpiritualProgress';

interface ChakraProgressProps {
  progress: SpiritualProgress;
}

const ChakraProgress = ({ progress }: ChakraProgressProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {CHAKRA_THRESHOLDS.map((chakra, index) => {
        const isUnlocked = progress.karma_points >= chakra.points;
        const progressToUnlock = Math.min((progress.karma_points / chakra.points) * 100, 100);
        
        return (
          <motion.div
            key={chakra.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            {/* Chakra Circle */}
            <div
              className={`
                relative w-16 h-16 rounded-full border-2 flex items-center justify-center
                transition-all duration-500
                 ${isUnlocked 
                   ? 'border-transparent' 
                   : 'border-border'
                 }
              `}
              style={{
                background: isUnlocked 
                  ? `radial-gradient(circle, ${chakra.color}40, ${chakra.color}10)`
                  : 'hsl(var(--muted))',
                boxShadow: isUnlocked 
                  ? `0 0 20px ${chakra.color}40, 0 0 40px ${chakra.color}20`
                  : 'none',
              }}
            >
              {/* Progress ring for locked chakras */}
              {!isUnlocked && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="none"
                    stroke={chakra.color}
                    strokeWidth="2"
                    strokeDasharray={`${progressToUnlock * 1.88} 188`}
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              )}
              
              {/* Inner glow for unlocked */}
              {isUnlocked && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-2 rounded-full"
                  style={{ background: `radial-gradient(circle, ${chakra.color}60, transparent)` }}
                />
              )}
              
              {/* Chakra number/symbol */}
              <span 
                className={`text-lg font-display ${isUnlocked ? 'text-white' : 'text-muted-foreground'}`}
                style={{ textShadow: isUnlocked ? `0 0 10px ${chakra.color}` : 'none' }}
              >
                {index + 1}
              </span>
            </div>

            {/* Label */}
            <div className="text-center mt-2">
              <p className={`text-xs font-medium ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {chakra.name.split(' ')[0]}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isUnlocked ? '✓ Unlocked' : `${chakra.points} pts`}
              </p>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-popover border border-border text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              <p className="font-medium text-foreground">{chakra.name}</p>
              <p className="text-muted-foreground">
                {isUnlocked ? 'Awakened' : `Requires ${chakra.points} Karma`}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChakraProgress;
