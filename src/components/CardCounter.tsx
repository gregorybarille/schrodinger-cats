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
    <div className={cn('flex flex-col items-center gap-2 p-3 rounded-lg border-2', bgClass)}>
      <div className={colorClass}>{icon}</div>
      <div className={cn('text-sm font-semibold', colorClass)}>{label}</div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-base"
          onClick={() => onChange(Math.max(0, count - 1))}
          disabled={count <= 0}
        >
          −
        </Button>
        <span className={cn('text-xl font-bold w-7 text-center', colorClass)}>{count}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-base"
          onClick={() => onChange(Math.min(max, count + 1))}
          disabled={count >= max}
        >
          +
        </Button>
      </div>
    </div>
  );
}
