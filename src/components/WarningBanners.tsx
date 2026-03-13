import { IconAlertTriangle } from '@tabler/icons-react';
import { GameState, Bid, computeWarnings, SituationalWarning } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface WarningBannersProps {
  gameState: GameState;
  currentBid: Bid | null;
}

export function WarningBanners({ gameState, currentBid }: WarningBannersProps) {
  const warnings = computeWarnings(gameState, currentBid);
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((w: SituationalWarning) => (
        <div
          key={w.key}
          className={cn(
            'flex items-start gap-2 rounded-lg border px-3 py-2 text-xs',
            w.severity === 'danger'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-amber-50 border-amber-300 text-amber-800',
          )}
        >
          <IconAlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}
