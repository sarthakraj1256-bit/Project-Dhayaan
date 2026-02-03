import { useState, useEffect } from 'react';
import { TrendingDown, Users, Target, Brain, Moon, Sparkles, BarChart3 } from 'lucide-react';

interface StressStats {
  totalSubmissions: number;
  averageReduction: number;
  byIntentTag: {
    tag: string;
    count: number;
    avgReduction: number;
  }[];
}

const intentTagConfig: Record<string, { icon: typeof Brain; label: string; color: string }> = {
  anxiety: { icon: Brain, label: 'Anxiety Relief', color: 'from-blue-500/20 to-blue-600/10' },
  focus: { icon: Target, label: 'Focus', color: 'from-amber-500/20 to-amber-600/10' },
  sleep: { icon: Moon, label: 'Sleep', color: 'from-indigo-500/20 to-indigo-600/10' },
  spiritual: { icon: Sparkles, label: 'Spiritual Growth', color: 'from-purple-500/20 to-purple-600/10' },
};

export default function StressStatsDashboard() {
  const [stats, setStats] = useState<StressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Use the secure RPC function to get aggregated statistics only
      const { data, error: fetchError } = await supabase
        .rpc('get_stress_statistics');

      if (fetchError) {
        throw fetchError;
      }

      if (!data || data.length === 0 || data[0].total_participants === 0) {
        setStats({
          totalSubmissions: 0,
          averageReduction: 0,
          byIntentTag: [],
        });
        setLoading(false);
        return;
      }

      const statsRow = data[0];
      
      // Parse intent breakdown from the aggregated data
      const intentBreakdown = statsRow.intent_breakdown || [];
      const byIntentTag = Array.isArray(intentBreakdown) 
        ? intentBreakdown.map((item: { intent_tag: string; count: number; avg_reduction: number }) => ({
            tag: item.intent_tag,
            count: Number(item.count),
            avgReduction: Math.round(Number(item.avg_reduction) || 0),
          }))
          .sort((a: { avgReduction: number }, b: { avgReduction: number }) => b.avgReduction - a.avgReduction)
        : [];

      setStats({
        totalSubmissions: Number(statsRow.total_participants) || 0,
        averageReduction: Math.round(Number(statsRow.average_stress_reduction) || 0),
        byIntentTag,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Unable to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20" />
              <div className="h-4 w-48 bg-primary/20 rounded" />
              <div className="h-3 w-32 bg-primary/10 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !stats) {
    return null; // Silently fail - don't show anything if stats unavailable
  }

  // Don't show dashboard if no data yet
  if (stats.totalSubmissions === 0) {
    return (
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-gold-gradient tracking-wider mb-4">
              Scientific Stress Analysis
            </h2>
            <p className="font-body text-muted-foreground">
              Real-time stress reduction metrics from temple experience participants
            </p>
          </div>
          
          <div className="glass-card p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-primary/40 mb-4" />
            <p className="text-muted-foreground font-body">
              No stress metrics recorded yet. Be the first to share your experience!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="statistics" className="relative z-10 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-gold-gradient tracking-wider mb-4">
            Scientific Stress Analysis
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Real-time stress reduction metrics from temple experience participants, 
            demonstrating the measurable impact of sacred architecture on mental wellbeing.
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Average Reduction Card */}
          <div className="glass-card p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingDown className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-display">
                  Average Stress Reduction
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-gold-gradient gold-glow">
                  {stats.averageReduction}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-body">
                Measured from entry to post-experience
              </p>
            </div>
          </div>

          {/* Total Participants Card */}
          <div className="glass-card p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-display">
                  Total Participants
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-gold-gradient gold-glow">
                  {stats.totalSubmissions}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-body">
                Stress assessments completed
              </p>
            </div>
          </div>
        </div>

        {/* Intent Tag Breakdown */}
        {stats.byIntentTag.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-display text-xl tracking-wider mb-6 text-center">
              Reduction by Intent
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.byIntentTag.map((item) => {
                const config = intentTagConfig[item.tag] || { 
                  icon: Brain, 
                  label: item.tag, 
                  color: 'from-gray-500/20 to-gray-600/10' 
                };
                const Icon = config.icon;
                
                return (
                  <div
                    key={item.tag}
                    className={`relative p-4 rounded-xl border border-border/30 bg-gradient-to-br ${config.color} hover:border-primary/30 transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary/80" />
                        <div>
                          <p className="font-display text-sm tracking-wider text-foreground">
                            {config.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.count} {item.count === 1 ? 'participant' : 'participants'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-2xl text-gold-gradient">
                          {item.avgReduction}%
                        </span>
                        <p className="text-xs text-muted-foreground">avg reduction</p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-background/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(item.avgReduction, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Methodology Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/60 font-body max-w-lg mx-auto">
            Stress levels measured on a 1-10 scale before and after the temple experience. 
            Reduction percentage calculated as ((initial - final) / initial) × 100.
          </p>
        </div>
      </div>
    </section>
  );
}
