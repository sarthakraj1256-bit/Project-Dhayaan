import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/backend/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground font-body">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-display text-lg">ॐ</span>
            </div>
            <div>
              <h1 className="font-display text-xl text-gold-gradient tracking-wider">
                DHYAAN
              </h1>
              <p className="text-xs text-muted-foreground tracking-widest">DASHBOARD</p>
            </div>
          </motion.div>

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          {/* Welcome Section */}
          <div className="glass-card p-8 mb-8">
            <h2 className="font-display text-3xl text-foreground mb-4 tracking-wider">
              Welcome to Your Sacred Space
            </h2>
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              You have successfully accessed the protected dashboard. This demonstrates
              that the ProtectedRoute wrapper is functioning correctly.
            </p>
          </div>

          {/* User Info Card */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 mb-8"
            >
              <h3 className="font-display text-xl text-foreground mb-6 tracking-wider flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Your Profile
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
                  <Mail className="w-5 h-5 text-primary/70" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                      Email
                    </p>
                    <p className="text-foreground font-body">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
                  <UserIcon className="w-5 h-5 text-primary/70" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                      User ID
                    </p>
                    <p className="text-foreground font-mono text-sm">{user.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
                  <Calendar className="w-5 h-5 text-primary/70" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                      Member Since
                    </p>
                    <p className="text-foreground font-body">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8"
          >
            <h3 className="font-display text-xl text-foreground mb-4 tracking-wider">
              Protected Route Test
            </h3>
            <div className="space-y-4 font-body text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Authentication is working correctly
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                ProtectedRoute wrapper is functioning
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                User session is active
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Redirects to /auth when unauthenticated
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/5"
            >
              Return to Home
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Test Sign Out & Redirect
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
