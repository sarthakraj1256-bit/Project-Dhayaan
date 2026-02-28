import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/backend/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { isAdmin, isLoading: roleLoading } = useAdminCheck();
  const location = useLocation();
  const { toast } = useToast();
  const unauthorizedToastShownRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !roleLoading && user && !isAdmin && !unauthorizedToastShownRef.current) {
      unauthorizedToastShownRef.current = true;
      toast({
        title: "Access Denied",
        description: "Access Denied: Restricted to Authorized Personnel.",
        variant: "destructive",
      });
    }
  }, [authLoading, roleLoading, user, isAdmin, toast]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="60 200" strokeLinecap="round" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="hsl(var(--gold-light))" strokeWidth="1.5" strokeDasharray="40 160" strokeLinecap="round" />
            </svg>
          </motion.div>
          <p className="text-muted-foreground text-sm tracking-widest animate-pulse">
            Verifying access...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;

