 import { motion } from 'framer-motion';
 import { Check } from 'lucide-react';
 
 interface Step {
   id: string;
   label: string;
   icon: React.ReactNode;
 }
 
 interface LearningStepProps {
   steps: Step[];
   currentStep: number;
   onStepClick?: (index: number) => void;
 }
 
 const LearningStep = ({ steps, currentStep, onStepClick }: LearningStepProps) => {
   return (
     <div className="flex items-center justify-center gap-2 flex-wrap">
       {steps.map((step, index) => {
         const isCompleted = index < currentStep;
         const isCurrent = index === currentStep;
         const isClickable = onStepClick && index <= currentStep;
 
         return (
           <button
             key={step.id}
             onClick={() => isClickable && onStepClick?.(index)}
             disabled={!isClickable}
             className={`
               flex items-center gap-2 px-3 py-2 rounded-full transition-all text-sm
               ${isCurrent 
                 ? 'bg-primary/20 border border-primary/50 text-primary' 
                 : isCompleted
                   ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                   : 'bg-white/5 border border-white/10 text-muted-foreground'
               }
               ${isClickable ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}
             `}
           >
             <span className={`
               w-5 h-5 rounded-full flex items-center justify-center text-xs
               ${isCompleted ? 'bg-emerald-500/20' : isCurrent ? 'bg-primary/20' : 'bg-white/10'}
             `}>
               {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
             </span>
             <span className="hidden sm:inline">{step.label}</span>
             {step.icon}
           </button>
         );
       })}
     </div>
   );
 };
 
 export default LearningStep;