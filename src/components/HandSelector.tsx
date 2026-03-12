import { IconCat, IconSkull, IconBox, IconWand, IconEye } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardCounter } from './CardCounter';
import { Hand, FIXED_DECK } from '@/lib/gameLogic';

interface HandSelectorProps {
  hand: Hand;
  myRevealedCards: Hand;
  cardsPerPlayer: number;
  onChange: (hand: Hand) => void;
  onRevealedChange: (revealed: Hand) => void;
}

export function HandSelector({ hand, myRevealedCards, cardsPerPlayer, onChange, onRevealedChange }: HandSelectorProps) {
  const total = hand.alive + hand.dead + hand.emptyBox + hand.schrodinger;
  const remaining = cardsPerPlayer - total;
  const revealedTotal = myRevealedCards.alive + myRevealedCards.dead + myRevealedCards.emptyBox + myRevealedCards.schrodinger;

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
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          <CardCounter
            label="Alive"
            icon={<IconCat size={16} />}
            count={hand.alive}
            max={Math.min(hand.alive + remaining, FIXED_DECK.alive)}
            colorClass="text-green-700"
            bgClass="bg-green-50 border-green-200"
            onChange={(v) => onChange({ ...hand, alive: v })}
          />
          <CardCounter
            label="Dead"
            icon={<IconSkull size={16} />}
            count={hand.dead}
            max={Math.min(hand.dead + remaining, FIXED_DECK.dead)}
            colorClass="text-gray-700"
            bgClass="bg-gray-50 border-gray-200"
            onChange={(v) => onChange({ ...hand, dead: v })}
          />
          <CardCounter
            label="Box"
            icon={<IconBox size={16} />}
            count={hand.emptyBox}
            max={Math.min(hand.emptyBox + remaining, FIXED_DECK.emptyBox)}
            colorClass="text-orange-600"
            bgClass="bg-orange-50 border-orange-200"
            onChange={(v) => onChange({ ...hand, emptyBox: v })}
          />
          <CardCounter
            label="Schr."
            icon={<IconWand size={16} />}
            count={hand.schrodinger}
            max={Math.min(hand.schrodinger + remaining, FIXED_DECK.schrodinger)}
            colorClass="text-purple-700"
            bgClass="bg-purple-50 border-purple-200"
            onChange={(v) => onChange({ ...hand, schrodinger: v })}
          />
        </div>
        {remaining > 0 && (
          <p className="text-sm text-orange-600 text-center">
            {remaining} card{remaining !== 1 ? 's' : ''} not yet selected
          </p>
        )}

        {/* My revealed cards — cards I personally revealed this round */}
        <div>
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
            <IconEye size={13} />
            I revealed{revealedTotal > 0 ? ` (${revealedTotal})` : ''}
          </p>
          <div className="grid grid-cols-4 gap-2">
            <CardCounter
              label="Alive"
              icon={<IconCat size={16} />}
              count={myRevealedCards.alive}
              max={hand.alive}
              colorClass="text-green-700"
              bgClass="bg-green-50 border-green-200"
              onChange={(v) => onRevealedChange({ ...myRevealedCards, alive: v })}
            />
            <CardCounter
              label="Dead"
              icon={<IconSkull size={16} />}
              count={myRevealedCards.dead}
              max={hand.dead}
              colorClass="text-gray-700"
              bgClass="bg-gray-50 border-gray-200"
              onChange={(v) => onRevealedChange({ ...myRevealedCards, dead: v })}
            />
            <CardCounter
              label="Box"
              icon={<IconBox size={16} />}
              count={myRevealedCards.emptyBox}
              max={hand.emptyBox}
              colorClass="text-orange-600"
              bgClass="bg-orange-50 border-orange-200"
              onChange={(v) => onRevealedChange({ ...myRevealedCards, emptyBox: v })}
            />
            <CardCounter
              label="Schr."
              icon={<IconWand size={16} />}
              count={myRevealedCards.schrodinger}
              max={hand.schrodinger}
              colorClass="text-purple-700"
              bgClass="bg-purple-50 border-purple-200"
              onChange={(v) => onRevealedChange({ ...myRevealedCards, schrodinger: v })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
