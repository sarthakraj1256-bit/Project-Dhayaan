import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/backend/client';
import { toast } from 'sonner';
import { ArrowLeft, Camera, Loader2, Save, User as UserIcon, Trash2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logError } from '@/lib/logger';
import { clearTTSCache, clearAudioCache, getCacheSize, formatBytes, getLastCleanupStats, type CleanupStats } from '@/lib/audioCache';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
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
      toast.error('Failed to load profile');
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
      toast.error('Failed to update profile');
      logError('Profile update error', error);
    } else {
      toast.success('Profile updated successfully');
      setProfile(prev => prev ? { ...prev, display_name: displayName.trim() || null } : null);
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload avatar');
      logError('Avatar upload error', uploadError);
      setIsUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL (add timestamp to bust cache)
    const avatarUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrlWithTimestamp })
      .eq('user_id', user.id);

    if (updateError) {
      toast.error('Failed to update profile');
      logError('Avatar URL update error', updateError);
    } else {
      toast.success('Avatar updated successfully');
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrlWithTimestamp } : null);
    }

    setIsUploading(false);
  };

  const handleClearAudioCache = async () => {
    setIsClearingCache(true);
    try {
      await Promise.all([clearTTSCache(), clearAudioCache()]);
      toast.success('Audio cache cleared successfully');
      await fetchCacheSize(); // Refresh size after clearing
    } catch (error) {
      toast.error('Failed to clear audio cache');
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
      {/* Sacred Pattern Overlay */}
      <div className="fixed inset-0 sacred-pattern pointer-events-none opacity-20 z-0" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/30">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="font-display text-lg tracking-wider text-foreground">
          Profile
        </h1>
        <div className="w-9" />
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">

        {/* Profile Card */}
        <div
          className="rounded-xl p-4 sm:p-5 md:p-6 mb-6"
          style={{
            background: 'hsl(var(--void-light) / 0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid hsl(var(--gold) / 0.2)',
          }}
        >
          {/* Avatar Section */}
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

              {/* Upload Overlay */}
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
              Click to upload avatar
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm tracking-wider">
                Email
              </Label>
              <div className="px-4 py-3 rounded-lg bg-void/30 border border-gold/10 text-foreground/70">
                {user?.email}
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-muted-foreground text-sm tracking-wider">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
                className="bg-void/30 border-gold/20 focus:border-gold/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Save Button */}
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
              {isSaving ? 'Saving...' : 'Save Changes'}
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
                Storage Settings
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage cached audio data
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    Audio Cache
                  </p>
                  {cacheSize && (
                    <span className={`text-sm font-mono ${cacheSize.total > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {formatBytes(cacheSize.total)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  TTS voice audio and atmosphere sounds are cached locally for instant playback. 
                  Clearing this will require regenerating audio on next play.
                </p>
                
                {/* Detailed breakdown */}
                {cacheSize && cacheSize.total > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Guru Voice (TTS)</span>
                      <span className="text-xs font-mono text-foreground">{formatBytes(cacheSize.tts)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Atmosphere</span>
                      <span className="text-xs font-mono text-foreground">{formatBytes(cacheSize.atmosphere)}</span>
                    </div>
                  </div>
                )}
                
                {/* Last cleanup stats */}
                {cleanupStats && (
                  <div className="pt-3 mt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Last auto-cleanup</span>
                      <span className="text-foreground/70">
                        {formatDistanceToNow(new Date(cleanupStats.lastCleanupDate), { addSuffix: true })}
                      </span>
                    </div>
                    {cleanupStats.totalRemoved > 0 && (
                      <p className="text-xs text-emerald-400/80 mt-1">
                        Removed {cleanupStats.totalRemoved} expired {cleanupStats.totalRemoved === 1 ? 'entry' : 'entries'}
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
            {isClearingCache ? 'Clearing...' : 'Clear Audio Cache'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;