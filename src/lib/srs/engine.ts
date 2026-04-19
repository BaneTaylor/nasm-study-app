// =============================================================================
// SM-2 Spaced Repetition Engine for NASM CPT Study App
// =============================================================================

export type SRSCard = {
  id: string;
  type: "flashcard" | "question" | "concept";
  sourceId: string; // flashcard_id or question_id
  difficulty: number; // 1-5 (1=easy, 5=hard)
  interval: number; // days until next review
  easeFactor: number; // SM-2 ease factor (starts at 2.5)
  repetitions: number; // number of successful reviews
  nextReview: Date;
  lastReview: Date | null;
};

export type ReviewRating = 1 | 2 | 3 | 4 | 5;
// 1 = Complete blackout, forgot everything
// 2 = Wrong, but recognized it when shown
// 3 = Wrong, but answer was on tip of tongue
// 4 = Correct, but required significant effort
// 5 = Correct, easy recall

export type NextReviewResult = {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: Date;
};

// ---------------------------------------------------------------------------
// Core SM-2 Algorithm
// ---------------------------------------------------------------------------

/**
 * Calculates the next review parameters using the SM-2 algorithm.
 *
 * - If rating < 3: reset repetitions to 0, interval to 1 day (lapse)
 * - If rating >= 3:
 *   - rep 0 -> interval = 1 day
 *   - rep 1 -> interval = 3 days
 *   - rep 2+ -> interval = previous interval * easeFactor
 * - EaseFactor adjustment:
 *   EF' = EF + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
 * - Minimum EF = 1.3
 */
export function calculateNextReview(
  card: SRSCard,
  rating: ReviewRating
): NextReviewResult {
  let { easeFactor, repetitions, interval } = card;

  // Adjust ease factor based on rating
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  let newInterval: number;
  let newRepetitions: number;

  if (rating < 3) {
    // Failed — reset to beginning
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Successful recall
    newRepetitions = repetitions + 1;

    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 3;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  // Compute next review date
  const now = new Date();
  const nextReview = new Date(
    now.getTime() + newInterval * 24 * 60 * 60 * 1000
  );

  return {
    interval: newInterval,
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    repetitions: newRepetitions,
    nextReview,
  };
}

// ---------------------------------------------------------------------------
// Queue & Metrics
// ---------------------------------------------------------------------------

/**
 * Returns cards where nextReview <= now, sorted by most overdue first.
 */
export function getDueCards(cards: SRSCard[]): SRSCard[] {
  const now = new Date();
  return cards
    .filter((c) => c.nextReview <= now)
    .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
}

/**
 * Returns the retention rate as a percentage (0-100).
 * Retention = cards with at least 1 successful review (repetitions > 0)
 * divided by total cards that have been reviewed at least once.
 */
export function getRetentionRate(cards: SRSCard[]): number {
  const reviewed = cards.filter((c) => c.lastReview !== null);
  if (reviewed.length === 0) return 0;

  const retained = reviewed.filter((c) => c.repetitions > 0);
  return Math.round((retained.length / reviewed.length) * 100);
}

/**
 * Returns the number of cards due today (nextReview <= end of today).
 */
export function getDailyReviewCount(cards: SRSCard[]): number {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return cards.filter((c) => c.nextReview <= endOfToday).length;
}

/**
 * Returns a forecast of upcoming reviews for the next N days.
 */
export function getUpcomingReviews(
  cards: SRSCard[],
  days: number
): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() + d);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = cards.filter(
      (c) => c.nextReview >= dayStart && c.nextReview <= dayEnd
    ).length;

    result.push({
      date: dayStart.toISOString().split("T")[0],
      count,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Utility: Convert rating to ReviewRating from quiz correctness
// ---------------------------------------------------------------------------

/**
 * Auto-rates a quiz question based on correctness and response time.
 * - Wrong answer: 2 (recognized when shown)
 * - Correct but slow (>10s): 4 (effort required)
 * - Correct and fast (<=10s): 5 (easy recall)
 */
export function autoRateQuizAnswer(
  correct: boolean,
  timeSpentSeconds: number
): ReviewRating {
  if (!correct) return 2;
  return timeSpentSeconds > 10 ? 4 : 5;
}
