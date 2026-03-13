import { IconCat, IconSkull, IconBox, IconWand } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardCounter } from './CardCounter';
import { Hand, FIXED_DECK } from '@/lib/gameLogic';

interface RevealedCardsProps {
  revealed: Hand;
  myHand: Hand;
  onChange: (revealed: Hand) => void;
}

export function RevealedCards({ revealed, myHand, onChange }: RevealedCardsProps) {
  const total = revealed.alive + revealed.dead + revealed.emptyBox + revealed.schrodinger;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Revealed Cards
          <span className="text-sm font-normal text-muted-foreground">
            ({total} revealed)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          <CardCounter
            label="Alive"
            icon={<IconCat size={16} />}
            count={revealed.alive}
            max={FIXED_DECK.alive - myHand.alive}
            colorClass="text-green-700"
            bgClass="bg-green-50 border-green-200"
            onChange={(v) => onChange({ ...revealed, alive: v })}
          />
          <CardCounter
            label="Dead"
            icon={<IconSkull size={16} />}
            count={revealed.dead}
            max={FIXED_DECK.dead - myHand.dead}
            colorClass="text-gray-700"
            bgClass="bg-gray-50 border-gray-200"
            onChange={(v) => onChange({ ...revealed, dead: v })}
          />
          <CardCounter
            label="Box"
            icon={<IconBox size={16} />}
            count={revealed.emptyBox}
            max={FIXED_DECK.emptyBox - myHand.emptyBox}
            colorClass="text-orange-600"
            bgClass="bg-orange-50 border-orange-200"
            onChange={(v) => onChange({ ...revealed, emptyBox: v })}
          />
          <CardCounter
            label="Schr."
            icon={<IconWand size={16} />}
            count={revealed.schrodinger}
            max={FIXED_DECK.schrodinger - myHand.schrodinger}
            colorClass="text-purple-700"
            bgClass="bg-purple-50 border-purple-200"
            onChange={(v) => onChange({ ...revealed, schrodinger: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
