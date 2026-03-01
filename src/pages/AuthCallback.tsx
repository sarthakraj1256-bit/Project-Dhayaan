import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const AUTH_TIMEOUT_MS = 12000;

type CallbackStatus = "verifying" | "success" | "error" | "timeout";

const statusMessages: Record<CallbackStatus, { title: string; subtitle: string }> = {
  verifying: { title: "Verifying your identity…", subtitle: "Connecting with your account" },
  success: { title: "Welcome back!", subtitle: "Redirecting to your sanctum…" },
  error: { title: "Authentication failed", subtitle: "Redirecting to login…" },
  timeout: { title: "Connection timed out", subtitle: "Redirecting to login…" },
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("verifying");

  useEffect(() => {
    let hasNavigated = false;

    const timeoutId = setTimeout(() => {
      if (!hasNavigated) {
        setStatus("timeout");
        setTimeout(() => navigate("/auth?oauth_status=timeout", { replace: true }), 1500);
      }
    }, AUTH_TIMEOUT_MS);

    const handleAuthCallback = async () => {
      try {
        // Check for error params from OAuth provider
        const errorParam = searchParams.get("error");
        if (errorParam) {
          console.error("OAuth error:", errorParam, searchParams.get("error_description"));
          hasNavigated = true;
          clearTimeout(timeoutId);
          setStatus("error");
          setTimeout(() => navigate(`/auth?oauth_status=error&oauth_error=${encodeURIComponent(searchParams.get("error_description") || errorParam)}`, { replace: true }), 1500);
          return;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          hasNavigated = true;
          clearTimeout(timeoutId);
          setStatus("error");
          setTimeout(() => navigate(`/auth?oauth_status=error&oauth_error=${encodeURIComponent(error.message)}`, { replace: true }), 1500);
          return;
        }

        if (data.session) {
          hasNavigated = true;
          clearTimeout(timeoutId);
          setStatus("success");
          setTimeout(() => navigate("/", { replace: true }), 1200);
        } else {
          // Listen for auth state change (token might be in hash)
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session && !hasNavigated) {
              hasNavigated = true;
              clearTimeout(timeoutId);
              setStatus("success");
              setTimeout(() => navigate("/", { replace: true }), 1200);
              subscription.unsubscribe();
            }
          });

          // Final fallback after a short delay
          setTimeout(() => {
            if (!hasNavigated) {
              hasNavigated = true;
              clearTimeout(timeoutId);
              setStatus("error");
              subscription.unsubscribe();
              setTimeout(() => navigate("/auth?oauth_status=error&oauth_error=no_session", { replace: true }), 1500);
            }
          }, 6000);
        }
      } catch (error) {
        console.error("Auth callback exception:", error);
        hasNavigated = true;
        clearTimeout(timeoutId);
        setStatus("error");
        setTimeout(() => navigate("/auth?oauth_status=error", { replace: true }), 1500);
      }
    };

    handleAuthCallback();

    return () => clearTimeout(timeoutId);
  }, [navigate, searchParams]);

  const { title, subtitle } = statusMessages[status];

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-sm"
      >
        {/* Status Icon */}
        <motion.div
          key={status}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto"
        >
          {status === "verifying" && (
            <div className="w-20 h-20 mx-auto relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-full h-full"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--gold) / 0.2)" strokeWidth="3" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--gold))" strokeWidth="3" strokeDasharray="80 200" strokeLinecap="round" />
                </svg>
              </motion.div>
              <Loader2 className="w-8 h-8 text-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
            </div>
          )}
          {status === "success" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto" />
            </motion.div>
          )}
          {(status === "error" || status === "timeout") && (
            <XCircle className="w-20 h-20 text-destructive mx-auto" />
          )}
        </motion.div>

        {/* Status Text */}
        <motion.div
          key={`text-${status}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="font-display text-xl tracking-wider text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm font-body tracking-wide">{subtitle}</p>
        </motion.div>

        {/* Progress dots */}
        {status === "verifying" && (
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-gold"
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;