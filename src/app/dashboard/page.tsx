import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import Link from "next/link";
import FunFactWrapper from "./fun-fact-wrapper";
import Greeting from "./greeting";

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

  const [quizRes, flashcardRes, allQuizRes, allFlashcardRes] =
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
    ]);

  const todayQuizzes = quizRes.data || [];
  const todayCards = flashcardRes.data || [];
  const cardsReviewedToday = todayCards.length;

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

  // Determine continue studying link
  const hasCardsDue = cardsReviewedToday === 0;
  const hasStudiedToday = todayQuizzes.length > 0 || cardsReviewedToday > 0;
  const continueLink = hasCardsDue ? "/flashcards" : "/quiz";
  const continueLabel = hasCardsDue ? "Review Flashcards" : "Take a Quiz";
  const continueDescription = hasCardsDue
    ? "You have flashcards waiting for review"
    : hasStudiedToday
    ? "Keep the momentum going with a quiz"
    : "Start studying with a practice quiz";

  const featureCards = [
    {
      href: "/campaign",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      ),
      title: "Campaign Mode",
      description: "Guided learning from zero to exam-ready",
      gradient: "from-rose-500 to-pink-500",
      hoverBorder: "group-hover:border-rose-500/50",
    },
    {
      href: "/coach",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      ),
      title: "AI Study Coach",
      description: "Ask anything — get instant answers",
      gradient: "from-indigo-500 to-violet-500",
      hoverBorder: "group-hover:border-indigo-500/50",
    },
    {
      href: "/flashcards",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
        </svg>
      ),
      title: "Flashcards",
      description: "Study terms with spaced repetition",
      gradient: "from-blue-500 to-cyan-500",
      hoverBorder: "group-hover:border-blue-500/50",
    },
    {
      href: "/quiz",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
      title: "Practice Quiz",
      description: "Exam-style questions to test knowledge",
      gradient: "from-green-500 to-emerald-500",
      hoverBorder: "group-hover:border-green-500/50",
    },
    {
      href: "/chapters",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      title: "Chapter Summaries",
      description: "Condensed notes for each chapter",
      gradient: "from-purple-500 to-pink-500",
      hoverBorder: "group-hover:border-purple-500/50",
    },
    {
      href: "/schedule",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      title: "Study Schedule",
      description: "Your weekly study plan and sessions",
      gradient: "from-cyan-500 to-teal-500",
      hoverBorder: "group-hover:border-cyan-500/50",
    },
    {
      href: "/stats",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      title: "Stats & Analytics",
      description: "Track your progress and readiness",
      gradient: "from-amber-500 to-orange-500",
      hoverBorder: "group-hover:border-amber-500/50",
    },
    {
      href: "/anatomy",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
      title: "Anatomy Explorer",
      description: "Interactive muscle diagrams",
      gradient: "from-teal-500 to-emerald-500",
      hoverBorder: "group-hover:border-teal-500/50",
    },
    {
      href: "/scenarios",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
      title: "Client Scenarios",
      description: "Practice real-world program design",
      gradient: "from-fuchsia-500 to-purple-500",
      hoverBorder: "group-hover:border-fuchsia-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Greeting displayName={profile?.display_name} />
            <p className="text-gray-400 mt-1">
              {daysUntilExam !== null
                ? `${daysUntilExam} days until your exam`
                : "Your NASM study dashboard"}
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
              {cardsReviewedToday}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">
              Cards Today
            </div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-400">
              {avgQuizScore !== null ? `${avgQuizScore}%` : "--"}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">
              Quiz Score
            </div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-amber-400">
              {streak}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">
              Day Streak
            </div>
          </div>
        </div>

        {/* Exam Mode Banner — visible within 14 days of exam */}
        {daysUntilExam !== null && daysUntilExam <= 14 && (
          <Link
            href="/exam-mode"
            className="group relative block mb-6 rounded-2xl p-px transition-all hover:scale-[1.01]"
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

        {/* Continue Studying Hero Card */}
        <Link
          href={continueLink}
          className="group relative block mb-6 rounded-2xl p-1"
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

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {featureCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative rounded-2xl p-px transition-all duration-300 hover:scale-[1.02]"
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="relative bg-gray-900 rounded-2xl p-6 sm:p-7 h-full min-h-[80px] flex flex-col border border-gray-800 group-hover:border-transparent transition-colors">
                <div className={`text-gray-400 group-hover:text-white mb-4 transition-colors`}>
                  {card.icon}
                </div>
                <h2 className="text-lg font-semibold text-white group-hover:text-white transition-colors">
                  {card.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
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
