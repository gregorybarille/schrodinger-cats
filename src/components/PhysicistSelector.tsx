import { IconFlask } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PhysicistState, PhysicistId, PhysicistActivation, PHYSICIST_CATS, GameState,
  physicistInGameProbability,
} from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface PhysicistSelectorProps {
  physicistState: PhysicistState;
  gameState: GameState;
  onChange: (ps: PhysicistState) => void;
}

const CYCLE: PhysicistActivation[] = ['idle', 'active', 'discarded'];

function nextActivation(current: PhysicistActivation): PhysicistActivation {
  return CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
}

function activationClasses(activation: PhysicistActivation): string {
  if (activation === 'active')    return 'bg-amber-500 hover:bg-amber-600 border-amber-500';
  if (activation === 'discarded') return 'bg-muted text-muted-foreground/50 border-muted line-through hover:bg-muted/80';
  return '';
}

export function PhysicistSelector({ physicistState, gameState, onChange }: PhysicistSelectorProps) {
  const { myPhysicist, physicistActivations, nextPlayerHasUnrevealedPhysicist } = physicistState;
  const inGameProbs = physicistInGameProbability(gameState);

  // All unknown physicists (not mine, not activated) share the same probability.
  const unknownPhysicists = PHYSICIST_CATS.filter((cat) => {
    if (cat.id === myPhysicist) return false;
    return (physicistActivations[cat.id] ?? 'idle') === 'idle';
  });
  const unknownProb = unknownPhysicists.length > 0
    ? (inGameProbs.get(unknownPhysicists[0].id) ?? 0)
    : 0;
  const unknownPct = Math.round(unknownProb * 100);

  // ── My physicist handlers ───────────────────────────────────────────────

  // Click an idle physicist in "My" section → claim it, set active.
  // Click the already-selected one → cycle its activation.
  // Cycling back to idle releases ownership.
  const handleMyClick = (id: PhysicistId) => {
    if (id !== myPhysicist) {
      // Switch to a new physicist: clear old one's activation, claim new one as active
      const newActivations = { ...physicistActivations };
      if (myPhysicist) delete newActivations[myPhysicist];
      newActivations[id] = 'active';
      onChange({ ...physicistState, myPhysicist: id, physicistActivations: newActivations });
    } else {
      // Cycle the current physicist
      const current = physicistActivations[id] ?? 'idle';
      const next = nextActivation(current);
      const newActivations = { ...physicistActivations };
      if (next === 'idle') {
        delete newActivations[id];
        onChange({ ...physicistState, myPhysicist: null, physicistActivations: newActivations });
      } else {
        newActivations[id] = next;
        onChange({ ...physicistState, physicistActivations: newActivations });
      }
    }
  };

  // ── Other physicist handlers ────────────────────────────────────────────

  const handleOtherClick = (id: PhysicistId) => {
    const current = physicistActivations[id] ?? 'idle';
    const next = nextActivation(current);
    const newActivations = { ...physicistActivations };
    if (next === 'idle') {
      delete newActivations[id];
    } else {
      newActivations[id] = next;
    }
    onChange({ ...physicistState, physicistActivations: newActivations });
  };

  const toggleNextPlayerUnrevealed = () => {
    onChange({ ...physicistState, nextPlayerHasUnrevealedPhysicist: !nextPlayerHasUnrevealedPhysicist });
  };

  const myActivation = myPhysicist ? (physicistActivations[myPhysicist] ?? 'idle') : 'idle';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <IconFlask size={20} />
          Physicist Cats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* ── My Physicist ── */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">My Physicist</p>
          <p className="text-xs text-muted-foreground mb-2">
            Tap to select · Tap again: active · Tap again: discarded · Tap again: reset
          </p>
          {myPhysicist ? (
            // Collapsed: show only the selected physicist, cycling through its states
            <Button
              variant={myActivation === 'idle' ? 'outline' : 'default'}
              size="sm"
              onClick={() => handleMyClick(myPhysicist)}
              title={`${PHYSICIST_CATS.find((c) => c.id === myPhysicist)?.name} — ${myActivation}`}
              className={cn('text-xs h-7 px-2', activationClasses(myActivation))}
            >
              {PHYSICIST_CATS.find((c) => c.id === myPhysicist)?.effect}
            </Button>
          ) : (
            // Expanded: pick which one is mine
            <div className="flex flex-wrap gap-1.5">
              {PHYSICIST_CATS.map((cat) => (
                <Button
                  key={cat.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleMyClick(cat.id)}
                  title={cat.name}
                  className="text-xs h-7 px-2"
                >
                  {cat.effect}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* ── Other Physicists ── */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Other Physicists</p>
          <p className="text-xs text-muted-foreground mb-2">
            Tap once: active this turn · Tap twice: discarded · Tap again: reset
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PHYSICIST_CATS.filter((p) => p.id !== myPhysicist).map((cat) => {
              const activation = physicistActivations[cat.id] ?? 'idle';
              return (
                <Button
                  key={cat.id}
                  variant={activation === 'idle' ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleOtherClick(cat.id)}
                  title={`${cat.name} — ${activation}`}
                  className={cn('text-xs h-7 px-2', activationClasses(activation))}
                >
                  {cat.effect}
                </Button>
              );
            })}
          </div>
          {unknownPhysicists.length > 0 && gameState.numPlayers < 10 && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Each unknown physicist:{' '}
              <span className="font-medium tabular-nums">{unknownPct}%</span> chance held by another player
            </p>
          )}
        </div>

        {/* ── Next player unrevealed physicist ── */}
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
