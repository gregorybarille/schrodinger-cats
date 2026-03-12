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

// ─── Discard pile ──────────────────────────────────────────────────────────

export interface DiscardPile {
  alive: number;
  dead: number;
  emptyBox: number;
  schrodinger: number;
  unknown: number; // cards in the discard we haven't seen
}

export const EMPTY_DISCARD: DiscardPile = {
  alive: 0,
  dead: 0,
  emptyBox: 0,
  schrodinger: 0,
  unknown: 0,
};

// ─── Physicist Cats ────────────────────────────────────────────────────────

export type PhysicistId =
  | 'pounce'       // Cecilia Pounce-Gaposchkin — +2 alive cats
  | 'goeppert'     // Maria Goeppert-Meower — +1 box
  | 'purrie'       // Marie Purrie — discard all revealed alive
  | 'felidae'      // Michael Felidae — discard all revealed dead
  | 'feyncat'      // Richard Feyncat — Heisenberg don't count
  | 'prride'       // Sally Prride — look at discard pile
  | 'mewton'       // Sir Isaac Mewton — draw 2 cards
  | 'felinestein'  // Albert Felinestein — swap entire hand
  | 'pawking'      // Stephen Pawking — skip one turn
  | 'tabby';       // Neil deGrasse Tabby — copy a face-up physicist

export interface PhysicistCat {
  id: PhysicistId;
  name: string;
  shortName: string;
  effect: string;
}

export const PHYSICIST_CATS: PhysicistCat[] = [
  { id: 'pounce',      name: 'Cecilia Pounce-Gaposchkin', shortName: 'Pounce',      effect: '+2 alive cats' },
  { id: 'goeppert',    name: 'Maria Goeppert-Meower',     shortName: 'Goeppert',    effect: '+1 box' },
  { id: 'purrie',      name: 'Marie Purrie',              shortName: 'Purrie',      effect: 'Discard all revealed alive' },
  { id: 'felidae',     name: 'Michael Felidae',           shortName: 'Felidae',     effect: 'Discard all revealed dead' },
  { id: 'feyncat',     name: 'Richard Feyncat',           shortName: 'Feyncat',     effect: 'Heisenberg don\'t count' },
  { id: 'prride',      name: 'Sally Prride',              shortName: 'Prride',      effect: 'Look at discard pile' },
  { id: 'mewton',      name: 'Sir Isaac Mewton',          shortName: 'Mewton',      effect: 'Draw 2 cards' },
  { id: 'felinestein', name: 'Albert Felinestein',        shortName: 'Felinestein', effect: 'Swap entire hand' },
  { id: 'pawking',     name: 'Stephen Pawking',           shortName: 'Pawking',     effect: 'Skip one turn' },
  { id: 'tabby',       name: 'Neil deGrasse Tabby',       shortName: 'Tabby',       effect: 'Copy a face-up physicist' },
];

export function getPhysicist(id: PhysicistId): PhysicistCat {
  return PHYSICIST_CATS.find((p) => p.id === id)!;
}

export interface PhysicistState {
  myPhysicist: PhysicistId | null;
  myPhysicistPlayed: boolean;
  // Other physicists that have been played/revealed this round
  playedPhysicists: PhysicistId[];
  // Whether the next player (right after me) has an unrevealed physicist
  nextPlayerHasUnrevealedPhysicist: boolean;
}

export const EMPTY_PHYSICIST_STATE: PhysicistState = {
  myPhysicist: null,
  myPhysicistPlayed: false,
  playedPhysicists: [],
  nextPlayerHasUnrevealedPhysicist: true,
};

// ─── Game state ────────────────────────────────────────────────────────────

export interface GameState {
  numPlayers: number;
  cardsPerPlayer: number;
  myHand: Hand;
  revealedCards: Hand;
  discardPile: DiscardPile;
  physicistState: PhysicistState;
}

export interface Bid {
  count: number;
  type: BiddableType;
}

export interface BidAnalysis {
  bid: Bid;
  probability: number;
  adjustedProbability: number; // considering exchanges + physicist effects
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
  return numPlayers;
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

/**
 * Base probability: ignores exchanges and physicist effects.
 * Uses the cards we know about (hand, revealed, known discards) to determine
 * what's in the unknown pool, then runs hypergeometric.
 */
export function calculateBidProbability(state: GameState, bid: Bid): number {
  const deck = FIXED_DECK;
  const { myHand, revealedCards, discardPile, numPlayers, cardsPerPlayer } = state;

  const totalDeck = deck.alive + deck.dead + deck.emptyBox + deck.schrodinger;

  // Known cards: my hand + revealed + known discards (not unknown discards)
  const knownDiscards = discardPile.alive + discardPile.dead + discardPile.emptyBox + discardPile.schrodinger;
  const myHandTotal = myHand.alive + myHand.dead + myHand.emptyBox + myHand.schrodinger;
  const revealedTotal = revealedCards.alive + revealedCards.dead + revealedCards.emptyBox + revealedCards.schrodinger;

  // Cards removed from circulation: discards (known + unknown) are not in anyone's hand
  const totalDiscards = knownDiscards + discardPile.unknown;
  const cardsInPlay = Math.max(0, totalDeck - totalDiscards);

  const unknownTotal = Math.max(0, cardsInPlay - myHandTotal - revealedTotal);

  const otherPlayersCards = Math.max(0, cardsInPlay - myHandTotal - revealedTotal);
  const cardsInOtherHands = Math.min(cardsPerPlayer * (numPlayers - 1), otherPlayersCards);

  // Apply Feyncat: if played, schrodinger cards don't count toward alive/dead
  const feyncatActive = isPhysicistActive(state.physicistState, 'feyncat');

  // Apply Purrie: if played, revealed alive don't count
  const purrieActive = isPhysicistActive(state.physicistState, 'purrie');

  // Apply Felidae: if played, revealed dead don't count
  const felidaeActive = isPhysicistActive(state.physicistState, 'felidae');

  // Apply Pounce: +2 alive effective revealed
  const pounceActive = isPhysicistActive(state.physicistState, 'pounce');

  // Apply Goeppert: +1 box effective revealed
  const goeppertActive = isPhysicistActive(state.physicistState, 'goeppert');

  const myQualifying = getQualifyingInHandWithPhysicists(myHand, bid.type, feyncatActive);
  const revealedQualifying = getRevealedQualifyingWithPhysicists(
    revealedCards, bid.type, feyncatActive, purrieActive, felidaeActive, pounceActive, goeppertActive,
  );
  const totalQualifying = getQualifyingInDeckWithPhysicists(deck, bid.type, feyncatActive);
  const discardQualifying = getQualifyingInHandWithPhysicists(
    { alive: discardPile.alive, dead: discardPile.dead, emptyBox: discardPile.emptyBox, schrodinger: discardPile.schrodinger },
    bid.type,
    feyncatActive,
  );
  const unknownQualifying = Math.max(0, totalQualifying - myQualifying - revealedQualifying - discardQualifying);

  const needed = bid.count - myQualifying - revealedQualifying;
  if (needed <= 0) return 1;

  return hypergeometricCDF_geq(
    Math.max(0, unknownTotal),
    Math.min(unknownQualifying, unknownTotal),
    Math.min(cardsInOtherHands, unknownTotal),
    needed,
  );
}

/**
 * Exchange-adjusted probability: assumes that revealed cards were exchanged,
 * meaning the player who revealed alive cats likely discarded dead cats (and vice versa).
 * This shifts the pool composition.
 */
export function calculateExchangeAdjustedProbability(state: GameState, bid: Bid): number {
  const { revealedCards, discardPile } = state;

  // Estimate what was likely discarded based on reveals:
  //   - Revealed alive → probably discarded dead
  //   - Revealed dead → probably discarded alive
  //   - Revealed box/schrodinger → could be anything (no adjustment)
  const inferredDiscardedDead = revealedCards.alive;
  const inferredDiscardedAlive = revealedCards.dead;

  // Create an adjusted discard pile with the inferred discards added
  const adjustedDiscard: DiscardPile = {
    alive: discardPile.alive + inferredDiscardedAlive,
    dead: discardPile.dead + inferredDiscardedDead,
    emptyBox: discardPile.emptyBox,
    schrodinger: discardPile.schrodinger,
    // Reduce unknown by the amount we've now inferred (but don't go below 0)
    unknown: Math.max(0, discardPile.unknown - inferredDiscardedAlive - inferredDiscardedDead),
  };

  const adjustedState: GameState = {
    ...state,
    discardPile: adjustedDiscard,
  };

  return calculateBidProbability(adjustedState, bid);
}

// Physicist-aware qualifying helpers

function getQualifyingInDeckWithPhysicists(deck: DeckConfig, type: BiddableType, feyncatActive: boolean): number {
  if (feyncatActive) {
    // Schrodinger cards don't count
    if (type === 'alive') return deck.alive;
    if (type === 'dead') return deck.dead;
    return deck.emptyBox;
  }
  return getQualifyingInDeck(deck, type);
}

function getQualifyingInHandWithPhysicists(hand: Hand, type: BiddableType, feyncatActive: boolean): number {
  if (feyncatActive) {
    if (type === 'alive') return hand.alive;
    if (type === 'dead') return hand.dead;
    return hand.emptyBox;
  }
  return getQualifyingInHand(hand, type);
}

function getRevealedQualifyingWithPhysicists(
  revealed: Hand,
  type: BiddableType,
  feyncatActive: boolean,
  purrieActive: boolean,
  felidaeActive: boolean,
  pounceActive: boolean,
  goeppertActive: boolean,
): number {
  let count = getQualifyingInHandWithPhysicists(revealed, type, feyncatActive);

  // Purrie: revealed alive cats don't count
  if (purrieActive && type === 'alive') {
    count = Math.max(0, count - revealed.alive);
  }

  // Felidae: revealed dead cats don't count
  if (felidaeActive && type === 'dead') {
    count = Math.max(0, count - revealed.dead);
  }

  // Pounce: +2 alive
  if (pounceActive && type === 'alive') {
    count += 2;
  }

  // Goeppert: +1 box
  if (goeppertActive && type === 'emptyBox') {
    count += 1;
  }

  return count;
}

function isPhysicistActive(ps: PhysicistState, id: PhysicistId): boolean {
  // Active if it's my physicist and I've played it, or if another player played it
  if (ps.myPhysicist === id && ps.myPhysicistPlayed) return true;
  return ps.playedPhysicists.includes(id);
}

// Probability that a given unplayed physicist is still in the game
// (i.e. held by one of the other players, not set aside).
export function physicistInGameProbability(state: GameState): Map<PhysicistId, number> {
  const { numPlayers, physicistState } = state;
  const known: Set<PhysicistId> = new Set();

  if (physicistState.myPhysicist) known.add(physicistState.myPhysicist);
  physicistState.playedPhysicists.forEach((id) => known.add(id));

  const totalPhysicists = PHYSICIST_CATS.length; // 10
  const unknownPhysicists = totalPhysicists - known.size;
  // Slots held by other players (excluding mine)
  const otherPlayerSlots = numPlayers - 1;
  // Slots already accounted for by played physicists from other players
  const otherKnown = physicistState.playedPhysicists.length;
  const unknownOtherSlots = Math.max(0, otherPlayerSlots - otherKnown);

  const result = new Map<PhysicistId, number>();

  for (const cat of PHYSICIST_CATS) {
    if (known.has(cat.id)) {
      // Already known: probability is 1 if in play, but we skip these
      result.set(cat.id, 1);
    } else if (unknownPhysicists <= 0) {
      result.set(cat.id, 0);
    } else {
      // Probability that this specific unknown physicist is held by one of
      // the remaining unknown player slots
      const prob = Math.min(1, unknownOtherSlots / unknownPhysicists);
      result.set(cat.id, prob);
    }
  }

  return result;
}

export function analyzeBid(state: GameState, bid: Bid): BidAnalysis {
  const probability = calculateBidProbability(state, bid);
  const adjustedProbability = calculateExchangeAdjustedProbability(state, bid);
  let recommendation: 'safe' | 'risky' | 'challenge';
  // Use the worse of the two probabilities for the recommendation
  const worstCase = Math.min(probability, adjustedProbability);
  if (worstCase >= 0.6) recommendation = 'safe';
  else if (worstCase >= 0.4) recommendation = 'risky';
  else recommendation = 'challenge';
  return { bid, probability, adjustedProbability, recommendation };
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
  ownAdjustedProb: number;
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
 *   score = 0.45 × ownProb  +  0.15 × adjustedProb  +  0.25 × pressureScore  +  0.15 × returnSafetyScore
 *
 *   • ownProb (45 %): primary concern — you don't want to lose a challenge.
 *   • adjustedProb (15 %): exchange-adjusted probability.
 *   • pressureScore (25 %): average opponent bid probability after yours;
 *       LOW pressure = opponents are unlikely to raise = good for you.
 *       We invert: pressureScore = 1 − avgOpponentProb.
 *   • returnSafetyScore (15 %): probability of the bid you'd face if every
 *       opponent raises; HIGH = you can cope if the turn comes back.
 *
 * Additional modifiers from physicist cats:
 *   • If Felidae/Purrie are unplayed and could be in the game, applies a risk
 *     penalty to bids of the matching type.
 *   • If the next player has an unrevealed physicist, slight uncertainty penalty.
 */
export function adviseBids(
  state: GameState,
  currentBid: Bid | null,
  topN = 3,
): StrategicAdvice[] {
  const maxCards = state.numPlayers * state.cardsPerPlayer;
  const sequence = buildBidSequence(maxCards);
  const startIdx = currentBidIndex(sequence, currentBid) + 1;
  const opponents = state.numPlayers - 1;

  // Physicist risk factors
  const physicistProbs = physicistInGameProbability(state);
  const purrieRisk = isPhysicistActive(state.physicistState, 'purrie')
    ? 0 : (physicistProbs.get('purrie') ?? 0);
  const felidaeRisk = isPhysicistActive(state.physicistState, 'felidae')
    ? 0 : (physicistProbs.get('felidae') ?? 0);
  const nextPlayerUnknown = state.physicistState.nextPlayerHasUnrevealedPhysicist;

  const results: StrategicAdvice[] = [];

  for (let i = startIdx; i < sequence.length; i++) {
    const slot = sequence[i];
    const ownProb = calculateBidProbability(state, slot);
    const ownAdjustedProb = calculateExchangeAdjustedProbability(state, slot);

    const opponentSlots = sequence.slice(i + 1, i + 1 + opponents);
    const opponentProbs =
      opponentSlots.length > 0
        ? opponentSlots.map((s) => calculateBidProbability(state, s))
        : [];

    const avgOpponentProb =
      opponentProbs.length > 0
        ? opponentProbs.reduce((a, b) => a + b, 0) / opponentProbs.length
        : 0;
    const pressureScore = 1 - avgOpponentProb;

    const returnSlot = sequence[i + opponents] ?? null;
    const returnSafetyScore = returnSlot
      ? calculateBidProbability(state, returnSlot)
      : 0;

    let score =
      0.45 * ownProb + 0.15 * ownAdjustedProb + 0.25 * pressureScore + 0.15 * returnSafetyScore;

    // Physicist risk penalties
    // If Purrie is unplayed and could be in the game, alive bids are riskier
    if (slot.type === 'alive' && purrieRisk > 0) {
      score -= 0.1 * purrieRisk;
    }
    // If Felidae is unplayed and could be in the game, dead bids are riskier
    if (slot.type === 'dead' && felidaeRisk > 0) {
      score -= 0.1 * felidaeRisk;
    }
    // Next player has unknown physicist — slight uncertainty
    if (nextPlayerUnknown) {
      score -= 0.03;
    }

    score = Math.min(1, Math.max(0, score));

    // Build reason string
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

    // Append physicist warnings
    if (slot.type === 'alive' && purrieRisk > 0.3) {
      reason += ' · Purrie risk!';
    }
    if (slot.type === 'dead' && felidaeRisk > 0.3) {
      reason += ' · Felidae risk!';
    }
    if (Math.abs(ownProb - ownAdjustedProb) > 0.1) {
      reason += ' · Exchange shifts odds';
    }

    results.push({ bid: slot, ownProb, ownAdjustedProb, pressureScore, returnSafetyScore, score, reason });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}
