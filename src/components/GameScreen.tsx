
import { Button } from '@/components/ui/button';
import { HandSelector } from './HandSelector';
import { RevealedCards } from './RevealedCards';
import { BidInput } from './BidInput';
import { ProbabilityDisplay } from './ProbabilityDisplay';
import { GameState, Bid } from '@/lib/gameLogic';

interface GameScreenProps {
  gameState: GameState;
  currentBid: Bid | null;
  onHandChange: (hand: { alive: number; dead: number; schrodinger: number }) => void;
  onRevealedChange: (revealed: { alive: number; dead: number; schrodinger: number }) => void;
  onBidChange: (bid: Bid | null) => void;
  onReset: () => void;
}

export function GameScreen({
  gameState,
  currentBid,
  onHandChange,
  onRevealedChange,
  onBidChange,
  onReset,
}: GameScreenProps) {
  const maxBidCount = gameState.numPlayers * gameState.cardsPerPlayer;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {gameState.numPlayers} players · {gameState.cardsPerPlayer} cards each
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          🔄 New Game
        </Button>
      </div>

      <HandSelector
        hand={gameState.myHand}
        cardsPerPlayer={gameState.cardsPerPlayer}
        onChange={onHandChange}
      />

      <RevealedCards
        revealed={gameState.revealedCards}
        deckConfig={gameState.deckConfig}
        myHand={gameState.myHand}
        onChange={onRevealedChange}
      />

      <BidInput
        bid={currentBid}
        maxCount={maxBidCount}
        onChange={onBidChange}
      />

      <ProbabilityDisplay
        gameState={gameState}
        currentBid={currentBid}
      />
    </div>
  );
}
