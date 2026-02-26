import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/backend/client';
import { toast } from 'sonner';
import { ArrowLeft, Camera, Loader2, Save, User as UserIcon, Trash2, Database, HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logError } from '@/lib/logger';
import { clearTTSCache, clearAudioCache, getCacheSize, formatBytes, getLastCleanupStats, type CleanupStats } from '@/lib/audioCache';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheSize, setCacheSize] = useState<{ tts: number; atmosphere: number; total: number } | null>(null);
  const [cleanupStats, setCleanupStats] = useState<CleanupStats | null>(null);

  const fetchCacheSize = async () => {
    const size = await getCacheSize();
    setCacheSize(size);
  };

  const fetchCleanupStats = () => {
    const stats = getLastCleanupStats();
    setCleanupStats(stats);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      await fetchProfile(session.user.id);
      await fetchCacheSize();
      fetchCleanupStats();
    };
    checkAuth();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      toast.error(t('profile.failedLoad'));
      logError('Profile load error', error);
    } else if (data) {
      setProfile(data);
      setDisplayName(data.display_name || '');
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() || null })
      .eq('user_id', user.id);

    if (error) {
      toast.error(t('profile.failedUpdate'));
      logError('Profile update error', error);
    } else {
      toast.success(t('profile.updateSuccess'));
      setProfile(prev => prev ? { ...prev, display_name: displayName.trim() || null } : null);
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.uploadImage'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge'));
      return;
    }

    setIsUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error(t('profile.failedUpload'));
      logError('Avatar upload error', uploadError);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrlWithTimestamp })
      .eq('user_id', user.id);

    if (updateError) {
      toast.error(t('profile.failedUpdate'));
      logError('Avatar URL update error', updateError);
    } else {
      toast.success(t('profile.avatarUpdated'));
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrlWithTimestamp } : null);
    }

    setIsUploading(false);
  };

  const handleClearAudioCache = async () => {
    setIsClearingCache(true);
    try {
      await Promise.all([clearTTSCache(), clearAudioCache()]);
      toast.success(t('profile.cacheCleared'));
      await fetchCacheSize();
    } catch (error) {
      toast.error(t('profile.failedClearCache'));
      logError('Cache clear error', error);
    }
    setIsClearingCache(false);
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.slice(0, 2).toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || '??';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 sacred-pattern pointer-events-none opacity-20 z-0" />

      <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/30">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="font-display text-lg tracking-wider text-foreground">
          {t('page.profile')}
        </h1>
        <div className="w-9" />
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        <div
          className="rounded-xl p-4 sm:p-5 md:p-6 mb-6"
          style={{
            background: 'hsl(var(--void-light) / 0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid hsl(var(--gold) / 0.2)',
          }}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-2 border-gold/30">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback
                  className="text-xl font-display tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--gold) / 0.3), hsl(var(--gold) / 0.1))',
                    color: 'hsl(var(--gold))',
                  }}
                >
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-void/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gold" />
                ) : (
                  <Camera className="w-6 h-6 text-gold" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              {t('profile.clickUpload')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm tracking-wider">
                {t('profile.email')}
              </Label>
              <div className="px-4 py-3 rounded-lg bg-void/30 border border-gold/10 text-foreground/70">
                {user?.email}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-muted-foreground text-sm tracking-wider">
                {t('profile.displayName')}
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('profile.enterName')}
                maxLength={50}
                className="bg-void/30 border-gold/20 focus:border-gold/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full mt-6"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--gold) / 0.8), hsl(var(--gold) / 0.6))',
                color: 'hsl(var(--void))',
              }}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? t('profile.saving') : t('profile.saveChanges')}
            </Button>
          </div>
        </div>

        {/* Storage Settings Card */}
        <div
          className="rounded-xl p-4 sm:p-5 md:p-6"
          style={{
            background: 'hsl(var(--void-light) / 0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid hsl(var(--gold) / 0.2)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg tracking-wider text-foreground">
                {t('profile.storageSettings')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('profile.manageCached')}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-foreground/5 border border-border/50 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    {t('profile.audioCache')}
                  </p>
                  {cacheSize && (
                    <span className={`text-sm font-mono ${cacheSize.total > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {formatBytes(cacheSize.total)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('profile.cacheDesc')}
                </p>
                
                {cacheSize && cacheSize.total > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t('profile.ttsVoice')}</span>
                      <span className="text-xs font-mono text-foreground">{formatBytes(cacheSize.tts)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t('profile.atmosphere')}</span>
                      <span className="text-xs font-mono text-foreground">{formatBytes(cacheSize.atmosphere)}</span>
                    </div>
                  </div>
                )}
                
                {cleanupStats && (
                  <div className="pt-3 mt-3 border-t border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t('profile.lastAutoCleanup')}</span>
                      <span className="text-foreground/70">
                        {formatDistanceToNow(new Date(cleanupStats.lastCleanupDate), { addSuffix: true })}
                      </span>
                    </div>
                    {cleanupStats.totalRemoved > 0 && (
                      <p className="text-xs text-emerald-400/80 mt-1">
                        {t('profile.removedEntries').replace('{count}', String(cleanupStats.totalRemoved)).replace('{unit}', cleanupStats.totalRemoved === 1 ? t('profile.entry') : t('profile.entries'))}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleClearAudioCache}
            disabled={isClearingCache}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            {isClearingCache ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {isClearingCache ? t('profile.clearing') : t('profile.clearCache')}
          </Button>
        </div>

        {/* Help & Guide Link */}
        <button
          onClick={() => navigate('/help')}
          className="w-full rounded-xl p-4 flex items-center gap-3 border border-border/50 bg-card hover:bg-muted transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Help & Guide</p>
            <p className="text-xs text-muted-foreground">Sadhana guide, FAQs & support</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Profile;
