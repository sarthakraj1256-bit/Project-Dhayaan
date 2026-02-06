import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Search, Filter, MapPin, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  allImmersiveTemples, 
  ImmersiveTemple, 
  TempleCategory,
  categoryLabels,
  getTempleById
} from '@/data/immersiveTemples';
import PanoramaViewer from '@/components/immersive-darshan/PanoramaViewer';
import DevotionalAudioControls from '@/components/immersive-darshan/DevotionalAudioControls';
import RitualOverlay from '@/components/immersive-darshan/RitualOverlay';
import { useDevotionalAudio } from '@/hooks/useDevotionalAudio';
import BottomNav from '@/components/BottomNav';

const ImmersiveDarshan = () => {
  const [selectedTemple, setSelectedTemple] = useState<ImmersiveTemple | null>(null);
  const [currentZoneId, setCurrentZoneId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TempleCategory | 'all'>('all');
  const [activeRitual, setActiveRitual] = useState<'diya' | 'bell' | 'flower' | 'prasad' | null>(null);
  
  const audio = useDevotionalAudio(selectedTemple);

  // Get current time of day
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  }, []);

  // Current zone
  const currentZone = useMemo(() => {
    if (!selectedTemple || !currentZoneId) return null;
    return selectedTemple.zones.find(z => z.id === currentZoneId) || selectedTemple.zones[0];
  }, [selectedTemple, currentZoneId]);

  // Filter temples
  const filteredTemples = useMemo(() => {
    return allImmersiveTemples.filter(temple => {
      const matchesSearch = temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           temple.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || temple.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Handle entering a temple
  const handleEnterTemple = (temple: ImmersiveTemple) => {
    setSelectedTemple(temple);
    setCurrentZoneId(temple.defaultZoneId);
  };

  // Handle zone change and update ambience
  const handleZoneChange = (zoneId: string) => {
    setCurrentZoneId(zoneId);
    const zone = selectedTemple?.zones.find(z => z.id === zoneId);
    if (zone) {
      audio.playAmbience(zone.ambienceType);
    }
  };

  // Handle ritual interaction
  const handleRitualInteract = (ritualType: string) => {
    setActiveRitual(ritualType as 'diya' | 'bell' | 'flower' | 'prasad');
  };

  // Stop audio when leaving temple (don't auto-play to avoid errors)
  useEffect(() => {
    return () => {
      audio.stopAudio();
    };
  }, [selectedTemple?.id]);

  return (
    <div className="min-h-screen bg-background sacred-pattern">
      {/* 360° Viewer */}
      <AnimatePresence>
        {selectedTemple && currentZone && (
          <>
            <PanoramaViewer
              temple={selectedTemple}
              currentZone={currentZone}
              onZoneChange={handleZoneChange}
              onClose={() => {
                setSelectedTemple(null);
                setCurrentZoneId(null);
                audio.stopAudio();
              }}
              onRitualInteract={handleRitualInteract}
              onMeditationStart={(spotId) => console.log('Start meditation at:', spotId)}
              timeOfDay={timeOfDay}
            />

            {/* Audio Controls */}
            <DevotionalAudioControls
              temple={selectedTemple}
              isPlaying={audio.isPlaying}
              currentTrack={audio.currentTrack}
              volume={audio.volume}
              bellPlaying={audio.bellPlaying}
              onPlayAarti={audio.playAarti}
              onPlayKirtan={audio.playKirtan}
              onPlayAmbience={() => currentZone && audio.playAmbience(currentZone.ambienceType)}
              onPlayChanting={audio.playChanting}
              onRingBell={audio.ringBell}
              onStop={audio.stopAudio}
              onVolumeChange={audio.setVolume}
            />

            {/* Ritual Overlay */}
            <RitualOverlay
              ritualType={activeRitual}
              onComplete={() => setActiveRitual(null)}
              onRingBell={audio.ringBell}
            />
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/live-darshan">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl md:text-3xl text-gold-gradient">
                  360° Immersive Darshan
                </h1>
                <p className="text-muted-foreground text-sm">
                  Experience temples like you're actually there
                </p>
              </div>
            </div>

            <Badge variant="outline" className="hidden sm:flex gap-1 border-primary/50 text-primary">
              <Eye className="w-3 h-3" />
              {allImmersiveTemples.length} Temples
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search temples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border/50"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Temples
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key as TempleCategory)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Temple Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemples.map((temple, index) => (
            <motion.div
              key={temple.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300"
                onClick={() => handleEnterTemple(temple)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={temple.thumbnail}
                    alt={temple.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* 360 Badge */}
                  <Badge className="absolute top-3 left-3 bg-primary/90">
                    360°
                  </Badge>

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary-foreground ml-1" />
                    </div>
                  </div>

                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-lg text-white">{temple.name}</h3>
                    <div className="flex items-center gap-1 text-white/70 text-sm mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{temple.location}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {temple.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[temple.category]}
                    </Badge>
                    {temple.features.hasLiveStream && (
                      <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                        Live
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTemples.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No temples found matching your criteria</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ImmersiveDarshan;
