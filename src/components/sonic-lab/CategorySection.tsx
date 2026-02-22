 import { useRef } from 'react';
 import { motion } from 'framer-motion';
 import { ChevronLeft, ChevronRight } from 'lucide-react';
 import { CategoryInfo, FrequencyItem } from '@/data/soundLibrary';
 import FrequencyCard from './FrequencyCard';
 
 interface CategorySectionProps {
   category: CategoryInfo;
   frequencies: FrequencyItem[];
   activeFrequency: number | null;
   onPlayFrequency: (freq: number, name?: string, category?: string) => void;
   onStopFrequency: () => void;
 }
 
 const CategorySection = ({
   category,
   frequencies,
   activeFrequency,
   onPlayFrequency,
   onStopFrequency,
 }: CategorySectionProps) => {
   const scrollRef = useRef<HTMLDivElement>(null);
 
   const scroll = (direction: 'left' | 'right') => {
     if (scrollRef.current) {
       const scrollAmount = 240;
       scrollRef.current.scrollBy({
         left: direction === 'left' ? -scrollAmount : scrollAmount,
         behavior: 'smooth',
       });
     }
   };
 
   return (
     <motion.section
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: '-50px' }}
       transition={{ duration: 0.6 }}
       className="mb-12"
     >
       {/* Category Header */}
       <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-4">
           <span className="text-3xl">{category.icon}</span>
           <div>
             <h3 className="font-display text-xl tracking-wider text-foreground">
               {category.name}
             </h3>
             <p className="text-sm text-muted-foreground">{category.description}</p>
           </div>
         </div>
 
         {/* Scroll Controls */}
         <div className="hidden sm:flex items-center gap-2">
           <button
             onClick={() => scroll('left')}
              className="p-2 rounded-full bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-foreground/70" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-foreground/5 border border-border/50 hover:bg-foreground/10 transition-colors"
           >
             <ChevronRight className="w-4 h-4 text-foreground/70" />
           </button>
         </div>
       </div>
 
       {/* Horizontal Scrollable Grid */}
       <div
         ref={scrollRef}
         className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-foreground/10"
         style={{
           scrollbarWidth: 'thin',
           msOverflowStyle: 'none',
         }}
       >
         {frequencies.map((freq, index) => (
           <FrequencyCard
             key={`${freq.freq}-${index}`}
             frequency={freq}
             isActive={activeFrequency === freq.value}
             categoryColor={category.color}
             onPlay={() => onPlayFrequency(freq.value, freq.name, category.id)}
             onStop={onStopFrequency}
           />
         ))}
       </div>
     </motion.section>
   );
 };
 
 export default CategorySection;