import { useState } from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { HandSelector } from './HandSelector';
import { RevealedCards } from './RevealedCards';
import { DiscardPileDisplay } from './DiscardPileDisplay';
import { PhysicistSelector } from './PhysicistSelector';
import { WarningBanners } from './WarningBanners';
import { StrategicAdvicePanel } from './BidDisplay';
import { GameState, Hand, DiscardPile, PhysicistState, Bid } from '@/lib/gameLogic';

interface GameScreenProps {
  gameState: GameState;
  currentBid: Bid | null;
  onBidChange: (bid: Bid | null) => void;
  onHandChange: (hand: Hand) => void;
  onMyRevealedChange: (revealed: Hand) => void;
  onRevealedChange: (revealed: Hand) => void;
  onDiscardChange: (discard: DiscardPile) => void;
  onPhysicistChange: (ps: PhysicistState) => void;
  /** When true, PhysicistSelector is rendered in a separate column — omit it from main */
  physicistInSidebar?: boolean;
}

export function GameScreen({
  gameState,
  currentBid,
  onBidChange,
  onHandChange,
  onMyRevealedChange,
  onRevealedChange,
  onDiscardChange,
  onPhysicistChange,
  physicistInSidebar = false,
}: GameScreenProps) {
  const [adviceOpen, setAdviceOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Warnings — shown at top, bid-aware */}
      <WarningBanners gameState={gameState} currentBid={currentBid} />

      {/* Strategic advice — collapsible, mobile only */}
      <div className="lg:hidden">
        <button
          className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground py-1 px-0"
          onClick={() => setAdviceOpen((o) => !o)}
        >
          <span>Strategic Advice</span>
          {adviceOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </button>
        {adviceOpen && (
          <div className="mt-2">
            <StrategicAdvicePanel
              gameState={gameState}
              currentBid={currentBid}
              onBidChange={onBidChange}
            />
          </div>
        )}
      </div>

      <HandSelector
        hand={gameState.myHand}
        myRevealedCards={gameState.myRevealedCards}
        cardsPerPlayer={gameState.cardsPerPlayer}
        onChange={onHandChange}
        onRevealedChange={onMyRevealedChange}
      />

      <RevealedCards
        revealed={gameState.revealedCards}
        myHand={gameState.myHand}
        onChange={onRevealedChange}
      />

      <DiscardPileDisplay
        discardPile={gameState.discardPile}
        myHand={gameState.myHand}
        revealedCards={gameState.revealedCards}
        onChange={onDiscardChange}
      />

      {!physicistInSidebar && (
        <PhysicistSelector
          physicistState={gameState.physicistState}
          gameState={gameState}
          onChange={onPhysicistChange}
        />
      )}
    </div>
  );
}
