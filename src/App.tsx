import { useState } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { DeckConfig, GameState, Bid, getCardsPerPlayer } from './lib/gameLogic';
import './index.css';

const DEFAULT_DECK: DeckConfig = { alive: 12, dead: 12, schrodinger: 12 };

function App() {
  const [screen, setScreen] = useState<'setup' | 'game'>('setup');
  const [numPlayers, setNumPlayers] = useState(4);
  const [deckConfig, setDeckConfig] = useState<DeckConfig>(DEFAULT_DECK);
  const [gameState, setGameState] = useState<GameState>({
    numPlayers: 4,
    deckConfig: DEFAULT_DECK,
    cardsPerPlayer: getCardsPerPlayer(4),
    myHand: { alive: 0, dead: 0, schrodinger: 0 },
    revealedCards: { alive: 0, dead: 0, schrodinger: 0 },
  });
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);

  const handleStartGame = () => {
    const cardsPerPlayer = getCardsPerPlayer(numPlayers);
    setGameState({
      numPlayers,
      deckConfig,
      cardsPerPlayer,
      myHand: { alive: 0, dead: 0, schrodinger: 0 },
      revealedCards: { alive: 0, dead: 0, schrodinger: 0 },
    });
    setCurrentBid(null);
    setScreen('game');
  };

  const handleReset = () => {
    setScreen('setup');
    setCurrentBid(null);
  };

  const updateGameState = (partial: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🐱</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Schrödinger's Cats</h1>
            <p className="text-xs text-muted-foreground">Probability Calculator</p>
          </div>
          <div className="ml-auto flex gap-1">
            <span className="text-xl">💀</span>
            <span className="text-xl">⚡</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {screen === 'setup' ? (
          <SetupScreen
            numPlayers={numPlayers}
            deckConfig={deckConfig}
            onNumPlayersChange={setNumPlayers}
            onDeckConfigChange={setDeckConfig}
            onStartGame={handleStartGame}
          />
        ) : (
          <GameScreen
            gameState={gameState}
            currentBid={currentBid}
            onHandChange={(hand) => updateGameState({ myHand: hand })}
            onRevealedChange={(revealedCards) => updateGameState({ revealedCards })}
            onBidChange={setCurrentBid}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        Schrödinger's Cats © Amigo Spiele · Probability calculator for personal use
      </footer>
    </div>
  );
}

export default App;
