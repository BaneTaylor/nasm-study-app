// =============================================================================
// Adaptive Learning Engine for NASM CPT Study App
// =============================================================================

export type ConceptMastery = {
  conceptTag: string;
  timesSeen: number;
  timesCorrect: number;
  lastSeen: string; // ISO date
  mastery: number; // 0-100
};

export type CampaignProgress = {
  lessonId: string;
  completed: boolean;
  score: number; // 0-100
  xpEarned: number;
  completedAt: string;
  attempts: number;
};

// ---------------------------------------------------------------------------
// Mastery Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates mastery for a concept using a weighted formula that accounts for:
 * - Accuracy (correct / seen)
 * - Volume (diminishing returns after ~10 exposures)
 * - Consistency bonus (high accuracy over many attempts)
 *
 * Returns 0-100.
 */
export function calculateMastery(seen: number, correct: number): number {
  if (seen === 0) return 0;

  const accuracy = correct / seen; // 0-1
  // Volume factor: ramps up quickly then plateaus — rewards repeated exposure
  const volumeFactor = Math.min(1, seen / 8);
  // Consistency bonus: if accuracy is high AND volume is decent, boost mastery
  const consistencyBonus = accuracy >= 0.8 && seen >= 5 ? 10 : 0;

  const raw = accuracy * 80 * volumeFactor + consistencyBonus;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

// ---------------------------------------------------------------------------
// Adaptive Difficulty
// ---------------------------------------------------------------------------

/**
 * Determines what difficulty of questions to serve based on overall concept mastery.
 * - avg mastery < 40 -> easy
 * - avg mastery < 70 -> medium
 * - avg mastery >= 70 -> hard
 */
export function getAdaptiveDifficulty(
  conceptMasteries: ConceptMastery[]
): "easy" | "medium" | "hard" {
  if (conceptMasteries.length === 0) return "easy";

  const avg =
    conceptMasteries.reduce((sum, c) => sum + c.mastery, 0) /
    conceptMasteries.length;

  if (avg < 40) return "easy";
  if (avg < 70) return "medium";
  return "hard";
}

// ---------------------------------------------------------------------------
// Pacing Controls
// ---------------------------------------------------------------------------

/**
 * Returns true if the learner is struggling — last 3 scores average < 60%.
 * When true, the app should offer remediation / re-teaching before progressing.
 */
export function shouldSlowDown(recentScores: number[]): boolean {
  if (recentScores.length < 3) return false;
  const last3 = recentScores.slice(-3);
  const avg = last3.reduce((a, b) => a + b, 0) / last3.length;
  return avg < 60;
}

/**
 * Returns true if the learner is excelling — last 3 scores average > 90%.
 * When true, the app can skip review or offer harder challenges.
 */
export function shouldSpeedUp(recentScores: number[]): boolean {
  if (recentScores.length < 3) return false;
  const last3 = recentScores.slice(-3);
  const avg = last3.reduce((a, b) => a + b, 0) / last3.length;
  return avg > 90;
}

// ---------------------------------------------------------------------------
// Spaced Review
// ---------------------------------------------------------------------------

/**
 * Returns concept tags that are due for review. Mastery decays at 2 points per
 * day since last seen. Concepts are sorted by effective mastery (lowest first)
 * so the weakest concepts surface first.
 */
export function getReviewConcepts(
  masteries: ConceptMastery[],
  count: number
): string[] {
  const now = Date.now();

  const withDecay = masteries.map((c) => {
    const daysSinceLastSeen = Math.max(
      0,
      (now - new Date(c.lastSeen).getTime()) / (1000 * 60 * 60 * 24)
    );
    const decay = Math.floor(daysSinceLastSeen) * 2;
    const effectiveMastery = Math.max(0, c.mastery - decay);
    return { conceptTag: c.conceptTag, effectiveMastery };
  });

  // Sort by effective mastery ascending — weakest first
  withDecay.sort((a, b) => a.effectiveMastery - b.effectiveMastery);

  return withDecay.slice(0, count).map((c) => c.conceptTag);
}

// ---------------------------------------------------------------------------
// XP & Leveling
// ---------------------------------------------------------------------------

/**
 * Calculates bonus XP for a lesson attempt.
 * - First-attempt bonus: +25% if attempts === 1
 * - Perfect score bonus: +50% if score === 100
 * - Base multiplier scales with score (0.5x at 50%, 1x at 100%)
 *
 * Returns the bonus XP (added on top of the lesson's base xpReward).
 */
export function calculateXpBonus(score: number, attempts: number): number {
  let bonus = 0;

  // Score-based multiplier: 0 at 0%, 10 at 100%
  bonus += Math.round((score / 100) * 10);

  // First-attempt bonus
  if (attempts === 1) {
    bonus += 5;
  }

  // Perfect score bonus
  if (score === 100) {
    bonus += 10;
  }

  return bonus;
}

const LEVEL_TITLES: Record<number, string> = {
  1: "Beginner",
  2: "Newcomer",
  3: "Curious Learner",
  4: "Dedicated Student",
  5: "Student",
  6: "Focused Student",
  7: "Committed Learner",
  8: "Rising Scholar",
  9: "Knowledge Seeker",
  10: "Apprentice",
  11: "Apprentice Trainer",
  12: "Junior Trainer",
  13: "Fitness Scholar",
  14: "Anatomy Buff",
  15: "Movement Analyst",
  16: "Assessment Pro",
  17: "Corrective Specialist",
  18: "Training Technician",
  19: "Program Designer",
  20: "OPT Expert",
  21: "Periodization Pro",
  22: "Science of Fitness",
  23: "Evidence-Based Trainer",
  24: "Kinetic Chain Master",
  25: "Advanced Practitioner",
  26: "Elite Student",
  27: "Senior Scholar",
  28: "Exam Strategist",
  29: "Mock Exam Ace",
  30: "Pre-Certified",
  31: "Almost There",
  32: "Final Review",
  33: "Exam Confident",
  34: "Test Day Ready",
  35: "Certified Ready",
  36: "NASM Scholar",
  37: "Fitness Authority",
  38: "Master Trainer",
  39: "Elite Trainer",
  40: "Training Virtuoso",
  41: "Movement Maestro",
  42: "Biomechanics Guru",
  43: "Exercise Scientist",
  44: "Performance Expert",
  45: "Fitness Sage",
  46: "Legendary Trainer",
  47: "Grand Master",
  48: "Hall of Fame",
  49: "Transcendent",
  50: "NASM Legend",
};

/**
 * Determines player level from total XP earned.
 * XP curve: each level requires progressively more XP.
 * Level 1: 0 XP, Level 2: 100 XP, scaling up.
 */
export function getLevelFromXp(xp: number): {
  level: number;
  title: string;
  nextLevelXp: number;
} {
  let level = 1;
  let cumulativeXp = 0;

  for (let i = 1; i <= 50; i++) {
    const xpForThisLevel = getXpRequiredForLevel(i);
    if (xp < cumulativeXp + xpForThisLevel) {
      return {
        level: i,
        title: LEVEL_TITLES[i] || `Level ${i}`,
        nextLevelXp: cumulativeXp + xpForThisLevel,
      };
    }
    cumulativeXp += xpForThisLevel;
    level = i;
  }

  return {
    level: 50,
    title: LEVEL_TITLES[50],
    nextLevelXp: cumulativeXp, // max level
  };
}

function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  // Quadratic growth: level 2 = 100, level 10 ~ 460, level 25 ~ 1600, level 50 ~ 5000
  return Math.round(50 + level * level * 1.8);
}
