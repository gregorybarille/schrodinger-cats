import { useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { StrategicAdvicePanel } from './components/BidDisplay';
import { GameState, Hand, Bid, getCardsPerPlayer } from './lib/gameLogic';
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
  });

  const handleNumPlayersChange = (n: number) => {
    setNumPlayers(n);
    setCurrentBid(null);
    setGameState({
      numPlayers: n,
      cardsPerPlayer: getCardsPerPlayer(n),
      myHand: EMPTY_HAND,
      revealedCards: EMPTY_HAND,
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

      {/* Outer wrapper: wider than main so the advice panel has room to the right */}
      <div className="flex justify-center gap-4 px-4 py-6">
        {/* Center column: the actual main content, same width as before */}
        <main className="w-full max-w-lg shrink-0">
          <GameScreen
            gameState={gameState}
            numPlayers={numPlayers}
            currentBid={currentBid}
            onNumPlayersChange={handleNumPlayersChange}
            onHandChange={(myHand) => updateGameState({ myHand })}
            onRevealedChange={(revealedCards) => updateGameState({ revealedCards })}
            onBidChange={setCurrentBid}
          />
        </main>

        {/* Right side: strategic advice, sticky so it stays in view while scrolling */}
        {/* pt-[52px] = players row height (36px) + space-y-4 gap (16px), aligns with My Hand */}
        <aside className="hidden lg:block pt-[52px]">
          <div className="sticky top-20">
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
