import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, ListVideo, X, CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { standaloneCartoons, rollNo21Cartoons, chhotaBheemKrishnaCartoons, selfieWithBajrangiCartoons, jayJagannathCartoons, CartoonVideo } from '@/data/childrenCartoons';
import { Badge } from '@/components/ui/badge';
import ContentVideoModal from '@/components/live-darshan/ContentVideoModal';
import { SpiritualContent } from '@/data/templeStreams';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import { useWatchedEpisodes } from '@/hooks/useWatchedEpisodes';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const deduplicatedVideos = (() => {
  const seen = new Set<string>();
  return standaloneCartoons.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
})();

export default function ChildrenCartoons() {
  const { t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<SpiritualContent | null>(null);
  const [showRollNo21, setShowRollNo21] = useState(false);
  const [showBheemKrishna, setShowBheemKrishna] = useState(false);
  const [showSelfieBajrangi, setShowSelfieBajrangi] = useState(false);
  const [showJayJagannath, setShowJayJagannath] = useState(false);
  const [hideWatched, setHideWatched] = useState(false);
  const { isWatched, toggleWatched, markWatched, watchedCount } = useWatchedEpisodes();

  const videos = useMemo(() => deduplicatedVideos, []);

  const filteredVideos = useMemo(
    () => hideWatched ? videos.filter((v) => !isWatched(v.id)) : videos,
    [videos, hideWatched, isWatched]
  );

  const totalEpisodes = videos.length + rollNo21Cartoons.length + chhotaBheemKrishnaCartoons.length + selfieWithBajrangiCartoons.length + jayJagannathCartoons.length;

  const handleVideoSelect = useCallback((item: CartoonVideo) => {
    markWatched(item.id);
    setSelectedVideo({
      id: item.id,
      title: item.title,
      type: 'short',
      youtubeVideoId: item.youtubeVideoId,
      duration: item.duration,
      thumbnail: item.thumbnail,
    });
  }, [markWatched]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
       <header className="sticky top-0 z-40 h-14 px-4 flex items-center gap-3 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <BackButton />
        <h1 className="font-display text-lg tracking-wider text-foreground">{t('page.childrenCartoons')}</h1>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Progress Bar */}
         <div className="rounded-2xl light-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">{t('cartoons.watchProgress')}</p>
            <span className="text-xs text-muted-foreground">{watchedCount} / {totalEpisodes} {t('cartoons.watched')}</span>
          </div>
          <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex items-center justify-end mt-2">
            <button
              type="button"
              onClick={() => setHideWatched(!hideWatched)}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground/70 transition-colors"
            >
              {hideWatched ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {hideWatched ? t('cartoons.showWatched') : t('cartoons.hideWatched')}
            </button>
          </div>
        </div>

        {/* Playlists */}
        <section>
          <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-3">{t('cartoons.playlists')}</h2>
          <div className="space-y-3">
            <PlaylistCard
              title="Roll No 21"
              episodes={rollNo21Cartoons}
              onOpen={() => setShowRollNo21(true)}
              watchedCount={rollNo21Cartoons.filter((v) => isWatched(v.id)).length}
              totalCount={rollNo21Cartoons.length}
              episodesLabel={t('cartoons.episodes')}
              watchedLabel={t('cartoons.watched')}
            />
            <PlaylistCard
              title="Chhota Bheem aur Krishna ki Jodi"
              episodes={chhotaBheemKrishnaCartoons}
              onOpen={() => setShowBheemKrishna(true)}
              watchedCount={chhotaBheemKrishnaCartoons.filter((v) => isWatched(v.id)).length}
              totalCount={chhotaBheemKrishnaCartoons.length}
              episodesLabel={t('cartoons.episodes')}
              watchedLabel={t('cartoons.watched')}
            />
            <PlaylistCard
              title="Selfie with Bajrangi"
              episodes={selfieWithBajrangiCartoons}
              onOpen={() => setShowSelfieBajrangi(true)}
              watchedCount={selfieWithBajrangiCartoons.filter((v) => isWatched(v.id)).length}
              totalCount={selfieWithBajrangiCartoons.length}
              episodesLabel={t('cartoons.episodes')}
              watchedLabel={t('cartoons.watched')}
            />
            <PlaylistCard
              title="Jay Jagannath"
              episodes={jayJagannathCartoons}
              onOpen={() => setShowJayJagannath(true)}
              watchedCount={jayJagannathCartoons.filter((v) => isWatched(v.id)).length}
              totalCount={jayJagannathCartoons.length}
              episodesLabel={t('cartoons.episodes')}
              watchedLabel={t('cartoons.watched')}
            />
          </div>
        </section>

        {/* Featured Videos */}
        <section>
           <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-3">{t('cartoons.featuredVideos')}</h2>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('cartoons.allWatched')}
              <button type="button" onClick={() => setHideWatched(false)} className="block mx-auto mt-2 text-primary text-xs hover:underline">
                {t('cartoons.showAll')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredVideos.map((item, i) => (
                <VideoCard
                  key={item.id}
                  item={item}
                  index={i}
                  onSelect={handleVideoSelect}
                  watched={isWatched(item.id)}
                  onToggleWatched={() => toggleWatched(item.id)}
                  videoLabel={t('content.video')}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedVideo && (
        <ContentVideoModal content={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}

      {showRollNo21 && (
        <EpisodeModal
          title="Roll No 21"
          episodes={rollNo21Cartoons}
          onClose={() => setShowRollNo21(false)}
          onSelectVideo={(item) => { handleVideoSelect(item); setShowRollNo21(false); }}
          isWatched={isWatched}
          onToggleWatched={toggleWatched}
          episodeLabel={t('cartoons.episode')}
        />
      )}

      {showBheemKrishna && (
        <EpisodeModal
          title="Chhota Bheem aur Krishna ki Jodi"
          episodes={chhotaBheemKrishnaCartoons}
          onClose={() => setShowBheemKrishna(false)}
          onSelectVideo={(item) => { handleVideoSelect(item); setShowBheemKrishna(false); }}
          isWatched={isWatched}
          onToggleWatched={toggleWatched}
          episodeLabel={t('cartoons.episode')}
        />
      )}

      {showSelfieBajrangi && (
        <EpisodeModal
          title="Selfie with Bajrangi"
          episodes={selfieWithBajrangiCartoons}
          onClose={() => setShowSelfieBajrangi(false)}
          onSelectVideo={(item) => { handleVideoSelect(item); setShowSelfieBajrangi(false); }}
          isWatched={isWatched}
          onToggleWatched={toggleWatched}
          episodeLabel={t('cartoons.episode')}
        />
      )}

      {showJayJagannath && (
        <EpisodeModal
          title="Jay Jagannath"
          episodes={jayJagannathCartoons}
          onClose={() => setShowJayJagannath(false)}
          onSelectVideo={(item) => { handleVideoSelect(item); setShowJayJagannath(false); }}
          isWatched={isWatched}
          onToggleWatched={toggleWatched}
          episodeLabel={t('cartoons.episode')}
        />
      )}

      <BottomNav />
    </div>
  );
}

const lightCardClass = "w-full text-left rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md hover:bg-accent/30 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none";

function PlaylistCard({ title, episodes, onOpen, watchedCount, totalCount, episodesLabel, watchedLabel }: { title: string; episodes: CartoonVideo[]; onOpen: () => void; watchedCount: number; totalCount: number; episodesLabel: string; watchedLabel: string }) {
  const thumb = `https://img.youtube.com/vi/${episodes[0]?.youtubeVideoId}/hqdefault.jpg`;
  return (
    <button type="button" aria-label={`Open ${title} playlist`} onClick={onOpen} className={lightCardClass}>
      <div className="flex gap-3 p-2">
        <div className="w-36 shrink-0 rounded-xl overflow-hidden">
          <AspectRatio ratio={16 / 9}>
            <img src={thumb} alt={title} className="w-full h-full object-cover" loading="lazy" />
          </AspectRatio>
        </div>
        <div className="flex flex-col justify-center min-w-0 py-1 flex-1">
          <p className="text-sm font-medium text-foreground/90 leading-snug">{title}</p>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
            <ListVideo className="w-3 h-3" />
            <span>{totalCount} {episodesLabel}</span>
          </div>
          {watchedCount > 0 && (
            <div className="mt-2">
              <div className="h-1 rounded-full bg-foreground/10 overflow-hidden w-full max-w-[120px]">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(watchedCount / totalCount) * 100}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">{watchedCount}/{totalCount} {watchedLabel}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function VideoCard({ item, index, onSelect, watched, onToggleWatched, videoLabel }: { item: CartoonVideo; index: number; onSelect: (v: CartoonVideo) => void; watched: boolean; onToggleWatched: () => void; videoLabel: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={cn(watched && 'opacity-60')}>
      <div className="rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md transition-all duration-200">
        <button type="button" aria-label={`Play ${item.title}`} onClick={() => onSelect(item)} className="w-full text-left active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none">
          <div className="w-full aspect-[16/9] relative overflow-hidden bg-muted">
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute top-1.5 left-1.5">
              <Badge className="bg-pink-600 text-white border-0 text-[9px] px-1.5 py-0.5 leading-none">{videoLabel}</Badge>
            </div>
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white/80">
              <Clock className="w-2.5 h-2.5" />
              {item.duration}
            </div>
            {watched && (
              <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            )}
            {!watched && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                </div>
              </div>
            )}
          </div>
        </button>
        <div className="p-2.5 flex items-center justify-between gap-1">
          <p className="text-xs font-medium text-foreground/85 line-clamp-2 leading-snug flex-1">{item.title}</p>
          <button type="button" onClick={onToggleWatched} className="p-1.5 hover:bg-accent/50 rounded-full transition-colors shrink-0">
            {watched ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-muted-foreground/40" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EpisodeModal({ title, episodes, onClose, onSelectVideo, isWatched, onToggleWatched, episodeLabel }: { title: string; episodes: CartoonVideo[]; onClose: () => void; onSelectVideo: (v: CartoonVideo) => void; isWatched: (id: string) => boolean; onToggleWatched: (id: string) => void; episodeLabel: string }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto" onClick={onClose}>
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="w-full max-w-2xl mx-auto p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg md:text-xl text-foreground">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/20"><X className="w-5 h-5" /></Button>
          </div>
          <div className="flex flex-col gap-3">
            {episodes.map((item, i) => {
              const watched = isWatched(item.id);
              return (
                <div key={item.youtubeVideoId} className={cn('flex items-center gap-2 rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm transition-all duration-200', watched && 'opacity-60')}>
                  <button type="button" aria-label={`Play ${episodeLabel} ${i + 1}`} onClick={() => onSelectVideo(item)} className="flex-1 flex gap-3 p-2 text-left hover:bg-accent/30 active:scale-[0.98] transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <div className="w-28 shrink-0 rounded-xl overflow-hidden relative">
                      <AspectRatio ratio={16 / 9}>
                        <img src={item.thumbnail} alt={`${episodeLabel} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </AspectRatio>
                      {watched && (
                        <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0 py-1">
                      <p className="text-sm font-medium text-foreground/90 leading-snug">{episodeLabel} {i + 1}</p>
                      <span className="text-xs text-muted-foreground mt-0.5">{title}</span>
                    </div>
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); onToggleWatched(item.id); }} className="p-3 hover:bg-accent/50 rounded-full transition-colors mr-1 shrink-0">
                    {watched ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground/40" />}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
