import { IconFlask } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PhysicistState, PhysicistId, PHYSICIST_CATS, GameState,
  physicistInGameProbability,
} from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface PhysicistSelectorProps {
  physicistState: PhysicistState;
  gameState: GameState;
  onChange: (ps: PhysicistState) => void;
}

export function PhysicistSelector({ physicistState, gameState, onChange }: PhysicistSelectorProps) {
  const { myPhysicist, myPhysicistPlayed, playedPhysicists, nextPlayerHasUnrevealedPhysicist } = physicistState;
  const inGameProbs = physicistInGameProbability(gameState);

  // All unknown physicist share the same probability — just pick any one.
  const unknownProb = (() => {
    const firstUnknown = PHYSICIST_CATS.find(
      (cat) => cat.id !== myPhysicist && !playedPhysicists.includes(cat.id),
    );
    return firstUnknown ? (inGameProbs.get(firstUnknown.id) ?? 0) : 0;
  })();
  const unknownPct = Math.round(unknownProb * 100);
  const unknownCount = PHYSICIST_CATS.filter(
    (cat) => cat.id !== myPhysicist && !playedPhysicists.includes(cat.id),
  ).length;

  const toggleMyPlayed = () => {
    onChange({ ...physicistState, myPhysicistPlayed: !myPhysicistPlayed });
  };

  const selectMyPhysicist = (id: PhysicistId | null) => {
    onChange({
      ...physicistState,
      myPhysicist: id,
      myPhysicistPlayed: false,
      playedPhysicists: id ? playedPhysicists.filter((p) => p !== id) : playedPhysicists,
    });
  };

  const toggleOtherPlayed = (id: PhysicistId) => {
    const isPlayed = playedPhysicists.includes(id);
    onChange({
      ...physicistState,
      playedPhysicists: isPlayed
        ? playedPhysicists.filter((p) => p !== id)
        : [...playedPhysicists, id],
    });
  };

  const toggleNextPlayerUnrevealed = () => {
    onChange({ ...physicistState, nextPlayerHasUnrevealedPhysicist: !nextPlayerHasUnrevealedPhysicist });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <IconFlask size={20} />
          Physicist Cats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* My physicist — when selected show only mine; otherwise show all */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">My Physicist</p>
          {myPhysicist ? (
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => selectMyPhysicist(null)}
                className="text-xs h-7 px-2"
                title={PHYSICIST_CATS.find((c) => c.id === myPhysicist)?.name}
              >
                {PHYSICIST_CATS.find((c) => c.id === myPhysicist)?.effect}
              </Button>
              <Button
                variant={myPhysicistPlayed ? 'default' : 'outline'}
                size="sm"
                onClick={toggleMyPlayed}
                className={cn('text-xs h-6 px-2', myPhysicistPlayed && 'bg-green-600 hover:bg-green-700')}
              >
                {myPhysicistPlayed ? 'Played' : 'Not played'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {PHYSICIST_CATS.map((cat) => (
                <Button
                  key={cat.id}
                  variant="outline"
                  size="sm"
                  onClick={() => selectMyPhysicist(cat.id)}
                  className="text-xs h-7 px-2"
                  title={cat.name}
                >
                  {cat.effect}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Other played physicists */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Other Played Physicists</p>
          <div className="flex flex-wrap gap-1.5">
            {PHYSICIST_CATS.filter((p) => p.id !== myPhysicist).map((cat) => {
              const isPlayed = playedPhysicists.includes(cat.id);
              return (
                <Button
                  key={cat.id}
                  variant={isPlayed ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleOtherPlayed(cat.id)}
                  className={cn('text-xs h-7 px-2', isPlayed && 'bg-purple-600 hover:bg-purple-700')}
                  title={cat.name}
                >
                  {cat.effect}
                </Button>
              );
            })}
          </div>
          {unknownCount > 0 && gameState.numPlayers < 10 && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Each unknown physicist:{' '}
              <span className="font-medium tabular-nums">{unknownPct}%</span> chance held by another player
            </p>
          )}
        </div>

        {/* Next player unrevealed physicist */}
        <div className="flex items-center gap-2">
          <Button
            variant={nextPlayerHasUnrevealedPhysicist ? 'default' : 'outline'}
            size="sm"
            onClick={toggleNextPlayerUnrevealed}
            className={cn('text-xs h-7 px-2', nextPlayerHasUnrevealedPhysicist && 'bg-amber-600 hover:bg-amber-700')}
          >
            {nextPlayerHasUnrevealedPhysicist ? 'Yes' : 'No'}
          </Button>
          <span className="text-xs text-muted-foreground">Next player has unrevealed physicist</span>
        </div>

      </CardContent>
    </Card>
  );
}
