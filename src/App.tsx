import { lazy, Suspense, useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import EnvHealthCheck from "./components/EnvHealthCheck";
import { PWASplashScreen } from "./components/pwa/PWASplashScreen";
import { OfflineIndicator } from "./components/pwa/OfflineIndicator";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { SessionRestoreGate } from "./components/SessionRestoreGate";
import { RouteMemoryTracker } from "./components/RouteMemoryTracker";

// Critical routes - loaded immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

// Lazy-loaded routes - loaded on demand
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const SonicLab = lazy(() => import("./pages/SonicLab"));
const Mantrochar = lazy(() => import("./pages/Mantrochar"));
const Lakshya = lazy(() => import("./pages/Lakshya"));
const LiveDarshan = lazy(() => import("./pages/LiveDarshan"));
const AartiSchedule = lazy(() => import("./pages/AartiSchedule"));
const ImmersiveDarshan = lazy(() => import("./pages/ImmersiveDarshan"));
const SharedGarden = lazy(() => import("./pages/SharedGarden"));
const Install = lazy(() => import("./pages/Install"));
const JapBank = lazy(() => import("./pages/JapBank"));
const ChildrenCartoons = lazy(() => import("./pages/ChildrenCartoons"));
const Help = lazy(() => import("./pages/Help"));
const Admin = lazy(() => import("./pages/Admin"));
const BhaktiShorts = lazy(() => import("./pages/BhaktiShorts"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const DailyAarati = lazy(() => import("./pages/DailyAarati"));
const MyKrishna = lazy(() => import("./pages/MyKrishna"));

// Lazy-loaded protected route wrappers
const ProtectedRoute = lazy(() => import("./components/auth/ProtectedRoute"));
const AdminRoute = lazy(() => import("./components/auth/AdminRoute"));

// Page loading skeleton
const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div
      className="w-3 h-3 rounded-full animate-pulse"
      style={{ background: 'hsl(38 60% 55%)' }}
    />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  return (
    <ThemeProvider>
    <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <PWASplashScreen minDisplayTime={2500} onComplete={handleSplashComplete} />
          <OfflineIndicator />
          <Toaster />
          <Sonner />
          <EnvHealthCheck />
          <PWAInstallPrompt />
          <RouteMemoryTracker />
          <SessionRestoreGate splashDone={splashDone} />
          
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              {/* Critical routes - no lazy loading */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Protected routes - lazy loaded */}
              <Route path="/dashboard" element={
                <Suspense fallback={<PageSkeleton />}>
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<PageSkeleton />}>
                  <ProtectedRoute><Profile /></ProtectedRoute>
                </Suspense>
              } />
              
              {/* Feature routes - lazy loaded */}
              <Route path="/sonic-lab" element={<SonicLab />} />
              <Route path="/mantrochar" element={<Mantrochar />} />
              <Route path="/lakshya" element={<Lakshya />} />
              <Route path="/live-darshan" element={<LiveDarshan />} />
              <Route path="/aarti-schedule" element={<AartiSchedule />} />
              <Route path="/daily-aarati" element={<DailyAarati />} />
              <Route path="/immersive-darshan" element={<ImmersiveDarshan />} />
              <Route path="/garden/:id" element={<SharedGarden />} />
              <Route path="/jap-bank" element={<JapBank />} />
              <Route path="/children-cartoons" element={<ChildrenCartoons />} />
              <Route path="/install" element={<Install />} />
              <Route path="/help" element={<Help />} />
              <Route path="/bhakti-shorts" element={<BhaktiShorts />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/my-krishna" element={<MyKrishna />} />
              <Route path="/admin" element={
                <Suspense fallback={<PageSkeleton />}>
                  <AdminRoute><Admin /></AdminRoute>
                </Suspense>
              } />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;