import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { 
  Clock, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset,
  MapPin,
  Search,
  Filter,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { temples, Temple, AartiSchedule, deityLabels, DeityType } from '@/data/templeStreams';
import BottomNav from '@/components/BottomNav';

interface ScheduleEntry {
  temple: Temple;
  aarti: AartiSchedule;
  timeMinutes: number;
}

const getTimeIcon = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 4 && hour < 7) return <Sunrise className="w-4 h-4 text-primary" />;
  if (hour >= 7 && hour < 12) return <Sun className="w-4 h-4 text-primary" />;
  if (hour >= 12 && hour < 17) return <Sun className="w-4 h-4 text-accent-foreground" />;
  if (hour >= 17 && hour < 20) return <Sunset className="w-4 h-4 text-primary" />;
  return <Moon className="w-4 h-4 text-muted-foreground" />;
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getTimeSlotLabel = (hour: number): string => {
  if (hour >= 3 && hour < 6) return 'Brahma Muhurta (3-6 AM)';
  if (hour >= 6 && hour < 9) return 'Morning (6-9 AM)';
  if (hour >= 9 && hour < 12) return 'Late Morning (9 AM-12 PM)';
  if (hour >= 12 && hour < 15) return 'Afternoon (12-3 PM)';
  if (hour >= 15 && hour < 18) return 'Evening (3-6 PM)';
  if (hour >= 18 && hour < 21) return 'Sandhya (6-9 PM)';
  return 'Night (9 PM-3 AM)';
};

const isCurrentlyActive = (time: string, duration: number): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const aartiStart = new Date();
  aartiStart.setHours(hours, minutes, 0, 0);
  const aartiEnd = new Date(aartiStart.getTime() + duration * 60000);
  
  return now >= aartiStart && now <= aartiEnd;
};

const isUpcoming = (time: string): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const aartiTime = new Date();
  aartiTime.setHours(hours, minutes, 0, 0);
  
  const diffMs = aartiTime.getTime() - now.getTime();
  const diffMins = diffMs / 60000;
  
  return diffMins > 0 && diffMins <= 60;
};

const AartiSchedulePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<DeityType | 'all'>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');

  // Build consolidated schedule
  const allScheduleEntries = useMemo(() => {
    const entries: ScheduleEntry[] = [];
    
    temples.forEach(temple => {
      if (temple.aartiSchedule) {
        temple.aartiSchedule.forEach(aarti => {
          const [hours, minutes] = aarti.time.split(':').map(Number);
          entries.push({
            temple,
            aarti,
            timeMinutes: hours * 60 + minutes
          });
        });
      }
    });
    
    // Sort by time
    return entries.sort((a, b) => a.timeMinutes - b.timeMinutes);
  }, []);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return allScheduleEntries.filter(entry => {
      const matchesSearch = 
        entry.temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.aarti.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDeity = selectedDeity === 'all' || entry.temple.deity === selectedDeity;
      
      if (selectedTimeSlot !== 'all') {
        const hour = Math.floor(entry.timeMinutes / 60);
        const slotLabel = getTimeSlotLabel(hour);
        if (!slotLabel.toLowerCase().includes(selectedTimeSlot.toLowerCase())) {
          return false;
        }
      }
      
      return matchesSearch && matchesDeity;
    });
  }, [allScheduleEntries, searchQuery, selectedDeity, selectedTimeSlot]);

  // Group by time slot
  const groupedByTimeSlot = useMemo(() => {
    const groups: Record<string, ScheduleEntry[]> = {};
    
    filteredEntries.forEach(entry => {
      const hour = Math.floor(entry.timeMinutes / 60);
      const slotLabel = getTimeSlotLabel(hour);
      
      if (!groups[slotLabel]) {
        groups[slotLabel] = [];
      }
      groups[slotLabel].push(entry);
    });
    
    return groups;
  }, [filteredEntries]);

  // Get current time info
  const now = new Date();
  const currentHour = now.getHours();
  const currentSlot = getTimeSlotLabel(currentHour);

  // Count stats
  const totalAartis = allScheduleEntries.length;
  const activeNow = allScheduleEntries.filter(e => isCurrentlyActive(e.aarti.time, e.aarti.duration)).length;
  const upcomingCount = allScheduleEntries.filter(e => isUpcoming(e.aarti.time)).length;

  return (
    <div className="min-h-screen bg-background sacred-pattern">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div>
                <h1 className="font-display text-2xl md:text-3xl text-gold-gradient">
                  Aarati Schedule
                </h1>
                <p className="text-muted-foreground text-sm">
                  Daily timings across all temples
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary">{totalAartis} Daily Aaratis</span>
              </div>
              {activeNow > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/20 rounded-full animate-pulse">
                  <Bell className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">{activeNow} Live Now</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Current Time Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 glass-card rounded-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Time</p>
              <p className="text-3xl font-display text-foreground">
                {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-sm text-primary mt-1">{currentSlot}</p>
            </div>
            
            <div className="flex gap-4">
              {activeNow > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{activeNow}</p>
                  <p className="text-xs text-muted-foreground">Live Now</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{upcomingCount}</p>
                <p className="text-xs text-muted-foreground">Next Hour</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{temples.filter(t => t.aartiSchedule).length}</p>
                <p className="text-xs text-muted-foreground">Temples</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search temples or aaratis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border/50"
            />
          </div>
          
          <Select value={selectedDeity} onValueChange={(v) => setSelectedDeity(v as DeityType | 'all')}>
            <SelectTrigger className="w-full md:w-[180px] h-12">
              <SelectValue placeholder="All Deities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deities</SelectItem>
              <SelectItem value="shiva">🔱 Shiva</SelectItem>
              <SelectItem value="vishnu">🙏 Vishnu</SelectItem>
              <SelectItem value="devi">🌸 Devi</SelectItem>
              <SelectItem value="guru">📿 Guru</SelectItem>
              <SelectItem value="multi">✨ Multi-Deity</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger className="w-full md:w-[200px] h-12">
              <SelectValue placeholder="All Times" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Times</SelectItem>
              <SelectItem value="brahma">🌅 Brahma Muhurta (3-6 AM)</SelectItem>
              <SelectItem value="morning">☀️ Morning (6-9 AM)</SelectItem>
              <SelectItem value="late morning">🌤️ Late Morning (9 AM-12 PM)</SelectItem>
              <SelectItem value="afternoon">🌞 Afternoon (12-3 PM)</SelectItem>
              <SelectItem value="evening">🌇 Evening (3-6 PM)</SelectItem>
              <SelectItem value="sandhya">🌆 Sandhya (6-9 PM)</SelectItem>
              <SelectItem value="night">🌙 Night (9 PM-3 AM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Schedule Grid by Time Slot */}
        <div className="space-y-8">
          {Object.entries(groupedByTimeSlot).map(([slotLabel, entries], slotIndex) => (
            <motion.section
              key={slotLabel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: slotIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${currentSlot === slotLabel ? 'bg-primary/20' : 'bg-muted'}`}>
                  {slotLabel.includes('Brahma') && <Sunrise className="w-5 h-5 text-primary" />}
                  {slotLabel.includes('Morning') && !slotLabel.includes('Late') && <Sun className="w-5 h-5 text-primary" />}
                  {slotLabel.includes('Late Morning') && <Sun className="w-5 h-5 text-accent-foreground" />}
                  {slotLabel.includes('Afternoon') && <Sun className="w-5 h-5 text-primary" />}
                  {slotLabel.includes('Evening') && <Sunset className="w-5 h-5 text-primary" />}
                  {slotLabel.includes('Sandhya') && <Sunset className="w-5 h-5 text-primary" />}
                  {slotLabel.includes('Night') && <Moon className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <h2 className="font-display text-lg text-foreground">{slotLabel}</h2>
                  <p className="text-xs text-muted-foreground">{entries.length} aaratis</p>
                </div>
                {currentSlot === slotLabel && (
                  <Badge className="ml-auto bg-primary text-primary-foreground">Current</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map((entry, index) => {
                  const isActive = isCurrentlyActive(entry.aarti.time, entry.aarti.duration);
                  const upcoming = isUpcoming(entry.aarti.time);
                  
                  return (
                    <motion.div
                      key={`${entry.temple.id}-${entry.aarti.time}-${index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className={`overflow-hidden transition-all ${
                        isActive 
                          ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]' 
                          : upcoming 
                            ? 'border-primary/50' 
                            : 'border-border/50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getTimeIcon(entry.aarti.time)}
                                <span className="font-bold text-foreground">
                                  {formatTime(entry.aarti.time)}
                                </span>
                                {isActive && (
                                  <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse">
                                    LIVE
                                  </Badge>
                                )}
                                {upcoming && !isActive && (
                                  <Badge variant="outline" className="text-xs border-primary text-primary">
                                    Soon
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="font-medium text-foreground truncate">
                                {entry.aarti.name}
                              </p>
                              
                              {entry.aarti.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {entry.aarti.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Link to="/live-darshan" className="flex items-center gap-1 text-xs text-primary hover:underline truncate">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  {entry.temple.name}
                                </Link>
                              </div>
                            </div>
                            
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {deityLabels[entry.temple.deity].split(' ')[0]}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No aaratis found matching your criteria</p>
          </div>
        )}
      </main>

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <BottomNav />
    </div>
  );
};

export default AartiSchedulePage;
