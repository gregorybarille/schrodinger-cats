import { ReactNode } from 'react';
import { IconCat, IconSkull, IconBox, IconWand } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GameState, Bid, BidRow, BiddableType, StrategicAdvice,
  analyzeBid, adviseBids, buildBidRows, currentBidIndex, buildBidSequence,
} from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

// ─── Shared config ──────────────────────────────────────────────────────────

const typeIcon: Record<BiddableType, ReactNode> = {
  alive:    <IconCat   size={14} />,
  dead:     <IconSkull size={14} />,
  emptyBox: <IconBox   size={14} />,
};

const typeIconMd: Record<BiddableType, ReactNode> = {
  alive:    <IconCat   size={16} />,
  dead:     <IconSkull size={16} />,
  emptyBox: <IconBox   size={16} />,
};

const typeLabel: Record<BiddableType, string> = {
  alive:    'Alive',
  dead:     'Dead',
  emptyBox: 'Box',
};

const typeColor: Record<BiddableType, string> = {
  alive:    'text-green-700',
  dead:     'text-gray-600',
  emptyBox: 'text-orange-600',
};

const colHeaderBg = [
  'bg-green-100 text-green-800',
  'bg-gray-100 text-gray-700',
  'bg-green-100 text-green-800',
  'bg-gray-100 text-gray-700',
  'bg-orange-100 text-orange-700',
];

// ─── Shared props ────────────────────────────────────────────────────────────

interface BidPanelProps {
  gameState: GameState;
  currentBid: Bid | null;
  onBidChange: (bid: Bid | null) => void;
}

// ─── Prob bar ───────────────────────────────────────────────────────────────

function ProbBar({ probability, recommendation }: { probability: number; recommendation: string }) {
  const pct = Math.round(probability * 100);
  const barColor =
    recommendation === 'safe'  ? 'bg-green-500' :
    recommendation === 'risky' ? 'bg-yellow-500' :
                                 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold w-8 text-right tabular-nums">{pct}%</span>
    </div>
  );
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  if (recommendation === 'safe')
    return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs px-1.5">Safe</Badge>;
  if (recommendation === 'risky')
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs px-1.5">Risky</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-red-300 text-xs px-1.5">Challenge</Badge>;
}

function cellBg(probability: number): string {
  if (probability >= 0.6) return 'bg-green-200';
  if (probability >= 0.4) return 'bg-yellow-200';
  return 'bg-red-200';
}

// ─── Scoreboard table ────────────────────────────────────────────────────────

const COL_LABELS = ['Alive', 'Dead', 'Alive', 'Dead', 'Box'];

function Scoreboard({ gameState, currentBid, onBidChange }: BidPanelProps) {
  const maxCards = gameState.numPlayers * gameState.cardsPerPlayer;
  const rows: BidRow[] = buildBidRows(maxCards);
  const sequence = buildBidSequence(maxCards);
  const currentIdx = currentBidIndex(sequence, currentBid);

  const analysisMap = new Map<string, ReturnType<typeof analyzeBid>>();
  sequence.forEach((slot) => {
    analysisMap.set(`${slot.type}-${slot.count}`, analyzeBid(gameState, slot));
  });

  return (
    <table className="w-full text-center border-separate" style={{ borderSpacing: '2px' }}>
      <thead>
        <tr>
          {COL_LABELS.map((label, ci) => (
            <th key={ci} className={cn('text-xs font-semibold rounded px-1 py-0.5', colHeaderBg[ci])}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.round}>
            {row.cells.map((cell, ci) => {
              const { slot, inPlay } = cell;

              if (!inPlay) {
                return (
                  <td key={ci} className="p-0">
                    <div className="w-full rounded text-xs font-bold tabular-nums py-0.5 bg-muted/30 leading-tight">
                      <span className="block text-muted-foreground/40">{slot.count}</span>
                    </div>
                  </td>
                );
              }

              const key = `${slot.type}-${slot.count}`;
              const seqIdx = sequence.findIndex(
                (s) => s.count === slot.count && s.type === slot.type,
              );
              const analysis = analysisMap.get(key);
              const isCurrent =
                currentBid?.count === slot.count && currentBid?.type === slot.type;
              const isPast = seqIdx !== -1 && seqIdx < currentIdx;

              return (
                <td key={ci} className="p-0">
                  <button
                    onClick={() => onBidChange(isCurrent ? null : slot)}
                    title={`${slot.count}× ${typeLabel[slot.type]} — ${analysis ? Math.round(analysis.probability * 100) + '%' : ''}`}
                    className={cn(
                      'w-full rounded text-xs font-bold tabular-nums py-0.5 transition-all leading-tight',
                      analysis ? cellBg(analysis.probability) : 'bg-muted',
                      isPast && 'opacity-25',
                      isCurrent && 'ring-2 ring-offset-1 ring-indigo-600 opacity-100 scale-105 shadow-sm z-10 relative',
                    )}
                  >
                    <span className={cn('block', isPast ? 'text-gray-400' : typeColor[slot.type])}>
                      {slot.count}
                    </span>
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Scorecard card (goes inside main) ───────────────────────────────────────

export function BidScorecard({ gameState, currentBid, onBidChange }: BidPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center justify-between">
          Bid Scorecard
          {currentBid && (
            <Button variant="ghost" size="sm" onClick={() => onBidChange(null)} className="text-muted-foreground h-6 px-2 text-xs">
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <Scoreboard gameState={gameState} currentBid={currentBid} onBidChange={onBidChange} />
        <div className="flex items-center gap-3 mt-2 justify-center">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded bg-green-200" /> ≥60%
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded bg-yellow-200" /> 40–60%
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded bg-red-200" /> &lt;40%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Strategic advice panel (goes in side column) ────────────────────────────

export function StrategicAdvicePanel({ gameState, currentBid, onBidChange }: BidPanelProps) {
  const currentAnalysis = currentBid ? analyzeBid(gameState, currentBid) : null;
  const advice = adviseBids(gameState, currentBid, 3);

  return (
    <Card className="w-52">
      <CardHeader className="pb-2 pt-4 px-3">
        <CardTitle className="text-sm">Strategic advice</CardTitle>
        {currentAnalysis && (
          <div className="mt-1 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className={cn('text-xs font-semibold flex items-center gap-1', typeColor[currentAnalysis.bid.type])}>
                {typeIconMd[currentAnalysis.bid.type]}
                {currentAnalysis.bid.count}× {typeLabel[currentAnalysis.bid.type]}
              </span>
              <RecommendationBadge recommendation={currentAnalysis.recommendation} />
            </div>
            <ProbBar probability={currentAnalysis.probability} recommendation={currentAnalysis.recommendation} />
          </div>
        )}
        {!currentBid && (
          <p className="text-xs text-muted-foreground mt-1">
            Select a bid on the scorecard to see recommendations.
          </p>
        )}
      </CardHeader>
      {currentBid && advice.length > 0 && (
        <CardContent className="px-3 pb-3">
          <div className="space-y-2">
            {advice.map((item: StrategicAdvice, i: number) => {
              const bidAnalysis = analyzeBid(gameState, item.bid);
              const isTop = i === 0;
              return (
                <button
                  key={`${item.bid.type}-${item.bid.count}`}
                  onClick={() => onBidChange(item.bid)}
                  className={cn(
                    'w-full text-left rounded-md p-2 transition-colors border',
                    isTop
                      ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
                      : 'bg-muted/40 border-transparent hover:bg-muted',
                  )}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={cn('text-xs font-semibold flex items-center gap-1', typeColor[item.bid.type])}>
                      {typeIcon[item.bid.type]}
                      {item.bid.count}× {typeLabel[item.bid.type]}
                    </span>
                    <div className="flex items-center gap-1">
                      {isTop && <span className="text-xs text-indigo-600 font-semibold">★</span>}
                      <RecommendationBadge recommendation={bidAnalysis.recommendation} />
                    </div>
                  </div>
                  <ProbBar probability={item.ownProb} recommendation={bidAnalysis.recommendation} />
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{item.reason}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      )}
      {currentBid && advice.length === 0 && (
        <CardContent className="px-3 pb-3">
          <p className="text-muted-foreground text-xs">No further bids possible.</p>
        </CardContent>
      )}
    </Card>
  );
}

// Export the Schrödinger icon for use elsewhere
export { IconWand as SchrodingerIcon };
