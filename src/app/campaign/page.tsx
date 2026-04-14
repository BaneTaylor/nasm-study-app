"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  getCurriculum,
  getAllLessons,
  type Unit,
  type Stage,
  type Lesson,
} from "@/lib/campaign/curriculum";
import {
  getLevelFromXp,
  getReviewConcepts,
  type ConceptMastery,
  type CampaignProgress,
} from "@/lib/campaign/adaptive-engine";

// ---------------------------------------------------------------------------
// Color maps per unit theme
// ---------------------------------------------------------------------------

const unitColors: Record<
  string,
  {
    gradient: string;
    glow: string;
    border: string;
    text: string;
    bg: string;
    progressBar: string;
    dot: string;
    dotRing: string;
  }
> = {
  blue: {
    gradient: "from-blue-600/20 via-blue-900/10 to-transparent",
    glow: "shadow-blue-500/30",
    border: "border-blue-500/30",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    progressBar: "bg-blue-500",
    dot: "bg-blue-500",
    dotRing: "ring-blue-500/40",
  },
  purple: {
    gradient: "from-purple-600/20 via-purple-900/10 to-transparent",
    glow: "shadow-purple-500/30",
    border: "border-purple-500/30",
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    progressBar: "bg-purple-500",
    dot: "bg-purple-500",
    dotRing: "ring-purple-500/40",
  },
  green: {
    gradient: "from-green-600/20 via-green-900/10 to-transparent",
    glow: "shadow-green-500/30",
    border: "border-green-500/30",
    text: "text-green-400",
    bg: "bg-green-500/10",
    progressBar: "bg-green-500",
    dot: "bg-green-500",
    dotRing: "ring-green-500/40",
  },
  amber: {
    gradient: "from-amber-600/20 via-amber-900/10 to-transparent",
    glow: "shadow-amber-500/30",
    border: "border-amber-500/30",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    progressBar: "bg-amber-500",
    dot: "bg-amber-500",
    dotRing: "ring-amber-500/40",
  },
  rose: {
    gradient: "from-rose-600/20 via-rose-900/10 to-transparent",
    glow: "shadow-rose-500/30",
    border: "border-rose-500/30",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    progressBar: "bg-rose-500",
    dot: "bg-rose-500",
    dotRing: "ring-rose-500/40",
  },
  teal: {
    gradient: "from-teal-600/20 via-teal-900/10 to-transparent",
    glow: "shadow-teal-500/30",
    border: "border-teal-500/30",
    text: "text-teal-400",
    bg: "bg-teal-500/10",
    progressBar: "bg-teal-500",
    dot: "bg-teal-500",
    dotRing: "ring-teal-500/40",
  },
};

// ---------------------------------------------------------------------------
// Types for local state
// ---------------------------------------------------------------------------

type ProgressMap = Record<string, CampaignProgress>;

// ---------------------------------------------------------------------------
// Helper: lesson status
// ---------------------------------------------------------------------------

function getLessonStatus(
  lesson: Lesson,
  progressMap: ProgressMap,
  _stage: Stage
): "completed" | "current" | "locked" {
  const prog = progressMap[lesson.id];
  if (prog?.completed) return "completed";

  // Check prerequisites
  const prereqsMet =
    !lesson.prerequisites ||
    lesson.prerequisites.every((pid) => progressMap[pid]?.completed);

  if (prereqsMet) return "current";
  return "locked";
}

function getFirstUncompletedLesson(
  units: Unit[],
  progressMap: ProgressMap
): string | null {
  for (const unit of units) {
    for (const stage of unit.stages) {
      for (const lesson of stage.lessons) {
        const status = getLessonStatus(lesson, progressMap, stage);
        if (status === "current") return lesson.id;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Lesson type icons
// ---------------------------------------------------------------------------

const lessonTypeIcon: Record<string, string> = {
  learn: "📖",
  flashcards: "🗂️",
  quiz: "📝",
  scenario: "🎭",
  review: "🔄",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CampaignPage() {
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [conceptMasteries, setConceptMasteries] = useState<ConceptMastery[]>(
    []
  );
  const [totalXp, setTotalXp] = useState(0);
  const [reviewDue, setReviewDue] = useState<string[]>([]);
  const supabase = createClient();

  const units = getCurriculum();
  const allLessons = getAllLessons();

  const loadProgress = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch campaign progress
      const { data: progress } = await supabase
        .from("campaign_progress")
        .select("*")
        .eq("user_id", user.id);

      const map: ProgressMap = {};
      let xp = 0;
      for (const p of progress || []) {
        map[p.lesson_id] = {
          lessonId: p.lesson_id,
          completed: p.completed,
          score: p.score,
          xpEarned: p.xp_earned,
          completedAt: p.completed_at,
          attempts: p.attempts,
        };
        if (p.completed) xp += p.xp_earned;
      }
      setProgressMap(map);
      setTotalXp(xp);

      // Fetch concept mastery
      const { data: mastery } = await supabase
        .from("concept_mastery")
        .select("*")
        .eq("user_id", user.id);

      const masteries: ConceptMastery[] = (mastery || []).map(
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
      );
      setConceptMasteries(masteries);

      // Check for review-due concepts
      const dueForReview = getReviewConcepts(masteries, 5);
      setReviewDue(dueForReview.filter((_, i) => i < 3));
    } catch {
      // Tables may not exist yet — show fresh state
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Computed values
  const levelInfo = getLevelFromXp(totalXp);
  const completedCount = Object.values(progressMap).filter(
    (p) => p.completed
  ).length;
  const overallProgress =
    allLessons.length > 0
      ? Math.round((completedCount / allLessons.length) * 100)
      : 0;
  const nextLessonId = getFirstUncompletedLesson(units, progressMap);

  // Streak — simplified: count consecutive days with completions (placeholder)
  const streak = completedCount > 0 ? Math.min(completedCount, 7) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      {/* ----------------------------------------------------------------- */}
      {/* Player Stats Bar */}
      {/* ----------------------------------------------------------------- */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Level & Title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                {levelInfo.level}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {levelInfo.title}
                </p>
                <p className="text-gray-500 text-xs">
                  {totalXp} XP
                </p>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-3">
              {/* Streak */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-orange-400">🔥</span>
                <span className="text-gray-300 font-medium">{streak}</span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs font-medium">
                  {overallProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Review Due Floating Button */}
      {/* ----------------------------------------------------------------- */}
      {reviewDue.length > 0 && (
        <div className="sticky top-[72px] z-30 px-4 pt-2">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/campaign/lesson/u1-s2-l4"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Review Due — {reviewDue.length} concepts need practice
              <span className="ml-auto text-amber-500/60">→</span>
            </Link>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Continue Button */}
      {/* ----------------------------------------------------------------- */}
      {nextLessonId && (
        <div className="px-4 pt-4">
          <div className="max-w-2xl mx-auto">
            <Link
              href={`/campaign/lesson/${nextLessonId}`}
              className="block w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-center font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Continue Learning
            </Link>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Journey Map */}
      {/* ----------------------------------------------------------------- */}
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        {units.map((unit) => {
          const colors = unitColors[unit.color] || unitColors.blue;
          const unitLessons = unit.stages.flatMap((s) => s.lessons);
          const unitCompleted = unitLessons.filter(
            (l) => progressMap[l.id]?.completed
          ).length;
          const unitProgress =
            unitLessons.length > 0
              ? Math.round((unitCompleted / unitLessons.length) * 100)
              : 0;

          return (
            <div key={unit.id} className="relative">
              {/* Unit Header */}
              <div
                className={`relative rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-5 mb-4`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{unit.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white">
                      {unit.title}
                    </h2>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {unit.description}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.progressBar} rounded-full transition-all duration-700`}
                          style={{ width: `${unitProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {unitProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stages & Lessons */}
              <div className="space-y-4 pl-3">
                {unit.stages.map((stage, stageIndex) => (
                  <div key={stage.id}>
                    {/* Stage title */}
                    <div className="flex items-center gap-2 mb-3 ml-4">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}
                      />
                      <h3 className={`text-sm font-semibold ${colors.text}`}>
                        {stage.title}
                      </h3>
                      <span className="text-xs text-gray-600">
                        {stage.masteryThreshold}% to pass
                      </span>
                    </div>

                    {/* Lesson nodes */}
                    <div className="relative ml-6">
                      {/* Connecting line */}
                      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-800" />

                      <div className="space-y-1">
                        {stage.lessons.map((lesson, lessonIndex) => {
                          const status = getLessonStatus(
                            lesson,
                            progressMap,
                            stage
                          );
                          const isNext = lesson.id === nextLessonId;

                          return (
                            <div key={lesson.id} className="relative">
                              {isNext || status === "current" ? (
                                <Link
                                  href={`/campaign/lesson/${lesson.id}`}
                                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-900/60 transition-all group"
                                >
                                  <LessonNode
                                    status={status}
                                    isNext={isNext}
                                    colors={colors}
                                    type={lesson.type}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm font-medium ${
                                        isNext
                                          ? "text-white"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      {lesson.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {lesson.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">
                                      +{lesson.xpReward} XP
                                    </span>
                                    {isNext && (
                                      <span
                                        className={`text-xs ${colors.text} font-medium`}
                                      >
                                        Go →
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              ) : status === "completed" ? (
                                <Link
                                  href={`/campaign/lesson/${lesson.id}`}
                                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-900/60 transition-all group"
                                >
                                  <LessonNode
                                    status={status}
                                    isNext={false}
                                    colors={colors}
                                    type={lesson.type}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-400">
                                      {lesson.title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5 truncate">
                                      {lesson.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-green-500/60">
                                      {progressMap[lesson.id]?.score}%
                                    </span>
                                  </div>
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 p-3 rounded-xl opacity-50 cursor-not-allowed">
                                  <LessonNode
                                    status={status}
                                    isNext={false}
                                    colors={colors}
                                    type={lesson.type}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-600">
                                      {lesson.title}
                                    </p>
                                    <p className="text-xs text-gray-700 mt-0.5 truncate">
                                      {lesson.description}
                                    </p>
                                  </div>
                                  <span className="text-gray-700 text-xs">
                                    🔒
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stage separator */}
                    {stageIndex < unit.stages.length - 1 && (
                      <div className="my-3 ml-11 h-px bg-gray-800/50" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom padding for nav */}
      <div className="h-16" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson Node Component
// ---------------------------------------------------------------------------

function LessonNode({
  status,
  isNext,
  colors,
  type,
}: {
  status: "completed" | "current" | "locked";
  isNext: boolean;
  colors: (typeof unitColors)[string];
  type: string;
}) {
  if (status === "completed") {
    return (
      <div className="relative z-10 w-10 h-10 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center shrink-0">
        <svg
          className="w-5 h-5 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  }

  if (status === "current") {
    return (
      <div
        className={`relative z-10 w-10 h-10 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center shrink-0 ${
          isNext ? `ring-4 ${colors.dotRing} animate-pulse` : ""
        }`}
      >
        <span className="text-base">{lessonTypeIcon[type] || "📖"}</span>
      </div>
    );
  }

  // Locked
  return (
    <div className="relative z-10 w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center shrink-0">
      <svg
        className="w-4 h-4 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    </div>
  );
}
