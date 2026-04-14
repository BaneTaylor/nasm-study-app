"use client";

import { useEffect, useState, Suspense } from "react";
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

type Flashcard = {
  id: string;
  chapter: number;
  term: string;
  definition: string;
};

type DrillAnswer = {
  question_id: string;
  selected: number;
  correct: number;
};

type Phase = "loading" | "flashcards" | "quiz" | "results";

const LETTER_BADGES = ["A", "B", "C", "D"];
const LETTER_COLORS_DEFAULT = [
  "bg-blue-600/20 text-blue-400 border-blue-500/30",
  "bg-purple-600/20 text-purple-400 border-purple-500/30",
  "bg-amber-600/20 text-amber-400 border-amber-500/30",
  "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
];

function DrillSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const missedParam = searchParams.get("missed") || "";
  const missedIds = missedParam.split(",").filter(Boolean);

  const supabase = createClient();

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Flashcard state
  const [fcIndex, setFcIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [fcAnimating, setFcAnimating] = useState(false);

  // Quiz state
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<DrillAnswer[]>([]);
  const [answerAnimating, setAnswerAnimating] = useState(false);

  useEffect(() => {
    if (missedIds.length === 0) {
      router.push("/quiz");
      return;
    }
    loadDrillData();
  }, []);

  async function loadDrillData() {
    // Fetch the missed questions
    const { data: questionData } = await supabase
      .from("questions")
      .select("*")
      .in("id", missedIds);

    const qs = (questionData || []) as Question[];

    // Shuffle options order for re-quiz (keep correct_answer mapping)
    const shuffledQs = qs.map((q) => {
      const indices = q.options.map((_: string, i: number) => i);
      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return {
        ...q,
        options: indices.map((idx: number) => q.options[idx]),
        correct_answer: indices.indexOf(q.correct_answer),
      };
    });

    // Shuffle question order
    shuffledQs.sort(() => Math.random() - 0.5);
    setQuestions(shuffledQs);

    // Fetch related flashcards from the same chapters
    const chapters = [...new Set(qs.map((q) => q.chapter))];
    if (chapters.length > 0) {
      const { data: fcData } = await supabase
        .from("flashcards")
        .select("*")
        .eq("is_default", true)
        .in("chapter", chapters);

      let fcs = (fcData || []) as Flashcard[];
      // Shuffle and take a reasonable number (up to 2 per missed question, max 10)
      fcs.sort(() => Math.random() - 0.5);
      fcs = fcs.slice(0, Math.min(missedIds.length * 2, 10));
      setFlashcards(fcs);
    }

    // Start with flashcards phase if we have any, otherwise go straight to quiz
    if (chapters.length > 0) {
      setPhase("flashcards");
    } else {
      setPhase("quiz");
    }
  }

  // --- Flashcard handlers ---
  function handleFlip() {
    if (fcAnimating) return;
    setFlipped(!flipped);
  }

  function nextFlashcard() {
    setFcAnimating(true);
    setTimeout(() => {
      setFlipped(false);
      setFcAnimating(false);
      if (fcIndex < flashcards.length - 1) {
        setFcIndex((prev) => prev + 1);
      } else {
        // Move to quiz phase
        setPhase("quiz");
      }
    }, 250);
  }

  function skipToQuiz() {
    setPhase("quiz");
  }

  // --- Quiz handlers ---
  function selectAnswer(index: number) {
    if (selected !== null) return;
    setSelected(index);
    setAnswerAnimating(true);

    const question = questions[qIndex];
    setAnswers((prev) => [
      ...prev,
      {
        question_id: question.id,
        selected: index,
        correct: question.correct_answer,
      },
    ]);

    setTimeout(() => {
      setAnswerAnimating(false);
      setShowExplanation(true);
    }, 600);
  }

  function nextQuizQuestion() {
    if (qIndex < questions.length - 1) {
      setQIndex((prev) => prev + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setPhase("results");
    }
  }

  // --- Loading ---
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Preparing your drill...</p>
        </div>
      </div>
    );
  }

  // --- Flashcard Phase ---
  if (phase === "flashcards") {
    const card = flashcards[fcIndex];
    if (!card) {
      setPhase("quiz");
      return null;
    }

    const fcProgress = Math.round(((fcIndex + 1) / flashcards.length) * 100);

    return (
      <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-red-400">🎯</span> Weak Spot Drill
              </h1>
              <p className="text-xs text-gray-500">
                Step 1: Review related flashcards
              </p>
            </div>
            <button
              onClick={skipToQuiz}
              className="text-sm text-gray-500 hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors min-h-[44px]"
            >
              Skip to Quiz
            </button>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                Card {fcIndex + 1} of {flashcards.length}
              </span>
              <span>{fcProgress}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                style={{ width: `${fcProgress}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div
            onClick={handleFlip}
            className={`relative cursor-pointer select-none transition-all duration-300 ${
              fcAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
            style={{ perspective: "1000px" }}
          >
            <div
              className="relative transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className="rounded-2xl min-h-[300px] flex flex-col"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="bg-gradient-to-br from-red-600/15 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col shadow-2xl">
                  <div className="flex justify-between items-center px-5 pt-4">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-red-400/80">
                      Chapter {card.chapter}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-600">
                      Term
                    </span>
                  </div>
                  <div className="mx-5 mt-3 h-px bg-gradient-to-r from-red-500/30 via-gray-700 to-transparent" />
                  <div className="flex-1 flex flex-col items-center justify-center px-8 py-8">
                    <h2 className="text-2xl font-bold text-white text-center leading-snug">
                      {card.term}
                    </h2>
                  </div>
                  <div className="pb-5 text-center">
                    <span className="text-gray-600 text-xs">
                      Tap to reveal definition
                    </span>
                  </div>
                </div>
              </div>

              {/* Back */}
              <div
                className="rounded-2xl min-h-[300px] flex flex-col absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="bg-gradient-to-br from-orange-600/15 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col shadow-2xl">
                  <div className="flex justify-between items-center px-5 pt-4">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-400/80">
                      Chapter {card.chapter}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-600">
                      Definition
                    </span>
                  </div>
                  <div className="mx-5 mt-3 h-px bg-gradient-to-r from-orange-500/30 via-gray-700 to-transparent" />
                  <div className="px-6 pt-5">
                    <p className="text-sm font-semibold text-white/60">
                      {card.term}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center px-6 py-4">
                    <p className="text-base text-gray-200 leading-relaxed">
                      {card.definition}
                    </p>
                  </div>
                  <div className="pb-5 text-center">
                    <span className="text-gray-600 text-xs">
                      Tap &quot;Next&quot; to continue
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next flashcard button */}
          {flipped && (
            <button
              onClick={nextFlashcard}
              className="w-full mt-5 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all min-h-[56px] text-lg shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
            >
              {fcIndex < flashcards.length - 1 ? (
                <>
                  Next Card
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
                <>
                  Start Re-Quiz
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
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Quiz Phase ---
  if (phase === "quiz") {
    if (questions.length === 0) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
          <div className="text-center bg-gray-900 rounded-2xl p-8 border border-gray-800 max-w-sm">
            <div className="text-4xl mb-4">🤔</div>
            <p className="text-white font-medium mb-2">
              No questions to drill
            </p>
            <p className="text-gray-400 text-sm mb-6">
              The missed questions could not be loaded.
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors min-h-[48px]"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      );
    }

    const question = questions[qIndex];
    const quizProgress = Math.round(((qIndex + 1) / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-red-400">🎯</span> Weak Spot Drill
              </h1>
              <p className="text-xs text-gray-500">
                Step 2: Re-quiz on missed questions
              </p>
            </div>
            <span className="text-xs text-gray-500">Ch. {question.chapter}</span>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">
                Question {qIndex + 1}{" "}
                <span className="text-gray-500">of {questions.length}</span>
              </span>
              <span className="text-xs text-gray-500">{quizProgress}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${quizProgress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600" />
            <p className="text-lg text-white leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrectAnswer = i === question.correct_answer;
              const answered = selected !== null;

              let containerStyle =
                "border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-900/80";
              let badgeStyle =
                LETTER_COLORS_DEFAULT[i] || LETTER_COLORS_DEFAULT[0];

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
                  <span
                    className={`${answered && !isCorrectAnswer && !isSelected ? "text-gray-600" : answered && isCorrectAnswer ? "text-green-300" : answered && isSelected ? "text-red-300" : "text-gray-200"} transition-colors duration-300`}
                  >
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

          {/* Next */}
          {selected !== null && !answerAnimating && (
            <button
              onClick={nextQuizQuestion}
              className="w-full mt-5 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all min-h-[56px] text-lg shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
            >
              {qIndex < questions.length - 1 ? (
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

  // --- Results Phase ---
  const correctCount = answers.filter((a) => a.selected === a.correct).length;
  const totalCount = questions.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const improved = correctCount > 0;
  const perfectScore = correctCount === totalCount;

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Results Header */}
        <div className="text-center mb-8 pt-6">
          <div className="text-4xl mb-4">
            {perfectScore ? "🌟" : improved ? "📈" : "💪"}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Drill Complete!
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            {perfectScore
              ? "You nailed every question this time!"
              : improved
                ? "You're making progress on these tough spots."
                : "Keep reviewing — you'll get there!"}
          </p>

          {/* Score circle */}
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-gray-800 mb-4 relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${score >= 70 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444"} ${score * 3.6}deg, transparent 0deg)`,
                mask: "radial-gradient(circle, transparent 60%, black 61%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 60%, black 61%)",
              }}
            />
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${score >= 70 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400"}`}
              >
                {score}%
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            {correctCount} of {totalCount} correct
          </p>

          {/* Improvement indicator */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800">
            <span className="text-xs text-gray-400">
              Originally missed: {totalCount}
            </span>
            <span className="text-gray-700">|</span>
            <span
              className={`text-xs font-medium ${correctCount > 0 ? "text-green-400" : "text-gray-500"}`}
            >
              Now correct: {correctCount}
            </span>
          </div>
        </div>

        {/* Question Review */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Review
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
                        {q.question}
                      </p>
                      {!isCorrect && answer && (
                        <p className="text-sm text-red-400/80 mb-1">
                          Your answer: {q.options[answer.selected]}
                        </p>
                      )}
                      <p className="text-sm text-green-400/80 mb-2">
                        Correct: {q.options[q.correct_answer]}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {q.explanation}
                      </p>
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

export default function DrillPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Loading drill...</p>
          </div>
        </div>
      }
    >
      <DrillSession />
    </Suspense>
  );
}
