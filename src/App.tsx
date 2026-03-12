import { useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { BidScorecard, StrategicAdvicePanel } from './components/BidDisplay';
import { PhysicistSelector } from './components/PhysicistSelector';
import {
  GameState, Hand, Bid, DiscardPile, PhysicistState,
  getCardsPerPlayer, EMPTY_DISCARD, EMPTY_PHYSICIST_STATE,
} from './lib/gameLogic';
import './index.css';

const EMPTY_HAND: Hand = { alive: 0, dead: 0, emptyBox: 0, schrodinger: 0 };

function makeInitialState(n: number): GameState {
  return {
    numPlayers: n,
    cardsPerPlayer: getCardsPerPlayer(n),
    myHand: EMPTY_HAND,
    myRevealedCards: EMPTY_HAND,
    revealedCards: EMPTY_HAND,
    discardPile: EMPTY_DISCARD,
    physicistState: EMPTY_PHYSICIST_STATE,
  };
}

function App() {
  const [numPlayers, setNumPlayers] = useState(4);
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => makeInitialState(4));

  const handleNumPlayersChange = (n: number) => {
    setNumPlayers(n);
    setCurrentBid(null);
    setGameState(makeInitialState(n));
  };

  const handleReset = () => {
    setCurrentBid(null);
    setGameState(makeInitialState(numPlayers));
  };

  const updateGameState = (partial: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...partial }));
  };

  // When other players' revealed cards change, sync the discard unknown:
  // each card that gets newly revealed by another player came with a discard.
  const handleRevealedChange = (newRevealed: Hand) => {
    setGameState((prev) => {
      const oldTotal =
        prev.revealedCards.alive + prev.revealedCards.dead +
        prev.revealedCards.emptyBox + prev.revealedCards.schrodinger;
      const newTotal =
        newRevealed.alive + newRevealed.dead +
        newRevealed.emptyBox + newRevealed.schrodinger;
      const delta = newTotal - oldTotal;
      const newUnknown = Math.max(0, prev.discardPile.unknown + delta);
      return {
        ...prev,
        revealedCards: newRevealed,
        discardPile: { ...prev.discardPile, unknown: newUnknown },
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold leading-tight">Schrödinger's Cats</h1>
          <p className="text-xs text-muted-foreground">Probability Calculator</p>
        </div>
      </header>

      {/*
        Three-column layout on lg+:
          left aside  (280px) — PhysicistSelector
          main        (max-w-lg, centered) — game inputs
          right aside (280px) — BidScorecard + StrategicAdvicePanel

        On small screens everything stacks in main, physicist is inline,
        scorecard appears at bottom, advice is collapsible inside GameScreen.
      */}
      <div className="relative max-w-lg mx-auto px-4 py-6">
        <main>
          <GameScreen
            gameState={gameState}
            numPlayers={numPlayers}
            currentBid={currentBid}
            onNumPlayersChange={handleNumPlayersChange}
            onReset={handleReset}
            onBidChange={setCurrentBid}
            onHandChange={(myHand) => updateGameState({ myHand })}
            onMyRevealedChange={(myRevealedCards) => updateGameState({ myRevealedCards })}
            onRevealedChange={handleRevealedChange}
            onDiscardChange={(discardPile: DiscardPile) => updateGameState({ discardPile })}
            onPhysicistChange={(physicistState: PhysicistState) => updateGameState({ physicistState })}
            physicistInSidebar={true}
          />

          {/* Physicist — inline on small screens only */}
          <div className="mt-4 lg:hidden">
            <PhysicistSelector
              physicistState={gameState.physicistState}
              gameState={gameState}
              onChange={(physicistState) => updateGameState({ physicistState })}
            />
          </div>

          {/* Scorecard — inline on small screens only */}
          <div className="mt-4 lg:hidden">
            <BidScorecard
              gameState={gameState}
              currentBid={currentBid}
              onBidChange={setCurrentBid}
            />
          </div>
        </main>

        {/* Left aside — PhysicistSelector, large screens only */}
        <aside className="hidden lg:block absolute top-[76px] right-full pr-4 w-[280px]">
          <div className="sticky top-20">
            <PhysicistSelector
              physicistState={gameState.physicistState}
              gameState={gameState}
              onChange={(physicistState) => updateGameState({ physicistState })}
            />
          </div>
        </aside>

        {/* Right aside — scorecard + strategic advice, large screens only */}
        <aside className="hidden lg:block absolute top-[76px] left-full pl-4 w-[280px]">
          <div className="sticky top-20 space-y-4">
            <BidScorecard
              gameState={gameState}
              currentBid={currentBid}
              onBidChange={setCurrentBid}
            />
            <StrategicAdvicePanel
              gameState={gameState}
              currentBid={currentBid}
              onBidChange={setCurrentBid}
            />
          </div>
        </aside>
      </div>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        Schrödinger's Cats © Amigo Spiele · Probability calculator for personal use
      </footer>
    </div>
  );
}

export default App;
