import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/backend/client";
import { lovable } from "@/integrations/lovableSafe";
import { useToast } from "@/hooks/use-toast";
import SriYantraBackground from "@/components/auth/SriYantraBackground";
import FloatingInput from "@/components/auth/FloatingInput";
import SanctumButton from "@/components/auth/SanctumButton";
import GoogleButton from "@/components/auth/GoogleButton";
import AppleButton from "@/components/auth/AppleButton";
import { ArrowLeft } from "lucide-react";
import { logError } from "@/lib/logger";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(1);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for password reset token in URL
  useEffect(() => {
    const type = searchParams.get("type");
    const accessToken = searchParams.get("access_token");
    
    // Handle password recovery redirect
    if (type === "recovery" || accessToken) {
      setMode("reset");
    }
  }, [searchParams]);

  // Check if user is already logged in
  useEffect(() => {
    const isResetMode = mode === "reset";
    if (isResetMode) return; // Don't redirect during password reset
    
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

  // Handle password typing for background animation
  const handlePasswordTyping = (isTyping: boolean) => {
    setSpinSpeed(isTyping ? 3 : 1);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    if (mode === "forgot") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    } else if (mode === "reset") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
      
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
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
        toast({
          title: "Unable to send reset email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Path recovery initiated",
          description: "Check your email for the sacred link to restore your journey.",
        });
        // Stay on forgot page to show confirmation
      }
    } catch {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        toast({
          title: "Unable to update password",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Path restored",
          description: "Your password has been updated. You may now enter the sanctum.",
        });
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "forgot") {
      return handleForgotPassword();
    }
    
    if (mode === "reset") {
      return handleResetPassword();
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (mode === "login") {
        // Direct Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          toast({
            title: "Invalid credentials",
            description: error.message || "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else if (data?.user) {
          // Successful login - navigation handled by auth state change
          navigate("/");
        }
      } else if (mode === "signup") {
        // Direct Supabase signup with auto-confirm enabled
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          if (error.message?.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please login instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup failed",
              description: error.message || "Unable to create account.",
              variant: "destructive",
            });
          }
        } else if (data?.user) {
          // With auto-confirm enabled, user is logged in directly
          toast({
            title: "Welcome to Dhyaan",
            description: "Your journey begins now.",
          });
          navigate("/");
        }
      }
    } catch {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      
      if (result.error) {
        toast({
          title: "Google login failed",
          description: result.error.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "An error occurred",
        description: "Could not connect to Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsAppleLoading(true);
    
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      
      if (result.error) {
        toast({
          title: "Apple login failed",
          description: result.error.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "An error occurred",
        description: "Could not connect to Apple. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAppleLoading(false);
    }
  };

  const getHeadingText = () => {
    switch (mode) {
      case "forgot":
        return "RECOVER YOUR PATH";
      case "reset":
        return "RESTORE YOUR PATH";
      default:
        return "DHYAAN";
    }
  };

  const getSubheadingText = () => {
    switch (mode) {
      case "forgot":
        return "Enter your email to receive a sacred link";
      case "reset":
        return "Create your new password";
      default:
        return "RESONATE WITH THE COSMOS";
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case "forgot":
        return "SEND SACRED LINK";
      case "reset":
        return "RESTORE PASSWORD";
      case "login":
        return "ENTER SANCTUM";
      default:
        return "BEGIN JOURNEY";
    }
  };

  const getFooterText = () => {
    switch (mode) {
      case "forgot":
        return "The cosmos remembers all seekers";
      case "reset":
        return "A new beginning awaits";
      case "login":
        return "Return to inner peace";
      default:
        return "Begin your spiritual awakening";
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Sri Yantra Background */}
      <SriYantraBackground spinSpeed={spinSpeed} />
      
      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ 
          duration: 1, 
          ease: [0.16, 1, 0.3, 1],
          exit: { duration: 1, ease: [0.4, 0, 1, 1] }
        }}
        className="relative w-full max-w-md"
      >
        {/* Outer glow */}
        <div 
          className="absolute -inset-1 rounded-2xl opacity-50 blur-xl"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--gold) / 0.3), transparent, hsl(var(--gold) / 0.3))',
          }}
        />
        
        {/* Card */}
        <div 
          className="relative rounded-2xl p-8 md:p-12"
          style={{
            background: 'hsl(var(--void-light) / 0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid hsl(var(--gold) / 0.3)',
            boxShadow: `
              0 0 60px -20px hsl(var(--gold) / 0.3),
              inset 0 1px 0 hsl(var(--gold) / 0.1)
            `,
          }}
        >
          {/* Back button for forgot/reset modes */}
          <AnimatePresence>
            {(mode === "forgot" || mode === "reset") && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => {
                  setMode("login");
                  setErrors({});
                }}
                className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-gold transition-colors"
                aria-label="Back to login"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Logo / Heading */}
          <motion.h1
            key={mode}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-2"
          >
            <span 
              className={`font-display tracking-[0.2em] text-gold-gradient ${
                mode === "forgot" || mode === "reset" 
                  ? "text-2xl md:text-3xl" 
                  : "text-4xl md:text-5xl tracking-[0.3em]"
              }`}
              style={{
                textShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 0 80px hsl(var(--gold) / 0.3)',
              }}
            >
              {getHeadingText()}
            </span>
          </motion.h1>
          
          {/* Tagline */}
          <motion.p
            key={`sub-${mode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-muted-foreground font-body text-sm tracking-widest mb-8"
          >
            {getSubheadingText()}
          </motion.p>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Email field - show for login, signup, forgot */}
                {(mode === "login" || mode === "signup" || mode === "forgot") && (
                  <div>
                    <FloatingInput
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-sm mt-2 font-body"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>
                )}
                
                {/* Password field - show for login, signup, reset */}
                {(mode === "login" || mode === "signup" || mode === "reset") && (
                  <div>
                    <FloatingInput
                      label={mode === "reset" ? "New Password" : "Password"}
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      onTyping={handlePasswordTyping}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                    />
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-sm mt-2 font-body"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </div>
                )}

                {/* Confirm Password field - show for reset only */}
                {mode === "reset" && (
                  <div>
                    <FloatingInput
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      onTyping={handlePasswordTyping}
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-sm mt-2 font-body"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>


            {/* Forgot Password Link - only show for login */}
            {mode === "login" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-right"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-gold transition-colors font-body tracking-wide"
                >
                  Lost your path?
                </button>
              </motion.div>
            )}
            
            {/* Submit Button */}
            <div className="pt-4">
              <SanctumButton 
                type="submit" 
                isLoading={isLoading}
              >
                {getButtonText()}
              </SanctumButton>
            </div>
          </form>
          
          {/* Divider and Social Login - only show for login/signup */}
          {(mode === "login" || mode === "signup") && (
            <>
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <span className="text-muted-foreground text-xs tracking-widest font-body">OR</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              </div>
              
              {/* Social Login */}
              <div className="flex justify-center gap-4">
                <GoogleButton onClick={handleGoogleLogin} isLoading={isGoogleLoading} />
                <AppleButton onClick={handleAppleLogin} isLoading={isAppleLoading} />
              </div>
            </>
          )}
          
          {/* Footer text */}
          <motion.p
            key={`footer-${mode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground/50 text-xs mt-8 font-body tracking-wide"
          >
            {getFooterText()}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
