import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import Link from "next/link";
import FunFactWrapper from "./fun-fact-wrapper";
import RadarWrapper from "./radar-wrapper";
import { chapterDomains, domainLabels } from "@/lib/design-system";
import { getCurriculum, getAllLessons } from "@/lib/campaign/curriculum";
import OfflineExercise from "./offline-exercise";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, display_name, exam_date")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const daysUntilExam = profile?.exam_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.exam_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  // Fetch today's stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  const [, flashcardRes, allQuizRes, allFlashcardRes, srsRes, allQuizWithChapters, campaignRes] =
    await Promise.all([
      supabase
        .from("quiz_results")
        .select("score, correct_count, total_questions")
        .eq("user_id", user.id)
        .gte("completed_at", todayISO),
      supabase
        .from("flashcard_progress")
        .select("id")
        .eq("user_id", user.id)
        .gte("last_reviewed_at", todayISO),
      supabase
        .from("quiz_results")
        .select("completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false }),
      supabase
        .from("flashcard_progress")
        .select("last_reviewed_at")
        .eq("user_id", user.id)
        .order("last_reviewed_at", { ascending: false }),
      // SRS due cards
      supabase
        .from("flashcard_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("next_review_at", new Date().toISOString()),
      // All quiz results with chapter info for domain mastery
      supabase
        .from("quiz_results")
        .select("score, chapter")
        .eq("user_id", user.id),
      // Campaign progress
      supabase
        .from("campaign_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id),
    ]);

  const todayCards = flashcardRes.data || [];
  const cardsReviewedToday = todayCards.length;
  const cardsDue = srsRes.count || 0;

  // Calculate streak
  const activityDates = new Set<string>();
  for (const qr of allQuizRes.data || []) {
    if (qr.completed_at) activityDates.add(qr.completed_at.slice(0, 10));
  }
  for (const fp of allFlashcardRes.data || []) {
    if (fp.last_reviewed_at) activityDates.add(fp.last_reviewed_at.slice(0, 10));
  }

  let streak = 0;
  if (activityDates.size > 0) {
    const sorted = Array.from(activityDates).sort().reverse();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (sorted[0] === today || sorted[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = (prev.getTime() - curr.getTime()) / 86400000;
        if (diff <= 1) streak++;
        else break;
      }
    }
  }

  // Calculate domain mastery scores
  const domainScoreMap: Record<string, { total: number; count: number }> = {};
  for (const q of allQuizWithChapters.data || []) {
    if (q.chapter && q.score != null) {
      const domain = chapterDomains[q.chapter];
      if (domain) {
        if (!domainScoreMap[domain]) domainScoreMap[domain] = { total: 0, count: 0 };
        domainScoreMap[domain].total += q.score;
        domainScoreMap[domain].count += 1;
      }
    }
  }

  const domainColorMap: Record<string, string> = {
    optModel: "#f43f5e",
    anatomy: "#3b82f6",
    assessment: "#22c55e",
    flexibility: "#a855f7",
    resistance: "#f59e0b",
    nutrition: "#14b8a6",
    specialPops: "#6366f1",
    programDesign: "#d946ef",
  };

  const allDomainKeys = Object.keys(domainLabels);
  const domainScores = allDomainKeys.map((domain) => {
    const data = domainScoreMap[domain];
    return {
      domain,
      label: domainLabels[domain],
      score: data ? Math.round(data.total / data.count) : 0,
      color: domainColorMap[domain] || "#3b82f6",
    };
  });

  // Calculate chapters mastered (avg score >= 80)
  const chapterScoreMap: Record<number, { total: number; count: number }> = {};
  for (const q of allQuizWithChapters.data || []) {
    if (q.chapter && q.score != null) {
      if (!chapterScoreMap[q.chapter]) chapterScoreMap[q.chapter] = { total: 0, count: 0 };
      chapterScoreMap[q.chapter].total += q.score;
      chapterScoreMap[q.chapter].count += 1;
    }
  }
  const chaptersMastered = Object.values(chapterScoreMap).filter(
    (c) => c.count >= 1 && c.total / c.count >= 80
  ).length;

  // Exam readiness calculation inputs
  const allScores = (allQuizWithChapters.data || []).map((q) => q.score || 0);
  const overallQuizAvg = allScores.length > 0
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 0;
  const coveragePercent = (Object.keys(chapterScoreMap).length / 20) * 100;
  const totalCards = allFlashcardRes.data?.length || 0;
  const srsRetention = totalCards > 0
    ? Math.min(100, Math.round(((totalCards - cardsDue) / Math.max(totalCards, 1)) * 100))
    : 0;

  const examReadiness = Math.round(
    overallQuizAvg * 0.25 +
    srsRetention * 0.25 +
    overallQuizAvg * 0.2 +
    0 * 0.15 +
    coveragePercent * 0.15
  );

  // Overall mastery %
  const overallMastery = allScores.length > 0 ? Math.round(overallQuizAvg) : 0;

  // Campaign: find next incomplete lesson
  const completedLessonIds = new Set(
    (campaignRes.data || [])
      .filter((p) => p.completed)
      .map((p) => p.lesson_id)
  );
  const curriculum = getCurriculum();
  const allLessons = getAllLessons();
  const totalLessons = allLessons.length;
  const completedLessonsCount = completedLessonIds.size;
  const allComplete = totalLessons > 0 && completedLessonsCount >= totalLessons;
  const hasCampaignStarted = completedLessonsCount > 0;

  // Find the next incomplete lesson + its unit
  let nextLesson: { id: string; title: string } | null = null;
  let nextLessonUnit: { id: string; title: string } | null = null;
  let unitProgress = 0;
  let unitTotal = 0;

  for (const unit of curriculum) {
    let unitCompleted = 0;
    let unitLessons = 0;
    let foundInUnit = false;
    for (const stage of unit.stages) {
      for (const lesson of stage.lessons) {
        unitLessons++;
        if (completedLessonIds.has(lesson.id)) {
          unitCompleted++;
        } else if (!nextLesson) {
          nextLesson = { id: lesson.id, title: lesson.title };
          nextLessonUnit = { id: unit.id, title: unit.title };
          foundInUnit = true;
        }
      }
    }
    if (foundInUnit || (!nextLesson && unitLessons > 0)) {
      unitProgress = unitCompleted;
      unitTotal = unitLessons;
    }
    if (foundInUnit) break;
  }

  const unitProgressPercent = unitTotal > 0 ? Math.round((unitProgress / unitTotal) * 100) : 0;

  // First name only
  const firstName = profile?.display_name
    ? profile.display_name.split(" ")[0]
    : null;

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 text-sm">&#x1F525;</span>
                <span className="text-amber-400 text-sm font-semibold">Day {streak}</span>
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {firstName ? `Hey, ${firstName}` : "Welcome back"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Mini exam readiness */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(31, 41, 55)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={examReadiness >= 70 ? "#22c55e" : examReadiness >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={2 * Math.PI * 15 * (1 - examReadiness / 100)}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                  {examReadiness}
                </span>
              </div>
              {daysUntilExam !== null && (
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-gray-500">Exam in</div>
                  <div className="text-sm font-semibold text-white">{daysUntilExam}d</div>
                </div>
              )}
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Hero: Continue Learning */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-800/60 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <div className="relative p-6 sm:p-8">
            {allComplete ? (
              <>
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">&#x1F389;</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    You&apos;ve completed the curriculum!
                  </h2>
                  <p className="text-gray-400 text-sm">
                    All {totalLessons} lessons done. Time to crush the exam.
                  </p>
                  <Link
                    href="/campaign"
                    className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-400 hover:to-emerald-400 transition-all"
                  >
                    Review Curriculum
                  </Link>
                </div>
              </>
            ) : !hasCampaignStarted ? (
              <>
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
                  Your Journey Begins
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Start the NASM Campaign
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  A guided path from zero to exam-ready, one lesson at a time.
                </p>
                <Link
                  href="/campaign"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold text-base hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/20"
                >
                  Start Your Journey
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                  {nextLessonUnit?.title || "Continue Learning"}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {nextLesson?.title || "Next Lesson"}
                </h2>
                <div className="flex items-center gap-3 mt-3 mb-5">
                  <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${unitProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-medium tabular-nums shrink-0">
                    {unitProgressPercent}%
                  </span>
                </div>
                <Link
                  href={nextLesson ? `/campaign/lesson/${nextLesson.id}` : "/campaign"}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold text-base hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/20"
                >
                  Continue
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Review Due (only if cards are due) */}
        {cardsDue > 0 && (
          <Link
            href="/flashcards"
            className="group flex items-center justify-between rounded-xl border border-gray-800/60 bg-gray-900/60 p-4 hover:border-blue-500/30 hover:bg-gray-900/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">&#x1F504;</span>
              <span className="text-sm text-gray-200">
                <span className="font-semibold text-white">{cardsDue}</span> card{cardsDue !== 1 ? "s" : ""} due for review
              </span>
            </div>
            <span className="text-xs font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
              Review Now &rarr;
            </span>
          </Link>
        )}

        {/* Offline Exercise */}
        <OfflineExercise />

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <div className="rounded-xl bg-gray-900/40 border border-gray-800/40 p-3 text-center">
            <div className="text-lg sm:text-xl font-bold text-amber-400 tabular-nums">{streak}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Streak</div>
          </div>
          <div className="rounded-xl bg-gray-900/40 border border-gray-800/40 p-3 text-center">
            <div className="text-lg sm:text-xl font-bold text-blue-400 tabular-nums">{overallMastery}%</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Mastery</div>
          </div>
          <div className="rounded-xl bg-gray-900/40 border border-gray-800/40 p-3 text-center">
            <div className="text-lg sm:text-xl font-bold text-green-400 tabular-nums">{chaptersMastered}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Chapters</div>
          </div>
          <div className="rounded-xl bg-gray-900/40 border border-gray-800/40 p-3 text-center">
            <div className="text-lg sm:text-xl font-bold text-purple-400 tabular-nums">{cardsReviewedToday}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Reviewed</div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5 sm:p-6">
          <h2 className="text-center text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
            Domain Mastery
          </h2>
          <RadarWrapper domainScores={domainScores} />
          <p className="text-center text-[10px] text-gray-600 mt-2">
            Tap a domain to start a targeted study session
          </p>
        </div>

        {/* Exam Mode Banner */}
        {daysUntilExam !== null && daysUntilExam <= 14 && (
          <Link
            href="/exam-mode"
            className="group relative block rounded-2xl p-px transition-all hover:scale-[1.01]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gray-900 rounded-[15px] p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 6.75 6.75 0 009 4.5a.75.75 0 01.75.75c0 1.865.755 3.556 1.976 4.776A6.723 6.723 0 0015.362 5.214z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-400">
                    {daysUntilExam === 0
                      ? "Exam Day!"
                      : `${daysUntilExam} day${daysUntilExam !== 1 ? "s" : ""} to exam`}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {daysUntilExam <= 7 ? "Final review mode" : "Focused review tools"}
                  </p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        )}

        <FunFactWrapper />
      </div>
    </div>
  );
}
