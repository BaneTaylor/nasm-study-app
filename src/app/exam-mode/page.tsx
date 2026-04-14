"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Profile, QuizResult } from "@/lib/types/database";

const TOTAL_CHAPTERS = 20;

const NASM_CHAPTER_NAMES: Record<number, string> = {
  1: "The Scientific Rationale for Integrated Training",
  2: "Basic Exercise Science",
  3: "The Cardiorespiratory System",
  4: "Exercise Metabolism & Bioenergetics",
  5: "Human Movement Science",
  6: "Fitness Assessment",
  7: "Flexibility Training Concepts",
  8: "Cardiorespiratory Fitness Training",
  9: "Core Training Concepts",
  10: "Balance Training Concepts",
  11: "Plyometric Training Concepts",
  12: "Speed, Agility & Quickness Training",
  13: "Resistance Training Concepts",
  14: "The OPT Model",
  15: "Introduction to Exercise Program Design",
  16: "Nutrition",
  17: "Supplementation",
  18: "Lifestyle Modification & Behavioral Coaching",
  19: "Special Populations",
  20: "Professional Development & Responsibility",
};

const CONFIDENCE_DOMAINS = [
  { key: "anatomy", label: "Anatomy & Movement Science", chapters: [2, 5] },
  { key: "assessment", label: "Fitness Assessment", chapters: [6] },
  { key: "programming", label: "Program Design & OPT Model", chapters: [14, 15] },
  { key: "nutrition", label: "Nutrition & Supplementation", chapters: [16, 17] },
  { key: "special", label: "Special Populations & Coaching", chapters: [18, 19] },
];

const CALM_TIPS = [
  {
    icon: "\uD83D\uDE34",
    title: "Prioritize Sleep",
    text: "Get 7-9 hours each night this week. Sleep consolidates memory better than extra study hours.",
  },
  {
    icon: "\uD83D\uDCDA",
    title: "Review, Don't Cram",
    text: "Focus on material you already know. Reinforcing existing knowledge is more effective than learning new concepts now.",
  },
  {
    icon: "\uD83C\uDFAF",
    title: "Focus on Weak Spots",
    text: "Use the weak chapters list above. Short targeted reviews beat long unfocused sessions.",
  },
  {
    icon: "\u23F0",
    title: "Arrive Early",
    text: "Plan to arrive 30 minutes before your exam. Rushing increases anxiety and hurts performance.",
  },
  {
    icon: "\uD83E\uDDD8",
    title: "Practice Calm Breathing",
    text: "If you feel anxious, try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Repeat 3 times.",
  },
  {
    icon: "\uD83D\uDCAA",
    title: "Trust Your Preparation",
    text: "You have been studying. Trust the work you have put in and approach the exam with confidence.",
  },
];

type WeakChapter = {
  chapter: number;
  avgScore: number;
  attempts: number;
};

export default function ExamModePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, number>>({});
  const [showConfidenceResults, setShowConfidenceResults] = useState(false);

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

      const [profileRes, quizRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("quiz_results")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false }),
      ]);

      setProfile(profileRes.data as Profile | null);
      setQuizResults((quizRes.data as QuizResult[]) || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const getTimeUntilExam = useCallback(() => {
    if (!profile?.exam_date) return null;
    const diff = new Date(profile.exam_date).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, [profile?.exam_date]);

  useEffect(() => {
    if (!profile?.exam_date) return;
    const update = () => {
      const t = getTimeUntilExam();
      if (t) setCountdown(t);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [profile?.exam_date, getTimeUntilExam]);

  const daysUntilExam = profile?.exam_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.exam_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const isWithin7Days = daysUntilExam !== null && daysUntilExam <= 7;

  // Weak chapters calculation
  const getWeakChapters = (): WeakChapter[] => {
    const chapterMap = new Map<number, { total: number; count: number }>();
    for (const qr of quizResults) {
      if (qr.chapter !== null) {
        const existing = chapterMap.get(qr.chapter) || { total: 0, count: 0 };
        existing.total += qr.score;
        existing.count += 1;
        chapterMap.set(qr.chapter, existing);
      }
    }

    // Include chapters with no quizzes as weak (score 0)
    for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
      if (!chapterMap.has(i)) {
        chapterMap.set(i, { total: 0, count: 0 });
      }
    }

    return Array.from(chapterMap.entries())
      .map(([chapter, data]) => ({
        chapter,
        avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
        attempts: data.count,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);
  };

  // Confidence check: compare self-assessment vs data
  const getDataScore = (chapters: number[]): number => {
    const relevant = quizResults.filter(
      (q) => q.chapter !== null && chapters.includes(q.chapter)
    );
    if (relevant.length === 0) return 0;
    return Math.round(
      relevant.reduce((s, q) => s + q.score, 0) / relevant.length
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800/60 rounded-xl w-48" />
            <div className="h-48 bg-gray-800/60 rounded-2xl" />
            <div className="h-64 bg-gray-800/60 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile?.exam_date) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-flex items-center gap-1 py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">&#128197;</div>
            <h1 className="text-xl font-bold text-white mb-2">No Exam Date Set</h1>
            <p className="text-gray-400 mb-6">
              Set your exam date in settings to unlock Exam Mode.
            </p>
            <Link
              href="/settings"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all"
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // More than 7 days away — show countdown preview
  if (!isWithin7Days) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-flex items-center gap-1 py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="bg-gradient-to-br from-gray-900 via-amber-950/10 to-orange-950/10 border border-amber-900/30 rounded-2xl p-10 sm:p-14 text-center">
            <div className="text-6xl mb-6">&#128293;</div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Exam Mode Activates in {daysUntilExam! - 7} Days
            </h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Exam mode activates 7 days before your exam with focused review tools,
              countdown timer, and final preparation resources.
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-gray-800/60 rounded-xl px-6 py-4 text-center">
                <p className="text-3xl font-bold text-amber-400">{daysUntilExam}</p>
                <p className="text-gray-500 text-xs mt-1">days until exam</p>
              </div>
              <div className="bg-gray-800/60 rounded-xl px-6 py-4 text-center">
                <p className="text-3xl font-bold text-orange-400">{Math.max(0, daysUntilExam! - 7)}</p>
                <p className="text-gray-500 text-xs mt-1">days until exam mode</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // WITHIN 7 DAYS — Full exam mode
  const weakChapters = getWeakChapters();

  // Build wrong question IDs for rapid fire
  const wrongQuestionIds = quizResults
    .flatMap((qr) =>
      (qr.answers || []).filter((a) => a.selected !== a.correct).map((a) => a.question_id)
    );
  const uniqueWrongIds = [...new Set(wrongQuestionIds)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-amber-950/5 to-orange-950/10 p-4 sm:p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Back nav */}
        <Link
          href="/dashboard"
          className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-flex items-center gap-1 py-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* ===== COUNTDOWN TIMER ===== */}
        <div className="bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-gray-900 border border-amber-800/40 rounded-2xl p-6 sm:p-8 mb-6 text-center shadow-[0_0_40px_rgba(245,158,11,0.15)]">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-semibold mb-4">
            Exam Countdown
          </p>
          <div className="flex justify-center gap-3 sm:gap-5">
            {[
              { value: countdown.days, label: "Days" },
              { value: countdown.hours, label: "Hours" },
              { value: countdown.minutes, label: "Min" },
              { value: countdown.seconds, label: "Sec" },
            ].map((unit) => (
              <div key={unit.label} className="bg-gray-900/80 border border-amber-800/30 rounded-xl px-4 sm:px-6 py-3 sm:py-4 min-w-[70px]">
                <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
                  {String(unit.value).padStart(2, "0")}
                </p>
                <p className="text-gray-500 text-xs mt-1">{unit.label}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Exam on {new Date(profile.exam_date!).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* ===== TOP 5 WEAKEST CHAPTERS ===== */}
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Top 5 Weakest Chapters
          </h2>
          <div className="space-y-3">
            {weakChapters.map((ch) => (
              <div
                key={ch.chapter}
                className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-4"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <span className="text-red-400 font-bold text-sm">{ch.chapter}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {NASM_CHAPTER_NAMES[ch.chapter] || `Chapter ${ch.chapter}`}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {ch.attempts > 0
                      ? `Avg: ${ch.avgScore}% from ${ch.attempts} ${ch.attempts === 1 ? "quiz" : "quizzes"}`
                      : "No quizzes taken"}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/flashcards?chapter=${ch.chapter}`}
                    className="text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    Cards
                  </Link>
                  <Link
                    href={`/quiz/session?mode=chapter&chapter=${ch.chapter}`}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Rapid Fire Review */}
          <Link
            href={
              uniqueWrongIds.length > 0
                ? `/quiz/session?mode=weak_areas`
                : `/quiz/session?mode=mixed`
            }
            className="group relative block rounded-2xl p-px transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gray-900 rounded-[15px] p-6 h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Rapid Fire Review</h3>
              </div>
              <p className="text-gray-400 text-sm">
                {uniqueWrongIds.length > 0
                  ? `Practice ${uniqueWrongIds.length} questions you previously got wrong`
                  : "Quick mixed review to sharpen your skills"}
              </p>
            </div>
          </Link>

          {/* Final Practice Exam */}
          <Link
            href="/quiz/session?mode=exam_simulation"
            className="group relative block rounded-2xl p-px transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gray-900 rounded-[15px] p-6 h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Final Practice Exam</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Full timed exam simulation to test your readiness
              </p>
            </div>
          </Link>
        </div>

        {/* ===== CONFIDENCE CHECK ===== */}
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            Confidence Check
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Rate your confidence in each area (1-5), then see how it compares to your actual scores.
          </p>

          {!showConfidenceResults ? (
            <div className="space-y-4">
              {CONFIDENCE_DOMAINS.map((domain) => (
                <div key={domain.key}>
                  <p className="text-gray-300 text-sm font-medium mb-2">
                    {domain.label}
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() =>
                          setConfidenceRatings((prev) => ({
                            ...prev,
                            [domain.key]: rating,
                          }))
                        }
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                          confidenceRatings[domain.key] === rating
                            ? "bg-purple-500 text-white scale-110"
                            : "bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-gray-300"
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowConfidenceResults(true)}
                disabled={Object.keys(confidenceRatings).length < CONFIDENCE_DOMAINS.length}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-medium transition-all"
              >
                {Object.keys(confidenceRatings).length < CONFIDENCE_DOMAINS.length
                  ? `Rate all ${CONFIDENCE_DOMAINS.length} areas to continue`
                  : "See Results"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {CONFIDENCE_DOMAINS.map((domain) => {
                const selfScore = confidenceRatings[domain.key] || 0;
                const dataScore = getDataScore(domain.chapters);
                const dataLevel = Math.round(dataScore / 20); // convert 0-100 to 1-5 scale
                const gap = selfScore - dataLevel;
                const gapLabel =
                  gap > 1
                    ? "Overconfident"
                    : gap < -1
                    ? "Underconfident"
                    : "Well calibrated";
                const gapColor =
                  gap > 1
                    ? "text-red-400"
                    : gap < -1
                    ? "text-amber-400"
                    : "text-emerald-400";

                return (
                  <div key={domain.key} className="bg-gray-800/40 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm font-medium">{domain.label}</p>
                      <span className={`text-xs font-medium ${gapColor}`}>{gapLabel}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs mb-1">Your confidence</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-full ${
                                i <= selfScore ? "bg-purple-500" : "bg-gray-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs mb-1">
                          Data says ({dataScore}%)
                        </p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-full ${
                                i <= dataLevel ? "bg-blue-500" : "bg-gray-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => {
                  setShowConfidenceResults(false);
                  setConfidenceRatings({});
                }}
                className="text-sm text-gray-400 hover:text-gray-300 mt-2"
              >
                Retake confidence check
              </button>
            </div>
          )}
        </div>

        {/* ===== CALM TIPS ===== */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950/10 border border-gray-800/50 rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            Final Week Tips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CALM_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="bg-gray-800/40 rounded-xl p-4 flex gap-3"
              >
                <span className="text-2xl shrink-0">{tip.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{tip.title}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                    {tip.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
