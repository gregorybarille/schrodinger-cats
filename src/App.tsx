import { useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { BidScorecard, StrategicAdvicePanel } from './components/BidDisplay';
import {
  GameState, Hand, Bid, DiscardPile, PhysicistState,
  getCardsPerPlayer, EMPTY_DISCARD, EMPTY_PHYSICIST_STATE,
} from './lib/gameLogic';
import './index.css';

const EMPTY_HAND: Hand = { alive: 0, dead: 0, emptyBox: 0, schrodinger: 0 };

function App() {
  const [numPlayers, setNumPlayers] = useState(4);
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    numPlayers: 4,
    cardsPerPlayer: getCardsPerPlayer(4),
    myHand: EMPTY_HAND,
    revealedCards: EMPTY_HAND,
    discardPile: EMPTY_DISCARD,
    physicistState: EMPTY_PHYSICIST_STATE,
  });

  const handleNumPlayersChange = (n: number) => {
    setNumPlayers(n);
    setCurrentBid(null);
    setGameState({
      numPlayers: n,
      cardsPerPlayer: getCardsPerPlayer(n),
      myHand: EMPTY_HAND,
      revealedCards: EMPTY_HAND,
      discardPile: EMPTY_DISCARD,
      physicistState: EMPTY_PHYSICIST_STATE,
    });
  };

  const updateGameState = (partial: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold leading-tight">Schrödinger's Cats</h1>
          <p className="text-xs text-muted-foreground">Probability Calculator</p>
        </div>
      </header>

      {/* Centered main column; aside is positioned absolutely to its right */}
      <div className="relative max-w-lg mx-auto px-4 py-6">
        <main>
          <GameScreen
            gameState={gameState}
            numPlayers={numPlayers}
            onNumPlayersChange={handleNumPlayersChange}
            onHandChange={(myHand) => updateGameState({ myHand })}
            onRevealedChange={(revealedCards) => updateGameState({ revealedCards })}
            onDiscardChange={(discardPile: DiscardPile) => updateGameState({ discardPile })}
            onPhysicistChange={(physicistState: PhysicistState) => updateGameState({ physicistState })}
          />

          {/* Scorecard in main column — visible only on small screens where aside is hidden */}
          <div className="mt-4 lg:hidden">
            <BidScorecard
              gameState={gameState}
              currentBid={currentBid}
              onBidChange={setCurrentBid}
            />
          </div>
        </main>

        {/* Right side: scorecard + strategic advice, anchored to the right edge of main */}
        {/* top offset: py-6 (24px) + players row (36px) + space-y-4 gap (16px) = 76px, aligns with My Hand */}
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
