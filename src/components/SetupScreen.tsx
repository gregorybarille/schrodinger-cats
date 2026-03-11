
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardCounter } from './CardCounter';
import { DeckConfig, getCardsPerPlayer } from '@/lib/gameLogic';

interface SetupScreenProps {
  numPlayers: number;
  deckConfig: DeckConfig;
  onNumPlayersChange: (n: number) => void;
  onDeckConfigChange: (config: DeckConfig) => void;
  onStartGame: () => void;
}

export function SetupScreen({
  numPlayers,
  deckConfig,
  onNumPlayersChange,
  onDeckConfigChange,
  onStartGame,
}: SetupScreenProps) {
  const cardsPerPlayer = getCardsPerPlayer(numPlayers);
  const totalDealt = cardsPerPlayer * numPlayers;
  const totalDeck = deckConfig.alive + deckConfig.dead + deckConfig.schrodinger;
  const setAside = Math.max(0, totalDeck - totalDealt);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>👥 Number of Players</CardTitle>
          <CardDescription>Select how many players are in the game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {[2, 3, 4, 5, 6].map((n) => (
              <Button
                key={n}
                variant={numPlayers === n ? 'default' : 'outline'}
                size="lg"
                onClick={() => onNumPlayersChange(n)}
                className="w-12 h-12 text-lg"
              >
                {n}
              </Button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm space-y-1">
            <p>🃏 <strong>{cardsPerPlayer} cards</strong> per player</p>
            <p>📤 <strong>{totalDealt} cards</strong> dealt total</p>
            {setAside > 0 && <p>📦 <strong>{setAside} cards</strong> set aside (not dealt)</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🃏 Deck Configuration</CardTitle>
          <CardDescription>Default: 36 cards (12 of each type)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <CardCounter
              label="Alive"
              emoji="🐱"
              count={deckConfig.alive}
              max={36}
              colorClass="text-green-700"
              bgClass="bg-green-50 border-green-200"
              onChange={(v) => onDeckConfigChange({ ...deckConfig, alive: v })}
            />
            <CardCounter
              label="Dead"
              emoji="💀"
              count={deckConfig.dead}
              max={36}
              colorClass="text-gray-700"
              bgClass="bg-gray-50 border-gray-200"
              onChange={(v) => onDeckConfigChange({ ...deckConfig, dead: v })}
            />
            <CardCounter
              label="Schrödinger"
              emoji="⚡"
              count={deckConfig.schrodinger}
              max={36}
              colorClass="text-purple-700"
              bgClass="bg-purple-50 border-purple-200"
              onChange={(v) => onDeckConfigChange({ ...deckConfig, schrodinger: v })}
            />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Total: {totalDeck} cards in deck
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 border-muted">
        <CardHeader>
          <CardTitle>📖 Card Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-2 rounded bg-green-50">
            <span className="text-2xl">🐱</span>
            <div>
              <p className="font-semibold text-green-800">Alive Cat</p>
              <p className="text-sm text-green-700">Counts toward "Alive" bids</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded bg-gray-50">
            <span className="text-2xl">💀</span>
            <div>
              <p className="font-semibold text-gray-800">Dead Cat</p>
              <p className="text-sm text-gray-700">Counts toward "Dead" bids</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded bg-purple-50">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-semibold text-purple-800">Schrödinger Cat</p>
              <p className="text-sm text-purple-700">Counts toward BOTH "Alive" AND "Dead" bids, plus "Schrödinger" bids</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onStartGame} size="lg" className="w-full text-lg py-6">
        🎮 Start Game
      </Button>
    </div>
  );
}
