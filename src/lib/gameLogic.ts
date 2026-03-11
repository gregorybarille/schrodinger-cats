export type CardType = 'alive' | 'dead' | 'schrodinger';

export interface DeckConfig {
  alive: number;
  dead: number;
  schrodinger: number;
}

export interface GameState {
  numPlayers: number;
  deckConfig: DeckConfig;
  cardsPerPlayer: number;
  myHand: { alive: number; dead: number; schrodinger: number };
  revealedCards: { alive: number; dead: number; schrodinger: number };
}

export interface Bid {
  count: number;
  type: CardType;
}

export interface BidAnalysis {
  bid: Bid;
  probability: number;
  recommendation: 'safe' | 'risky' | 'challenge';
}

function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

function hypergeometricPMF(N: number, K: number, n: number, k: number): number {
  if (k < 0 || k > n || k > K || n - k > N - K) return 0;
  if (N === 0) return k === 0 ? 1 : 0;
  return combinations(K, k) * combinations(N - K, n - k) / combinations(N, n);
}

function hypergeometricCDF_geq(N: number, K: number, n: number, minK: number): number {
  if (minK <= 0) return 1;
  if (N <= 0 || n <= 0) return 0;
  if (minK > Math.min(K, n)) return 0;
  
  let prob = 0;
  for (let k = minK; k <= Math.min(K, n); k++) {
    prob += hypergeometricPMF(N, K, n, k);
  }
  return Math.min(1, Math.max(0, prob));
}

export function getCardsPerPlayer(numPlayers: number): number {
  const mapping: Record<number, number> = {
    2: 8, 3: 7, 4: 6, 5: 5, 6: 4
  };
  return mapping[numPlayers] ?? 5;
}

export function getQualifyingInDeck(deckConfig: DeckConfig, type: CardType): number {
  if (type === 'alive') return deckConfig.alive + deckConfig.schrodinger;
  if (type === 'dead') return deckConfig.dead + deckConfig.schrodinger;
  return deckConfig.schrodinger;
}

export function getQualifyingInHand(
  hand: { alive: number; dead: number; schrodinger: number },
  type: CardType
): number {
  if (type === 'alive') return hand.alive + hand.schrodinger;
  if (type === 'dead') return hand.dead + hand.schrodinger;
  return hand.schrodinger;
}

export function calculateBidProbability(state: GameState, bid: Bid): number {
  const { deckConfig, myHand, revealedCards, numPlayers, cardsPerPlayer } = state;
  
  const totalDeck = deckConfig.alive + deckConfig.dead + deckConfig.schrodinger;
  const myHandTotal = myHand.alive + myHand.dead + myHand.schrodinger;
  const revealedTotal = revealedCards.alive + revealedCards.dead + revealedCards.schrodinger;
  
  const knownTotal = myHandTotal + revealedTotal;
  const unknownTotal = Math.max(0, totalDeck - knownTotal);
  
  const otherPlayersCards = cardsPerPlayer * (numPlayers - 1);
  const cardsInOtherHands = Math.min(otherPlayersCards, unknownTotal);
  
  const myQualifying = getQualifyingInHand(myHand, bid.type);
  const revealedQualifying = getQualifyingInHand(revealedCards, bid.type);
  const totalQualifying = getQualifyingInDeck(deckConfig, bid.type);
  const unknownQualifying = Math.max(0, totalQualifying - myQualifying - revealedQualifying);
  
  const needed = bid.count - myQualifying;
  
  if (needed <= 0) return 1;
  
  return hypergeometricCDF_geq(unknownTotal, unknownQualifying, cardsInOtherHands, needed);
}

export function analyzeBid(state: GameState, bid: Bid): BidAnalysis {
  const probability = calculateBidProbability(state, bid);
  let recommendation: 'safe' | 'risky' | 'challenge';
  
  if (probability >= 0.6) recommendation = 'safe';
  else if (probability >= 0.4) recommendation = 'risky';
  else recommendation = 'challenge';
  
  return { bid, probability, recommendation };
}

export function getNextPossibleBids(state: GameState, currentBid: Bid | null): BidAnalysis[] {
  const { deckConfig, numPlayers, cardsPerPlayer } = state;
  const totalQualifying = {
    alive: getQualifyingInDeck(deckConfig, 'alive'),
    dead: getQualifyingInDeck(deckConfig, 'dead'),
    schrodinger: deckConfig.schrodinger,
  };
  
  const maxPossible = numPlayers * cardsPerPlayer;
  const analyses: BidAnalysis[] = [];
  
  const types: CardType[] = ['alive', 'dead', 'schrodinger'];
  
  for (const type of types) {
    const max = Math.min(totalQualifying[type], maxPossible);
    const startCount = currentBid && type === currentBid.type ? currentBid.count + 1 : 1;
    
    for (let count = startCount; count <= max; count++) {
      analyses.push(analyzeBid(state, { count, type }));
    }
  }
  
  return analyses.sort((a, b) => b.probability - a.probability);
}
