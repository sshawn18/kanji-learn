export interface SM2Card {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

export type ReviewRating = 0 | 1 | 2 | 3; // 0=Again, 1=Hard, 2=Good, 3=Easy

function addDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export function computeNextSM2(card: SM2Card, rating: ReviewRating): SM2Card {
  // Map 0-3 rating to SM-2's 0-5 quality scale
  const q = [0, 3, 4, 5][rating];

  if (q < 3) {
    // Failed review: reset
    return {
      easeFactor: Math.max(1.3, card.easeFactor - 0.2),
      interval: 1,
      repetitions: 0,
      nextReviewAt: addDays(1),
    };
  }

  // Compute new interval
  let newInterval: number;
  if (card.repetitions === 0) {
    newInterval = 1;
  } else if (card.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(card.interval * card.easeFactor);
  }

  // Update ease factor: EF' = EF + 0.1 - (5-q)*(0.08 + (5-q)*0.02)
  const newEF = Math.max(
    1.3,
    card.easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  return {
    easeFactor: newEF,
    interval: newInterval,
    repetitions: card.repetitions + 1,
    nextReviewAt: addDays(newInterval),
  };
}

export function isDue(card: SM2Card): boolean {
  return new Date() >= new Date(card.nextReviewAt);
}

/** Format a day interval into a human-readable label (like Anki's button hints). */
export function formatInterval(days: number): string {
  if (days < 1) return "< 1 day";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  const weeks = Math.round(days / 7);
  if (weeks === 1) return "1 wk";
  if (weeks < 5) return `${weeks} wks`;
  const months = Math.round(days / 30);
  if (months === 1) return "1 mo";
  return `${months} mo`;
}

/**
 * Preview what interval would be scheduled for each rating without mutating state.
 * Returns a display string like Anki's button hints.
 * `rating === 0` (Again) always returns "< 1 min" because the card is re-queued
 * immediately in the current session.
 */
export function previewNextInterval(card: SM2Card, rating: ReviewRating): string {
  if (rating === 0) return "< 1 min";
  const next = computeNextSM2(card, rating);
  return formatInterval(next.interval);
}
