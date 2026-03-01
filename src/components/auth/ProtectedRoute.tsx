import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
 import { logError } from "@/lib/logger";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (mounted) {
              setUser(session?.user ?? null);
              setIsLoading(false);
            }
          }
        );

        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
         logError("Auth check failed", error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Loading state with mystical animation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          {/* Rotating mandala loader */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(38, 70%, 50%)"
                strokeWidth="2"
                strokeDasharray="60 200"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke="hsl(45, 80%, 60%)"
                strokeWidth="1.5"
                strokeDasharray="40 160"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="20"
                fill="none"
                stroke="hsl(38, 70%, 50%)"
                strokeWidth="1"
                strokeDasharray="20 100"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
          <p className="text-gold font-body text-sm tracking-widest animate-pulse">
            Verifying your presence...
          </p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated - render children
  return <>{children}</>;
};

export default ProtectedRoute;
