// Biddable card types (schrodinger is a bonus, not biddable)
export type BiddableType = 'alive' | 'dead' | 'emptyBox';
export type CardType = BiddableType | 'schrodinger';

export interface DeckConfig {
  alive: number;
  dead: number;
  emptyBox: number;
  schrodinger: number;
}

// Fixed deck — never changes
export const FIXED_DECK: DeckConfig = {
  alive: 20,
  dead: 20,
  emptyBox: 8,
  schrodinger: 4,
};

export interface Hand {
  alive: number;
  dead: number;
  emptyBox: number;
  schrodinger: number;
}

export interface GameState {
  numPlayers: number;
  cardsPerPlayer: number;
  myHand: Hand;
  revealedCards: Hand;
}

export interface Bid {
  count: number;
  type: BiddableType;
}

export interface BidAnalysis {
  bid: Bid;
  probability: number;
  recommendation: 'safe' | 'risky' | 'challenge';
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

function hypergeometricPMF(N: number, K: number, n: number, k: number): number {
  if (k < 0 || k > n || k > K || n - k > N - K) return 0;
  if (N === 0) return k === 0 ? 1 : 0;
  return (combinations(K, k) * combinations(N - K, n - k)) / combinations(N, n);
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
  const mapping: Record<number, number> = { 2: 8, 3: 7, 4: 6, 5: 5, 6: 4 };
  return mapping[numPlayers] ?? 5;
}

// How many cards in the deck qualify for a given bid type.
// alive/schrodinger cats both count toward "alive" bids.
// dead/schrodinger cats both count toward "dead" bids.
// emptyBox is straightforward.
export function getQualifyingInDeck(deck: DeckConfig, type: BiddableType): number {
  if (type === 'alive') return deck.alive + deck.schrodinger;
  if (type === 'dead') return deck.dead + deck.schrodinger;
  return deck.emptyBox;
}

export function getQualifyingInHand(hand: Hand, type: BiddableType): number {
  if (type === 'alive') return hand.alive + hand.schrodinger;
  if (type === 'dead') return hand.dead + hand.schrodinger;
  return hand.emptyBox;
}

// ─── Probability engine ────────────────────────────────────────────────────

export function calculateBidProbability(state: GameState, bid: Bid): number {
  const deck = FIXED_DECK;
  const { myHand, revealedCards, numPlayers, cardsPerPlayer } = state;

  const totalDeck = deck.alive + deck.dead + deck.emptyBox + deck.schrodinger;
  const myHandTotal = myHand.alive + myHand.dead + myHand.emptyBox + myHand.schrodinger;
  const revealedTotal =
    revealedCards.alive + revealedCards.dead + revealedCards.emptyBox + revealedCards.schrodinger;

  const knownTotal = myHandTotal + revealedTotal;
  const unknownTotal = Math.max(0, totalDeck - knownTotal);

  const otherPlayersCards = cardsPerPlayer * (numPlayers - 1);
  const cardsInOtherHands = Math.min(otherPlayersCards, unknownTotal);

  const myQualifying = getQualifyingInHand(myHand, bid.type);
  const revealedQualifying = getQualifyingInHand(revealedCards, bid.type);
  const totalQualifying = getQualifyingInDeck(deck, bid.type);
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

// ─── Bid sequence ──────────────────────────────────────────────────────────

// The canonical bid order is an infinite sequence of "rounds":
//   round r (1-indexed): alive×(2r-1), dead×(2r-1), alive×(2r), dead×(2r), emptyBox×r
//
// Examples:
//   r=1: 1 alive, 1 dead, 2 alive, 2 dead, 1 emptyBox
//   r=2: 3 alive, 3 dead, 4 alive, 4 dead, 2 emptyBox
//   r=3: 5 alive, 5 dead, 6 alive, 6 dead, 3 emptyBox
//   ...
//   r=13: 25 alive, 25 dead, 26 alive, 26 dead, 13 emptyBox  (last round)
//
// A bid is valid only if count ≤ numPlayers × cardsPerPlayer (total cards in play).

export interface BidSlot {
  count: number;
  type: BiddableType;
}

// Build the full ordered sequence of all possible bids (up to the table maximum).
export function buildBidSequence(maxCards: number): BidSlot[] {
  const sequence: BidSlot[] = [];
  for (let r = 1; ; r++) {
    const slots: BidSlot[] = [
      { count: 2 * r - 1, type: 'alive' },
      { count: 2 * r - 1, type: 'dead' },
      { count: 2 * r, type: 'alive' },
      { count: 2 * r, type: 'dead' },
      { count: r, type: 'emptyBox' },
    ];
    // Only include slots whose count is within the table maximum
    const valid = slots.filter((s) => s.count <= maxCards);
    if (valid.length === 0) break;
    sequence.push(...valid);
    // If the last slot in the round is already at or above the max, stop after this round
    if (slots[slots.length - 1].count >= maxCards) break;
  }
  return sequence;
}

// Returns the index in the sequence of the current bid (-1 if no current bid).
export function currentBidIndex(sequence: BidSlot[], currentBid: Bid | null): number {
  if (!currentBid) return -1;
  return sequence.findIndex(
    (s) => s.count === currentBid.count && s.type === currentBid.type,
  );
}

// Returns all bids that come strictly after the current bid in sequence order,
// each annotated with their probability.
export function getNextBidsInOrder(
  state: GameState,
  currentBid: Bid | null,
): BidAnalysis[] {
  const maxCards = state.numPlayers * state.cardsPerPlayer;
  const sequence = buildBidSequence(maxCards);
  const idx = currentBidIndex(sequence, currentBid);
  const remaining = sequence.slice(idx + 1);
  return remaining.map((slot) => analyzeBid(state, slot));
}

// ─── Scoreboard grid ───────────────────────────────────────────────────────

// A row in the scoreboard corresponds to one "round" r.
// Columns are always: alive(2r-1), dead(2r-1), alive(2r), dead(2r), emptyBox(r)
// A cell is null when its count exceeds maxCards.
export interface BidCell {
  slot: BidSlot;
  inPlay: boolean; // false when count > maxCards
}

export interface BidRow {
  round: number;
  cells: BidCell[];  // always length 5
}

export function buildBidRows(maxCards: number): BidRow[] {
  const rows: BidRow[] = [];
  for (let r = 1; r <= 13; r++) {
    const slots: BidSlot[] = [
      { count: 2 * r - 1, type: 'alive' },
      { count: 2 * r - 1, type: 'dead' },
      { count: 2 * r,     type: 'alive' },
      { count: 2 * r,     type: 'dead' },
      { count: r,         type: 'emptyBox' },
    ];
    const cells: BidCell[] = slots.map((s) => ({ slot: s, inPlay: s.count <= maxCards }));
    rows.push({ round: r, cells });
  }
  return rows;
}

// ─── Strategic advice ──────────────────────────────────────────────────────

export interface StrategicAdvice {
  bid: Bid;
  ownProb: number;
  // Average probability of the next (numPlayers - 1) bids after this one.
  // Low value = opponents likely to challenge before it returns to you.
  pressureScore: number;
  // Probability of the bid you'd face if all opponents raised (i.e. the bid
  // numPlayers - 1 slots after this one). High = safe even if it comes back.
  returnSafetyScore: number;
  // Combined strategic score in [0, 1]
  score: number;
  // Human-readable reason
  reason: string;
}

/**
 * Score every candidate bid after `currentBid` and return the top
 * `topN` strategic recommendations.
 *
 * Scoring rationale:
 *   score = 0.5 × ownProb  +  0.3 × pressureScore  +  0.2 × returnSafetyScore
 *
 *   • ownProb (50 %): primary concern — you don't want to lose a challenge.
 *   • pressureScore (30 %): average opponent bid probability after yours;
 *       LOW pressure = opponents are unlikely to raise = good for you.
 *       We invert: pressureScore = 1 − avgOpponentProb.
 *   • returnSafetyScore (20 %): probability of the bid you'd face if every
 *       opponent raises; HIGH = you can cope if the turn comes back.
 */
export function adviseBids(
  state: GameState,
  currentBid: Bid | null,
  topN = 3,
): StrategicAdvice[] {
  const maxCards = state.numPlayers * state.cardsPerPlayer;
  const sequence = buildBidSequence(maxCards);
  const startIdx = currentBidIndex(sequence, currentBid) + 1; // first valid next bid
  const opponents = state.numPlayers - 1;

  const results: StrategicAdvice[] = [];

  for (let i = startIdx; i < sequence.length; i++) {
    const slot = sequence[i];
    const ownProb = calculateBidProbability(state, slot);

    // The next `opponents` bids after this one (what opponents would raise to)
    const opponentSlots = sequence.slice(i + 1, i + 1 + opponents);
    const opponentProbs =
      opponentSlots.length > 0
        ? opponentSlots.map((s) => calculateBidProbability(state, s))
        : [];

    // pressureScore: inverted average opponent probability
    //   = how likely opponents are to get stuck / challenged on their raises
    const avgOpponentProb =
      opponentProbs.length > 0
        ? opponentProbs.reduce((a, b) => a + b, 0) / opponentProbs.length
        : 0;
    const pressureScore = 1 - avgOpponentProb;

    // returnSafetyScore: probability of the bid you'd face if all opponents raised
    const returnSlot = sequence[i + opponents] ?? null;
    const returnSafetyScore = returnSlot
      ? calculateBidProbability(state, returnSlot)
      : 0;

    const score =
      0.5 * ownProb + 0.3 * pressureScore + 0.2 * returnSafetyScore;

    // Build a concise reason string
    let reason: string;
    if (ownProb >= 0.7 && pressureScore >= 0.5) {
      reason = 'High chance + opponents likely stuck';
    } else if (ownProb >= 0.7 && returnSafetyScore >= 0.5) {
      reason = 'High chance + safe if it returns';
    } else if (ownProb >= 0.7) {
      reason = 'High chance you win a challenge';
    } else if (ownProb >= 0.5 && pressureScore >= 0.6) {
      reason = 'Decent chance + heavy opponent pressure';
    } else if (ownProb >= 0.5) {
      reason = 'Reasonable chance, moderate risk';
    } else if (pressureScore >= 0.7) {
      reason = 'Risky for you, but very risky for opponents too';
    } else {
      reason = 'Low chance — may invite challenge';
    }

    results.push({ bid: slot, ownProb, pressureScore, returnSafetyScore, score, reason });
  }

  // Sort descending by score and return the top N
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}
