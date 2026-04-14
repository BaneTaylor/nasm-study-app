"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Question = {
  id: string;
  chapter: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
};

type Answer = {
  question_id: string;
  selected: number;
  correct: number;
  time_spent_seconds: number;
};

type QuestionProgressRow = {
  id: string;
  question_id: string;
  times_seen: number;
  times_correct: number;
  next_review_at: string | null;
};

/** Compute next review timestamp for a quiz question using spaced-repetition logic. */
function getQuestionNextReview(wasCorrect: boolean, timesSeen: number): string {
  const now = Date.now();
  let intervalMinutes: number;

  if (!wasCorrect) {
    // Wrong answers come back sooner: 5 min, 30 min, 2 hours
    intervalMinutes = timesSeen <= 1 ? 5 : timesSeen <= 2 ? 30 : 120;
  } else {
    // Correct answers space out: 1 day, 3 days, 7 days, 14 days, 30 days
    const intervals = [1440, 4320, 10080, 20160, 43200];
    intervalMinutes = intervals[Math.min(timesSeen, intervals.length - 1)];
  }

  return new Date(now + intervalMinutes * 60 * 1000).toISOString();
}

const LETTER_BADGES = ["A", "B", "C", "D"];
const LETTER_COLORS_DEFAULT = [
  "bg-blue-600/20 text-blue-400 border-blue-500/30",
  "bg-purple-600/20 text-purple-400 border-purple-500/30",
  "bg-amber-600/20 text-amber-400 border-amber-500/30",
  "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
];

function CircularProgress({
  score,
  size = 160,
  strokeWidth = 12,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? "text-green-400"
      : score >= 50
        ? "text-yellow-400"
        : "text-red-400";
  const trackColor =
    score >= 70
      ? "text-green-900/40"
      : score >= 50
        ? "text-yellow-900/40"
        : "text-red-900/40";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={`stroke-current ${trackColor}`}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`stroke-current ${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${color}`}>{score}%</span>
        <span className="text-xs text-gray-500 mt-1">
          {score >= 70 ? "Passing" : "Keep studying"}
        </span>
      </div>
    </div>
  );
}

function QuizSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "mixed";
  const chapterParam = searchParams.get("chapter");
  const chaptersParam = searchParams.get("chapters");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [answerAnimating, setAnswerAnimating] = useState(false);
  const [progressMap, setProgressMap] = useState<
    Map<string, QuestionProgressRow>
  >(new Map());
  const supabase = createClient();

  const isExamMode = mode === "exam_simulation";
  const isQuick10 = mode === "quick10";

  useEffect(() => {
    loadQuestions();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    function handleShortcut(e: Event) {
      const { action, value } = (e as CustomEvent).detail;
      if (action === "select_answer" && typeof value === "number") {
        if (value >= 0 && value < (questions[currentIndex]?.options.length ?? 0)) {
          selectAnswer(value);
        }
      } else if (action === "next_question" && selected !== null && !answerAnimating) {
        nextQuestion();
      }
    }
    window.addEventListener("shortcut", handleShortcut);
    return () => window.removeEventListener("shortcut", handleShortcut);
  });

  useEffect(() => {
    if (!isExamMode || quizComplete) return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isExamMode, quizComplete]);

  async function loadQuestions() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase.from("questions").select("*");
    if (mode === "chapter" && chapterParam) {
      query = query.eq("chapter", parseInt(chapterParam));
    } else if (mode === "weak_chapters" && chaptersParam) {
      const chapterNums = chaptersParam.split(",").map(Number);
      query = query.in("chapter", chapterNums);
    }

    const { data } = await query;
    let qs = (data || []) as Question[];

    // Load question_progress for spaced repetition sorting
    let progMap = new Map<string, QuestionProgressRow>();
    if (user) {
      const { data: progress } = await supabase
        .from("question_progress")
        .select("*")
        .eq("user_id", user.id);

      if (progress) {
        progress.forEach((p: QuestionProgressRow) => {
          progMap.set(p.question_id, p);
        });
      }
    }
    setProgressMap(progMap);

    // For mixed / weak_chapters modes, use spaced repetition ordering:
    // 1. Never seen first, 2. Due for review (next_review_at <= now), 3. Random
    if (mode === "mixed" || mode === "weak_chapters") {
      const now = new Date();
      qs.sort((a, b) => {
        const aProg = progMap.get(a.id);
        const bProg = progMap.get(b.id);

        const aNeverSeen = !aProg;
        const bNeverSeen = !bProg;
        if (aNeverSeen !== bNeverSeen) return aNeverSeen ? -1 : 1;

        if (aProg && bProg) {
          const aDue =
            !aProg.next_review_at || new Date(aProg.next_review_at) <= now;
          const bDue =
            !bProg.next_review_at || new Date(bProg.next_review_at) <= now;
          if (aDue !== bDue) return aDue ? -1 : 1;
        }

        return Math.random() - 0.5;
      });
    } else {
      // Shuffle for other modes
      qs = qs.sort(() => Math.random() - 0.5);
    }

    // Limit based on mode
    if (isExamMode) qs = qs.slice(0, 20);
    else if (isQuick10) qs = qs.slice(0, 10);
    else if (mode === "mixed") qs = qs.slice(0, 15);
    else if (mode === "weak_chapters") qs = qs.slice(0, 15);

    setQuestions(qs);
    setQuestionStartTime(Date.now());
    setLoading(false);
  }

  async function upsertQuestionProgress(
    questionId: string,
    wasCorrect: boolean
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const existing = progressMap.get(questionId);
    const timesSeen = (existing?.times_seen || 0) + 1;
    const timesCorrect = (existing?.times_correct || 0) + (wasCorrect ? 1 : 0);
    const nextReview = getQuestionNextReview(wasCorrect, timesSeen);

    if (existing) {
      await supabase
        .from("question_progress")
        .update({
          times_seen: timesSeen,
          times_correct: timesCorrect,
          last_seen_at: new Date().toISOString(),
          next_review_at: nextReview,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("question_progress").insert({
        user_id: user.id,
        question_id: questionId,
        times_seen: timesSeen,
        times_correct: timesCorrect,
        last_seen_at: new Date().toISOString(),
        next_review_at: nextReview,
      });
    }

    // Update local map
    setProgressMap((prev) => {
      const next = new Map(prev);
      next.set(questionId, {
        id: existing?.id || "pending",
        question_id: questionId,
        times_seen: timesSeen,
        times_correct: timesCorrect,
        next_review_at: nextReview,
      });
      return next;
    });
  }

  function selectAnswer(index: number) {
    if (selected !== null) return;
    setSelected(index);
    setAnswerAnimating(true);

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const question = questions[currentIndex];

    setAnswers((prev) => [
      ...prev,
      {
        question_id: question.id,
        selected: index,
        correct: question.correct_answer,
        time_spent_seconds: timeSpent,
      },
    ]);

    // Upsert question progress for spaced repetition
    upsertQuestionProgress(question.id, index === question.correct_answer);

    // Brief animation before showing explanation or advancing
    setTimeout(() => {
      setAnswerAnimating(false);
      if (!isExamMode) {
        setShowExplanation(true);
      } else {
        setTimeout(() => nextQuestion(), 300);
      }
    }, 600);
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  }

  async function finishQuiz() {
    setQuizComplete(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const correctCount = answers.filter(
      (a) => a.selected === a.correct
    ).length;
    const score = Math.round((correctCount / questions.length) * 100);

    await supabase.from("quiz_results").insert({
      user_id: user.id,
      quiz_type: mode,
      chapter:
        mode === "chapter" && chapterParam ? parseInt(chapterParam) : null,
      score,
      total_questions: questions.length,
      correct_count: correctCount,
      answers,
      completed_at: new Date().toISOString(),
    });
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  // No questions
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center bg-gray-900 rounded-2xl p-8 border border-gray-800 max-w-sm">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-white font-medium mb-2">No questions found</p>
          <p className="text-gray-400 text-sm mb-6">
            There aren&apos;t any questions available for this selection yet.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors min-h-[48px]"
          >
            Try another mode
          </Link>
        </div>
      </div>
    );
  }

  // Results screen
  if (quizComplete) {
    const correctCount = answers.filter(
      (a) => a.selected === a.correct
    ).length;
    const score = Math.round((correctCount / questions.length) * 100);

    // Calculate chapter breakdown of wrong answers
    const wrongByChapter = new Map<number, number>();
    const missedQuestionIds: string[] = [];
    questions.forEach((q, i) => {
      const answer = answers[i];
      if (answer && answer.selected !== q.correct_answer) {
        wrongByChapter.set(
          q.chapter,
          (wrongByChapter.get(q.chapter) || 0) + 1
        );
        missedQuestionIds.push(q.id);
      }
    });
    const wrongChapters = Array.from(wrongByChapter.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    return (
      <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Score Section */}
          <div className="text-center mb-8 pt-4">
            <div className="text-4xl mb-4">
              {score >= 70 ? "🎉" : score >= 50 ? "💪" : "📚"}
            </div>
            <h1 className="text-2xl font-bold text-white mb-6">
              Quiz Complete!
            </h1>

            <CircularProgress score={score} />

            <p className="text-gray-400 mt-4">
              {correctCount} of {questions.length} correct
              {isExamMode && (
                <span className="ml-2 text-gray-500">
                  ·{" "}
                  {Math.floor(timerSeconds / 60)}:
                  {(timerSeconds % 60).toString().padStart(2, "0")}
                </span>
              )}
            </p>
          </div>

          {/* Drill Your Weak Spots Button */}
          {missedQuestionIds.length > 0 && (
            <Link
              href={`/quiz/drill?missed=${missedQuestionIds.join(",")}`}
              className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 hover:border-red-400/50 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl shrink-0">
                🎯
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-red-300 group-hover:text-red-200 transition-colors">
                  Drill Your Weak Spots
                </div>
                <div className="text-sm text-gray-400">
                  Review flashcards and re-quiz on the {missedQuestionIds.length}{" "}
                  question{missedQuestionIds.length !== 1 ? "s" : ""} you missed
                </div>
              </div>
              <svg
                className="w-5 h-5 text-red-400/60 group-hover:text-red-400 transition-colors shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}

          {/* Chapter Breakdown for Wrong Answers */}
          {wrongChapters.length > 0 && (
            <div className="mb-8 bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                Chapters to review
              </h2>
              <div className="space-y-3">
                {wrongChapters.map(([ch, wrongCount]) => (
                  <div
                    key={ch}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 text-sm font-bold shrink-0">
                        {ch}
                      </span>
                      <span className="text-sm text-gray-300">
                        Chapter {ch}{" "}
                        <span className="text-gray-500">
                          — {wrongCount} wrong
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/flashcards?chapter=${ch}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 transition-colors min-h-[32px] flex items-center"
                      >
                        Flashcards
                      </Link>
                      <Link
                        href={`/chapters/${ch}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors min-h-[32px] flex items-center"
                      >
                        Study
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer Review */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              Question Review
            </h2>
            <div className="space-y-3">
              {questions.map((q, i) => {
                const answer = answers[i];
                const isCorrect = answer?.selected === q.correct_answer;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border ${
                      isCorrect
                        ? "border-green-800/60 bg-green-900/10"
                        : "border-red-800/60 bg-red-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isCorrect
                            ? "bg-green-600/20 text-green-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm mb-2 leading-relaxed">
                          {i + 1}. {q.question}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-red-400/80 mb-1">
                            Your answer: {q.options[answer?.selected ?? 0]}
                          </p>
                        )}
                        <p className="text-sm text-green-400/80 mb-2">
                          Correct: {q.options[q.correct_answer]}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {q.explanation}
                        </p>
                        {!isCorrect && (
                          <div className="flex gap-2 mt-3">
                            <Link
                              href={`/chapters/${q.chapter}`}
                              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 transition-colors min-h-[32px] flex items-center gap-1"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                              Study Ch. {q.chapter}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-4">
            <Link
              href="/quiz"
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-center font-semibold rounded-xl transition-all min-h-[56px] flex items-center justify-center shadow-lg shadow-blue-900/20"
            >
              New Quiz
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white text-center font-semibold rounded-xl transition-colors min-h-[56px] flex items-center justify-center"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz
  const question = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const modeLabel = isExamMode
    ? "Exam Simulation"
    : isQuick10
      ? "Quick 10"
      : mode === "chapter"
        ? `Chapter ${chapterParam}`
        : mode === "weak_chapters"
          ? "Weak Areas"
          : "Mixed Review";

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (
                  confirm("Are you sure you want to quit this quiz?")
                ) {
                  router.push("/quiz");
                }
              }}
              className="text-gray-500 hover:text-gray-300 p-2 -ml-2 rounded-lg hover:bg-gray-800/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <span className="text-sm text-gray-500">{modeLabel}</span>
          </div>

          {/* Timer (exam mode) */}
          {isExamMode && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/15 border border-amber-500/30">
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-amber-400 font-mono font-bold text-lg">
                {Math.floor(timerSeconds / 60)}:
                {(timerSeconds % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white">
              Question {currentIndex + 1}{" "}
              <span className="text-gray-500">of {questions.length}</span>
            </span>
            <span className="text-xs text-gray-500">
              Ch. {question.chapter}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6 relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
          <p className="text-lg text-white leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrectAnswer = i === question.correct_answer;
            const answered = selected !== null;

            let containerStyle =
              "border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-900/80";
            let badgeStyle = LETTER_COLORS_DEFAULT[i] || LETTER_COLORS_DEFAULT[0];

            if (answered) {
              if (isCorrectAnswer) {
                containerStyle = answerAnimating
                  ? "border-green-500 bg-green-900/30 ring-2 ring-green-500/40 scale-[1.01]"
                  : "border-green-500 bg-green-900/20";
                badgeStyle =
                  "bg-green-600/30 text-green-300 border-green-500/50";
              } else if (isSelected && !isCorrectAnswer) {
                containerStyle = answerAnimating
                  ? "border-red-500 bg-red-900/30 ring-2 ring-red-500/40 shake"
                  : "border-red-500 bg-red-900/20";
                badgeStyle = "bg-red-600/30 text-red-300 border-red-500/50";
              } else {
                containerStyle =
                  "border-gray-800/50 bg-gray-900/30 opacity-50";
                badgeStyle =
                  "bg-gray-800/50 text-gray-600 border-gray-700/50";
              }
            }

            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={answered}
                className={`w-full text-left px-4 py-4 rounded-xl border transition-all duration-300 min-h-[56px] flex items-center gap-3 ${containerStyle}`}
              >
                <span
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-300 ${badgeStyle}`}
                >
                  {LETTER_BADGES[i]}
                </span>
                <span className={`${answered && !isCorrectAnswer && !isSelected ? "text-gray-600" : answered && isCorrectAnswer ? "text-green-300" : answered && isSelected ? "text-red-300" : "text-gray-200"} transition-colors duration-300`}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-5 p-5 bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <span className="text-lg">💡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-400 mb-1">
                  Explanation
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {selected !== null && !isExamMode && !answerAnimating && (
          <button
            onClick={nextQuestion}
            className="w-full mt-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all min-h-[56px] text-lg shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                Next Question
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            ) : (
              "See Results"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuizSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Loading quiz...</p>
          </div>
        </div>
      }
    >
      <QuizSession />
    </Suspense>
  );
}
