import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppleButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

const AppleButton = ({ onClick, isLoading }: AppleButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "relative w-14 h-14 rounded-full",
        "bg-void-light border border-gold/30",
        "flex items-center justify-center",
        "transition-all duration-300",
        "hover:border-gold hover:shadow-[0_0_30px_hsl(var(--gold)/0.3)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "group"
      )}
    >
      {/* Inner glow */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Apple logo in gold */}
      <svg 
        viewBox="0 0 24 24" 
        className="w-6 h-6 relative z-10"
        style={{ filter: 'drop-shadow(0 0 4px hsl(var(--gold) / 0.5))' }}
      >
        <path
          fill="hsl(38, 70%, 50%)"
          d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
        />
      </svg>
    </motion.button>
  );
};

export default AppleButton;
