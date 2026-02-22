import { Suspense, lazy, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Target, HandHeart, Trophy, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useJapBank, PRESET_MANTRAS } from '@/hooks/useJapBank';
import { useJapGoalReminders } from '@/hooks/useJapGoalReminders';
import BottomNav from '@/components/BottomNav';

const JapCounter = lazy(() => import('@/components/jap-bank/JapCounter'));
const MantraBreakdown = lazy(() => import('@/components/jap-bank/MantraBreakdown'));
const MiniWeekCalendar = lazy(() => import('@/components/jap-bank/MiniWeekCalendar'));
const JapLedger = lazy(() => import('@/components/jap-bank/JapLedger'));
const JapGoals = lazy(() => import('@/components/jap-bank/JapGoals'));
const JapLeaderboard = lazy(() => import('@/components/jap-bank/JapLeaderboard'));
const JapRequests = lazy(() => import('@/components/jap-bank/JapRequests'));
const TempleJapReporting = lazy(() => import('@/components/jap-bank/TempleJapReporting'));
const GoalConfetti = lazy(() => import('@/components/jap-bank/GoalConfetti'));

const Fallback = () => <Skeleton className="h-40 w-full bg-muted/30 rounded-lg" />;

const JapBank = () => {
  const { t } = useLanguage();
  const {
    userId, isAuthenticated,
    entries, goals, requests, leaderboard,
    lifetimeTotal, todayTotal, getTotalForMantra,
    addEntry, createGoal, createRequest,
    acceptRequest, submitProof, completeRequest,
  } = useJapBank();

  useJapGoalReminders(goals, isAuthenticated);

  const [selectedMantra, setSelectedMantra] = useState(PRESET_MANTRAS[0]);
  const [customMantra, setCustomMantra] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const mantraName = selectedMantra === 'custom' ? customMantra.trim() : selectedMantra;

  // Stats for selected date
  const dateStats = useMemo(() => {
    const dateEntries = entries.filter(e => new Date(e.created_at).toISOString().slice(0, 10) === selectedDate);
    const total = dateEntries.reduce((sum, e) => sum + e.chant_count, 0);
    const mantras = new Map<string, number>();
    dateEntries.forEach(e => mantras.set(e.mantra_name, (mantras.get(e.mantra_name) || 0) + e.chant_count));
    return { total, mantras };
  }, [entries, selectedDate]);

  const mantraLifetimeCount = useMemo(() => getTotalForMantra(mantraName || ''), [mantraName, getTotalForMantra]);

  const mantraTodayCount = useMemo(() => {
    const todayStr = new Date().toDateString();
    return entries
      .filter(e => e.mantra_name === mantraName && new Date(e.created_at).toDateString() === todayStr)
      .reduce((sum, e) => sum + e.chant_count, 0);
  }, [entries, mantraName]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <Suspense fallback={null}><GoalConfetti /></Suspense>

      {/* Header */}
      <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/30">
        <Link to="/" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h1 className="font-display text-lg tracking-wider text-primary">
          📿 {t('page.japBank')}
        </h1>
        <div className="w-9" />
      </header>

      {!isAuthenticated ? (
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Sign in to start your jap journey</p>
          <Link to="/auth" className="text-primary underline font-semibold">Sign In</Link>
        </div>
      ) : (
        <div className="px-4 mt-2">
          <Tabs defaultValue="bank">
            <TabsList className="w-full flex overflow-x-auto gap-1 h-auto flex-wrap">
              <TabsTrigger value="bank" className="flex-1 min-w-[60px] text-xs gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Bank
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex-1 min-w-[60px] text-xs gap-1">
                <Target className="w-3.5 h-3.5" /> Goals
              </TabsTrigger>
              <TabsTrigger value="temple" className="flex-1 min-w-[60px] text-xs gap-1">
                <Building2 className="w-3.5 h-3.5" /> Temple
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex-1 min-w-[60px] text-xs gap-1">
                <HandHeart className="w-3.5 h-3.5" /> Delegate
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex-1 min-w-[60px] text-xs gap-1">
                <Trophy className="w-3.5 h-3.5" /> Leaders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bank" className="mt-3 space-y-0">
              <Suspense fallback={<Fallback />}>
                {/* 1. TOP: Mantra Selection + Breakdown */}
                <div className="space-y-3 mb-3">
                  <Select value={selectedMantra} onValueChange={setSelectedMantra}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Select Mantra" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_MANTRAS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                      <SelectItem value="custom">✏️ Custom Mantra</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedMantra === 'custom' && (
                    <Input
                      placeholder="Enter your mantra..."
                      value={customMantra}
                      onChange={e => setCustomMantra(e.target.value)}
                      maxLength={200}
                      className="bg-muted border-border"
                    />
                  )}

                  <MantraBreakdown
                    mantraName={mantraName || PRESET_MANTRAS[0]}
                    todayCount={mantraTodayCount}
                    lifetimeCount={mantraLifetimeCount}
                  />
                </div>

                {/* Soft divider */}
                <div className="py-1">
                  <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--gold) / 0.25), transparent)' }} />
                </div>

                {/* 2. MIDDLE: Mini Week Calendar */}
                <MiniWeekCalendar
                  entries={entries}
                  goals={goals}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />

                {/* Date stats */}
                {dateStats.total > 0 && (
                  <motion.div
                    key={selectedDate}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg px-4 py-2.5 mb-3"
                    style={{
                      background: 'hsl(var(--void-light) / 0.5)',
                      border: '1px solid hsl(var(--gold) / 0.1)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {selectedDate === new Date().toISOString().slice(0, 10) ? 'Today' : new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm font-semibold text-primary font-[Cinzel]">
                        {dateStats.total.toLocaleString()} chants
                      </span>
                    </div>
                    {dateStats.mantras.size > 1 && (
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {Array.from(dateStats.mantras.entries()).map(([name, cnt]) => (
                          <span key={name} className="text-[10px] text-muted-foreground">
                            {name}: <span className="text-foreground/80">{cnt.toLocaleString()}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Soft divider */}
                <div className="py-1">
                  <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--gold) / 0.25), transparent)' }} />
                </div>

                {/* 3. BOTTOM: Tap Counter */}
                <div className="pt-2">
                  <JapCounter
                    onSave={(name, count) => addEntry.mutate({ mantraName: name, count })}
                    isSaving={addEntry.isPending}
                    selectedMantra={mantraName || PRESET_MANTRAS[0]}
                  />
                </div>

                {/* Ledger below (scrollable) */}
                <div className="mt-4">
                  <JapLedger
                    entries={entries}
                    lifetimeTotal={lifetimeTotal}
                    todayTotal={todayTotal}
                    getTotalForMantra={getTotalForMantra}
                  />
                </div>
              </Suspense>
            </TabsContent>

            <TabsContent value="goals" className="mt-4">
              <Suspense fallback={<Fallback />}>
                <JapGoals
                  goals={goals}
                  onCreateGoal={g => createGoal.mutate(g)}
                  isCreating={createGoal.isPending}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="temple" className="mt-4">
              <Suspense fallback={<Fallback />}>
                <TempleJapReporting userId={userId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="requests" className="mt-4">
              <Suspense fallback={<Fallback />}>
                <JapRequests
                  requests={requests}
                  userId={userId}
                  onCreateRequest={r => createRequest.mutate(r)}
                  onAcceptRequest={id => acceptRequest.mutate(id)}
                  onSubmitProof={d => submitProof.mutate(d)}
                  onComplete={d => completeRequest.mutate(d)}
                  isCreating={createRequest.isPending}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-4">
              <Suspense fallback={<Fallback />}>
                <JapLeaderboard leaderboard={leaderboard} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default JapBank;
