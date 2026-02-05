 import { AnimatePresence, motion } from 'framer-motion';
 import { Link } from 'react-router-dom';
 import { ArrowLeft, Radio } from 'lucide-react';
 import { categories, getFrequenciesByCategory } from '@/data/soundLibrary';
 import { useFrequencyAudio } from '@/hooks/useFrequencyAudio';
 import { useSessionTimer } from '@/hooks/useSessionTimer';
 import CategorySection from '@/components/sonic-lab/CategorySection';
 import AudioControls from '@/components/sonic-lab/AudioControls';
 import WaveformVisualizer from '@/components/sonic-lab/WaveformVisualizer';
 
 const SonicLab = () => {
   const {
     audioState,
     playFrequency,
     stopFrequency,
     setFrequencyVolume,
     setAtmosphere,
     setAtmosphereVolume,
     getFrequencyData,
   } = useFrequencyAudio();
 
   const { formattedTime } = useSessionTimer(audioState.isPlaying);
 
   return (
     <div className="min-h-screen bg-void relative overflow-hidden">
       {/* Background Elements */}
       <div className="fixed inset-0 z-0">
         {/* Gradient overlay */}
         <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light/20 to-void" />
         
         {/* Grid pattern */}
         <div 
           className="absolute inset-0 opacity-[0.03]"
           style={{
             backgroundImage: `
               linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
               linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px',
           }}
         />
 
         {/* Radial glow */}
         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
       </div>
 
       {/* Content */}
       <div className="relative z-10">
         {/* Header */}
         <header className="sticky top-0 z-40 px-6 py-4 bg-void/80 backdrop-blur-xl border-b border-white/5">
           <div className="max-w-7xl mx-auto flex items-center justify-between">
             <Link
               to="/"
               className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
             >
               <ArrowLeft className="w-4 h-4" />
               <span className="text-sm tracking-wider">Back</span>
             </Link>
 
             <div className="flex items-center gap-3">
               <Radio className="w-5 h-5 text-primary" />
               <h1 className="font-display text-xl tracking-[0.2em] text-gold-gradient">
                 THE SONIC LAB
               </h1>
             </div>
 
             <div className="w-16" /> {/* Spacer for centering */}
           </div>
         </header>
 
         {/* Hero Section */}
         <section className="px-6 py-16 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="max-w-3xl mx-auto"
           >
             <h2 className="font-display text-4xl md:text-5xl tracking-wider text-foreground mb-4">
               <span className="text-gold-gradient">Frequency</span> Pharmacy
             </h2>
             <p className="text-muted-foreground font-body text-lg leading-relaxed">
               Select sound frequencies based on what you want to feel, heal, or achieve.
               Each frequency is a purposeful tool for your wellbeing.
             </p>
           </motion.div>
 
           {/* Waveform Visualizer */}
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.3 }}
             className="max-w-4xl mx-auto mt-8"
           >
             <WaveformVisualizer
               isPlaying={audioState.isPlaying}
               frequency={audioState.currentFrequency}
               getFrequencyData={getFrequencyData}
             />
           </motion.div>
         </section>
 
         {/* Frequency Categories */}
         <main className="px-6 pb-32 max-w-7xl mx-auto">
           {categories.map((category) => (
             <CategorySection
               key={category.id}
               category={category}
               frequencies={getFrequenciesByCategory(category.id)}
               activeFrequency={audioState.currentFrequency}
               onPlayFrequency={playFrequency}
               onStopFrequency={stopFrequency}
             />
           ))}
         </main>
 
         {/* Fixed Audio Controls */}
         <AnimatePresence>
           <AudioControls
             isPlaying={audioState.isPlaying}
             currentFrequency={audioState.currentFrequency}
             frequencyVolume={audioState.frequencyVolume}
             atmosphereVolume={audioState.atmosphereVolume}
             currentAtmosphere={audioState.currentAtmosphere}
             atmosphereLoading={audioState.atmosphereLoading}
             atmosphereCached={audioState.atmosphereCached}
             atmosphereError={audioState.atmosphereError}
             sessionTime={formattedTime}
             onFrequencyVolumeChange={setFrequencyVolume}
             onAtmosphereVolumeChange={setAtmosphereVolume}
             onAtmosphereChange={setAtmosphere}
             onStop={stopFrequency}
           />
         </AnimatePresence>
       </div>
 
       {/* Footer */}
       <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center">
         <p className="text-xs text-muted-foreground/50">
           "नाद ब्रह्म" — Sound is the Divine
         </p>
       </footer>
     </div>
   );
 };
 
 export default SonicLab;