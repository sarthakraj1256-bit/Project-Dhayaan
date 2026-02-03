import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SanctumButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const SanctumButton = ({ isLoading, children, className, disabled, type = "button", onClick }: SanctumButtonProps) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(
        "relative w-full py-4 px-8 rounded-md overflow-hidden",
        "font-display text-lg tracking-[0.2em] uppercase",
        "transition-all duration-300",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      disabled={disabled || isLoading}
    >
      {/* Multi-layer background for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold via-gold-light to-gold" />
      
      {/* Inner shadow for 3D effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)',
        }}
      />
      
      {/* Animated glow border */}
      <div 
        className="absolute inset-0 rounded-md"
        style={{
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.3),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            0 0 30px hsl(var(--gold) / 0.4),
            0 0 60px hsl(var(--gold) / 0.2)
          `,
        }}
      />
      
      {/* Energy pulse animation */}
      <motion.div
        className="absolute inset-0 bg-white/10"
        animate={{
          opacity: [0, 0.2, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ width: '50%' }}
      />
      
      {/* Text */}
      <span className="relative z-10 text-void flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
      </span>
    </motion.button>
  );
};

export default SanctumButton;
