"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type ChapterQuestionCount = {
  chapter: number;
  count: number;
};

export default function QuizSetupPage() {
  const [mode, setMode] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterCounts, setChapterCounts] = useState<Map<number, number>>(
    new Map()
  );
  const [weakChapters, setWeakChapters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const chapters = Array.from({ length: 20 }, (_, i) => i + 1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Load question counts per chapter
    const { data: questions } = await supabase
      .from("questions")
      .select("chapter");

    if (questions) {
      const counts = new Map<number, number>();
      questions.forEach((q: { chapter: number }) => {
        counts.set(q.chapter, (counts.get(q.chapter) || 0) + 1);
      });
      setChapterCounts(counts);
    }

    // Load weak chapters from quiz results
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: results } = await supabase
        .from("quiz_results")
        .select("chapter, score")
        .eq("user_id", user.id)
        .not("chapter", "is", null)
        .order("completed_at", { ascending: false })
        .limit(40);

      if (results && results.length > 0) {
        const chapterScores = new Map<number, number[]>();
        results.forEach((r: { chapter: number; score: number }) => {
          if (!chapterScores.has(r.chapter)) {
            chapterScores.set(r.chapter, []);
          }
          chapterScores.get(r.chapter)!.push(r.score);
        });

        const weak: number[] = [];
        chapterScores.forEach((scores, ch) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avg < 70) weak.push(ch);
        });
        setWeakChapters(weak);
      }
    }

    setLoading(false);
  }

  function startQuiz() {
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (mode === "chapter" && selectedChapter) {
      params.set("chapter", selectedChapter.toString());
    }
    if (mode === "weak_chapters") {
      params.set("chapters", weakChapters.join(","));
    }
    router.push(`/quiz/session?${params.toString()}`);
  }

  function startQuick10() {
    const params = new URLSearchParams();
    params.set("mode", "quick10");
    router.push(`/quiz/session?${params.toString()}`);
  }

  const totalQuestions = Array.from(chapterCounts.values()).reduce(
    (a, b) => a + b,
    0
  );

  const modes = [
    {
      value: "chapter",
      icon: "📖",
      title: "By Chapter",
      description: "Focus on one chapter at a time to master specific topics",
      time: "5-10 min",
      gradient: "from-blue-600/20 to-cyan-600/20",
      borderActive: "border-blue-500",
      iconBg: "bg-blue-600/20",
      textActive: "text-blue-400",
    },
    {
      value: "mixed",
      icon: "🔀",
      title: "Mixed Review",
      description: "Random questions across all chapters — 15 questions",
      time: "8-12 min",
      gradient: "from-purple-600/20 to-pink-600/20",
      borderActive: "border-purple-500",
      iconBg: "bg-purple-600/20",
      textActive: "text-purple-400",
    },
    {
      value: "weak_chapters",
      icon: "🎯",
      title: "Target Weak Areas",
      description:
        weakChapters.length > 0
          ? `Focus on chapters ${weakChapters.slice(0, 3).join(", ")}${weakChapters.length > 3 ? "..." : ""} where you need practice`
          : "Targets chapters where your scores are lowest",
      time: "10-15 min",
      gradient: "from-amber-600/20 to-orange-600/20",
      borderActive: "border-amber-500",
      iconBg: "bg-amber-600/20",
      textActive: "text-amber-400",
      recommended: weakChapters.length > 0,
    },
    {
      value: "exam_simulation",
      icon: "🏆",
      title: "Exam Simulation",
      description:
        "Timed 20-question test mimicking the real NASM CPT exam format",
      time: "~20 min",
      gradient: "from-emerald-600/20 to-teal-600/20",
      borderActive: "border-emerald-500",
      iconBg: "bg-emerald-600/20",
      textActive: "text-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Practice Quiz</h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalQuestions > 0 ? `${totalQuestions} questions available` : ""}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-gray-800/50 transition-colors min-h-[48px]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
        </div>

        {/* Quick 10 Banner */}
        <button
          onClick={startQuick10}
          className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-600/30 to-violet-600/30 border border-indigo-500/40 hover:border-indigo-400/60 transition-all group min-h-[64px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl shrink-0">
              ⚡
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors">
                Quick 10
              </div>
              <div className="text-sm text-gray-400">
                10 mixed questions — perfect for a fast review
              </div>
            </div>
            <div className="text-xs text-indigo-400/70 shrink-0">~3 min</div>
          </div>
        </button>

        {/* Mode Selection */}
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Choose a quiz mode
        </p>

        <div className="space-y-3 mb-6">
          {modes.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setMode(opt.value);
                if (opt.value !== "chapter") setSelectedChapter(null);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all min-h-[80px] relative overflow-hidden ${
                mode === opt.value
                  ? `${opt.borderActive} bg-gradient-to-r ${opt.gradient}`
                  : "border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-900/80"
              }`}
            >
              {/* Recommended badge */}
              {opt.recommended && (
                <div className="absolute top-2 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Recommended for you
                  </span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    mode === opt.value ? opt.iconBg : "bg-gray-800"
                  }`}
                >
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        mode === opt.value ? opt.textActive : "text-white"
                      }`}
                    >
                      {opt.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5 leading-snug">
                    {opt.description}
                  </p>
                </div>
                <span className="text-xs text-gray-500 shrink-0 mt-1">
                  {opt.time}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Chapter Selector Grid */}
        {mode === "chapter" && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Select a chapter
            </p>
            <div className="grid grid-cols-5 gap-2">
              {chapters.map((ch) => {
                const count = chapterCounts.get(ch) || 0;
                const isWeak = weakChapters.includes(ch);
                const isSelected = selectedChapter === ch;

                return (
                  <button
                    key={ch}
                    onClick={() => setSelectedChapter(ch)}
                    className={`relative flex flex-col items-center justify-center rounded-xl border transition-all min-h-[64px] ${
                      isSelected
                        ? "border-blue-500 bg-blue-600/20 ring-1 ring-blue-500/50"
                        : isWeak
                          ? "border-amber-700/50 bg-amber-900/10 hover:border-amber-600/70"
                          : count > 0
                            ? "border-gray-800 bg-gray-900 hover:border-gray-600"
                            : "border-gray-800/50 bg-gray-900/50 opacity-50"
                    }`}
                    disabled={count === 0}
                  >
                    {isWeak && !isSelected && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                    <span
                      className={`text-lg font-bold ${
                        isSelected
                          ? "text-blue-400"
                          : count > 0
                            ? "text-white"
                            : "text-gray-600"
                      }`}
                    >
                      {ch}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? "text-blue-400/70" : "text-gray-500"
                      }`}
                    >
                      {count > 0 ? `${count}q` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
            {weakChapters.length > 0 && (
              <p className="text-xs text-amber-500/70 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Amber dots = chapters that need more practice
              </p>
            )}
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={startQuiz}
          disabled={
            !mode ||
            (mode === "chapter" && !selectedChapter) ||
            (mode === "weak_chapters" && weakChapters.length === 0)
          }
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all min-h-[56px] text-lg shadow-lg shadow-green-900/20 disabled:shadow-none"
        >
          {!mode
            ? "Select a mode to start"
            : mode === "chapter" && !selectedChapter
              ? "Pick a chapter"
              : mode === "weak_chapters" && weakChapters.length === 0
                ? "No weak areas detected yet"
                : "Start Quiz"}
        </button>
      </div>
    </div>
  );
}
