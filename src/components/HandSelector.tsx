import { IconCat, IconSkull, IconBox, IconWand } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardCounter } from './CardCounter';
import { Hand, FIXED_DECK } from '@/lib/gameLogic';

interface HandSelectorProps {
  hand: Hand;
  cardsPerPlayer: number;
  onChange: (hand: Hand) => void;
}

export function HandSelector({ hand, cardsPerPlayer, onChange }: HandSelectorProps) {
  const total = hand.alive + hand.dead + hand.emptyBox + hand.schrodinger;
  const remaining = cardsPerPlayer - total;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          My Hand
          <span className="text-sm font-normal text-muted-foreground">
            ({total}/{cardsPerPlayer} cards selected)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          <CardCounter
            label="Alive"
            icon={<IconCat size={24} />}
            count={hand.alive}
            max={Math.min(hand.alive + remaining, FIXED_DECK.alive)}
            colorClass="text-green-700"
            bgClass="bg-green-50 border-green-200"
            onChange={(v) => onChange({ ...hand, alive: v })}
          />
          <CardCounter
            label="Dead"
            icon={<IconSkull size={24} />}
            count={hand.dead}
            max={Math.min(hand.dead + remaining, FIXED_DECK.dead)}
            colorClass="text-gray-700"
            bgClass="bg-gray-50 border-gray-200"
            onChange={(v) => onChange({ ...hand, dead: v })}
          />
          <CardCounter
            label="Box"
            icon={<IconBox size={24} />}
            count={hand.emptyBox}
            max={Math.min(hand.emptyBox + remaining, FIXED_DECK.emptyBox)}
            colorClass="text-amber-700"
            bgClass="bg-amber-50 border-amber-200"
            onChange={(v) => onChange({ ...hand, emptyBox: v })}
          />
          <CardCounter
            label="Schrödinger"
            icon={<IconWand size={24} />}
            count={hand.schrodinger}
            max={Math.min(hand.schrodinger + remaining, FIXED_DECK.schrodinger)}
            colorClass="text-purple-700"
            bgClass="bg-purple-50 border-purple-200"
            onChange={(v) => onChange({ ...hand, schrodinger: v })}
          />
        </div>
        {remaining > 0 && (
          <p className="text-sm text-amber-600 mt-2 text-center">
            {remaining} card{remaining !== 1 ? 's' : ''} not yet selected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
