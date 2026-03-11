
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardCounter } from './CardCounter';

interface HandSelectorProps {
  hand: { alive: number; dead: number; schrodinger: number };
  cardsPerPlayer: number;
  onChange: (hand: { alive: number; dead: number; schrodinger: number }) => void;
}

export function HandSelector({ hand, cardsPerPlayer, onChange }: HandSelectorProps) {
  const total = hand.alive + hand.dead + hand.schrodinger;
  const remaining = cardsPerPlayer - total;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🃏 My Hand
          <span className="text-sm font-normal text-muted-foreground">
            ({total}/{cardsPerPlayer} cards selected)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <CardCounter
            label="Alive"
            emoji="🐱"
            count={hand.alive}
            max={hand.alive + remaining}
            colorClass="text-green-700"
            bgClass="bg-green-50 border-green-200"
            onChange={(v) => onChange({ ...hand, alive: v })}
          />
          <CardCounter
            label="Dead"
            emoji="💀"
            count={hand.dead}
            max={hand.dead + remaining}
            colorClass="text-gray-700"
            bgClass="bg-gray-50 border-gray-200"
            onChange={(v) => onChange({ ...hand, dead: v })}
          />
          <CardCounter
            label="Schrödinger"
            emoji="⚡"
            count={hand.schrodinger}
            max={hand.schrodinger + remaining}
            colorClass="text-purple-700"
            bgClass="bg-purple-50 border-purple-200"
            onChange={(v) => onChange({ ...hand, schrodinger: v })}
          />
        </div>
        {remaining > 0 && (
          <p className="text-sm text-amber-600 mt-2 text-center">
            ⚠️ {remaining} card{remaining !== 1 ? 's' : ''} not yet selected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
