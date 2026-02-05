 import { motion } from 'framer-motion';
 import { Volume2, VolumeX, Layers, Loader2, Check, Cloud } from 'lucide-react';
 import { Slider } from '@/components/ui/slider';
 import { atmospheres, AtmosphereItem } from '@/data/soundLibrary';
 
 interface AudioControlsProps {
   isPlaying: boolean;
   currentFrequency: number | null;
   frequencyVolume: number;
   atmosphereVolume: number;
   currentAtmosphere: string;
   atmosphereLoading?: boolean;
   atmosphereCached?: boolean;
   atmosphereError?: string | null;
   onFrequencyVolumeChange: (volume: number) => void;
   onAtmosphereVolumeChange: (volume: number) => void;
   onAtmosphereChange: (atmosphereId: string) => void;
   onStop: () => void;
 }
 
 const AudioControls = ({
   isPlaying,
   currentFrequency,
   frequencyVolume,
   atmosphereVolume,
   currentAtmosphere,
   atmosphereLoading = false,
   atmosphereCached = false,
   atmosphereError = null,
   onFrequencyVolumeChange,
   onAtmosphereVolumeChange,
   onAtmosphereChange,
   onStop,
 }: AudioControlsProps) => {
   if (!isPlaying) return null;
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 100 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: 100 }}
       className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-2xl"
     >
       <div
         className="rounded-2xl p-6"
         style={{
           background: 'linear-gradient(135deg, hsl(var(--void-light) / 0.9), hsl(var(--void) / 0.95))',
           backdropFilter: 'blur(24px)',
           WebkitBackdropFilter: 'blur(24px)',
           border: '1px solid hsl(var(--gold) / 0.3)',
           boxShadow: '0 0 60px -20px hsl(var(--gold) / 0.3)',
         }}
       >
         {/* Now Playing */}
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className="relative">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                 <motion.div
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="w-3 h-3 rounded-full bg-primary"
                 />
               </div>
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase tracking-widest">Now Playing</p>
               <p className="font-display text-xl text-foreground tracking-wider">
                 {currentFrequency}Hz
               </p>
             </div>
           </div>
 
           <button
             onClick={onStop}
             className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
           >
             <span className="font-display text-sm tracking-wider text-foreground/80">Stop</span>
           </button>
         </div>
 
         {/* Volume Controls */}
         <div className="space-y-4">
           {/* Frequency Volume */}
           <div className="flex items-center gap-4">
             <Volume2 className="w-4 h-4 text-primary shrink-0" />
             <div className="flex-1">
               <p className="text-xs text-muted-foreground mb-2">Frequency Volume</p>
               <Slider
                 value={[frequencyVolume * 100]}
                 onValueChange={([v]) => onFrequencyVolumeChange(v / 100)}
                 max={100}
                 step={1}
                 className="w-full"
               />
             </div>
             <span className="text-xs text-muted-foreground w-8">{Math.round(frequencyVolume * 100)}%</span>
           </div>
 
           {/* Atmosphere Layer */}
           <div className="pt-3 border-t border-white/10">
             <div className="flex items-center gap-2 mb-3">
               <Layers className="w-4 h-4 text-primary" />
               <p className="text-xs text-muted-foreground uppercase tracking-widest">Atmosphere Layer</p>
             </div>
 
             {/* Atmosphere Selector */}
             <div className="flex flex-wrap gap-2 mb-3">
               {atmospheres.map((atm) => (
                 <button
                   key={atm.id}
                   onClick={() => !atmosphereLoading && onAtmosphereChange(atm.id)}
                   disabled={atmosphereLoading && currentAtmosphere !== atm.id}
                   className={`
                     px-3 py-1.5 rounded-full text-xs transition-all duration-300 flex items-center gap-1.5
                     ${currentAtmosphere === atm.id
                       ? 'bg-primary/20 border border-primary/50 text-primary'
                       : 'bg-white/5 border border-white/10 text-foreground/70 hover:bg-white/10'
                     }
                     ${atmosphereLoading && currentAtmosphere !== atm.id ? 'opacity-50 cursor-not-allowed' : ''}
                   `}
                 >
                   <span className="mr-1">{atm.icon}</span>
                   {atm.name}
                   {/* Loading indicator for the active atmosphere */}
                   {atmosphereLoading && currentAtmosphere === atm.id && (
                     <Loader2 className="w-3 h-3 animate-spin" />
                   )}
                   {/* Cached indicator */}
                   {!atmosphereLoading && atmosphereCached && currentAtmosphere === atm.id && (
                     <Check className="w-3 h-3" />
                   )}
                 </button>
               ))}
             </div>
 
             {/* Loading/Status Message */}
             {atmosphereLoading && currentAtmosphere !== 'none' && (
               <div className="flex items-center gap-2 mb-3 text-xs text-primary">
                 <Cloud className="w-4 h-4 animate-pulse" />
                 <span>Generating atmosphere sound... (first time only)</span>
               </div>
             )}
 
             {/* Error Message */}
             {atmosphereError && (
               <div className="mb-3 text-xs text-destructive">
                 {atmosphereError}
               </div>
             )}
 
             {/* Atmosphere Volume */}
             {currentAtmosphere !== 'none' && !atmosphereLoading && (
               <div className="flex items-center gap-4">
                 <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
                 <Slider
                   value={[atmosphereVolume * 100]}
                   onValueChange={([v]) => onAtmosphereVolumeChange(v / 100)}
                   max={100}
                   step={1}
                   className="flex-1"
                 />
                 <span className="text-xs text-muted-foreground w-8">{Math.round(atmosphereVolume * 100)}%</span>
               </div>
             )}
           </div>
         </div>
       </div>
     </motion.div>
   );
 };
 
 export default AudioControls;