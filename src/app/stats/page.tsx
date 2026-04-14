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

function getChapterLabel(chapter: number): string {
  return `Ch. ${chapter}`;
}

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

function getReadinessLabel(avgScore: number): {
  label: string;
  color: string;
} {
  if (avgScore >= 70) return { label: "On Track", color: "#10b981" };
  if (avgScore >= 50) return { label: "At Risk", color: "#f59e0b" };
  return { label: "Behind", color: "#ef4444" };
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

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
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your stats...</p>
        </div>
      </div>
    );
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
            className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block"
          >
            &larr; Back to Dashboard
          </Link>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h1 className="text-xl font-bold text-white mb-2">
              No Stats Yet
            </h1>
            <p className="text-gray-400 mb-6">
              Complete some quizzes or review flashcards to see your analytics
              here.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/quiz"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Take a Quiz
              </Link>
              <Link
                href="/flashcards"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
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
  const readiness = getReadinessLabel(overallMastery);
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

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block"
        >
          &larr; Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">
          Stats & Analytics
        </h1>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Overall Mastery */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Overall Mastery
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: getBarColor(overallMastery) }}
            >
              {overallMastery}%
            </p>
          </div>

          {/* Exam Readiness */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Exam Readiness
            </p>
            <p className="text-xl font-bold" style={{ color: readiness.color }}>
              {readiness.label}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Projected: {projectedScore}%
            </p>
          </div>

          {/* Days Until Exam */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Days Until Exam
            </p>
            <p className="text-3xl font-bold text-white">
              {daysUntilExam !== null ? daysUntilExam : "--"}
            </p>
            {daysUntilExam !== null && daysUntilExam <= 14 && (
              <p className="text-yellow-500 text-xs mt-1">Coming up soon!</p>
            )}
          </div>

          {/* Study Streak */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Study Streak
            </p>
            <p className="text-3xl font-bold" style={{ color: "#f59e0b" }}>
              {streak}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {streak === 1 ? "day" : "days"} in a row
            </p>
          </div>
        </div>

        {/* Chapter Mastery Breakdown */}
        {chapterMastery.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Chapter Mastery Breakdown
            </h2>
            <div className="space-y-3">
              {chapterMastery.map((ch) => (
                <div key={ch.chapter} className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-16 shrink-0">
                    {getChapterLabel(ch.chapter)}
                  </span>
                  <div className="flex-1 bg-gray-800 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(ch.avgScore, 2)}%`,
                        backgroundColor: getBarColor(ch.avgScore),
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-white">
                      {ch.avgScore}%
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs w-20 text-right shrink-0">
                    {ch.attempts} {ch.attempts === 1 ? "quiz" : "quizzes"}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#10b981" }}
                />
                80%+
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#3b82f6" }}
                />
                60-79%
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#f59e0b" }}
                />
                40-59%
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#ef4444" }}
                />
                &lt;40%
              </span>
            </div>
          </div>
        )}

        {/* Learning Style Effectiveness */}
        {learningStyle && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Learning Style Profile
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { key: "visual", label: "Visual" },
                  { key: "reading_writing", label: "Reading/Writing" },
                  { key: "active_recall", label: "Active Recall" },
                  { key: "practical", label: "Practical" },
                ] as const
              ).map(({ key, label }) => {
                const score = learningStyle[key];
                return (
                  <div key={key} className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">{label}</p>
                    <div className="flex items-end gap-2">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "#8b5cf6" }}
                      >
                        {score}
                      </span>
                      <span className="text-gray-500 text-xs mb-1">/ 10</span>
                    </div>
                    <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(score / 10) * 100}%`,
                          backgroundColor: "#8b5cf6",
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
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Study Habits
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: "#3b82f6" }}
              >
                {totalQuizzes}
              </p>
              <p className="text-gray-400 text-sm">Quizzes Taken</p>
            </div>
            <div className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: "#10b981" }}
              >
                {avgQuizScore}%
              </p>
              <p className="text-gray-400 text-sm">Avg Quiz Score</p>
            </div>
            <div className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: "#8b5cf6" }}
              >
                {flashcardsReviewed}
              </p>
              <p className="text-gray-400 text-sm">Flashcards Reviewed</p>
            </div>
            <div className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: "#f59e0b" }}
              >
                {totalStudyHours}h
              </p>
              <p className="text-gray-400 text-sm">Total Study Time</p>
            </div>
          </div>
        </div>

        {/* Smart Alerts */}
        {weakChapters.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Smart Alerts
            </h2>
            <div className="space-y-3">
              {weakChapters.map((ch) => (
                <div
                  key={ch.chapter}
                  className="flex items-center gap-3 bg-red-950/30 border border-red-900/40 rounded-lg p-3"
                >
                  <span className="text-red-400 text-lg">!</span>
                  <div>
                    <p className="text-white text-sm font-medium">
                      Chapter {ch.chapter} needs attention
                    </p>
                    <p className="text-gray-400 text-xs">
                      Average score: {ch.avgScore}% across {ch.attempts}{" "}
                      {ch.attempts === 1 ? "attempt" : "attempts"}
                    </p>
                  </div>
                  <Link
                    href={`/quiz?chapter=${ch.chapter}`}
                    className="ml-auto text-xs text-blue-400 hover:text-blue-300 shrink-0"
                  >
                    Practice now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
