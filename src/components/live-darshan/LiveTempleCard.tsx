import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import type { LiveTemple } from '@/data/liveDarshanTemples';

interface LiveTempleCardProps {
  temple: LiveTemple;
  index: number;
  onTap: (temple: LiveTemple) => void;
}

export default function LiveTempleCard({ temple, index, onTap }: LiveTempleCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer group"
      onClick={() => onTap(temple)}
    >
      <div className="rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-shadow duration-300 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        {/* Image area */}
        <div className="relative h-[200px] md:h-[240px] overflow-hidden">
          {imgError ? (
            <div className={`w-full h-full bg-gradient-to-br ${temple.gradient} flex items-center justify-center`}>
              <span className="text-white/60 text-5xl font-bold">{temple.deity[0]}</span>
            </div>
          ) : (
            <img
              src={temple.image}
              alt={temple.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" style={{ backgroundPosition: '0 30%' }} />

          {/* LIVE badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-red-600/90 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-[livePulse_1.5s_infinite]" />
              LIVE
            </span>
          </div>

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border-2 border-white/50 transition-all duration-250 group-hover:bg-[hsl(38_60%_55%/0.8)] group-hover:scale-110">
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </div>
          </div>
        </div>

        {/* Text section */}
        <div className="p-3.5 bg-[#EDE8E0] dark:bg-[#1C1917]">
          <h3 className="text-base font-bold text-[#3C2F1F] dark:text-[#E9E2D9] truncate">
            {temple.name}
          </h3>
          <p className="text-xs text-[#9C8C7C] mt-0.5 truncate">{temple.subtitle}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-[hsl(38_60%_55%)] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {temple.deity}
            </p>
            <span className="text-[11px] text-[#9C8C7C]">Opens in YouTube →</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
