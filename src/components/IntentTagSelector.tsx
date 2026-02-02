import { cn } from '@/lib/utils';

export type IntentTag = 'anxiety_relief' | 'focus' | 'sleep' | 'spiritual_growth';

interface IntentTagOption {
  value: IntentTag;
  label: string;
  emoji: string;
  description: string;
}

const INTENT_OPTIONS: IntentTagOption[] = [
  {
    value: 'anxiety_relief',
    label: 'Anxiety Relief',
    emoji: '🧘',
    description: 'Finding calm & peace',
  },
  {
    value: 'focus',
    label: 'Focus',
    emoji: '🎯',
    description: 'Mental clarity',
  },
  {
    value: 'sleep',
    label: 'Sleep',
    emoji: '🌙',
    description: 'Better rest',
  },
  {
    value: 'spiritual_growth',
    label: 'Spiritual Growth',
    emoji: '✨',
    description: 'Inner awakening',
  },
];

interface IntentTagSelectorProps {
  selectedTag: IntentTag | null;
  onChange: (tag: IntentTag | null) => void;
}

export default function IntentTagSelector({ selectedTag, onChange }: IntentTagSelectorProps) {
  const handleToggle = (tag: IntentTag) => {
    onChange(selectedTag === tag ? null : tag);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-muted-foreground tracking-wider">
        What brings you here today?
        <span className="text-xs text-muted-foreground/60 ml-2">(optional)</span>
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {INTENT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            className={cn(
              'group flex flex-col items-center p-4 rounded-lg border transition-all duration-300',
              'hover:scale-[1.02] hover:shadow-lg',
              selectedTag === option.value
                ? 'glass-card border-primary/50 bg-primary/10 shadow-lg shadow-primary/10'
                : 'glass-card border-border/30 hover:border-primary/30'
            )}
          >
            <span className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110">
              {option.emoji}
            </span>
            <span className={cn(
              'font-display text-xs tracking-wider transition-colors duration-300',
              selectedTag === option.value ? 'text-primary' : 'text-foreground'
            )}>
              {option.label}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1 font-body">
              {option.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
