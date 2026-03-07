import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Landmark, Tv } from 'lucide-react';
import { LIVE_TEMPLES, getTemplesByRegion } from '@/data/liveDarshanTemples';
import LiveTempleCard from '@/components/live-darshan/LiveTempleCard';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

type Filter = 'all' | 'live' | 'sacred';

const LiveDarshan = () => {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const [filter, setFilter] = useState<Filter>('all');

  const liveCount = LIVE_TEMPLES.filter(t => t.hasLive).length;
  const totalCount = LIVE_TEMPLES.length;

  const filtered = useMemo(() => {
    if (filter === 'live') return LIVE_TEMPLES.filter(t => t.hasLive);
    if (filter === 'sacred') return LIVE_TEMPLES.filter(t => !t.hasLive);
    return LIVE_TEMPLES;
  }, [filter]);

  const regions = useMemo(() => getTemplesByRegion(filtered), [filtered]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `All ${totalCount}` },
    { key: 'live', label: `🔴 Live ${liveCount}` },
    { key: 'sacred', label: `🛕 All Temples` },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F5F0EA] dark:bg-[#080604]">
        {/* Header */}
        <header className="sticky top-0 z-[1000] h-16 flex items-center justify-between px-4 bg-[#E9E2D9]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl border-b border-[#5C5145]/10 dark:border-[#E9E2D9]/10">
          <button onClick={() => navigate('/')} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#5C5145]/10 dark:hover:bg-[#E9E2D9]/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#5C5145] dark:text-[#E9E2D9]" />
          </button>
          <h1 className="text-lg font-bold text-[#3C2F1F] dark:text-[#E9E2D9] tracking-wide">Live Darshan</h1>
          <button className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#5C5145]/10 dark:hover:bg-[#E9E2D9]/10 transition-colors">
            <Bell className="w-5 h-5 text-[#5C5145] dark:text-[#E9E2D9]" />
          </button>
        </header>

        {/* Subtitle */}
        <p className="text-center text-sm text-[#9C8C7C] italic pt-3 px-4">
          Seek blessings from sacred temples 🙏
        </p>

        <main className="px-4 pt-4 pb-28 md:pb-8 max-w-[1280px] mx-auto">
          {/* Stats banner */}
          <div className="flex items-center gap-3 p-3 rounded-xl border mb-5" style={{ background: 'rgba(211,154,42,0.08)', borderColor: 'rgba(211,154,42,0.25)' }}>
            <Landmark className="w-5 h-5 text-[#D39A2A] shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#3C2F1F] dark:text-[#E9E2D9] flex items-center gap-2">
                🛕 {totalCount} Temples
                <span className="text-[#9C8C7C]">|</span>
                <Tv className="w-3.5 h-3.5 text-[#D39A2A]" /> {liveCount} Live Streams
              </p>
              <p className="text-xs text-[#9C8C7C]">Tap any LIVE temple to join darshan</p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  filter === f.key
                    ? 'bg-[#D39A2A] text-white shadow-md'
                    : 'bg-[#1C1917]/10 dark:bg-white/10 text-[#9C8C7C]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Offline */}
          {!isOnline ? (
            <div className="text-center py-20">
              <p className="text-3xl mb-3">🛕</p>
              <p className="text-base font-medium text-[#3C2F1F] dark:text-[#E9E2D9]">No connection</p>
              <p className="text-sm text-[#9C8C7C] mt-1 mb-5">Please check your internet to join live darshan.</p>
              <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#C68A1A] to-[#D9A832]">
                Retry
              </button>
            </div>
          ) : (
            /* Regional sections */
            regions.map(region => (
              <div key={region.key}>
                <h2 className="text-[13px] uppercase tracking-[2px] text-[#D39A2A] border-b border-[rgba(211,154,42,0.2)] mt-6 mb-3 pb-1.5 font-semibold">
                  {region.label}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {region.temples.map(temple => (
                    <LiveTempleCard key={temple.id} temple={temple} />
                  ))}
                </div>
              </div>
            ))
          )}
        </main>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default LiveDarshan;
