import { useEffect } from 'react';
import { supabase } from '@/integrations/backend/client';
import { Language } from '@/i18n/translations';

const STORAGE_KEY = 'dhyaan-lang';

export function saveLanguagePreference(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang);
  
  // Async persist to Supabase if authenticated
  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      supabase
        .from('user_preferences')
        .upsert(
          { user_id: data.session.user.id, language_code: lang, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
        .then(() => {});
    }
  });
}

export function useLanguageSync(setLanguage: (lang: Language) => void) {
  useEffect(() => {
    // On auth state change, fetch persisted language
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('language_code')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (data?.language_code) {
          setLanguage(data.language_code as Language);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setLanguage]);
}
