import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase puts tokens there)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          navigate("/auth", { replace: true });
          return;
        }

        if (data.session) {
          // Successfully authenticated - redirect to home
          navigate("/", { replace: true });
        } else {
          // No session found - redirect to auth page
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Auth callback exception:", error);
        navigate("/auth", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse" />
        <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
        <p className="text-muted-foreground text-sm">Completing authentication...</p>
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
