import { motion, AnimatePresence } from 'framer-motion';
 import { Heart, X, Play, Trash2, Star } from 'lucide-react';
 import { Favorite } from '@/hooks/useFavorites';
 import { atmospheres, categories } from '@/data/soundLibrary';
 
 interface FavoritesPanelProps {
   isOpen: boolean;
   favorites: Favorite[];
   isLoading: boolean;
   isAuthenticated: boolean;
   onClose: () => void;
   onPlayFavorite: (favorite: Favorite) => void;
   onRemoveFavorite: (id: string) => void;
 }
 
const FavoritesPanel = ({
  isOpen,
  favorites,
  isLoading,
  isAuthenticated,
  onClose,
  onPlayFavorite,
  onRemoveFavorite,
}: FavoritesPanelProps) => {
   const getAtmosphereName = (id: string) => {
     return atmospheres.find((a) => a.id === id)?.name || 'None';
   };
 
   const getAtmosphereIcon = (id: string) => {
     return atmospheres.find((a) => a.id === id)?.icon || '🔇';
   };
 
   const getCategoryColor = (categoryId: string) => {
     const category = categories.find((c) => c.id === categoryId);
     const colorMap: Record<string, string> = {
       cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
       emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
       amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
       blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
       violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
       indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30',
     };
     return colorMap[category?.color || 'amber'] || colorMap.amber;
   };
 
   return (
    <AnimatePresence mode="wait">
       {isOpen && (
        <div>
           {/* Backdrop */}
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
             onClick={onClose}
           />
 
           {/* Panel */}
           <motion.div
             initial={{ opacity: 0, x: 300 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 300 }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-void border-l border-white/10 z-50 overflow-hidden flex flex-col"
           >
             {/* Header */}
             <div className="p-6 border-b border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                   <Star className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                   <h2 className="font-display text-xl tracking-wider text-foreground">Favorites</h2>
                   <p className="text-xs text-muted-foreground">Your saved combinations</p>
                 </div>
               </div>
               <button
                 onClick={onClose}
                 className="p-2 rounded-full hover:bg-white/10 transition-colors"
               >
                 <X className="w-5 h-5 text-muted-foreground" />
               </button>
             </div>
 
             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6">
               {!isAuthenticated ? (
                 <div className="text-center py-12">
                   <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                   <p className="text-muted-foreground mb-2">Sign in to save favorites</p>
                   <p className="text-xs text-muted-foreground/70">
                     Your favorite frequency combinations will be saved here
                   </p>
                 </div>
               ) : isLoading ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
                   ))}
                 </div>
               ) : favorites.length === 0 ? (
                 <div className="text-center py-12">
                   <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                   <p className="text-muted-foreground mb-2">No favorites yet</p>
                   <p className="text-xs text-muted-foreground/70">
                     Click the heart icon while playing to save a combination
                   </p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {favorites.map((favorite) => (
                     <motion.div
                       key={favorite.id}
                       layout
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -20 }}
                       className={`
                         relative p-4 rounded-xl border bg-gradient-to-br
                         ${getCategoryColor(favorite.frequency_category)}
                         group
                       `}
                     >
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <p className="font-display text-lg text-foreground tracking-wider">
                             {favorite.frequency_value}Hz
                           </p>
                           <p className="text-sm text-foreground/80">{favorite.frequency_name}</p>
                           <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                             <span>{getAtmosphereIcon(favorite.atmosphere_id)}</span>
                             <span>{getAtmosphereName(favorite.atmosphere_id)}</span>
                           </div>
                           {favorite.name && (
                             <p className="mt-2 text-xs text-primary/80 italic">"{favorite.name}"</p>
                           )}
                         </div>
 
                         <div className="flex items-center gap-2">
                           <button
                             onClick={() => onPlayFavorite(favorite)}
                             className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                           >
                             <Play className="w-4 h-4" />
                           </button>
                           <button
                             onClick={() => onRemoveFavorite(favorite.id)}
                             className="p-2 rounded-full bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                     </motion.div>
                   ))}
                 </div>
               )}
             </div>
           </motion.div>
        </div>
       )}
     </AnimatePresence>
   );
};
 
export default FavoritesPanel;