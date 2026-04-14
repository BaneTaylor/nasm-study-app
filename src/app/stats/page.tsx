"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type {
  Profile,
  QuizResult,
  FlashcardProgress,
  StudySession,
} from "@/lib/types/database";

type StatsData = {
  profile: Profile | null;
  quizResults: QuizResult[];
  flashcardProgress: FlashcardProgress[];
  studySessions: StudySession[];
};

function calculateStudyStreak(
  quizResults: QuizResult[],
  flashcardProgress: FlashcardProgress[]
): number {
  const activityDates = new Set<string>();

  for (const qr of quizResults) {
    if (qr.completed_at) {
      activityDates.add(qr.completed_at.slice(0, 10));
    }
  }
  for (const fp of flashcardProgress) {
    if (fp.last_reviewed_at) {
      activityDates.add(fp.last_reviewed_at.slice(0, 10));
    }
  }

  if (activityDates.size === 0) return 0;

  const sorted = Array.from(activityDates).sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diffDays) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getChapterMastery(
  quizResults: QuizResult[]
): { chapter: number; avgScore: number; attempts: number }[] {
  const chapterMap = new Map<number, { total: number; count: number }>();

  for (const qr of quizResults) {
    if (qr.chapter !== null) {
      const existing = chapterMap.get(qr.chapter) || { total: 0, count: 0 };
      existing.total += qr.score;
      existing.count += 1;
      chapterMap.set(qr.chapter, existing);
    }
  }

  return Array.from(chapterMap.entries())
    .map(([chapter, data]) => ({
      chapter,
      avgScore: Math.round(data.total / data.count),
      attempts: data.count,
    }))
    .sort((a, b) => a.chapter - b.chapter);
}

function getBarColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function getBarGradient(score: number): string {
  if (score >= 80) return "linear-gradient(90deg, #10b981, #34d399)";
  if (score >= 60) return "linear-gradient(90deg, #3b82f6, #60a5fa)";
  if (score >= 40) return "linear-gradient(90deg, #f59e0b, #fbbf24)";
  return "linear-gradient(90deg, #ef4444, #f87171)";
}

function getReadinessInfo(avgScore: number): {
  label: string;
  color: string;
  glow: string;
  gradient: string;
} {
  if (avgScore >= 70)
    return {
      label: "On Track",
      color: "#10b981",
      glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      gradient: "from-emerald-900/40 to-emerald-800/20",
    };
  if (avgScore >= 50)
    return {
      label: "At Risk",
      color: "#f59e0b",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
      gradient: "from-amber-900/40 to-amber-800/20",
    };
  return {
    label: "Behind",
    color: "#ef4444",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
    gradient: "from-red-900/40 to-red-800/20",
  };
}

/* --- Circular Progress Ring --- */
function CircularProgress({
  percentage,
  size = 160,
  strokeWidth = 12,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(55, 65, 81, 0.5)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{percentage}%</span>
        <span className="text-xs text-gray-400 mt-1">Mastery</span>
      </div>
    </div>
  );
}

/* --- Skeleton Loader --- */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gray-800/60 rounded-xl animate-pulse ${className}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <SkeletonBlock className="w-32 h-4 mb-6" />
        {/* Hero skeleton */}
        <div className="bg-gray-900/50 rounded-2xl p-8 mb-6 flex flex-col items-center">
          <SkeletonBlock className="w-40 h-40 rounded-full mb-4" />
          <SkeletonBlock className="w-48 h-6 mb-2" />
          <SkeletonBlock className="w-32 h-4" />
        </div>
        {/* Cards row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-28" />
          ))}
        </div>
        {/* Chapter bars */}
        <SkeletonBlock className="h-64 mb-6" />
        {/* Learning + Habits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SkeletonBlock className="h-52" />
          <SkeletonBlock className="h-52" />
        </div>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [profileRes, quizRes, flashcardRes, sessionRes] = await Promise.all(
        [
          supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single(),
          supabase
            .from("quiz_results")
            .select("*")
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false }),
          supabase
            .from("flashcard_progress")
            .select("*")
            .eq("user_id", user.id),
          supabase
            .from("study_sessions")
            .select("*")
            .eq("user_id", user.id),
        ]
      );

      setData({
        profile: profileRes.data as Profile | null,
        quizResults: (quizRes.data as QuizResult[]) || [],
        flashcardProgress: (flashcardRes.data as FlashcardProgress[]) || [],
        studySessions: (sessionRes.data as StudySession[]) || [],
      });
      setLoading(false);
      // Trigger animations after paint
      requestAnimationFrame(() => setAnimateIn(true));
    }

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const hasData =
    data &&
    (data.quizResults.length > 0 ||
      data.flashcardProgress.length > 0 ||
      data.studySessions.length > 0);

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-flex items-center gap-1 touch-manipulation py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/80 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              No Stats Yet
            </h1>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Complete some quizzes or review flashcards to see your analytics here.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/quiz"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all touch-manipulation active:scale-95"
              >
                Take a Quiz
              </Link>
              <Link
                href="/flashcards"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all touch-manipulation active:scale-95"
              >
                Study Flashcards
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { profile, quizResults, flashcardProgress, studySessions } = data!;

  // Overall mastery
  const overallMastery =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum, qr) => sum + qr.score, 0) /
            quizResults.length
        )
      : 0;

  // Exam readiness
  const readiness = getReadinessInfo(overallMastery);
  const projectedScore = Math.min(100, Math.round(overallMastery * 1.05));

  // Days until exam
  const daysUntilExam = profile?.exam_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.exam_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  // Study streak
  const streak = calculateStudyStreak(quizResults, flashcardProgress);

  // --- Probability of Passing Calculation ---
  const TOTAL_CHAPTERS = 20;

  // 1. Score trend: compare last 10 vs first 10 quizzes
  const sortedByDate = [...quizResults].sort((a, b) =>
    (a.completed_at || "").localeCompare(b.completed_at || "")
  );
  const first10 = sortedByDate.slice(0, Math.min(10, sortedByDate.length));
  const last10 = sortedByDate.slice(Math.max(0, sortedByDate.length - 10));
  const first10Avg =
    first10.length > 0
      ? first10.reduce((s, q) => s + q.score, 0) / first10.length
      : 0;
  const last10Avg =
    last10.length > 0
      ? last10.reduce((s, q) => s + q.score, 0) / last10.length
      : 0;
  const scoreTrendDelta = last10Avg - first10Avg;
  const scoreTrendLabel =
    scoreTrendDelta > 3
      ? "Improving"
      : scoreTrendDelta < -3
      ? "Declining"
      : "Stable";

  // 2. Chapter coverage
  const chaptersWithQuiz = new Set(
    quizResults.filter((q) => q.chapter !== null).map((q) => q.chapter)
  );
  const chapterCoverage = chaptersWithQuiz.size;
  const coverageRatio = chapterCoverage / TOTAL_CHAPTERS;

  // 3. Consistency: study days in last 2 weeks
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000)
    .toISOString()
    .slice(0, 10);
  const recentActivityDates = new Set<string>();
  for (const qr of quizResults) {
    if (qr.completed_at && qr.completed_at.slice(0, 10) >= twoWeeksAgo) {
      recentActivityDates.add(qr.completed_at.slice(0, 10));
    }
  }
  for (const fp of flashcardProgress) {
    if (
      fp.last_reviewed_at &&
      fp.last_reviewed_at.slice(0, 10) >= twoWeeksAgo
    ) {
      recentActivityDates.add(fp.last_reviewed_at.slice(0, 10));
    }
  }
  const consistencyDays = recentActivityDates.size;
  const consistencyRatio = consistencyDays / 14;

  // 4. Score vs passing threshold (70%)
  const scoreVsThreshold = Math.min(overallMastery / 70, 1.3);

  // Weighted probability calculation
  const rawProbability =
    scoreVsThreshold * 0.4 +
    (coverageRatio > 0.5 ? coverageRatio : coverageRatio * 0.5) * 0.2 +
    consistencyRatio * 0.15 +
    (scoreTrendDelta > 0 ? Math.min(scoreTrendDelta / 20, 0.25) + 0.75 : Math.max(0.5 + scoreTrendDelta / 40, 0.25)) * 0.25;

  const passingProbability = Math.max(
    0,
    Math.min(99, Math.round(rawProbability * 100))
  );
  const probColor =
    passingProbability > 75
      ? "text-emerald-400"
      : passingProbability >= 50
      ? "text-amber-400"
      : "text-red-400";
  const probBgColor =
    passingProbability > 75
      ? "from-emerald-900/40 to-emerald-800/20"
      : passingProbability >= 50
      ? "from-amber-900/40 to-amber-800/20"
      : "from-red-900/40 to-red-800/20";
  const probGlow =
    passingProbability > 75
      ? "shadow-[0_0_30px_rgba(16,185,129,0.3)]"
      : passingProbability >= 50
      ? "shadow-[0_0_30px_rgba(245,158,11,0.3)]"
      : "shadow-[0_0_30px_rgba(239,68,68,0.3)]";

  // Chapter mastery
  const chapterMastery = getChapterMastery(quizResults);

  // Learning style
  const learningStyle = profile?.learning_style;

  // Study habits
  const totalQuizzes = quizResults.length;
  const avgQuizScore = overallMastery;
  const flashcardsReviewed = flashcardProgress.filter(
    (fp) => fp.review_count > 0
  ).length;
  const totalStudyMinutes = studySessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  // Smart alerts
  const weakChapters = chapterMastery.filter((c) => c.avgScore < 50);

  const LEARNING_STYLE_CONFIG = [
    { key: "visual" as const, label: "Visual", color: "#3b82f6", gradient: "from-blue-500 to-blue-600" },
    { key: "reading_writing" as const, label: "Reading/Writing", color: "#8b5cf6", gradient: "from-purple-500 to-purple-600" },
    { key: "active_recall" as const, label: "Active Recall", color: "#10b981", gradient: "from-emerald-500 to-emerald-600" },
    { key: "practical" as const, label: "Practical", color: "#f59e0b", gradient: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Back nav */}
        <Link
          href="/dashboard"
          className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-flex items-center gap-1 touch-manipulation py-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* ===== HERO SECTION ===== */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950/30 border border-gray-800/60 rounded-2xl p-6 sm:p-8 mb-6 flex flex-col items-center text-center">
          <CircularProgress percentage={animateIn ? overallMastery : 0} />
          <h1 className="text-2xl font-bold text-white mt-4">
            Stats &amp; Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {quizResults.length} {quizResults.length === 1 ? "quiz" : "quizzes"} completed
            {streak > 0 && (
              <span className="text-amber-400 ml-2">
                {streak} day streak
              </span>
            )}
          </p>
          <Link
            href="/share"
            className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 text-blue-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share Progress
          </Link>
        </div>

        {/* ===== TOP CARDS ROW ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Exam Readiness spans full width on sm+ */}
          {/* Exam Readiness — Enhanced with Probability of Passing */}
          <div
            className={`bg-gradient-to-br ${probBgColor} border border-gray-800/50 rounded-2xl p-5 ${probGlow} transition-shadow sm:col-span-3`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: readiness.color }}
              />
              <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">
                Exam Readiness
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <div className="shrink-0">
                <p className={`text-3xl sm:text-4xl font-bold ${probColor}`}>
                  {passingProbability}%
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  chance of passing based on your current trajectory
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm flex-1">
                <div className="flex items-center gap-2">
                  <span className={scoreTrendDelta > 3 ? "text-emerald-400" : scoreTrendDelta < -3 ? "text-red-400" : "text-gray-400"}>
                    {scoreTrendDelta > 3 ? "\u2191" : scoreTrendDelta < -3 ? "\u2193" : "\u2192"}
                  </span>
                  <span className="text-gray-300">
                    Score trend:{" "}
                    <span className={scoreTrendDelta > 3 ? "text-emerald-400" : scoreTrendDelta < -3 ? "text-red-400" : "text-gray-400"}>
                      {scoreTrendLabel}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={coverageRatio >= 0.7 ? "text-emerald-400" : coverageRatio >= 0.4 ? "text-amber-400" : "text-red-400"}>
                    {coverageRatio >= 0.7 ? "\u2713" : "\u25CB"}
                  </span>
                  <span className="text-gray-300">
                    Coverage:{" "}
                    <span className={coverageRatio >= 0.7 ? "text-emerald-400" : coverageRatio >= 0.4 ? "text-amber-400" : "text-red-400"}>
                      {chapterCoverage}/{TOTAL_CHAPTERS} chapters
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={consistencyRatio >= 0.7 ? "text-emerald-400" : consistencyRatio >= 0.4 ? "text-amber-400" : "text-red-400"}>
                    {consistencyRatio >= 0.7 ? "\u2713" : "\u25CB"}
                  </span>
                  <span className="text-gray-300">
                    Consistency:{" "}
                    <span className={consistencyRatio >= 0.7 ? "text-emerald-400" : consistencyRatio >= 0.4 ? "text-amber-400" : "text-red-400"}>
                      {consistencyDays}/14 days
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={overallMastery >= 70 ? "text-emerald-400" : overallMastery >= 50 ? "text-amber-400" : "text-red-400"}>
                    {overallMastery >= 70 ? "\u2713" : "\u25CB"}
                  </span>
                  <span className="text-gray-300">
                    Avg score:{" "}
                    <span className={overallMastery >= 70 ? "text-emerald-400" : overallMastery >= 50 ? "text-amber-400" : "text-red-400"}>
                      {overallMastery}% (need 70%)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Days Until Exam */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/80 border border-gray-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">
                Days Until Exam
              </p>
            </div>
            <p className="text-3xl font-bold text-white">
              {daysUntilExam !== null ? daysUntilExam : "--"}
            </p>
            {daysUntilExam !== null && daysUntilExam <= 14 && (
              <p className="text-amber-400 text-xs mt-1 font-medium">Coming up soon!</p>
            )}
          </div>

          {/* Study Streak */}
          <div className="bg-gradient-to-br from-gray-900 to-amber-950/20 border border-gray-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c.5 3.5-1 6.5-3 9 1.5.5 3 .5 4-1 .5 3-2 5.5-5 7 5 0 10-4 10-10C18 3 13.5 1 12 2z" />
              </svg>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">
                Study Streak
              </p>
            </div>
            <p className="text-3xl font-bold text-amber-400">
              {streak}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {streak === 1 ? "day" : "days"} in a row
            </p>
          </div>
        </div>

        {/* ===== CHAPTER MASTERY ===== */}
        {chapterMastery.length > 0 && (
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Chapter Mastery
            </h2>
            <div className="space-y-3">
              {chapterMastery.map((ch, idx) => (
                <div key={ch.chapter} className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-14 shrink-0 font-medium">
                    Ch. {ch.chapter}
                  </span>
                  <div className="flex-1 bg-gray-800/60 rounded-full h-7 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all ease-out"
                      style={{
                        width: animateIn ? `${Math.max(ch.avgScore, 3)}%` : "0%",
                        background: getBarGradient(ch.avgScore),
                        transitionDuration: `${800 + idx * 100}ms`,
                        transitionDelay: `${idx * 50}ms`,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs font-semibold text-white drop-shadow-sm">
                      {ch.avgScore}%
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs w-16 text-right shrink-0">
                    {ch.attempts} {ch.attempts === 1 ? "quiz" : "quizzes"}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-5 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
                80%+
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                60-79%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
                40-59%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                &lt;40%
              </span>
            </div>
          </div>
        )}

        {/* ===== LEARNING STYLE + STUDY HABITS ROW ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Learning Style */}
          {learningStyle && (
            <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                Learning Style
              </h2>
              {/* Radial bars visualization */}
              <div className="space-y-4">
                {LEARNING_STYLE_CONFIG.map(({ key, label, color }) => {
                  const score = learningStyle[key];
                  const pct = (score / 10) * 100;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-300 font-medium">{label}</span>
                        <span className="text-sm font-bold" style={{ color }}>
                          {score}/10
                        </span>
                      </div>
                      <div className="h-3 bg-gray-800/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all ease-out"
                          style={{
                            width: animateIn ? `${pct}%` : "0%",
                            backgroundColor: color,
                            transitionDuration: "1000ms",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Study Habits */}
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Study Habits
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Quizzes Taken */}
              <div className="bg-gray-800/40 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{totalQuizzes}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Quizzes Taken</p>
                </div>
              </div>
              {/* Avg Score */}
              <div className="bg-gray-800/40 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{avgQuizScore}%</p>
                  <p className="text-gray-500 text-xs mt-0.5">Avg Score</p>
                </div>
              </div>
              {/* Flashcards */}
              <div className="bg-gray-800/40 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.011.672-1.866 1.595-2.147m14.81 0H4.595" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{flashcardsReviewed}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Cards Reviewed</p>
                </div>
              </div>
              {/* Study Time */}
              <div className="bg-gray-800/40 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{totalStudyHours}h</p>
                  <p className="text-gray-500 text-xs mt-0.5">Study Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SMART ALERTS ===== */}
        {weakChapters.length > 0 && (
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Smart Alerts
            </h2>
            <div className="space-y-3">
              {weakChapters.map((ch) => {
                const borderColor =
                  ch.avgScore < 25
                    ? "border-l-red-500 bg-red-950/20"
                    : ch.avgScore < 40
                    ? "border-l-orange-500 bg-orange-950/20"
                    : "border-l-amber-500 bg-amber-950/20";
                const iconColor =
                  ch.avgScore < 25
                    ? "text-red-400"
                    : ch.avgScore < 40
                    ? "text-orange-400"
                    : "text-amber-400";

                return (
                  <div
                    key={ch.chapter}
                    className={`flex items-center gap-4 rounded-xl p-4 border-l-4 ${borderColor} touch-manipulation`}
                  >
                    <div className={`shrink-0 ${iconColor}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium">
                        Chapter {ch.chapter} needs attention
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Average score: {ch.avgScore}% across {ch.attempts}{" "}
                        {ch.attempts === 1 ? "attempt" : "attempts"}
                      </p>
                    </div>
                    <Link
                      href={`/quiz?chapter=${ch.chapter}`}
                      className="shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 rounded-lg transition-colors touch-manipulation"
                    >
                      Practice
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
