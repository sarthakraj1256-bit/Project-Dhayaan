import { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import type { LiveTemple } from '@/data/liveDarshanTemples';
import { useLanguage } from '@/contexts/LanguageContext';
interface Props {
  temple: LiveTemple;
}

const openDarshan = (temple: LiveTemple) => {
  if (!temple.hasLive || !temple.liveUrl) return;
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  if (isMobile) {
    const appUrl = temple.liveUrl.replace('https://', 'vnd.youtube://');
    window.location.href = appUrl;
    setTimeout(() => {
      window.open(temple.liveUrl!, '_blank', 'noopener,noreferrer');
    }, 1500);
  } else {
    window.open(temple.liveUrl, '_blank', 'noopener,noreferrer');
  }
};

export default function LiveTempleCard({ temple }: Props) {
  const [imgError, setImgError] = useState(false);
  const { t } = useLanguage();

  const isLive = temple.hasLive && temple.liveUrl;

  const card = (
    <div
      className={`rounded-2xl overflow-hidden border transition-all duration-250 ${
        isLive
          ? 'cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:border-[rgba(201,168,76,0.4)] active:scale-[0.97]'
          : 'cursor-default'
      }`}
      style={{
        background: 'var(--darshan-card-bg)',
        borderColor: 'rgba(201,168,76,0.15)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Image area */}
      <div className="relative overflow-hidden h-[180px] md:h-[200px]">
        {!imgError ? (
          <img
            src={temple.imageUrl}
            alt={temple.name}
            loading="lazy"
            className="w-full h-full object-cover object-center"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${temple.color}, ${temple.color}dd)` }}
          >
            <span className="text-white/70 text-5xl font-bold select-none">
              {temple.name[0]}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />

        {/* LIVE badge */}
        {isLive && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold text-white bg-[rgba(220,38,38,0.92)]">
            <span className="w-2 h-2 rounded-full bg-white animate-[livePulse_1.8s_infinite]" />
            LIVE
          </span>
        )}

        {/* Sacred Site badge */}
        {!isLive && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-[3px] rounded-xl text-[10px] text-[#E9E2D9] bg-black/50">
            🛕 {t('darshan.sacredSite')}
          </span>
        )}

        {/* Play button */}
        {isLive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-lg border-2 border-white/50 transition-all duration-200 group-hover:bg-[rgba(211,154,42,0.8)]">
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Text section */}
      <div className="px-3.5 py-3">
        <h3 className="text-sm font-bold text-[#3C2F1F] dark:text-[#F5F0E8] truncate">
          {temple.name}
        </h3>
        <p className="text-[11px] text-[#9C8C7C] mt-0.5 truncate">{temple.location}</p>
        <p className="text-[11px] text-[#D39A2A] mt-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {temple.deity}
        </p>
        <p className={`text-[11px] mt-1.5 ${isLive ? 'text-[#D39A2A]' : 'text-[#6B5E4E]'}`}>
          {isLive ? 'Opens in YouTube →' : 'Sacred Viewing'}
        </p>
      </div>
    </div>
  );

  if (!isLive) return <div className="group">{card}</div>;

  return (
    <a
      href={temple.liveUrl!}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        openDarshan(temple);
      }}
      className="block no-underline group"
    >
      {card}
    </a>
  );
}
