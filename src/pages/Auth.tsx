import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";
import SriYantraBackground from "@/components/auth/SriYantraBackground";
import FloatingInput from "@/components/auth/FloatingInput";
import SanctumButton from "@/components/auth/SanctumButton";
import GoogleButton from "@/components/auth/GoogleButton";

// Validation schemas
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(1);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          navigate("/");
        }
      });

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          navigate("/");
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error("Auth initialization error:", error);
    }
  }, [navigate]);

  // Handle password typing for background animation
  const handlePasswordTyping = (isTyping: boolean) => {
    setSpinSpeed(isTyping ? 3 : 1);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password and try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please login instead.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Signup failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to verify your account.",
          });
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
        redirect_uri: `${window.location.origin}/`,
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

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Sri Yantra Background */}
      <SriYantraBackground spinSpeed={spinSpeed} />
      
      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-2"
          >
            <span 
              className="font-display text-4xl md:text-5xl tracking-[0.3em] text-gold-gradient"
              style={{
                textShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 0 80px hsl(var(--gold) / 0.3)',
              }}
            >
              DHYAAN
            </span>
          </motion.h1>
          
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-muted-foreground font-body text-sm tracking-widest mb-8"
          >
            RESONATE WITH THE COSMOS
          </motion.p>
          
          {/* Login/Signup Toggle */}
          <div className="flex justify-center gap-8 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`font-body text-sm tracking-wider transition-all duration-300 pb-1 ${
                isLogin 
                  ? 'text-gold border-b border-gold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ENTER
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`font-body text-sm tracking-wider transition-all duration-300 pb-1 ${
                !isLogin 
                  ? 'text-gold border-b border-gold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              JOIN
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
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
                
                <div>
                  <FloatingInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    onTyping={handlePasswordTyping}
                    autoComplete={isLogin ? "current-password" : "new-password"}
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
              </motion.div>
            </AnimatePresence>
            
            {/* Submit Button */}
            <div className="pt-4">
              <SanctumButton type="submit" isLoading={isLoading}>
                {isLogin ? "ENTER SANCTUM" : "BEGIN JOURNEY"}
              </SanctumButton>
            </div>
          </form>
          
          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <span className="text-muted-foreground text-xs tracking-widest font-body">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          </div>
          
          {/* Social Login */}
          <div className="flex justify-center">
            <GoogleButton onClick={handleGoogleLogin} isLoading={isGoogleLoading} />
          </div>
          
          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground/50 text-xs mt-8 font-body tracking-wide"
          >
            {isLogin 
              ? "Return to inner peace" 
              : "Begin your spiritual awakening"
            }
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
