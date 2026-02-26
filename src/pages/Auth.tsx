import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/backend/client";
import { lovable } from "@/integrations/lovableSafe";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { logError } from "@/lib/logger";
import dhyaanLogo from "@/assets/dhyaan-logo.png";

// Validation schemas
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for password reset token or OAuth status in URL
  useEffect(() => {
    const type = searchParams.get("type");
    const accessToken = searchParams.get("access_token");
    const oauthStatus = searchParams.get("oauth_status");
    const oauthError = searchParams.get("oauth_error");

    if (type === "recovery" || accessToken) {
      setMode("reset");
    }

    if (oauthStatus === "error") {
      const errorMsg = oauthError
        ? decodeURIComponent(oauthError)
        : "Google sign-in could not be completed.";
      toast({
        title: "Sign-in unsuccessful",
        description: errorMsg === "no_session"
          ? "No session was returned. Please try again."
          : errorMsg,
        variant: "destructive",
      });
    } else if (oauthStatus === "timeout") {
      toast({
        title: "Connection timed out",
        description: "The sign-in took too long. Please try again.",
        variant: "destructive",
      });
    }

    if (oauthStatus) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("oauth_status");
      newParams.delete("oauth_error");
      window.history.replaceState({}, "", `${window.location.pathname}${newParams.toString() ? `?${newParams}` : ""}`);
    }
  }, [searchParams, toast]);

  // Check if user is already logged in
  useEffect(() => {
    const isResetMode = mode === "reset";
    if (isResetMode) return;

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setMode("reset");
          return;
        }
        if (session?.user && !isResetMode) {
          navigate("/");
        }
      });

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && !isResetMode) {
          navigate("/");
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      logError("Auth initialization error", error);
    }
  }, [navigate, mode]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (mode === "forgot") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    } else if (mode === "reset") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    } else {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      if (error) {
        toast({ title: "Unable to send reset email", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Reset link sent", description: "Check your email for the reset link." });
      }
    } catch {
      toast({ title: "An error occurred", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: "Unable to update password", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Password updated", description: "You can now sign in with your new password." });
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast({ title: "An error occurred", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") return handleForgotPassword();
    if (mode === "reset") return handleResetPassword();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({ title: "Invalid credentials", description: error.message, variant: "destructive" });
        } else if (data?.user) {
          navigate("/");
        }
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (error.message?.includes("already registered")) {
            toast({ title: "Account exists", description: "This email is already registered. Please login instead.", variant: "destructive" });
          } else {
            toast({ title: "Signup failed", description: error.message, variant: "destructive" });
          }
        } else if (data?.user) {
          toast({ title: "Welcome to Dhyaan", description: "Your journey begins now." });
          navigate("/");
        }
      }
    } catch {
      toast({ title: "An error occurred", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) {
        toast({ title: "Google login failed", description: result.error.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", description: "Could not connect to Google.", variant: "destructive" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsAppleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
      if (result.error) {
        toast({ title: "Apple login failed", description: result.error.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", description: "Could not connect to Apple.", variant: "destructive" });
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle spiritual background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, hsl(38, 70%, 50%, 0.07) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 80% 80%, hsl(30, 60%, 55%, 0.05) 0%, transparent 50%)',
          }}
        />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              background: 'hsl(38, 70%, 50%, 0.12)',
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.08, 0.25, 0.08],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="rounded-2xl bg-card border border-border shadow-lg p-6 md:p-8">
          {/* Back button for forgot/reset */}
          <AnimatePresence>
            {(mode === "forgot" || mode === "reset") && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => { setMode("login"); setErrors({}); }}
                className="mb-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to login"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={dhyaanLogo}
              alt="Dhyaan Logo"
              className="w-20 h-20 rounded-2xl object-cover mb-3 shadow-md"
            />
            <h1 className="text-xl font-bold text-foreground tracking-wide">DHYAAN</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
              {mode === "reset" && "Set a new password"}
            </p>
          </div>

          {/* Social buttons - login & signup only */}
          {(mode === "login" || mode === "signup") && (
            <>
              <div className="space-y-3 mb-5">
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-sm font-medium text-foreground disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={handleAppleLogin}
                  disabled={isAppleLoading}
                  className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-sm font-medium text-foreground disabled:opacity-50"
                >
                  {isAppleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  )}
                  Continue with Apple
                </button>
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Email field */}
                {(mode === "login" || mode === "signup" || mode === "forgot") && (
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                        placeholder="Email address"
                        autoComplete="email"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-xs mt-1.5">{errors.email}</p>}
                  </div>
                )}

                {/* Password field */}
                {(mode === "login" || mode === "signup" || mode === "reset") && (
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                        placeholder={mode === "reset" ? "New password" : "Password"}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        className="w-full h-12 pl-11 pr-11 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-destructive text-xs mt-1.5">{errors.password}</p>}
                  </div>
                )}

                {/* Confirm password */}
                {mode === "reset" && (
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-destructive text-xs mt-1.5">{errors.confirmPassword}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Forgot password link */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setErrors({}); }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" && "Sign In"}
                  {mode === "signup" && "Sign Up"}
                  {mode === "forgot" && "Send Reset Link"}
                  {mode === "reset" && "Update Password"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle login/signup */}
          {(mode === "login" || mode === "signup") && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrors({}); }}
                className="text-primary font-semibold hover:underline"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
