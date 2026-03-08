import { useState } from 'react';
import { Play } from 'lucide-react';
import type { Gurudwara } from '@/data/gurudwaraStreams';
import type { LiveStatus } from '@/hooks/useGurudwaraLiveStatus';

interface Props {
  gurudwara: Gurudwara;
  liveStatus?: LiveStatus;
}

const openGurudwara = (url: string) => {
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  if (isMobile) {
    const appUrl = url.replace('https://', 'vnd.youtube://');
    window.location.href = appUrl;
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 1500);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export default function GurudwaraCard({ gurudwara, liveStatus }: Props) {
  const [imgError, setImgError] = useState(false);

  const isLive = liveStatus?.isLive ?? false;
  const hasBeenChecked = liveStatus && liveStatus.lastChecked > 0;

  return (
    <a
      href={gurudwara.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        openGurudwara(gurudwara.liveUrl);
      }}
      className="block no-underline group"
    >
      <div
        className="rounded-2xl overflow-hidden border cursor-pointer transition-all duration-250 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:border-[rgba(201,168,76,0.4)] active:scale-[0.97]"
        style={{
          background: 'var(--darshan-card-bg)',
          borderColor: isLive ? 'rgba(220,38,38,0.35)' : 'rgba(201,168,76,0.15)',
          boxShadow: isLive
            ? '0 4px 20px rgba(220,38,38,0.15)'
            : '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Image area */}
        <div className="relative overflow-hidden h-[180px] md:h-[200px]">
          {!imgError ? (
            <img
              src={gurudwara.imageUrl}
              alt={gurudwara.name}
              loading="lazy"
              className="w-full h-full object-cover object-center"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #D39A2A, #C68A1Add)' }}
            >
              <span className="text-white/70 text-5xl font-bold select-none">
                {gurudwara.name[0]}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />

          {/* LIVE / OFFLINE badge */}
          {hasBeenChecked ? (
            isLive ? (
              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold text-white bg-[rgba(220,38,38,0.92)]">
                <span className="w-2 h-2 rounded-full bg-white animate-[livePulse_1.8s_infinite]" />
                LIVE
              </span>
            ) : (
              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold text-white/80 bg-[rgba(100,100,100,0.75)]">
                <span className="w-2 h-2 rounded-full bg-white/50" />
                OFFLINE
              </span>
            )
          ) : (
            /* Show pulsing badge while first check is pending */
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold text-white bg-[rgba(220,38,38,0.92)]">
              <span className="w-2 h-2 rounded-full bg-white animate-[livePulse_1.8s_infinite]" />
              LIVE
            </span>
          )}

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-lg border-2 border-white/50 transition-all duration-200 group-hover:bg-[rgba(211,154,42,0.8)]">
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            </div>
          </div>
        </div>

        {/* Text section */}
        <div className="px-3.5 py-3">
          <h3 className="text-sm font-bold text-[#3C2F1F] dark:text-[#F5F0E8] truncate">
            {gurudwara.name}
          </h3>
          <p className="text-[11px] text-[#9C8C7C] mt-0.5 truncate">{gurudwara.location}</p>
          <p className={`text-[11px] mt-1.5 ${isLive ? 'text-red-500 font-semibold' : 'text-[#D39A2A]'}`}>
            {isLive ? '🔴 Live Now → Watch' : 'Opens in YouTube →'}
          </p>
        </div>
      </div>
    </a>
  );
}
