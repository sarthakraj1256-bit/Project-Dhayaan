import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Target, HandHeart, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useJapBank } from '@/hooks/useJapBank';
import BottomNav from '@/components/BottomNav';

const JapCounter = lazy(() => import('@/components/jap-bank/JapCounter'));
const JapLedger = lazy(() => import('@/components/jap-bank/JapLedger'));
const JapGoals = lazy(() => import('@/components/jap-bank/JapGoals'));
const JapLeaderboard = lazy(() => import('@/components/jap-bank/JapLeaderboard'));
const JapRequests = lazy(() => import('@/components/jap-bank/JapRequests'));

const Fallback = () => <Skeleton className="h-40 w-full bg-muted/30 rounded-lg" />;

const JapBank = () => {
  const {
    userId, isAuthenticated,
    entries, goals, requests, leaderboard,
    lifetimeTotal, todayTotal, getTotalForMantra,
    addEntry, createGoal, createRequest,
    acceptRequest, submitProof, completeRequest,
  } = useJapBank();

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div
        className="relative px-4 pt-12 pb-6 safe-top"
        style={{ background: 'linear-gradient(180deg, hsl(var(--void)), hsl(var(--void-light)))' }}
      >
        <Link to="/" className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground safe-top">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-primary font-[Cinzel] tracking-wide">
            📿 Jap Bank
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your spiritual chanting ledger
          </p>
          {isAuthenticated && (
            <div className="flex justify-center gap-6 mt-3">
              <div className="text-center">
                <p className="text-xl font-bold text-primary font-[Cinzel]">{todayTotal}</p>
                <p className="text-[10px] text-muted-foreground">Today</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-accent font-[Cinzel]">{lifetimeTotal.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Lifetime</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {!isAuthenticated ? (
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Sign in to start your jap journey</p>
          <Link to="/auth" className="text-primary underline font-semibold">Sign In</Link>
        </div>
      ) : (
        <div className="px-4 mt-4">
          <Tabs defaultValue="bank">
            <TabsList className="w-full flex overflow-x-auto gap-1 h-auto flex-wrap">
              <TabsTrigger value="bank" className="flex-1 min-w-[70px] text-xs gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Bank
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex-1 min-w-[70px] text-xs gap-1">
                <Target className="w-3.5 h-3.5" /> Goals
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex-1 min-w-[70px] text-xs gap-1">
                <HandHeart className="w-3.5 h-3.5" /> Delegate
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex-1 min-w-[70px] text-xs gap-1">
                <Trophy className="w-3.5 h-3.5" /> Leaders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bank" className="mt-4 space-y-4">
              <Suspense fallback={<Fallback />}>
                <JapCounter
                  onSave={(name, count) => addEntry.mutate({ mantraName: name, count })}
                  isSaving={addEntry.isPending}
                />
                <JapLedger
                  entries={entries}
                  lifetimeTotal={lifetimeTotal}
                  todayTotal={todayTotal}
                  getTotalForMantra={getTotalForMantra}
                />
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
                <JapLeaderboard leaderboard={leaderboard} currentUserId={userId} />
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
