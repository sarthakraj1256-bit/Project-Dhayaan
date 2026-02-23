import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/backend/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();

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
        title: t('dashboard.signedOut'),
        description: t('dashboard.signedOutDesc'),
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: t('dashboard.signOutFailed'),
        description: t('dashboard.signOutFailedDesc'),
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
          <p className="text-muted-foreground font-body">{t('dashboard.loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-display text-sm">ॐ</span>
            </div>
            <h1 className="font-display text-lg text-gold-gradient tracking-wider">
              {t('page.dashboard')}
            </h1>
          </div>

          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
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
              {t('dashboard.welcome')}
            </h2>
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              {t('dashboard.welcomeDesc')}
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
                {t('dashboard.yourProfile')}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
                  <Mail className="w-5 h-5 text-primary/70" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                      {t('profile.email')}
                    </p>
                    <p className="text-foreground font-body">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
                  <UserIcon className="w-5 h-5 text-primary/70" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                      {t('dashboard.userId')}
                    </p>
                    <p className="text-foreground font-mono text-sm">{user.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
                  <Calendar className="w-5 h-5 text-primary/70" />
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase mb-1">
                      {t('dashboard.memberSince')}
                    </p>
                    <p className="text-foreground font-body">
                      {new Date(user.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
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

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/5"
            >
              {t('dashboard.returnHome')}
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
