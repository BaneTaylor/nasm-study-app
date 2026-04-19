import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import Link from "next/link";
import FunFactWrapper from "./fun-fact-wrapper";
import Greeting from "./greeting";
import ExamReadinessBadge from "@/components/exam-readiness-badge";
import RadarWrapper from "./radar-wrapper";
import { chapterDomains, domainLabels } from "@/lib/design-system";

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

  const [quizRes, flashcardRes, allQuizRes, allFlashcardRes, srsRes, allQuizWithChapters] =
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
    ]);

  const todayQuizzes = quizRes.data || [];
  const todayCards = flashcardRes.data || [];
  const cardsReviewedToday = todayCards.length;
  const cardsDue = srsRes.count || 0;

  const avgQuizScore =
    todayQuizzes.length > 0
      ? Math.round(
          todayQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
            todayQuizzes.length
        )
      : null;

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

  // Find weakest domain
  const scoredDomains = domainScores.filter((d) => d.score > 0);
  const weakest = scoredDomains.length > 0
    ? scoredDomains.reduce((min, d) => (d.score < min.score ? d : min), scoredDomains[0])
    : null;

  // Find the first chapter for the weakest domain
  const weakestChapter = weakest
    ? Number(
        Object.entries(chapterDomains).find(([, d]) => d === weakest.domain)?.[0]
      ) || undefined
    : undefined;

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
  // Approximate SRS retention (cards reviewed / total due+reviewed * 100)
  const totalCards = allFlashcardRes.data?.length || 0;
  const srsRetention = totalCards > 0
    ? Math.min(100, Math.round(((totalCards - cardsDue) / Math.max(totalCards, 1)) * 100))
    : 0;

  // Determine continue studying link
  const hasCardsDue = cardsDue > 0;
  const hasStudiedToday = todayQuizzes.length > 0 || cardsReviewedToday > 0;
  const continueLink = hasCardsDue ? "/flashcards" : "/quiz";
  const continueLabel = hasCardsDue ? "Review Flashcards" : "Take a Quiz";
  const continueDescription = hasCardsDue
    ? `You have ${cardsDue} flashcard${cardsDue !== 1 ? "s" : ""} waiting for review`
    : hasStudiedToday
    ? "Keep the momentum going with a quiz"
    : "Start studying with a practice quiz";

  // Daily focus actions
  const focusActions = [];
  if (cardsDue > 0) {
    focusActions.push({ label: `Review ${cardsDue} cards`, href: "/flashcards" });
  }
  if (weakestChapter) {
    focusActions.push({ label: `Study Ch ${weakestChapter}`, href: `/chapters/${weakestChapter}` });
  }
  focusActions.push({ label: "Practice quiz", href: "/quiz" });
  // Limit to 3
  const dailyFocus = focusActions.slice(0, 3);

  const featureCards = [
    {
      href: "/campaign",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      ),
      title: "Campaign",
      description: "Guided zero-to-ready",
      gradient: "from-rose-500 to-pink-500",
    },
    {
      href: "/coach",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      ),
      title: "AI Coach",
      description: "Ask anything",
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      href: "/quiz",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
      title: "Quiz",
      description: "Exam-style practice",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      href: "/flashcards",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
        </svg>
      ),
      title: "Flashcards",
      description: "Spaced repetition",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      href: "/anatomy",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
      title: "Anatomy",
      description: "Interactive explorer",
      gradient: "from-teal-500 to-emerald-500",
    },
    {
      href: "/scenarios",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
      title: "Scenarios",
      description: "Client program design",
      gradient: "from-fuchsia-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* 1. Header — Greeting + Exam Countdown + Logout */}
        <div className="flex justify-between items-start">
          <div>
            <Greeting displayName={profile?.display_name} />
            <p className="text-gray-400 mt-1.5 text-sm sm:text-base">
              {daysUntilExam !== null ? (
                <>
                  <span className="font-semibold text-blue-400">{daysUntilExam}</span>
                  {" "}days until your exam
                </>
              ) : (
                "Your NASM study dashboard"
              )}
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* 2. Exam Readiness Badge */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-3xl p-6 sm:p-8">
          <h2 className="text-center text-sm font-medium uppercase tracking-wider text-gray-500 mb-2">
            Exam Readiness
          </h2>
          <ExamReadinessBadge
            quizAvg={overallQuizAvg}
            srsRetention={srsRetention}
            practiceExamScores={overallQuizAvg}
            scenarioAccuracy={0}
            coveragePercent={coveragePercent}
            weakestDomain={weakest?.label}
            weakestChapter={weakestChapter}
          />
        </div>

        {/* 3. Daily Focus Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider shrink-0">
            Today
          </span>
          <div className="flex flex-wrap gap-2">
            {dailyFocus.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/70 border border-gray-700/50 text-sm text-gray-200 hover:bg-gray-700/70 hover:border-gray-600 transition-all duration-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 4. Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-amber-400">{streak}</div>
            <div className="text-xs text-gray-500 mt-1.5 font-medium">Day Streak</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-blue-400">{cardsDue}</div>
            <div className="text-xs text-gray-500 mt-1.5 font-medium">Cards Due</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-green-400">
              {avgQuizScore !== null ? `${avgQuizScore}%` : "--"}
            </div>
            <div className="text-xs text-gray-500 mt-1.5 font-medium">Today&apos;s Score</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-purple-400">{chaptersMastered}</div>
            <div className="text-xs text-gray-500 mt-1.5 font-medium">Chapters Mastered</div>
          </div>
        </div>

        {/* 5. Radar Chart — Domain Mastery */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-3xl p-6 sm:p-8">
          <h2 className="text-center text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
            Domain Mastery
          </h2>
          <RadarWrapper domainScores={domainScores} />
          <p className="text-center text-xs text-gray-600 mt-3">
            Click a domain to start a targeted study session
          </p>
        </div>

        {/* Exam Mode Banner — visible within 14 days of exam */}
        {daysUntilExam !== null && daysUntilExam <= 14 && (
          <Link
            href="/exam-mode"
            className="group relative block rounded-2xl p-px transition-all hover:scale-[1.01]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gray-900 rounded-[15px] p-5 sm:p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 6.75 6.75 0 009 4.5a.75.75 0 01.75.75c0 1.865.755 3.556 1.976 4.776A6.723 6.723 0 0015.362 5.214z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-0.5">
                    {daysUntilExam <= 7 ? "Exam Mode Active" : "Exam Mode Available"}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {daysUntilExam === 0
                      ? "Exam Day is Today!"
                      : daysUntilExam === 1
                      ? "1 Day Until Your Exam"
                      : `${daysUntilExam} Days Until Your Exam`}
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {daysUntilExam <= 7
                      ? "Final review tools, weak chapter targeting, and practice exams"
                      : "Prepare with focused review tools and countdown timer"}
                  </p>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        )}

        {/* 6. Continue Studying CTA */}
        <Link
          href={continueLink}
          className="group relative block rounded-2xl p-1"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-gray-900 rounded-xl p-6 sm:p-8 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
                Continue Studying
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {continueLabel}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {continueDescription}
              </p>
            </div>
            <div className="shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </div>
        </Link>

        <FunFactWrapper />

        {/* 7. Feature Grid — 2x3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {featureCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative rounded-2xl p-px transition-all duration-300 hover:scale-[1.02]"
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="relative bg-gray-900/80 rounded-2xl p-5 sm:p-6 h-full flex flex-col border border-gray-800/60 group-hover:border-transparent transition-colors">
                <div className="text-gray-400 group-hover:text-white mb-3 transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-base font-semibold text-white">
                  {card.title}
                </h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
