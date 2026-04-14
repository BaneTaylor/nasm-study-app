"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { seedQuestions } from "@/lib/quiz/seed-questions";
import { seedQuestions2 } from "@/lib/quiz/seed-questions-2";
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

function QuizSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "mixed";
  const chapterParam = searchParams.get("chapter");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const supabase = createClient();

  const isExamMode = mode === "exam_simulation";

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (!isExamMode || quizComplete) return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isExamMode, quizComplete]);

  async function loadQuestions() {
    setLoading(true);

    // Check if questions exist, seed if not
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true });

    if (count === 0) {
      const allQuestions = [...seedQuestions, ...seedQuestions2];
      await supabase.from("questions").insert(
        allQuestions.map((q) => ({
          chapter: q.chapter,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
        }))
      );
    }

    let query = supabase.from("questions").select("*");
    if (mode === "chapter" && chapterParam) {
      query = query.eq("chapter", parseInt(chapterParam));
    }

    const { data } = await query;
    let qs = (data || []) as Question[];

    // Shuffle
    qs = qs.sort(() => Math.random() - 0.5);

    // Limit based on mode
    if (isExamMode) qs = qs.slice(0, 20);
    else if (mode === "mixed") qs = qs.slice(0, 15);

    setQuestions(qs);
    setQuestionStartTime(Date.now());
    setLoading(false);
  }

  function selectAnswer(index: number) {
    if (selected !== null) return;
    setSelected(index);

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

    if (!isExamMode) {
      setShowExplanation(true);
    } else {
      // In exam mode, auto-advance after brief delay
      setTimeout(() => nextQuestion(), 500);
    }
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
      chapter: mode === "chapter" && chapterParam ? parseInt(chapterParam) : null,
      score,
      total_questions: questions.length,
      correct_count: correctCount,
      answers,
      completed_at: new Date().toISOString(),
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            No questions available for this selection yet.
          </p>
          <Link
            href="/quiz"
            className="text-blue-400 hover:text-blue-300"
          >
            Try another mode
          </Link>
        </div>
      </div>
    );
  }

  // Quiz complete — show results
  if (quizComplete) {
    const correctCount = answers.filter(
      (a) => a.selected === a.correct
    ).length;
    const score = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">
              {score >= 70 ? "🎉" : score >= 50 ? "💪" : "📚"}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Quiz Complete!
            </h1>
            <p
              className={`text-4xl font-bold ${
                score >= 70
                  ? "text-green-400"
                  : score >= 50
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {score}%
            </p>
            <p className="text-gray-400 mt-2">
              {correctCount} of {questions.length} correct
              {isExamMode &&
                ` · ${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60)
                  .toString()
                  .padStart(2, "0")}`}
            </p>
          </div>

          {/* Review answers */}
          <div className="space-y-4 mb-8">
            {questions.map((q, i) => {
              const answer = answers[i];
              const isCorrect = answer?.selected === q.correct_answer;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border ${
                    isCorrect
                      ? "border-green-800 bg-green-900/20"
                      : "border-red-800 bg-red-900/20"
                  }`}
                >
                  <p className="text-white text-sm mb-2">
                    {i + 1}. {q.question}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-red-400 mb-1">
                      Your answer: {q.options[answer?.selected ?? 0]}
                    </p>
                  )}
                  <p className="text-sm text-green-400 mb-2">
                    Correct: {q.options[q.correct_answer]}
                  </p>
                  <p className="text-xs text-gray-500">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Link
              href="/quiz"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
            >
              New Quiz
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white text-center font-medium rounded-lg transition-colors"
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

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400 text-sm">
            Question {currentIndex + 1} of {questions.length}
          </span>
          {isExamMode && (
            <span className="text-yellow-400 text-sm">
              {Math.floor(timerSeconds / 60)}:
              {(timerSeconds % 60).toString().padStart(2, "0")}
            </span>
          )}
          <span className="text-gray-500 text-xs">Ch {question.chapter}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <p className="text-lg text-white mb-6 leading-relaxed">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            let style = "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500";
            if (selected !== null) {
              if (i === question.correct_answer) {
                style = "border-green-500 bg-green-900/30 text-green-300";
              } else if (i === selected && i !== question.correct_answer) {
                style = "border-red-500 bg-red-900/30 text-red-300";
              } else {
                style = "border-gray-800 bg-gray-900/50 text-gray-600";
              }
            }
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-4 rounded-lg border transition-colors ${style}`}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">Explanation: </span>
              {question.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {selected !== null && !isExamMode && (
          <button
            onClick={nextQuestion}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
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
          <p className="text-gray-400">Loading quiz...</p>
        </div>
      }
    >
      <QuizSession />
    </Suspense>
  );
}
