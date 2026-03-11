import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameState, Bid, BidAnalysis, analyzeBid, getNextPossibleBids } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface ProbabilityDisplayProps {
  gameState: GameState;
  currentBid: Bid | null;
}

const typeEmoji: Record<string, string> = {
  alive: '🐱',
  dead: '💀',
  schrodinger: '⚡',
};

const typeLabel: Record<string, string> = {
  alive: 'Alive',
  dead: 'Dead',
  schrodinger: 'Schrödinger',
};

function ProbBar({ probability, recommendation }: { probability: number; recommendation: string }) {
  const pct = Math.round(probability * 100);
  const barColor =
    recommendation === 'safe' ? 'bg-green-500' :
    recommendation === 'risky' ? 'bg-yellow-500' :
    'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold w-12 text-right">{pct}%</span>
    </div>
  );
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  if (recommendation === 'safe') return <Badge className="bg-green-100 text-green-800 border-green-300">✅ Safe</Badge>;
  if (recommendation === 'risky') return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">⚠️ Risky</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-red-300">❌ Challenge</Badge>;
}

export function ProbabilityDisplay({ gameState, currentBid }: ProbabilityDisplayProps) {
  const [showAll, setShowAll] = useState(false);

  const currentAnalysis = currentBid ? analyzeBid(gameState, currentBid) : null;
  const nextBids = getNextPossibleBids(gameState, currentBid);
  const displayedBids = showAll ? nextBids : nextBids.slice(0, 10);

  return (
    <div className="space-y-4">
      {currentAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">📊 Current Bid Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">
                {typeEmoji[currentAnalysis.bid.type]} {currentAnalysis.bid.count}× {typeLabel[currentAnalysis.bid.type]}
              </span>
              <RecommendationBadge recommendation={currentAnalysis.recommendation} />
            </div>
            <ProbBar probability={currentAnalysis.probability} recommendation={currentAnalysis.recommendation} />
            <p className="text-sm text-muted-foreground">
              {currentAnalysis.recommendation === 'safe'
                ? 'This bid is likely true. Safe to let it stand.'
                : currentAnalysis.recommendation === 'risky'
                ? 'This bid is uncertain. Consider carefully.'
                : 'This bid is unlikely to be true. Consider challenging!'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">🔮 Possible Next Bids</CardTitle>
        </CardHeader>
        <CardContent>
          {nextBids.length === 0 ? (
            <p className="text-muted-foreground text-sm">No valid next bids available.</p>
          ) : (
            <div className="space-y-2">
              {displayedBids.map((analysis: BidAnalysis, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <span className="text-base w-6">{typeEmoji[analysis.bid.type]}</span>
                  <span className="font-medium text-sm w-28 shrink-0">
                    {analysis.bid.count}× {typeLabel[analysis.bid.type]}
                  </span>
                  <div className="flex-1">
                    <ProbBar probability={analysis.probability} recommendation={analysis.recommendation} />
                  </div>
                  <RecommendationBadge recommendation={analysis.recommendation} />
                </div>
              ))}
              {nextBids.length > 10 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm text-primary underline mt-2"
                >
                  {showAll ? 'Show fewer' : `Show all ${nextBids.length} bids`}
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
