// Simplified SM-2 spaced repetition algorithm
// Returns the next review date based on rating and review count

type Rating = "didnt_know" | "kinda_knew" | "nailed_it";

export function getNextReviewDate(rating: Rating, reviewCount: number): Date {
  const now = new Date();
  let intervalMinutes: number;

  switch (rating) {
    case "didnt_know":
      // Show again soon — 5 minutes, then 30 min, then 2 hours
      intervalMinutes = reviewCount <= 1 ? 5 : reviewCount <= 2 ? 30 : 120;
      break;
    case "kinda_knew":
      // Medium spacing — 1 hour, 1 day, 3 days
      intervalMinutes =
        reviewCount <= 1 ? 60 : reviewCount <= 2 ? 1440 : 4320;
      break;
    case "nailed_it":
      // Long spacing — 1 day, 3 days, 7 days, 14 days, 30 days
      const nailedIntervals = [1440, 4320, 10080, 20160, 43200];
      intervalMinutes =
        nailedIntervals[Math.min(reviewCount, nailedIntervals.length - 1)];
      break;
  }

  return new Date(now.getTime() + intervalMinutes * 60 * 1000);
}
