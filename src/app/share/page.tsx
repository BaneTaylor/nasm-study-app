"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type ShareStats = {
  mastery: number;
  chaptersMastered: number;
  quizAverage: number;
  streak: number;
  totalQuizzes: number;
};

function getTagline(mastery: number): string {
  if (mastery >= 80) return "Crushing it! Ready to pass!";
  if (mastery >= 70) return "On track to pass!";
  if (mastery >= 55) return "Almost there! Keep grinding!";
  if (mastery >= 40) return "Building momentum!";
  if (mastery > 0) return "Just getting started!";
  return "The journey begins!";
}

function calculateStreak(
  quizResults: { completed_at: string | null }[],
  flashcardProgress: { last_reviewed_at: string | null }[]
): number {
  const activityDates = new Set<string>();
  for (const qr of quizResults) {
    if (qr.completed_at) activityDates.add(qr.completed_at.slice(0, 10));
  }
  for (const fp of flashcardProgress) {
    if (fp.last_reviewed_at) activityDates.add(fp.last_reviewed_at.slice(0, 10));
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

export default function SharePage() {
  const [stats, setStats] = useState<ShareStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [quizRes, flashcardRes] = await Promise.all([
        supabase
          .from("quiz_results")
          .select("score, chapter, completed_at")
          .eq("user_id", user.id),
        supabase
          .from("flashcard_progress")
          .select("last_reviewed_at")
          .eq("user_id", user.id),
      ]);

      const quizResults = quizRes.data || [];
      const flashcardProgress = flashcardRes.data || [];

      const totalQuizzes = quizResults.length;
      const quizAverage =
        totalQuizzes > 0
          ? Math.round(
              quizResults.reduce((sum: number, qr: { score: number }) => sum + qr.score, 0) /
                totalQuizzes
            )
          : 0;

      // Chapters mastered: chapters with avg score >= 70
      const chapterScores = new Map<number, { total: number; count: number }>();
      for (const qr of quizResults) {
        if (qr.chapter !== null) {
          const existing = chapterScores.get(qr.chapter) || {
            total: 0,
            count: 0,
          };
          existing.total += qr.score;
          existing.count += 1;
          chapterScores.set(qr.chapter, existing);
        }
      }
      let chaptersMastered = 0;
      for (const [, data] of chapterScores) {
        if (data.total / data.count >= 70) chaptersMastered++;
      }

      const streak = calculateStreak(quizResults, flashcardProgress);

      setStats({
        mastery: quizAverage,
        chaptersMastered,
        quizAverage,
        streak,
        totalQuizzes,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError(true);
      setTimeout(() => setShareError(false), 2000);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "NASM Study Progress",
          text: stats
            ? `I'm at ${stats.mastery}% mastery on my NASM CPT prep! ${stats.chaptersMastered} chapters mastered.`
            : "Check out my NASM study progress!",
          url: window.location.origin,
        });
      } catch {
        // User cancelled or share failed, fall back to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  }

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

  const s = stats || {
    mastery: 0,
    chaptersMastered: 0,
    quizAverage: 0,
    streak: 0,
    totalQuizzes: 0,
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-lg mx-auto">
        {/* Back nav */}
        <Link
          href="/stats"
          className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Stats
        </Link>

        {/* Instructions */}
        <p className="text-gray-500 text-sm text-center mb-4">
          Screenshot this card and share it!
        </p>

        {/* The shareable card */}
        <div
          className="relative overflow-hidden rounded-3xl mx-auto"
          style={{ aspectRatio: "9 / 16", maxWidth: 400 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.2),transparent_60%)]" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-between p-8 py-12">
            {/* Branding */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2">
                <svg
                  className="w-4 h-4 text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                  />
                </svg>
                <span className="text-sm font-semibold text-white/90 tracking-wide">
                  NASM Study
                </span>
              </div>
              <p className="text-white/50 text-xs">CPT Exam Prep</p>
            </div>

            {/* Main mastery stat */}
            <div className="text-center -mt-4">
              {/* Glow ring */}
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute w-44 h-44 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl" />
                <div className="relative w-40 h-40 rounded-full border-4 border-white/10 flex items-center justify-center">
                  <svg
                    className="absolute inset-0 -rotate-90"
                    width="160"
                    height="160"
                    viewBox="0 0 160 160"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r="74"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="74"
                      fill="none"
                      stroke="url(#shareGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 74}
                      strokeDashoffset={
                        2 * Math.PI * 74 * (1 - s.mastery / 100)
                      }
                    />
                    <defs>
                      <linearGradient
                        id="shareGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="relative text-center">
                    <span className="text-5xl font-bold text-white">
                      {s.mastery}
                    </span>
                    <span className="text-2xl font-bold text-white/70">%</span>
                    <div className="text-xs text-white/50 mt-1">Mastery</div>
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-lg font-semibold text-white mt-6">
                {getTagline(s.mastery)}
              </p>
            </div>

            {/* Stats grid */}
            <div className="w-full grid grid-cols-3 gap-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {s.chaptersMastered}
                </div>
                <div className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">
                  Chapters
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {s.quizAverage}%
                </div>
                <div className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">
                  Quiz Avg
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {s.streak}
                </div>
                <div className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">
                  Day Streak
                </div>
              </div>
            </div>

            {/* Footer watermark */}
            <div className="text-white/20 text-[10px] tracking-widest uppercase">
              nasm-study.app
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleShare}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
            Share
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.654a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374"
                  />
                </svg>
                Copy Link
              </>
            )}
          </button>
        </div>

        {shareError && (
          <p className="text-red-400 text-xs text-center mt-2">
            Could not copy to clipboard. Try manually copying the URL.
          </p>
        )}
      </div>
    </div>
  );
}
