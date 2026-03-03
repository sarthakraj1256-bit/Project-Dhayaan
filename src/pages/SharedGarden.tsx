import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Flower2, Sparkles, TreeDeciduous, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SharedGardenData {
  id: string;
  screenshot_url: string;
  plant_count: number | null;
  flourishing_count: number | null;
  garden_level: number | null;
  total_karma_earned: number | null;
  created_at: string;
  is_anonymous: boolean;
}

const SharedGarden = () => {
  const { id } = useParams<{ id: string }>();
  const [garden, setGarden] = useState<SharedGardenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGarden = async () => {
      if (!id) {
        setError('Garden not found');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .rpc('get_shared_garden', { garden_id: id })
        .maybeSingle();

      if (fetchError || !data) {
        setError('Garden not found');
      } else {
        setGarden(data);
      }
      setLoading(false);
    };

    fetchGarden();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
        />
      </div>
    );
  }

  if (error || !garden) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            🌱
          </motion.div>
          <h1 className="font-display text-2xl text-foreground mb-2">Garden Not Found</h1>
          <p className="text-muted-foreground mb-6">This garden may have been removed or the link is invalid.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            to="/"
            className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-foreground flex items-center gap-2">
              <Flower2 className="w-6 h-6 text-emerald-400" />
              Inner Calm Garden
            </h1>
            <p className="text-sm text-muted-foreground">Shared on Dhyaan</p>
          </div>
        </motion.div>

        {/* Garden Screenshot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden border border-border mb-6"
        >
          <img
            src={garden.screenshot_url}
            alt="Shared garden"
            className="w-full"
          />
        </motion.div>

        {/* Stats */}
        {garden.is_anonymous ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 rounded-xl bg-muted/50 border border-border text-center"
          >
            <p className="text-muted-foreground text-sm">
              🔒 This gardener chose to share anonymously
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-4 gap-3 mb-8"
          >
            <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
              <TreeDeciduous className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xl font-display text-foreground">{garden.plant_count}</p>
              <p className="text-xs text-muted-foreground">Plants</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
              <Flower2 className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-xl font-display text-foreground">{garden.flourishing_count}</p>
              <p className="text-xs text-muted-foreground">Flourishing</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
              <Heart className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <p className="text-xl font-display text-foreground">Lv.{garden.garden_level}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xl font-display text-foreground">{garden.total_karma_earned}</p>
              <p className="text-xs text-muted-foreground">Karma</p>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-4">
            Grow your own peaceful digital garden through meditation
          </p>
          <Link
            to="/lakshya"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 text-emerald-400 transition-all"
          >
            <Flower2 className="w-5 h-5" />
            Start Your Garden
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Created with 🧘 on{' '}
            <Link to="/" className="text-amber-400 hover:underline">
              Dhyaan
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedGarden;
