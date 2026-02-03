import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  onTyping?: (isTyping: boolean) => void;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, type = "text", className, onTyping, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      
      if (isPassword && onTyping) {
        onTyping(e.target.value.length > 0);
      }
      
      onChange?.(e);
    };
    
    return (
      <div className="relative group">
        <input
          ref={ref}
          type={inputType}
          className={cn(
            "peer w-full bg-transparent border-0 border-b-2 border-muted-foreground/30",
            "px-0 py-3 pt-6 text-foreground font-body text-lg",
            "focus:outline-none focus:ring-0",
            "transition-all duration-300",
            "placeholder-transparent",
            isFocused && "border-gold shadow-[0_2px_20px_-5px_hsl(var(--gold)/0.5)]",
            isPassword && "pr-12",
            className
          )}
          placeholder={label}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          {...props}
        />
        
        {/* Floating label */}
        <label
          className={cn(
            "absolute left-0 transition-all duration-300 pointer-events-none font-body",
            "text-muted-foreground",
            (isFocused || hasValue) 
              ? "top-0 text-xs text-gold" 
              : "top-1/2 -translate-y-1/2 text-lg"
          )}
        >
          {label}
        </label>
        
        {/* Animated glow line */}
        <div 
          className={cn(
            "absolute bottom-0 left-1/2 h-[2px] bg-gold",
            "transition-all duration-500 ease-out",
            isFocused ? "w-full -translate-x-1/2" : "w-0 -translate-x-1/2"
          )}
          style={{
            boxShadow: isFocused ? '0 0 20px hsl(var(--gold)), 0 0 40px hsl(var(--gold) / 0.5)' : 'none'
          }}
        />
        
        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-gold transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;
