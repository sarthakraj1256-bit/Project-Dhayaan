import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/backend/client";
import { Skeleton } from "@/components/ui/skeleton";

const AUTH_TIMEOUT_MS = 10000; // 10 seconds

const AuthCallback = () => {
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    let hasNavigated = false;

    // Timeout fallback - redirect to auth if stalled
    const timeoutId = setTimeout(() => {
      if (!hasNavigated) {
        console.warn("Auth callback timeout - redirecting to login");
        setTimeoutReached(true);
        navigate("/auth", { replace: true });
      }
    }, AUTH_TIMEOUT_MS);

    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase puts tokens there)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          hasNavigated = true;
          clearTimeout(timeoutId);
          navigate("/auth", { replace: true });
          return;
        }

        if (data.session) {
          // Successfully authenticated - redirect to home
          hasNavigated = true;
          clearTimeout(timeoutId);
          navigate("/", { replace: true });
        } else {
          // No session found - redirect to auth page
          hasNavigated = true;
          clearTimeout(timeoutId);
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Auth callback exception:", error);
        hasNavigated = true;
        clearTimeout(timeoutId);
        navigate("/auth", { replace: true });
      }
    };

    handleAuthCallback();

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse" />
        <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
        <p className="text-muted-foreground text-sm">
          {timeoutReached ? "Taking too long, redirecting..." : "Completing authentication..."}
        </p>
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
