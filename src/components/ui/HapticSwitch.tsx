import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface HapticSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  hapticEnabled?: boolean;
}

const HapticSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  HapticSwitchProps
>(({ className, hapticEnabled = true, onCheckedChange, ...props }, ref) => {
  const { triggerToggle, isEnabled } = useHapticFeedback({ enabled: hapticEnabled });

  const handleCheckedChange = (checked: boolean) => {
    if (isEnabled) {
      triggerToggle(checked);
    }
    onCheckedChange?.(checked);
  };

  return (
    <SwitchPrimitives.Root
      className={cn(
        // Touch-friendly size
        "peer inline-flex h-[28px] w-[52px] shrink-0 cursor-pointer items-center",
        "rounded-full border-2 border-transparent",
        "transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        // Touch manipulation
        "touch-manipulation select-none",
        className
      )}
      onCheckedChange={handleCheckedChange}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-[24px] w-[24px] rounded-full",
          "bg-background shadow-lg ring-0",
          "transition-transform data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  );
});

HapticSwitch.displayName = "HapticSwitch";

export { HapticSwitch };
