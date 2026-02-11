import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import EnvHealthCheck from "./components/EnvHealthCheck";
import { PWASplashScreen } from "./components/pwa/PWASplashScreen";
import { OfflineIndicator } from "./components/pwa/OfflineIndicator";

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

// Lazy-loaded protected route wrapper
const ProtectedRoute = lazy(() => import("./components/auth/ProtectedRoute"));

// Page loading skeleton
const PageSkeleton = () => (
  <div className="min-h-screen bg-void flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse" />
      <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
      <div className="flex gap-2 justify-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PWASplashScreen minDisplayTime={2500} />
      <OfflineIndicator />
      <Toaster />
      <Sonner />
      <EnvHealthCheck />
      <BrowserRouter>
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
            <Route path="/immersive-darshan" element={<ImmersiveDarshan />} />
            <Route path="/garden/:id" element={<SharedGarden />} />
            <Route path="/jap-bank" element={<JapBank />} />
            <Route path="/install" element={<Install />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;