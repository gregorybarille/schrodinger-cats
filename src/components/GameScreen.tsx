import { Button } from '@/components/ui/button';
import { HandSelector } from './HandSelector';
import { RevealedCards } from './RevealedCards';
import { DiscardPileDisplay } from './DiscardPileDisplay';
import { PhysicistSelector } from './PhysicistSelector';
import { GameState, Hand, DiscardPile, PhysicistState, getCardsPerPlayer } from '@/lib/gameLogic';

interface GameScreenProps {
  gameState: GameState;
  numPlayers: number;
  onNumPlayersChange: (n: number) => void;
  onHandChange: (hand: Hand) => void;
  onRevealedChange: (revealed: Hand) => void;
  onDiscardChange: (discard: DiscardPile) => void;
  onPhysicistChange: (ps: PhysicistState) => void;
}

export function GameScreen({
  gameState,
  numPlayers,
  onNumPlayersChange,
  onHandChange,
  onRevealedChange,
  onDiscardChange,
  onPhysicistChange,
}: GameScreenProps) {
  return (
    <div className="space-y-4">
      {/* Number of players */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground shrink-0">Players:</span>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <Button
              key={n}
              variant={numPlayers === n ? 'default' : 'outline'}
              size="sm"
              onClick={() => onNumPlayersChange(n)}
              className="w-9 h-9"
            >
              {n}
            </Button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {gameState.cardsPerPlayer} cards each · {getCardsPerPlayer(numPlayers) * numPlayers} total
        </span>
      </div>

      <HandSelector
        hand={gameState.myHand}
        cardsPerPlayer={gameState.cardsPerPlayer}
        onChange={onHandChange}
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

      <PhysicistSelector
        physicistState={gameState.physicistState}
        gameState={gameState}
        onChange={onPhysicistChange}
      />
    </div>
  );
}
