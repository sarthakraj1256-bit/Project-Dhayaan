import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/hooks/useHapticFeedback";

interface HapticSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  hapticEnabled?: boolean;
  tickInterval?: number; // Trigger haptic every N value change
}

const HapticSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  HapticSliderProps
>(({ className, hapticEnabled = true, tickInterval = 10, onValueChange, ...props }, ref) => {
  const lastTickRef = React.useRef<number | null>(null);

  const handleValueChange = (value: number[]) => {
    if (hapticEnabled && value.length > 0) {
      const currentValue = value[0];
      const currentTick = Math.floor(currentValue / tickInterval);
      
      // Only trigger haptic when crossing a tick boundary
      if (lastTickRef.current !== null && lastTickRef.current !== currentTick) {
        triggerHaptic('tick');
      }
      lastTickRef.current = currentTick;
    }
    onValueChange?.(value);
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        // Touch-friendly height
        "min-h-[44px]",
        className
      )}
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          // Touch-friendly thumb size
          "block h-6 w-6 rounded-full",
          "border-2 border-primary bg-background",
          "ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // Touch manipulation
          "touch-manipulation",
          // Active state
          "active:scale-110 transition-transform"
        )}
      />
    </SliderPrimitive.Root>
  );
});

HapticSlider.displayName = "HapticSlider";

export { HapticSlider };
