import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CardCounterProps {
  label: string;
  icon: ReactNode;
  count: number;
  max: number;
  colorClass: string;
  bgClass: string;
  compact?: boolean;
  onChange: (value: number) => void;
}

export function CardCounter({ label, icon, count, max, colorClass, bgClass, compact, onChange }: CardCounterProps) {
  return (
    <div className={cn(
      'flex flex-col items-center rounded-lg border-2',
      compact ? 'gap-1 p-1.5' : 'gap-2 p-3',
      bgClass,
    )}>
      <div className={colorClass}>{icon}</div>
      <div className={cn('font-semibold', compact ? 'text-xs' : 'text-sm', colorClass)}>{label}</div>
      <div className="flex items-center gap-0.5">
        <Button
          variant="outline"
          size="icon"
          className={compact ? 'h-6 w-6 text-sm' : 'h-7 w-7 text-base'}
          onClick={() => onChange(Math.max(0, count - 1))}
          disabled={count <= 0}
        >
          −
        </Button>
        <span className={cn('font-bold text-center tabular-nums', compact ? 'text-base w-5' : 'text-xl w-7', colorClass)}>{count}</span>
        <Button
          variant="outline"
          size="icon"
          className={compact ? 'h-6 w-6 text-sm' : 'h-7 w-7 text-base'}
          onClick={() => onChange(Math.min(max, count + 1))}
          disabled={count >= max}
        >
          +
        </Button>
      </div>
    </div>
  );
}
