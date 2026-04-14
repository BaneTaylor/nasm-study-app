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
