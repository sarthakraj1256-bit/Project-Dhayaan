import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface SadhanaFlameProps {
  streak: number;
  className?: string;
}

type FlameState = 'spark' | 'steady' | 'roaring';

/**
 * Interactive Agni flame that changes states based on streak
 * - Small Spark (0-2 days)
 * - Steady Flame (3-6 days)
 * - Blue Roaring Agni (7+ days)
 */
const SadhanaFlame = memo(function SadhanaFlame({ streak, className = '' }: SadhanaFlameProps) {
  const flameState: FlameState = useMemo(() => {
    if (streak >= 7) return 'roaring';
    if (streak >= 3) return 'steady';
    return 'spark';
  }, [streak]);

  const flameConfig = useMemo(() => {
    switch (flameState) {
      case 'roaring':
        return {
          size: 'w-12 h-12',
          colors: ['#00d4ff', '#0099ff', '#0066ff', '#00ffff'],
          glowColor: 'shadow-[0_0_30px_rgba(0,212,255,0.8)]',
          intensity: 1.5,
          label: 'Divine Fire 🔱',
        };
      case 'steady':
        return {
          size: 'w-10 h-10',
          colors: ['#ff6b00', '#ff8c00', '#ffaa00', '#ffd700'],
          glowColor: 'shadow-[0_0_20px_rgba(255,140,0,0.6)]',
          intensity: 1,
          label: 'Growing Flame',
        };
      default:
        return {
          size: 'w-8 h-8',
          colors: ['#ff4500', '#ff6347', '#ff7f50', '#ffa07a'],
          glowColor: 'shadow-[0_0_10px_rgba(255,99,71,0.4)]',
          intensity: 0.6,
          label: 'Spark',
        };
    }
  }, [flameState]);

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className={`relative ${flameConfig.size} ${flameConfig.glowColor} rounded-full`}>
        {/* Base glow */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${flameConfig.colors[0]} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 1.5 / flameConfig.intensity,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main flame SVG */}
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full relative z-10"
          fill="none"
        >
          <defs>
            <linearGradient id={`flame-gradient-${flameState}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={flameConfig.colors[0]} />
              <stop offset="40%" stopColor={flameConfig.colors[1]} />
              <stop offset="70%" stopColor={flameConfig.colors[2]} />
              <stop offset="100%" stopColor={flameConfig.colors[3]} />
            </linearGradient>
            <filter id={`flame-blur-${flameState}`}>
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
          </defs>

          {/* Outer flame */}
          <motion.path
            d="M12 2C12 2 8 6 8 11C8 14 9.5 16 12 18C14.5 16 16 14 16 11C16 6 12 2 12 2Z"
            fill={`url(#flame-gradient-${flameState})`}
            filter={`url(#flame-blur-${flameState})`}
            animate={{
              d: [
                "M12 2C12 2 8 6 8 11C8 14 9.5 16 12 18C14.5 16 16 14 16 11C16 6 12 2 12 2Z",
                "M12 3C12 3 7 7 7 11.5C7 14.5 9 16.5 12 18.5C15 16.5 17 14.5 17 11.5C17 7 12 3 12 3Z",
                "M12 2C12 2 8 6 8 11C8 14 9.5 16 12 18C14.5 16 16 14 16 11C16 6 12 2 12 2Z",
              ],
            }}
            transition={{
              duration: 0.8 / flameConfig.intensity,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner bright core */}
          <motion.path
            d="M12 8C12 8 10 10 10 12C10 13.5 11 14.5 12 15C13 14.5 14 13.5 14 12C14 10 12 8 12 8Z"
            fill={flameConfig.colors[3]}
            opacity={0.9}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 0.5 / flameConfig.intensity,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Sparks for roaring state */}
          {flameState === 'roaring' && (
            <>
              <motion.circle
                cx="9"
                cy="6"
                r="0.5"
                fill={flameConfig.colors[3]}
                animate={{
                  y: [-2, -6],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatDelay: 0.3,
                }}
              />
              <motion.circle
                cx="15"
                cy="7"
                r="0.4"
                fill={flameConfig.colors[2]}
                animate={{
                  y: [-2, -5],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  delay: 0.2,
                }}
              />
              <motion.circle
                cx="12"
                cy="4"
                r="0.3"
                fill={flameConfig.colors[3]}
                animate={{
                  y: [-1, -4],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                  delay: 0.4,
                }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Streak count and label */}
      <div className="flex flex-col">
        <span className="text-2xl font-display text-foreground">{streak}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {flameConfig.label}
        </span>
      </div>
    </div>
  );
});

export default SadhanaFlame;
