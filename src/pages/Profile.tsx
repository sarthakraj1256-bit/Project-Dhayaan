import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/backend/client';
import { toast } from 'sonner';
import { ArrowLeft, Camera, Loader2, Save, Pencil, Trash2, Database, HelpCircle, ChevronRight, Sun, Moon, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { logError } from '@/lib/logger';
import { clearTTSCache, clearAudioCache, getCacheSize, formatBytes, getLastCleanupStats, type CleanupStats } from '@/lib/audioCache';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
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
      setPhoneNumber(data.phone_number || '');
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
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleSavePhone = async () => {
    if (!user) return;
    const cleaned = phoneNumber.replace(/[^\d+\-\s()]/g, '').trim();
    if (cleaned && (cleaned.length < 7 || cleaned.length > 20)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ phone_number: cleaned || null })
      .eq('user_id', user.id);

    if (error) {
      toast.error(t('profile.failedUpdate'));
      logError('Phone update error', error);
    } else {
      toast.success(t('profile.updateSuccess'));
      setProfile(prev => prev ? { ...prev, phone_number: cleaned || null } : null);
      setIsEditingPhone(false);
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'heic', 'heif', 'avif'];
    const isImageByMime = file.type.startsWith('image/');
    const isImageByExtension = Boolean(fileExt && allowedImageExtensions.includes(fileExt));

    if (!isImageByMime && !isImageByExtension) {
      toast.error(t('profile.uploadImage'));
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge'));
      input.value = '';
      return;
    }

    setIsUploading(true);

    const safeExt = fileExt || 'jpg';
    const filePath = `${user.id}/avatar.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error(t('profile.failedUpload'));
      logError('Avatar upload error', uploadError);
      setIsUploading(false);
      input.value = '';
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
    input.value = '';
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
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/30">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="font-display text-lg tracking-wider text-foreground">
          {t('page.profile')}
        </h1>
        <div className="w-9" />
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Profile Card */}
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <button
              type="button"
              className="relative group cursor-pointer mb-4"
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Avatar className="w-24 h-24 border-2 border-border">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xl font-display tracking-wider bg-muted text-muted-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-card shadow-sm">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                ) : (
                  <Camera className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            {/* Name */}
            {isEditing ? (
              <div className="flex items-center gap-2 mb-1">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('profile.enterName')}
                  maxLength={50}
                  className="text-center text-lg font-semibold bg-transparent border-border h-9 w-48"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-9">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 mb-1 group"
              >
                <h2 className="text-xl font-semibold text-foreground">
                  {profile?.display_name || t('profile.enterName')}
                </h2>
                <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {/* Email */}
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Contact Number Card */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Contact No</p>
                {isEditingPhone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      maxLength={20}
                      type="tel"
                      className="h-8 w-44 text-sm bg-transparent border-border"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSavePhone()}
                    />
                    <Button size="sm" onClick={handleSavePhone} disabled={isSaving} className="h-8 px-2">
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.phone_number || 'Not added'}
                  </p>
                )}
              </div>
            </div>
            {!isEditingPhone && (
              <button
                onClick={() => setIsEditingPhone(true)}
                className="text-primary text-sm font-medium hover:underline"
              >
                {profile?.phone_number ? 'Edit' : 'Add'}
              </button>
            )}
          </div>
        </div>

        {/* Appearance Card */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Appearance</h3>
              <p className="text-sm text-muted-foreground">Switch between dark & light mode</p>
            </div>
            <div className="flex items-center gap-2">
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-primary" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>
        </div>

        {/* Storage Settings Card */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {t('profile.storageSettings')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('profile.manageCached')}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border/50 mb-4">
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
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                    {t('profile.removedEntries').replace('{count}', String(cleanupStats.totalRemoved)).replace('{unit}', cleanupStats.totalRemoved === 1 ? t('profile.entry') : t('profile.entries'))}
                  </p>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleClearAudioCache}
            disabled={isClearingCache}
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
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
          className="w-full rounded-xl p-4 flex items-center gap-3 border border-border bg-card hover:bg-muted transition-colors"
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
