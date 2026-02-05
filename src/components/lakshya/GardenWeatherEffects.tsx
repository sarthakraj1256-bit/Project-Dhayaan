import { useMemo } from 'react';
import { motion } from 'framer-motion';

type WeatherType = 'dawn' | 'morning' | 'afternoon' | 'sunset' | 'night' | 'blessed';

interface GardenWeatherEffectsProps {
  meditationMinutes: number;
  flourishingPlants: number;
}

const getTimeOfDay = (): WeatherType => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'sunset';
  return 'night';
};

const WEATHER_CONFIG = {
  dawn: {
    name: 'Sacred Dawn',
    emoji: '🌅',
    gradient: 'linear-gradient(180deg, #2D1B4E 0%, #7C3AED 30%, #F97316 60%, #FDE68A 100%)',
    particleColor: 'rgba(251, 191, 36, 0.6)',
    ambientLight: 0.4,
    showSunMoon: 'sun-rising',
  },
  morning: {
    name: 'Radiant Morning',
    emoji: '☀️',
    gradient: 'linear-gradient(180deg, #60A5FA 0%, #93C5FD 40%, #DBEAFE 100%)',
    particleColor: 'rgba(253, 224, 71, 0.5)',
    ambientLight: 0.8,
    showSunMoon: 'sun',
  },
  afternoon: {
    name: 'Peaceful Afternoon',
    emoji: '🌤️',
    gradient: 'linear-gradient(180deg, #38BDF8 0%, #7DD3FC 50%, #BAE6FD 100%)',
    particleColor: 'rgba(255, 255, 255, 0.4)',
    ambientLight: 1,
    showSunMoon: 'sun-high',
  },
  sunset: {
    name: 'Golden Hour',
    emoji: '🌇',
    gradient: 'linear-gradient(180deg, #1E1B4B 0%, #7C3AED 20%, #F97316 50%, #FBBF24 80%, #FDE68A 100%)',
    particleColor: 'rgba(251, 146, 60, 0.5)',
    ambientLight: 0.6,
    showSunMoon: 'sun-setting',
  },
  night: {
    name: 'Cosmic Night',
    emoji: '🌙',
    gradient: 'linear-gradient(180deg, #0F0A1E 0%, #1E1B4B 40%, #312E81 100%)',
    particleColor: 'rgba(167, 139, 250, 0.4)',
    ambientLight: 0.2,
    showSunMoon: 'moon',
  },
  blessed: {
    name: 'Divine Blessing',
    emoji: '✨',
    gradient: 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 30%, #FBBF24 60%, #F59E0B 100%)',
    particleColor: 'rgba(251, 191, 36, 0.8)',
    ambientLight: 1.2,
    showSunMoon: 'blessed',
  },
};

const GardenWeatherEffects = ({ meditationMinutes, flourishingPlants }: GardenWeatherEffectsProps) => {
  const weather = useMemo(() => {
    // Check for blessed state (high meditation + flourishing plants)
    if (meditationMinutes >= 60 && flourishingPlants >= 5) {
      return 'blessed' as WeatherType;
    }
    return getTimeOfDay();
  }, [meditationMinutes, flourishingPlants]);

  const config = WEATHER_CONFIG[weather];

  // Generate particles based on weather
  const particles = useMemo(() => {
    const count = weather === 'blessed' ? 30 : weather === 'night' ? 40 : 20;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: weather === 'night' ? Math.random() * 2 + 1 : Math.random() * 4 + 2,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2,
    }));
  }, [weather]);

  // Generate clouds for morning/afternoon
  const clouds = useMemo(() => {
    if (weather === 'night' || weather === 'blessed') return [];
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: 20 + i * 30,
      y: 10 + Math.random() * 15,
      scale: 0.6 + Math.random() * 0.4,
      opacity: 0.3 + Math.random() * 0.3,
    }));
  }, [weather]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Sky Gradient Overlay */}
      <motion.div
        key={weather}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
        style={{ background: config.gradient, mixBlendMode: 'overlay' }}
      />

      {/* Sun/Moon */}
      {config.showSunMoon === 'sun' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-8"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 40px 20px rgba(251, 191, 36, 0.3)',
                '0 0 60px 30px rgba(251, 191, 36, 0.4)',
                '0 0 40px 20px rgba(251, 191, 36, 0.3)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500"
          />
        </motion.div>
      )}

      {config.showSunMoon === 'sun-high' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 50px 25px rgba(251, 191, 36, 0.25)',
                '0 0 70px 35px rgba(251, 191, 36, 0.35)',
                '0 0 50px 25px rgba(251, 191, 36, 0.25)',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400"
          />
        </motion.div>
      )}

      {config.showSunMoon === 'sun-rising' && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute bottom-1/3 right-6"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 30px 15px rgba(249, 115, 22, 0.4)',
                '0 0 50px 25px rgba(251, 191, 36, 0.5)',
                '0 0 30px 15px rgba(249, 115, 22, 0.4)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500"
          />
        </motion.div>
      )}

      {config.showSunMoon === 'sun-setting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-1/4 left-6"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 40px 20px rgba(249, 115, 22, 0.5)',
                '0 0 60px 30px rgba(251, 146, 60, 0.6)',
                '0 0 40px 20px rgba(249, 115, 22, 0.5)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600"
          />
        </motion.div>
      )}

      {config.showSunMoon === 'moon' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-6 right-10"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px 10px rgba(226, 232, 240, 0.2)',
                '0 0 30px 15px rgba(226, 232, 240, 0.3)',
                '0 0 20px 10px rgba(226, 232, 240, 0.2)',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-300 relative overflow-hidden"
          >
            {/* Moon craters */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-200/50" />
            <div className="absolute bottom-3 right-2 w-1.5 h-1.5 rounded-full bg-slate-200/40" />
          </motion.div>
        </motion.div>
      )}

      {config.showSunMoon === 'blessed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              boxShadow: [
                '0 0 40px 20px rgba(251, 191, 36, 0.5)',
                '0 0 80px 40px rgba(251, 191, 36, 0.7)',
                '0 0 40px 20px rgba(251, 191, 36, 0.5)',
              ]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center text-2xl"
          >
            🕉️
          </motion.div>
        </motion.div>
      )}

      {/* Clouds */}
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          initial={{ x: '-20%', opacity: 0 }}
          animate={{ 
            x: ['0%', '10%', '0%'],
            opacity: cloud.opacity 
          }}
          transition={{ 
            x: { duration: 20 + cloud.id * 5, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 1 }
          }}
          className="absolute"
          style={{ 
            left: `${cloud.x}%`, 
            top: `${cloud.y}%`,
            transform: `scale(${cloud.scale})`,
          }}
        >
          <div className="flex gap-1">
            <div className="w-8 h-6 rounded-full bg-white/80" />
            <div className="w-12 h-8 rounded-full bg-white/90 -ml-4 -mt-2" />
            <div className="w-10 h-6 rounded-full bg-white/70 -ml-5" />
          </div>
        </motion.div>
      ))}

      {/* Particles (stars at night, light rays during day, sparkles when blessed) */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: weather === 'night' 
              ? [0.3, 1, 0.3] 
              : weather === 'blessed'
              ? [0.5, 1, 0.5]
              : [0.2, 0.6, 0.2],
            scale: weather === 'blessed' ? [1, 1.5, 1] : 1,
          }}
          transition={{ 
            duration: particle.duration, 
            delay: particle.delay, 
            repeat: Infinity 
          }}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: config.particleColor,
            boxShadow: weather === 'night' 
              ? `0 0 ${particle.size * 2}px ${config.particleColor}`
              : weather === 'blessed'
              ? `0 0 ${particle.size * 3}px ${config.particleColor}`
              : 'none',
          }}
        />
      ))}

      {/* Light rays for blessed state */}
      {weather === 'blessed' && (
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-b from-amber-400/40 to-transparent origin-bottom"
              style={{ transform: `rotate(${i * 45}deg) translateY(-100%)` }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </motion.div>
      )}

      {/* Weather indicator badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center gap-1.5"
      >
        <span className="text-xs">{config.emoji}</span>
        <span className="text-[10px] text-foreground/80">{config.name}</span>
      </motion.div>
    </div>
  );
};

export default GardenWeatherEffects;
