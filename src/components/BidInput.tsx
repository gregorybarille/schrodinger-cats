
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardType, Bid } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface BidInputProps {
  bid: Bid | null;
  maxCount: number;
  onChange: (bid: Bid | null) => void;
}

const typeConfig: Record<CardType, { label: string; emoji: string; colorClass: string; bgClass: string }> = {
  alive: { label: 'Alive', emoji: '🐱', colorClass: 'text-green-700', bgClass: 'bg-green-100 border-green-400 text-green-800' },
  dead: { label: 'Dead', emoji: '💀', colorClass: 'text-gray-700', bgClass: 'bg-gray-100 border-gray-400 text-gray-800' },
  schrodinger: { label: 'Schrödinger', emoji: '⚡', colorClass: 'text-purple-700', bgClass: 'bg-purple-100 border-purple-400 text-purple-800' },
};

export function BidInput({ bid, maxCount, onChange }: BidInputProps) {
  const count = bid?.count ?? 1;
  const type = bid?.type ?? 'alive';

  const setType = (t: CardType) => onChange({ count, type: t });
  const setCount = (c: number) => onChange({ count: c, type });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>🎯 Current Bid</span>
          {bid && (
            <Button variant="ghost" size="sm" onClick={() => onChange(null)} className="text-muted-foreground">
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Card Type</p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(typeConfig) as CardType[]).map((t) => {
              const cfg = typeConfig[t];
              const isSelected = type === t && bid !== null;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-sm font-medium",
                    isSelected ? cfg.bgClass + " shadow-md" : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <span className="text-xl">{cfg.emoji}</span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Count</p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount(Math.max(1, count - 1))}
              disabled={count <= 1}
            >
              −
            </Button>
            <span className="text-2xl font-bold w-10 text-center">{bid ? count : '—'}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount(Math.min(maxCount, count + 1))}
              disabled={count >= maxCount}
            >
              +
            </Button>
            <span className="text-sm text-muted-foreground">/ {maxCount} max</span>
          </div>
        </div>

        {bid && (
          <div className={cn("p-3 rounded-lg border-2 text-center font-semibold", typeConfig[bid.type].bgClass)}>
            {typeConfig[bid.type].emoji} Bid: at least {bid.count} {typeConfig[bid.type].label} card{bid.count !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
