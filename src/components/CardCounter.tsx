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
  onChange: (value: number) => void;
}

export function CardCounter({ label, icon, count, max, colorClass, bgClass, onChange }: CardCounterProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1 p-1.5 rounded-lg border-2', bgClass)}>
      <div className={colorClass}>{icon}</div>
      <div className={cn('text-xs font-semibold', colorClass)}>{label}</div>
      <div className="flex items-center gap-0.5">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 text-sm"
          onClick={() => onChange(Math.max(0, count - 1))}
          disabled={count <= 0}
        >
          −
        </Button>
        <span className={cn('text-base font-bold w-5 text-center tabular-nums', colorClass)}>{count}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 text-sm"
          onClick={() => onChange(Math.min(max, count + 1))}
          disabled={count >= max}
        >
          +
        </Button>
      </div>
    </div>
  );
}
