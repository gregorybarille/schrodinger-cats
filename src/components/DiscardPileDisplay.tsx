import { IconCat, IconSkull, IconBox, IconWand, IconQuestionMark } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardCounter } from './CardCounter';
import { DiscardPile, FIXED_DECK, Hand } from '@/lib/gameLogic';

interface DiscardPileDisplayProps {
  discardPile: DiscardPile;
  myHand: Hand;
  revealedCards: Hand;
  onChange: (discard: DiscardPile) => void;
}

export function DiscardPileDisplay({ discardPile, myHand, revealedCards, onChange }: DiscardPileDisplayProps) {
  const knownTotal = discardPile.alive + discardPile.dead + discardPile.emptyBox + discardPile.schrodinger;
  const total = knownTotal + discardPile.unknown;

  // Max for each type: deck total minus what's in hand and revealed
  const maxAlive = Math.max(0, FIXED_DECK.alive - myHand.alive - revealedCards.alive);
  const maxDead = Math.max(0, FIXED_DECK.dead - myHand.dead - revealedCards.dead);
  const maxBox = Math.max(0, FIXED_DECK.emptyBox - myHand.emptyBox - revealedCards.emptyBox);
  const maxSchrodinger = Math.max(0, FIXED_DECK.schrodinger - myHand.schrodinger - revealedCards.schrodinger);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Discard Pile
          <span className="text-sm font-normal text-muted-foreground">
            ({total} card{total !== 1 ? 's' : ''}{discardPile.unknown > 0 ? `, ${discardPile.unknown} unknown` : ''})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-1">
          <CardCounter
            label="Alive"
            icon={<IconCat size={16} />}
            count={discardPile.alive}
            max={maxAlive}
            colorClass="text-green-700"
            bgClass="bg-green-50 border-green-200"
            compact
            onChange={(v) => onChange({ ...discardPile, alive: v })}
          />
          <CardCounter
            label="Dead"
            icon={<IconSkull size={16} />}
            count={discardPile.dead}
            max={maxDead}
            colorClass="text-gray-700"
            bgClass="bg-gray-50 border-gray-200"
            compact
            onChange={(v) => onChange({ ...discardPile, dead: v })}
          />
          <CardCounter
            label="Box"
            icon={<IconBox size={16} />}
            count={discardPile.emptyBox}
            max={maxBox}
            colorClass="text-orange-600"
            bgClass="bg-orange-50 border-orange-200"
            compact
            onChange={(v) => onChange({ ...discardPile, emptyBox: v })}
          />
          <CardCounter
            label="Schr."
            icon={<IconWand size={16} />}
            count={discardPile.schrodinger}
            max={maxSchrodinger}
            colorClass="text-purple-700"
            bgClass="bg-purple-50 border-purple-200"
            compact
            onChange={(v) => onChange({ ...discardPile, schrodinger: v })}
          />
          <CardCounter
            label="???"
            icon={<IconQuestionMark size={16} />}
            count={discardPile.unknown}
            max={52 - knownTotal}
            colorClass="text-slate-500"
            bgClass="bg-slate-50 border-slate-200"
            compact
            onChange={(v) => onChange({ ...discardPile, unknown: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
