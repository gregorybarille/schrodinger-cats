
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardCounter } from './CardCounter';

interface RevealedCardsProps {
  revealed: { alive: number; dead: number; schrodinger: number };
  deckConfig: { alive: number; dead: number; schrodinger: number };
  myHand: { alive: number; dead: number; schrodinger: number };
  onChange: (revealed: { alive: number; dead: number; schrodinger: number }) => void;
}

export function RevealedCards({ revealed, deckConfig, myHand, onChange }: RevealedCardsProps) {
  const total = revealed.alive + revealed.dead + revealed.schrodinger;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          👁️ Revealed Cards
          <span className="text-sm font-normal text-muted-foreground">
            ({total} revealed)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <CardCounter
            label="Alive"
            emoji="🐱"
            count={revealed.alive}
            max={deckConfig.alive - myHand.alive}
            colorClass="text-green-700"
            bgClass="bg-green-50 border-green-200"
            onChange={(v) => onChange({ ...revealed, alive: v })}
          />
          <CardCounter
            label="Dead"
            emoji="💀"
            count={revealed.dead}
            max={deckConfig.dead - myHand.dead}
            colorClass="text-gray-700"
            bgClass="bg-gray-50 border-gray-200"
            onChange={(v) => onChange({ ...revealed, dead: v })}
          />
          <CardCounter
            label="Schrödinger"
            emoji="⚡"
            count={revealed.schrodinger}
            max={deckConfig.schrodinger - myHand.schrodinger}
            colorClass="text-purple-700"
            bgClass="bg-purple-50 border-purple-200"
            onChange={(v) => onChange({ ...revealed, schrodinger: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
