interface RadialProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  current: number;
  target: number;
}

const RadialProgress = ({ percentage, size = 80, strokeWidth = 6, current, target }: RadialProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const center = size / 2;
  const remaining = Math.max(target - current, 0);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={percentage >= 100 ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-primary font-[Cinzel] leading-none">
          {Math.round(percentage)}%
        </span>
        <span className="text-[9px] text-muted-foreground leading-tight">
          {remaining.toLocaleString()} left
        </span>
      </div>
    </div>
  );
};

export default RadialProgress;
