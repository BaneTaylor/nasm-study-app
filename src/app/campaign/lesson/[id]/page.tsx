"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getLesson,
  getNextLesson,
  getStageForLesson,
  getUnitForLesson,
  type Lesson,
  type LearnContent,
  type FlashcardContent,
  type QuizContent,
  type QuizQuestion,
  type ScenarioContent,
} from "@/lib/campaign/curriculum";
import {
  getLevelFromXp,
  calculateXpBonus,
  calculateMastery,
  getAdaptiveDifficulty,
  getReviewConcepts,
  type ConceptMastery,
} from "@/lib/campaign/adaptive-engine";

// =============================================================================
// Main Lesson Page
// =============================================================================

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [phase, setPhase] = useState<"active" | "complete">("active");
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpBonus, setXpBonus] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(0);
  const [newLevel, setNewLevel] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [stageComplete, setStageComplete] = useState(false);
  const [nextLessonData, setNextLessonData] = useState<Lesson | null>(null);
  const [animatedXp, setAnimatedXp] = useState(0);
  const [conceptMasteries, setConceptMasteries] = useState<ConceptMastery[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const l = getLesson(id);
    setLesson(l || null);
    const next = getNextLesson(id);
    setNextLessonData(next || null);

    // Load existing mastery data
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: mastery } = await supabase
          .from("concept_mastery")
          .select("*")
          .eq("user_id", user.id);

        if (mastery) {
          setConceptMasteries(
            mastery.map(
              (m: {
                concept_tag: string;
                times_seen: number;
                times_correct: number;
                mastery: number;
                last_seen_at: string;
              }) => ({
                conceptTag: m.concept_tag,
                timesSeen: m.times_seen,
                timesCorrect: m.times_correct,
                mastery: m.mastery,
                lastSeen: m.last_seen_at,
              })
            )
          );
        }

        // Check existing attempts
        const { data: progress } = await supabase
          .from("campaign_progress")
          .select("attempts")
          .eq("user_id", user.id)
          .eq("lesson_id", id)
          .single();

        if (progress) {
          setAttempts((progress.attempts || 0) + 1);
        }
      } catch {
        // Tables may not exist
      }
      setLoading(false);
    }
    loadData();
  }, [id, supabase]);

  // Animate XP count-up
  useEffect(() => {
    if (phase !== "complete") return;
    const target = xpEarned + xpBonus;
    if (animatedXp >= target) return;

    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setTimeout(() => {
      setAnimatedXp((prev) => Math.min(prev, target));
      setAnimatedXp(Math.min(animatedXp + step, target));
    }, 40);
    return () => clearTimeout(timer);
  }, [phase, animatedXp, xpEarned, xpBonus]);

  const handleLessonComplete = useCallback(
    async (finalScore: number) => {
      if (!lesson) return;

      const bonus = calculateXpBonus(finalScore, attempts);
      const totalXpForLesson = lesson.xpReward + bonus;
      setScore(finalScore);
      setXpEarned(lesson.xpReward);
      setXpBonus(bonus);
      setAnimatedXp(0);

      // Save to Supabase
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setPhase("complete");
          return;
        }

        // Get total XP before this lesson
        const { data: allProgress } = await supabase
          .from("campaign_progress")
          .select("xp_earned, completed")
          .eq("user_id", user.id);

        const currentTotalXp = (allProgress || [])
          .filter((p: { completed: boolean }) => p.completed)
          .reduce(
            (sum: number, p: { xp_earned: number }) => sum + p.xp_earned,
            0
          );

        const oldLevel = getLevelFromXp(currentTotalXp);
        const newLevelInfo = getLevelFromXp(
          currentTotalXp + totalXpForLesson
        );

        if (newLevelInfo.level > oldLevel.level) {
          setLevelUp(true);
          setPrevLevel(oldLevel.level);
          setNewLevel(newLevelInfo.level);
        }

        // Upsert campaign progress
        await supabase.from("campaign_progress").upsert(
          {
            user_id: user.id,
            lesson_id: lesson.id,
            completed: true,
            score: finalScore,
            xp_earned: totalXpForLesson,
            attempts,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" }
        );

        // Check if stage is complete
        const stage = getStageForLesson(lesson.id);
        if (stage) {
          const allStageComplete = stage.lessons.every((l) => {
            if (l.id === lesson.id) return true;
            const existing = (allProgress || []).find(
              (p: { lesson_id?: string; completed: boolean }) =>
                false // we stored lesson_id in campaign_progress
            );
            return false;
          });

          // Simple check: see if all other stage lessons are done
          const { data: stageProgress } = await supabase
            .from("campaign_progress")
            .select("lesson_id, completed")
            .eq("user_id", user.id)
            .in(
              "lesson_id",
              stage.lessons.map((l) => l.id)
            );

          const completedIds = new Set(
            (stageProgress || [])
              .filter((p: { completed: boolean }) => p.completed)
              .map((p: { lesson_id: string }) => p.lesson_id)
          );
          completedIds.add(lesson.id); // this one too

          if (completedIds.size >= stage.lessons.length) {
            setStageComplete(true);
          }
        }
      } catch {
        // Continue even if save fails
      }

      setPhase("complete");
    },
    [lesson, attempts, supabase]
  );

  const updateConceptMastery = useCallback(
    async (conceptTag: string, correct: boolean) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: existing } = await supabase
          .from("concept_mastery")
          .select("*")
          .eq("user_id", user.id)
          .eq("concept_tag", conceptTag)
          .single();

        const seen = (existing?.times_seen || 0) + 1;
        const correctCount =
          (existing?.times_correct || 0) + (correct ? 1 : 0);
        const mastery = calculateMastery(seen, correctCount);

        await supabase.from("concept_mastery").upsert(
          {
            user_id: user.id,
            concept_tag: conceptTag,
            times_seen: seen,
            times_correct: correctCount,
            mastery,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "user_id,concept_tag" }
        );
      } catch {
        // Silently fail
      }
    },
    [supabase]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Lesson not found</p>
          <Link
            href="/campaign"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Back to Campaign
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Completion Screen
  // ---------------------------------------------------------------------------
  if (phase === "complete") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Celebration header */}
          {stageComplete ? (
            <div>
              <div className="text-6xl mb-3 animate-bounce">🏆</div>
              <h1 className="text-3xl font-bold text-white">
                Stage Complete!
              </h1>
              <p className="text-gray-400 mt-1">
                You crushed it. On to the next challenge!
              </p>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-3">🎉</div>
              <h1 className="text-2xl font-bold text-white">
                Lesson Complete!
              </h1>
              <p className="text-gray-400 mt-1">{lesson.title}</p>
            </div>
          )}

          {/* Score */}
          {score > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                Score
              </p>
              <p className="text-4xl font-bold text-white">{score}%</p>
            </div>
          )}

          {/* XP earned — animated counter */}
          <div className="bg-gradient-to-br from-blue-600/10 via-gray-900 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
              XP Earned
            </p>
            <p className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              +{animatedXp}
            </p>
            {xpBonus > 0 && (
              <p className="text-xs text-green-400 mt-2">
                Includes +{xpBonus} bonus XP!
              </p>
            )}
          </div>

          {/* Level up */}
          {levelUp && (
            <div className="bg-gradient-to-br from-amber-600/10 via-gray-900 to-amber-600/5 border border-amber-500/30 rounded-2xl p-5 animate-pulse">
              <div className="text-4xl mb-2">⬆️</div>
              <p className="text-amber-400 font-bold text-lg">Level Up!</p>
              <p className="text-gray-400 text-sm">
                Level {prevLevel} → Level {newLevel}
              </p>
              <p className="text-amber-300 text-sm font-medium mt-1">
                {getLevelFromXp(0).title !==
                  getLevelFromXp(
                    /* compute xp for newLevel — just show the new title */
                    0
                  ).title && getLevelFromXp(newLevel * 100).title}
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="space-y-3 pt-2">
            {nextLessonData ? (
              <Link
                href={`/campaign/lesson/${nextLessonData.id}`}
                className="block w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] text-center"
              >
                Continue to Next Lesson
              </Link>
            ) : (
              <div className="py-3 text-green-400 font-medium">
                You have completed all available lessons!
              </div>
            )}
            <Link
              href="/campaign"
              className="block w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-center"
            >
              Back to Campaign Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Active lesson — render by type
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-950">
      {lesson.type === "learn" && (
        <LearnMode
          lesson={lesson}
          onComplete={handleLessonComplete}
        />
      )}
      {lesson.type === "flashcards" && (
        <FlashcardsMode
          lesson={lesson}
          onComplete={handleLessonComplete}
        />
      )}
      {lesson.type === "quiz" && (
        <QuizMode
          lesson={lesson}
          conceptMasteries={conceptMasteries}
          onComplete={handleLessonComplete}
          updateConceptMastery={updateConceptMastery}
        />
      )}
      {lesson.type === "scenario" && (
        <ScenarioMode
          lesson={lesson}
          onComplete={handleLessonComplete}
          updateConceptMastery={updateConceptMastery}
        />
      )}
      {lesson.type === "review" && (
        <ReviewMode
          lesson={lesson}
          conceptMasteries={conceptMasteries}
          onComplete={handleLessonComplete}
          updateConceptMastery={updateConceptMastery}
        />
      )}
    </div>
  );
}

// =============================================================================
// LEARN MODE
// =============================================================================

function LearnMode({
  lesson,
  onComplete,
}: {
  lesson: Lesson;
  onComplete: (score: number) => void;
}) {
  const content = lesson.content as LearnContent | undefined;
  const sections = content?.sections || [];
  const [currentSection, setCurrentSection] = useState(0);

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-gray-400">No content available.</p>
          <button
            onClick={() => onComplete(100)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl"
          >
            Mark Complete
          </button>
        </div>
      </div>
    );
  }

  const section = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;
  const isLast = currentSection === sections.length - 1;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-gray-950">
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/campaign"
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            ✕ Close
          </Link>
          <span className="text-gray-500 text-xs">
            {currentSection + 1} / {sections.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-5 py-8">
        <div className="space-y-6 animate-in">
          <h2 className="text-2xl font-bold text-white leading-tight">
            {section.heading}
          </h2>

          <p className="text-gray-300 text-base leading-relaxed">
            {section.body}
          </p>

          {/* Key point highlight */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 text-sm mt-0.5">💡</span>
              <p className="text-blue-300 text-sm font-medium leading-relaxed">
                {section.keyPoint}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-gray-950/90 backdrop-blur-sm border-t border-gray-800/60 p-4 pb-6">
        <div className="max-w-xl mx-auto flex gap-3">
          {currentSection > 0 && (
            <button
              onClick={() => setCurrentSection((p) => p - 1)}
              className="px-5 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors min-h-[48px]"
            >
              Back
            </button>
          )}
          {isLast ? (
            <button
              onClick={() => onComplete(100)}
              className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] min-h-[48px]"
            >
              I understand, continue
            </button>
          ) : (
            <button
              onClick={() => setCurrentSection((p) => p + 1)}
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] min-h-[48px]"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FLASHCARDS MODE
// =============================================================================

function FlashcardsMode({
  lesson,
  onComplete,
}: {
  lesson: Lesson;
  onComplete: (score: number) => void;
}) {
  const content = lesson.content as FlashcardContent | undefined;
  const cards = content?.cards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [ratings, setRatings] = useState<
    Record<number, "nailed" | "kinda" | "missed">
  >({});

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-gray-400">No flashcards available.</p>
          <button
            onClick={() => onComplete(100)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const card = currentIndex < cards.length ? cards[currentIndex] : null;
  const progress = (Object.keys(ratings).length / cards.length) * 100;
  const done = Object.keys(ratings).length === cards.length;

  function handleRate(rating: "nailed" | "kinda" | "missed") {
    setRatings((prev) => ({ ...prev, [currentIndex]: rating }));
    setAnimating(true);
    setTimeout(() => {
      setFlipped(false);
      setAnimating(false);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((p) => p + 1);
      } else {
        // Done with all cards
        const allRatings = { ...ratings, [currentIndex]: rating };
        const nailed = Object.values(allRatings).filter(
          (r) => r === "nailed"
        ).length;
        const kinda = Object.values(allRatings).filter(
          (r) => r === "kinda"
        ).length;
        const score = Math.round(
          ((nailed * 1 + kinda * 0.5) / cards.length) * 100
        );
        onComplete(score);
      }
    }, 300);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress */}
      <div className="sticky top-0 z-10 bg-gray-950">
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/campaign"
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            ✕ Close
          </Link>
          <span className="text-gray-500 text-xs">
            {Math.min(currentIndex + 1, cards.length)} / {cards.length}
          </span>
        </div>
      </div>

      {/* Card */}
      {card && (
        <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-5 py-8">
          <div
            onClick={() => !animating && setFlipped(!flipped)}
            className={`cursor-pointer select-none transition-all duration-300 ${
              animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
            style={{ perspective: "1000px" }}
          >
            <div
              className="relative transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className="rounded-2xl min-h-[320px] flex flex-col"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="bg-gradient-to-br from-blue-600/20 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col shadow-2xl shadow-blue-900/10">
                  <div className="px-5 pt-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-600">
                      Term
                    </span>
                  </div>
                  <div className="mx-5 mt-3 h-px bg-gradient-to-r from-blue-500/30 via-gray-700 to-transparent" />
                  <div className="flex-1 flex items-center justify-center px-8 py-8">
                    <h2 className="text-2xl font-bold text-white text-center leading-snug">
                      {card.term}
                    </h2>
                  </div>
                  <div className="pb-5 text-center">
                    <span className="text-gray-600 text-xs">
                      Tap to reveal definition
                    </span>
                  </div>
                </div>
              </div>

              {/* Back */}
              <div
                className="rounded-2xl min-h-[320px] flex flex-col absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="bg-gradient-to-br from-green-600/15 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col shadow-2xl shadow-green-900/10">
                  <div className="px-5 pt-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-600">
                      Definition
                    </span>
                  </div>
                  <div className="mx-5 mt-3 h-px bg-gradient-to-r from-green-500/30 via-gray-700 to-transparent" />
                  <div className="px-6 pt-5">
                    <p className="text-sm font-semibold text-white/60">
                      {card.term}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center px-6 py-4">
                    <p className="text-base text-gray-200 leading-relaxed">
                      {card.definition}
                    </p>
                  </div>
                  <div className="pb-5 text-center">
                    <span className="text-gray-600 text-xs">
                      Rate your knowledge below
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating buttons */}
          {flipped && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              <button
                onClick={() => handleRate("missed")}
                className="py-4 bg-red-950/60 border border-red-800 text-red-400 rounded-xl hover:bg-red-900/40 transition-all text-sm font-semibold flex flex-col items-center gap-1 min-h-[48px]"
              >
                <span className="text-lg">✕</span>
                <span>Missed</span>
              </button>
              <button
                onClick={() => handleRate("kinda")}
                className="py-4 bg-yellow-950/60 border border-yellow-800 text-yellow-400 rounded-xl hover:bg-yellow-900/40 transition-all text-sm font-semibold flex flex-col items-center gap-1 min-h-[48px]"
              >
                <span className="text-lg">~</span>
                <span>Kinda</span>
              </button>
              <button
                onClick={() => handleRate("nailed")}
                className="py-4 bg-green-950/60 border border-green-800 text-green-400 rounded-xl hover:bg-green-900/40 transition-all text-sm font-semibold flex flex-col items-center gap-1 min-h-[48px]"
              >
                <span className="text-lg">✓</span>
                <span>Nailed It</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// QUIZ MODE
// =============================================================================

function QuizMode({
  lesson,
  conceptMasteries,
  onComplete,
  updateConceptMastery,
}: {
  lesson: Lesson;
  conceptMasteries: ConceptMastery[];
  onComplete: (score: number) => void;
  updateConceptMastery: (tag: string, correct: boolean) => Promise<void>;
}) {
  const content = lesson.content as QuizContent | undefined;
  const allQuestions = content?.questions || [];

  // Filter by adaptive difficulty
  const difficulty = getAdaptiveDifficulty(conceptMasteries);
  const questions = allQuestions.filter((q) => {
    if (difficulty === "easy") return q.difficulty === "easy";
    if (difficulty === "medium")
      return q.difficulty === "easy" || q.difficulty === "medium";
    return true;
  });

  // Fall back to all questions if filtered list is empty
  const activeQuestions = questions.length > 0 ? questions : allQuestions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; correct: boolean }[]
  >([]);
  const [failed, setFailed] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<QuizQuestion[]>([]);

  if (activeQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-gray-400">No quiz questions available.</p>
          <button
            onClick={() => onComplete(100)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const question = activeQuestions[currentIdx];
  const progress = ((currentIdx + 1) / activeQuestions.length) * 100;
  const stage = getStageForLesson(lesson.id);
  const threshold = stage?.masteryThreshold || 70;

  function handleAnswer(optionIndex: number) {
    if (showExplanation) return;
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);

    const isCorrect = optionIndex === question.correctIndex;
    if (isCorrect) setCorrectCount((p) => p + 1);
    setAnswers((prev) => [
      ...prev,
      { questionId: question.id, correct: isCorrect },
    ]);

    // Update mastery
    updateConceptMastery(question.conceptTag, isCorrect);

    if (!isCorrect) {
      setMissedQuestions((prev) => [...prev, question]);
    }
  }

  function handleNext() {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx((p) => p + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete
      const score = Math.round(
        (correctCount / activeQuestions.length) * 100
      );
      // Account for the current correct answer if we haven't counted it yet
      const finalCorrect =
        selectedAnswer === question.correctIndex
          ? correctCount
          : correctCount;
      const finalScore = Math.round(
        (finalCorrect / activeQuestions.length) * 100
      );

      if (finalScore >= threshold) {
        onComplete(finalScore);
      } else {
        setFailed(true);
      }
    }
  }

  function handleRetry() {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrectCount(0);
    setAnswers([]);
    setFailed(false);
    setMissedQuestions([]);
  }

  // Failed screen
  if (failed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-3">📚</div>
            <h2 className="text-2xl font-bold text-white">
              Let&apos;s Review What You Missed
            </h2>
            <p className="text-gray-400 mt-2">
              You scored{" "}
              {Math.round((correctCount / activeQuestions.length) * 100)}% —
              need {threshold}% to pass
            </p>
          </div>

          <div className="space-y-4">
            {missedQuestions.map((q, i) => (
              <div
                key={q.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4"
              >
                <p className="text-white text-sm font-medium mb-2">
                  {q.question}
                </p>
                <p className="text-green-400 text-sm">
                  Correct: {q.options[q.correctIndex]}
                </p>
                <p className="text-gray-400 text-xs mt-2">{q.explanation}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleRetry}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all min-h-[48px]"
          >
            Try Again
          </button>
          <Link
            href="/campaign"
            className="block text-center text-gray-500 hover:text-gray-300 text-sm"
          >
            Back to Campaign
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress */}
      <div className="sticky top-0 z-10 bg-gray-950">
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/campaign"
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            ✕ Close
          </Link>
          <span className="text-gray-500 text-xs">
            {currentIdx + 1} / {activeQuestions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-5 py-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white leading-snug">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              let optionStyle =
                "bg-gray-900 border-gray-700 text-gray-200 hover:border-gray-500";
              if (showExplanation) {
                if (idx === question.correctIndex) {
                  optionStyle =
                    "bg-green-500/10 border-green-500/40 text-green-300";
                } else if (idx === selectedAnswer && idx !== question.correctIndex) {
                  optionStyle =
                    "bg-red-500/10 border-red-500/40 text-red-300";
                } else {
                  optionStyle =
                    "bg-gray-900/50 border-gray-800 text-gray-600";
                }
              } else if (selectedAnswer === idx) {
                optionStyle =
                  "bg-blue-500/10 border-blue-500/40 text-blue-300";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showExplanation}
                  className={`w-full text-left px-4 py-3.5 border rounded-xl transition-all text-sm font-medium min-h-[48px] ${optionStyle}`}
                >
                  <span className="text-gray-500 mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-300 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Next button */}
      {showExplanation && (
        <div className="sticky bottom-0 bg-gray-950/90 backdrop-blur-sm border-t border-gray-800/60 p-4 pb-6">
          <div className="max-w-xl mx-auto">
            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] min-h-[48px]"
            >
              {currentIdx < activeQuestions.length - 1
                ? "Next Question"
                : "See Results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SCENARIO MODE
// =============================================================================

function ScenarioMode({
  lesson,
  onComplete,
  updateConceptMastery,
}: {
  lesson: Lesson;
  onComplete: (score: number) => void;
  updateConceptMastery: (tag: string, correct: boolean) => Promise<void>;
}) {
  const content = lesson.content as ScenarioContent | undefined;
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-gray-400">No scenario available.</p>
          <button
            onClick={() => onComplete(100)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  function handleAnswer(idx: number) {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    const isCorrect = idx === content!.correctIndex;
    updateConceptMastery(content!.conceptTag, isCorrect);
  }

  const isCorrect = selectedAnswer === content.correctIndex;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800/60">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/campaign"
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            ✕ Close
          </Link>
          <span className="text-gray-500 text-xs">Scenario</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-auto w-full px-5 py-6 space-y-6">
        {/* Client card */}
        <div className="bg-gradient-to-br from-purple-600/10 via-gray-900 to-gray-900 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="text-white font-bold">{content.clientName}</p>
              <p className="text-gray-400 text-xs">
                Age {content.clientAge} | Goal: {content.clientGoal}
              </p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {content.clientBackground}
          </p>
        </div>

        {/* Question */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">
            {content.question}
          </h2>

          <div className="space-y-3">
            {content.options.map((option, idx) => {
              let optionStyle =
                "bg-gray-900 border-gray-700 text-gray-200 hover:border-gray-500";
              if (showResult) {
                if (idx === content.correctIndex) {
                  optionStyle =
                    "bg-green-500/10 border-green-500/40 text-green-300";
                } else if (
                  idx === selectedAnswer &&
                  idx !== content.correctIndex
                ) {
                  optionStyle =
                    "bg-red-500/10 border-red-500/40 text-red-300";
                } else {
                  optionStyle =
                    "bg-gray-900/50 border-gray-800 text-gray-600";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showResult}
                  className={`w-full text-left px-4 py-3.5 border rounded-xl transition-all text-sm font-medium min-h-[48px] ${optionStyle}`}
                >
                  <span className="text-gray-500 mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showResult && (
          <div
            className={`border rounded-xl p-4 ${
              isCorrect
                ? "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <p
              className={`font-semibold text-sm mb-2 ${
                isCorrect ? "text-green-400" : "text-red-400"
              }`}
            >
              {isCorrect ? "Correct!" : "Not quite."}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {content.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Continue */}
      {showResult && (
        <div className="sticky bottom-0 bg-gray-950/90 backdrop-blur-sm border-t border-gray-800/60 p-4 pb-6">
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => onComplete(isCorrect ? 100 : 50)}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] min-h-[48px]"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// REVIEW MODE
// =============================================================================

function ReviewMode({
  lesson,
  conceptMasteries,
  onComplete,
  updateConceptMastery,
}: {
  lesson: Lesson;
  conceptMasteries: ConceptMastery[];
  onComplete: (score: number) => void;
  updateConceptMastery: (tag: string, correct: boolean) => Promise<void>;
}) {
  // Build 10 review items from the unit's lessons (quiz questions + flashcards)
  const unit = getUnitForLesson(lesson.id);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [ready, setReady] = useState(false);

  type ReviewItem =
    | { type: "quiz"; question: QuizQuestion }
    | { type: "flashcard"; term: string; definition: string };

  useEffect(() => {
    if (!unit) return;

    const items: ReviewItem[] = [];

    // Prioritize concepts with lowest mastery
    const weakConcepts = getReviewConcepts(conceptMasteries, 10);
    const weakSet = new Set(weakConcepts);

    // Collect all quiz questions and flashcards from the unit
    const allQuizQuestions: QuizQuestion[] = [];
    const allFlashcards: { term: string; definition: string }[] = [];

    for (const stage of unit.stages) {
      for (const l of stage.lessons) {
        if (l.type === "quiz" && l.content) {
          const qc = l.content as QuizContent;
          allQuizQuestions.push(...qc.questions);
        }
        if (l.type === "flashcards" && l.content) {
          const fc = l.content as FlashcardContent;
          allFlashcards.push(...fc.cards);
        }
      }
    }

    // Add weak-concept questions first
    for (const q of allQuizQuestions) {
      if (weakSet.has(q.conceptTag) && items.length < 10) {
        items.push({ type: "quiz", question: q });
      }
    }

    // Fill remaining with mixed content
    const shuffled = [...allQuizQuestions].sort(() => Math.random() - 0.5);
    for (const q of shuffled) {
      if (items.length >= 10) break;
      if (!items.some((i) => i.type === "quiz" && i.question.id === q.id)) {
        items.push({ type: "quiz", question: q });
      }
    }

    // Add some flashcards if we still need items
    const shuffledCards = [...allFlashcards].sort(() => Math.random() - 0.5);
    for (const card of shuffledCards) {
      if (items.length >= 10) break;
      items.push({ type: "flashcard", ...card });
    }

    // Final shuffle
    items.sort(() => Math.random() - 0.5);

    setReviewItems(items.slice(0, 10));
    setReady(true);
  }, [unit, conceptMasteries]);

  if (!ready || reviewItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Preparing review...</p>
        </div>
      </div>
    );
  }

  const item = reviewItems[currentIdx];
  const progress = ((currentIdx + 1) / reviewItems.length) * 100;
  const isLast = currentIdx >= reviewItems.length - 1;

  function handleQuizAnswer(idx: number) {
    if (showResult || item.type !== "quiz") return;
    setSelectedAnswer(idx);
    setShowResult(true);
    const isCorrect = idx === item.question.correctIndex;
    if (isCorrect) setCorrectCount((p) => p + 1);
    updateConceptMastery(item.question.conceptTag, isCorrect);
  }

  function handleFlashcardRate(rating: "nailed" | "kinda" | "missed") {
    if (rating === "nailed") setCorrectCount((p) => p + 1);
    advance();
  }

  function advance() {
    if (isLast) {
      const finalScore = Math.round(
        ((correctCount + (showResult && selectedAnswer !== null &&
          item.type === "quiz" &&
          selectedAnswer === item.question.correctIndex
          ? 0
          : 0)) /
          reviewItems.length) *
          100
      );
      // Recalculate to be safe
      onComplete(
        Math.round((correctCount / reviewItems.length) * 100)
      );
    } else {
      setCurrentIdx((p) => p + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setFlipped(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress */}
      <div className="sticky top-0 z-10 bg-gray-950">
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/campaign"
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            ✕ Close
          </Link>
          <span className="text-amber-400 text-xs font-medium">
            Review {currentIdx + 1} / {reviewItems.length}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-5 py-8">
        {item.type === "quiz" ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white leading-snug">
              {item.question.question}
            </h2>
            <div className="space-y-3">
              {item.question.options.map((option, idx) => {
                let optionStyle =
                  "bg-gray-900 border-gray-700 text-gray-200 hover:border-gray-500";
                if (showResult) {
                  if (idx === item.question.correctIndex) {
                    optionStyle =
                      "bg-green-500/10 border-green-500/40 text-green-300";
                  } else if (
                    idx === selectedAnswer &&
                    idx !== item.question.correctIndex
                  ) {
                    optionStyle =
                      "bg-red-500/10 border-red-500/40 text-red-300";
                  } else {
                    optionStyle =
                      "bg-gray-900/50 border-gray-800 text-gray-600";
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={showResult}
                    className={`w-full text-left px-4 py-3.5 border rounded-xl transition-all text-sm font-medium min-h-[48px] ${optionStyle}`}
                  >
                    <span className="text-gray-500 mr-2">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
            {showResult && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 text-sm leading-relaxed">
                  {item.question.explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Flashcard review item */
          <div>
            <div
              onClick={() => setFlipped(!flipped)}
              className="cursor-pointer select-none"
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="rounded-2xl min-h-[280px] flex flex-col"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="bg-gradient-to-br from-amber-600/15 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col items-center justify-center px-8 py-8">
                    <span className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">
                      Review Term
                    </span>
                    <h2 className="text-2xl font-bold text-white text-center">
                      {item.term}
                    </h2>
                    <span className="text-gray-600 text-xs mt-6">
                      Tap to reveal
                    </span>
                  </div>
                </div>
                <div
                  className="rounded-2xl min-h-[280px] flex flex-col absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="bg-gradient-to-br from-green-600/10 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col justify-center px-8 py-8">
                    <p className="text-sm font-semibold text-white/60 mb-3">
                      {item.term}
                    </p>
                    <p className="text-base text-gray-200 leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {flipped && (
              <div className="grid grid-cols-3 gap-3 mt-5">
                <button
                  onClick={() => handleFlashcardRate("missed")}
                  className="py-4 bg-red-950/60 border border-red-800 text-red-400 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 min-h-[48px]"
                >
                  <span>Missed</span>
                </button>
                <button
                  onClick={() => handleFlashcardRate("kinda")}
                  className="py-4 bg-yellow-950/60 border border-yellow-800 text-yellow-400 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 min-h-[48px]"
                >
                  <span>Kinda</span>
                </button>
                <button
                  onClick={() => handleFlashcardRate("nailed")}
                  className="py-4 bg-green-950/60 border border-green-800 text-green-400 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 min-h-[48px]"
                >
                  <span>Nailed It</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next button (for quiz items) */}
      {showResult && item.type === "quiz" && (
        <div className="sticky bottom-0 bg-gray-950/90 backdrop-blur-sm border-t border-gray-800/60 p-4 pb-6">
          <div className="max-w-xl mx-auto">
            <button
              onClick={advance}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] min-h-[48px]"
            >
              {isLast ? "See Results" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
