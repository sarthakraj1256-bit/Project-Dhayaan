import PageTransition from '@/components/PageTransition';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Radio, 
  Search, 
  Sparkles, 
  TrendingUp,
  Play,
  Video,
  Music,
  BookOpen,
  Zap,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  temples, 
  spiritualContent, 
  Temple, 
  SpiritualContent,
  TempleCategory,
  DeityType,
  Region
} from '@/data/templeStreams';
import TempleCard from '@/components/live-darshan/TempleCard';
import TempleFilters from '@/components/live-darshan/TempleFilters';
import VideoPlayer from '@/components/live-darshan/VideoPlayer';
import SpiritualContentCard from '@/components/live-darshan/SpiritualContentCard';
import ContentVideoModal from '@/components/live-darshan/ContentVideoModal';
import FavoritesPanel from '@/components/live-darshan/FavoritesPanel';
import TempleStoriesPanel from '@/components/live-darshan/TempleStoriesPanel';
import BottomNav from '@/components/BottomNav';
import AartiReminderSettings from '@/components/live-darshan/AartiReminderSettings';
import { useFavoriteAartiNotifications } from '@/hooks/useFavoriteAartiNotifications';

const LiveDarshan = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'content' ? 'content' : 'temples';
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [selectedContent, setSelectedContent] = useState<SpiritualContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TempleCategory | 'all'>('all');
  const [selectedDeity, setSelectedDeity] = useState<DeityType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [contentType, setContentType] = useState<SpiritualContent['type'] | 'all'>('all');

  // Initialize favorite aarti notifications
  useFavoriteAartiNotifications();
  // Filter temples
  const filteredTemples = useMemo(() => {
    return temples.filter(temple => {
      const matchesSearch = temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           temple.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || temple.category === selectedCategory;
      const matchesDeity = selectedDeity === 'all' || temple.deity === selectedDeity;
      const matchesRegion = selectedRegion === 'all' || temple.region === selectedRegion;
      const matchesLive = !showLiveOnly || temple.isLive;
      
      return matchesSearch && matchesCategory && matchesDeity && matchesRegion && matchesLive;
    });
  }, [searchQuery, selectedCategory, selectedDeity, selectedRegion, showLiveOnly]);

  // Filter spiritual content
  const filteredContent = useMemo(() => {
    return spiritualContent.filter(content => {
      const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = contentType === 'all' || content.type === contentType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, contentType]);

  // Featured temples
  const featuredTemples = temples.filter(t => t.isFeatured && t.isLive).slice(0, 3);
  const trendingTemples = [...temples].sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0)).slice(0, 4);

   return (
     <PageTransition>
     <div className="min-h-screen bg-background sacred-pattern">
      {/* Video Player Modal */}
      {selectedTemple && (
        <VideoPlayer 
          temple={selectedTemple} 
          onClose={() => setSelectedTemple(null)} 
        />
      )}

      {/* Content Video Modal */}
      {selectedContent && (
        <ContentVideoModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl md:text-3xl text-gold-gradient">
                  Live Darshan
                </h1>
                <p className="text-muted-foreground text-sm">
                  Mandir aapke phone mein
                </p>
              </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Stories Panel */}
              <TempleStoriesPanel />
              
              {/* Favorites Panel */}
              <FavoritesPanel onSelectTemple={setSelectedTemple} />
              
              {/* Schedule Link */}
              <Link to="/aarti-schedule">
                <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </Button>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Calendar className="w-4 h-4" />
                </Button>
              </Link>
              
              {/* Reminder Settings */}
              <AartiReminderSettings />
              
              {/* Live Counter */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-destructive/20 rounded-full">
                <Radio className="w-4 h-4 text-destructive animate-pulse" />
                <span className="text-sm text-destructive">
                  {temples.filter(t => t.isLive).length} Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search temples, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-card border-border/50 text-lg"
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue={initialTab} className="space-y-8">
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="temples" className="gap-2">
              <Play className="w-4 h-4" />
              Live Temples
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Video className="w-4 h-4" />
              Daily Aarti
            </TabsTrigger>
          </TabsList>

          {/* Live Temples Tab */}
          <TabsContent value="temples" className="space-y-10">
            {/* Featured Section */}
            {!searchQuery && selectedCategory === 'all' && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl text-foreground">Featured Live</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredTemples.map((temple, index) => (
                    <motion.div
                      key={temple.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TempleCard
                        temple={temple}
                        onSelect={setSelectedTemple}
                        isSelected={selectedTemple?.id === temple.id}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Section */}
            {!searchQuery && selectedCategory === 'all' && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl text-foreground">Trending Now</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trendingTemples.map((temple, index) => (
                    <motion.div
                      key={temple.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TempleCard
                        temple={temple}
                        onSelect={setSelectedTemple}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Filters */}
            <section className="glass-card p-6 rounded-xl">
              <TempleFilters
                selectedCategory={selectedCategory}
                selectedDeity={selectedDeity}
                selectedRegion={selectedRegion}
                showLiveOnly={showLiveOnly}
                onCategoryChange={setSelectedCategory}
                onDeityChange={setSelectedDeity}
                onRegionChange={setSelectedRegion}
                onLiveOnlyChange={setShowLiveOnly}
              />
            </section>

            {/* All Temples Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-foreground">
                  {searchQuery ? 'Search Results' : 'All Temples'}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {filteredTemples.length} temples
                </span>
              </div>
              
              {filteredTemples.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemples.map((temple, index) => (
                    <motion.div
                      key={temple.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <TempleCard
                        temple={temple}
                        onSelect={setSelectedTemple}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No temples found matching your criteria</p>
                </div>
              )}
            </section>
          </TabsContent>

          {/* Spiritual Content Tab */}
          <TabsContent value="content" className="space-y-8">
            {/* Content Type Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: '✨ All', icon: Sparkles },
                { value: 'bhajan', label: '🎵 Bhajans', icon: Music },
                { value: 'aarti', label: '🪔 Aarti', icon: Zap },
                { value: 'mantra', label: '🕉️ Mantras', icon: Sparkles },
                { value: 'pravachan', label: '🎙️ Pravachan', icon: BookOpen },
                { value: 'discourse', label: '📖 Discourses', icon: BookOpen },
                { value: 'meditation', label: '🧘 Meditation', icon: Sparkles },
                { value: 'short', label: '📱 Shorts', icon: Video }
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  variant={contentType === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setContentType(value as SpiritualContent['type'] | 'all')}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredContent.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <SpiritualContentCard
                    content={content}
                    onSelect={setSelectedContent}
                  />
                </motion.div>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No content found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
    </PageTransition>
  );
};

export default LiveDarshan;
