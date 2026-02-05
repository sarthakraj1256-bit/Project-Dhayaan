 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 export interface Favorite {
   id: string;
   user_id: string;
   frequency_value: number;
   frequency_name: string;
   frequency_category: string;
   atmosphere_id: string;
   name: string | null;
   created_at: string;
 }
 
 export const useFavorites = () => {
   const [favorites, setFavorites] = useState<Favorite[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
 
   // Check auth state
   useEffect(() => {
     const checkAuth = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       setIsAuthenticated(!!session);
     };
     checkAuth();
 
     const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
       setIsAuthenticated(!!session);
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   // Fetch favorites when authenticated
   useEffect(() => {
     if (isAuthenticated) {
       fetchFavorites();
     } else {
       setFavorites([]);
     }
   }, [isAuthenticated]);
 
   const fetchFavorites = useCallback(async () => {
     setIsLoading(true);
     try {
       const { data, error } = await supabase
         .from('session_favorites')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       setFavorites(data || []);
     } catch (error) {
       console.error('Error fetching favorites:', error);
     } finally {
       setIsLoading(false);
     }
   }, []);
 
   const addFavorite = useCallback(async (
     frequencyValue: number,
     frequencyName: string,
     frequencyCategory: string,
     atmosphereId: string,
     customName?: string
   ) => {
     if (!isAuthenticated) {
       toast.error('Please sign in to save favorites');
       return false;
     }
 
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('Not authenticated');
 
       const { error } = await supabase
         .from('session_favorites')
         .insert({
           user_id: user.id,
           frequency_value: frequencyValue,
           frequency_name: frequencyName,
           frequency_category: frequencyCategory,
           atmosphere_id: atmosphereId,
           name: customName || null,
         });
 
       if (error) throw error;
 
       toast.success('Saved to favorites!');
       await fetchFavorites();
       return true;
     } catch (error) {
       console.error('Error adding favorite:', error);
       toast.error('Failed to save favorite');
       return false;
     }
   }, [isAuthenticated, fetchFavorites]);
 
   const removeFavorite = useCallback(async (id: string) => {
     try {
       const { error } = await supabase
         .from('session_favorites')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
 
       toast.success('Removed from favorites');
       setFavorites((prev) => prev.filter((f) => f.id !== id));
       return true;
     } catch (error) {
       console.error('Error removing favorite:', error);
       toast.error('Failed to remove favorite');
       return false;
     }
   }, []);
 
   const isFavorited = useCallback((frequencyValue: number, atmosphereId: string) => {
     return favorites.some(
       (f) => f.frequency_value === frequencyValue && f.atmosphere_id === atmosphereId
     );
   }, [favorites]);
 
   return {
     favorites,
     isLoading,
     isAuthenticated,
     addFavorite,
     removeFavorite,
     isFavorited,
     refetch: fetchFavorites,
   };
 };