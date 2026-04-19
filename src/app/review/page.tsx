"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  calculateNextReview,
  autoRateQuizAnswer,
  getUpcomingReviews,
  type SRSCard,
  type ReviewRating,
} from "@/lib/srs/engine";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReviewItem = {
  id: string; // progress row id
  type: "flashcard" | "question";
  sourceId: string;
  // Flashcard fields
  term?: string;
  definition?: string;
  chapter?: number;
  // Question fields
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  difficulty?: string;
  // SRS fields
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  reviewCount: number;
};

type SessionStats = {
  reviewed: number;
  ratings: ReviewRating[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const RATING_CONFIG: {
  value: ReviewRating;
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: 1,
    label: "Forgot completely",
    shortLabel: "Again",
    color: "text-red-400",
    bg: "bg-red-950/60 hover:bg-red-900/50",
    border: "border-red-800",
  },
  {
    value: 2,
    label: "Wrong, but recognized",
    shortLabel: "Hard",
    color: "text-red-300",
    bg: "bg-red-950/40 hover:bg-red-900/30",
    border: "border-red-800/60",
  },
  {
    value: 3,
    label: "Almost had it",
    shortLabel: "Good",
    color: "text-yellow-400",
    bg: "bg-yellow-950/60 hover:bg-yellow-900/50",
    border: "border-yellow-800",
  },
  {
    value: 4,
    label: "Correct with effort",
    shortLabel: "Easy",
    color: "text-green-300",
    bg: "bg-green-950/40 hover:bg-green-900/30",
    border: "border-green-800/60",
  },
  {
    value: 5,
    label: "Easy recall",
    shortLabel: "Perfect",
    color: "text-green-400",
    bg: "bg-green-950/60 hover:bg-green-900/50",
    border: "border-green-800",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReviewPage() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SessionStats>({ reviewed: 0, ratings: [] });
  const [phase, setPhase] = useState<"loading" | "review" | "done" | "empty">(
    "loading"
  );

  // Flashcard state
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Question state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const questionStartTime = useRef<number>(Date.now());

  // Forecast for empty state
  const [forecast, setForecast] = useState<{ date: string; count: number }[]>(
    []
  );
  const [nextDueHours, setNextDueHours] = useState<number | null>(null);

  const supabase = createClient();

  // -------------------------------------------------------------------------
  // Load due items
  // -------------------------------------------------------------------------

  const loadDueItems = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPhase("empty");
      setLoading(false);
      return;
    }

    const now = new Date().toISOString();
    const items: ReviewItem[] = [];

    // Fetch due flashcard progress joined with flashcards
    const { data: flashcardRows } = await supabase
      .from("flashcard_progress")
      .select(
        "id, flashcard_id, review_count, ease_factor, interval_days, flashcards!inner(id, chapter, term, definition)"
      )
      .eq("user_id", user.id)
      .lte("next_review_at", now);

    if (flashcardRows) {
      for (const row of flashcardRows as any[]) {
        const fc = row.flashcards;
        items.push({
          id: row.id,
          type: "flashcard",
          sourceId: row.flashcard_id,
          term: fc.term,
          definition: fc.definition,
          chapter: fc.chapter,
          easeFactor: row.ease_factor ?? 2.5,
          intervalDays: row.interval_days ?? 0,
          repetitions: row.review_count ?? 0,
          reviewCount: row.review_count ?? 0,
        });
      }
    }

    // Fetch due question progress joined with questions
    const { data: questionRows } = await supabase
      .from("question_progress")
      .select(
        "id, question_id, times_seen, times_correct, ease_factor, interval_days, questions!inner(id, chapter, question, options, correct_answer, explanation, difficulty)"
      )
      .eq("user_id", user.id)
      .lte("next_review_at", now);

    if (questionRows) {
      for (const row of questionRows as any[]) {
        const q = row.questions;
        items.push({
          id: row.id,
          type: "question",
          sourceId: row.question_id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          chapter: q.chapter,
          easeFactor: row.ease_factor ?? 2.5,
          intervalDays: row.interval_days ?? 0,
          repetitions: row.times_correct ?? 0,
          reviewCount: row.times_seen ?? 0,
        });
      }
    }

    if (items.length === 0) {
      // Build forecast from all cards
      await buildForecast(user.id);
      setPhase("empty");
    } else {
      setQueue(shuffle(items));
      setCurrentIndex(0);
      setPhase("review");
    }

    setLoading(false);
  }, []);

  async function buildForecast(userId: string) {
    // Get all flashcard progress to forecast
    const { data: allFc } = await supabase
      .from("flashcard_progress")
      .select("next_review_at, ease_factor, interval_days, review_count")
      .eq("user_id", userId);

    const { data: allQ } = await supabase
      .from("question_progress")
      .select("next_review_at, ease_factor, interval_days, times_seen")
      .eq("user_id", userId);

    const allCards: SRSCard[] = [];
    const now = new Date();

    for (const row of [...(allFc || []), ...(allQ || [])] as any[]) {
      const nextReview = new Date(row.next_review_at);
      allCards.push({
        id: "",
        type: "flashcard",
        sourceId: "",
        difficulty: 3,
        interval: row.interval_days ?? 0,
        easeFactor: row.ease_factor ?? 2.5,
        repetitions: row.review_count ?? row.times_seen ?? 0,
        nextReview,
        lastReview: null,
      });
    }

    const forecastData = getUpcomingReviews(allCards, 7);
    setForecast(forecastData);

    // Find next due card
    const futureDue = allCards
      .filter((c) => c.nextReview > now)
      .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());

    if (futureDue.length > 0) {
      const hoursUntil = Math.max(
        1,
        Math.round(
          (futureDue[0].nextReview.getTime() - now.getTime()) / (1000 * 60 * 60)
        )
      );
      setNextDueHours(hoursUntil);
    }
  }

  useEffect(() => {
    loadDueItems();
  }, [loadDueItems]);

  // Reset question timer when moving to next card
  useEffect(() => {
    questionStartTime.current = Date.now();
    setSelectedOption(null);
    setAnswered(false);
    setFlipped(false);
  }, [currentIndex]);

  // -------------------------------------------------------------------------
  // Rating handlers
  // -------------------------------------------------------------------------

  async function handleFlashcardRate(rating: ReviewRating) {
    const item = queue[currentIndex];
    if (!item) return;

    const srsCard: SRSCard = {
      id: item.id,
      type: "flashcard",
      sourceId: item.sourceId,
      difficulty: 3,
      interval: item.intervalDays,
      easeFactor: item.easeFactor,
      repetitions: item.repetitions,
      nextReview: new Date(),
      lastReview: null,
    };

    const result = calculateNextReview(srsCard, rating);

    await supabase
      .from("flashcard_progress")
      .update({
        ease_factor: result.easeFactor,
        interval_days: result.interval,
        review_count: item.reviewCount + 1,
        next_review_at: result.nextReview.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    recordRatingAndAdvance(rating);
  }

  async function handleQuestionAnswer(optionIndex: number) {
    if (answered) return;
    setSelectedOption(optionIndex);
    setAnswered(true);

    const item = queue[currentIndex];
    if (!item) return;

    const correct = optionIndex === item.correctAnswer;
    const timeSpent = (Date.now() - questionStartTime.current) / 1000;
    const rating = autoRateQuizAnswer(correct, timeSpent);

    const srsCard: SRSCard = {
      id: item.id,
      type: "question",
      sourceId: item.sourceId,
      difficulty: 3,
      interval: item.intervalDays,
      easeFactor: item.easeFactor,
      repetitions: item.repetitions,
      nextReview: new Date(),
      lastReview: null,
    };

    const result = calculateNextReview(srsCard, rating);

    await supabase
      .from("question_progress")
      .update({
        ease_factor: result.easeFactor,
        interval_days: result.interval,
        times_seen: item.reviewCount + 1,
        times_correct: correct
          ? item.repetitions + 1
          : item.repetitions,
        next_review_at: result.nextReview.toISOString(),
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    // Auto-advance after short delay to show result
    setTimeout(() => {
      recordRatingAndAdvance(rating);
    }, 1500);
  }

  function recordRatingAndAdvance(rating: ReviewRating) {
    setStats((prev) => ({
      reviewed: prev.reviewed + 1,
      ratings: [...prev.ratings, rating],
    }));

    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (currentIndex < queue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setPhase("done");
      }
    }, 300);
  }

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const item = phase === "review" && currentIndex >= 0 ? queue[currentIndex] : null;
  const progressPercent =
    queue.length > 0 ? Math.round((stats.reviewed / queue.length) * 100) : 0;
  const retentionRate =
    stats.ratings.length > 0
      ? Math.round(
          (stats.ratings.filter((r) => r >= 4).length / stats.ratings.length) *
            100
        )
      : 0;

  // -------------------------------------------------------------------------
  // Render: Loading
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading review queue...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Empty (all caught up)
  // -------------------------------------------------------------------------

  if (phase === "empty") {
    const maxForecast = Math.max(...forecast.map((f) => f.count), 1);

    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-white">Daily Review</h1>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-white text-sm"
            >
              Back
            </Link>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">&#10003;</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              All caught up!
            </h2>
            <p className="text-gray-400 mb-6">
              {nextDueHours !== null
                ? `Next review in ${nextDueHours} hour${nextDueHours !== 1 ? "s" : ""}`
                : "No cards to review yet. Start studying to build your queue!"}
            </p>

            {/* Forecast chart */}
            {forecast.length > 0 && forecast.some((f) => f.count > 0) && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Upcoming reviews (next 7 days)
                </h3>
                <div className="flex items-end justify-center gap-2 h-32">
                  {forecast.map((day) => {
                    const height =
                      day.count > 0
                        ? Math.max(12, (day.count / maxForecast) * 100)
                        : 4;
                    const dateLabel = new Date(day.date + "T12:00:00")
                      .toLocaleDateString("en-US", { weekday: "short" });
                    return (
                      <div
                        key={day.date}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="text-[10px] text-gray-500">
                          {day.count > 0 ? day.count : ""}
                        </span>
                        <div
                          className={`w-8 rounded-t transition-all ${
                            day.count > 0 ? "bg-blue-600" : "bg-gray-800"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-gray-600">
                          {dateLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3 justify-center">
              <Link
                href="/flashcards"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm"
              >
                Study Flashcards
              </Link>
              <Link
                href="/quiz"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-sm"
              >
                Take a Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Session Complete
  // -------------------------------------------------------------------------

  if (phase === "done") {
    const ratingCounts = [0, 0, 0, 0, 0];
    stats.ratings.forEach((r) => ratingCounts[r - 1]++);

    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-white">Review Complete</h1>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-white text-sm"
            >
              Back
            </Link>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">&#127881;</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Session Complete!
            </h2>
            <p className="text-gray-400 mb-6">
              You reviewed {stats.reviewed} item{stats.reviewed !== 1 ? "s" : ""}
            </p>

            {/* Retention rate */}
            <div className="mb-8">
              <div className="text-4xl font-bold text-white">
                {retentionRate}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Retention Rate</div>
            </div>

            {/* Rating breakdown */}
            <div className="flex justify-center gap-4 mb-8">
              {RATING_CONFIG.map((rc, i) => (
                <div key={rc.value} className="text-center">
                  <div className={`text-xl font-bold ${rc.color}`}>
                    {ratingCounts[i]}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {rc.shortLabel}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setStats({ reviewed: 0, ratings: [] });
                  loadDueItems();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm"
              >
                Review Again
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-sm"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Active Review
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Daily Review</h1>
            <p className="text-gray-500 text-xs">
              {queue.length} item{queue.length !== 1 ? "s" : ""} due
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-white text-sm"
          >
            Exit
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>
              {stats.reviewed} / {queue.length} reviewed
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card content */}
        {item && (
          <div
            className={`transition-all duration-300 ${
              animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  item.type === "flashcard"
                    ? "bg-blue-600/20 text-blue-400"
                    : "bg-purple-600/20 text-purple-400"
                }`}
              >
                {item.type === "flashcard" ? "Flashcard" : "Question"}
              </span>
              {item.chapter && (
                <span className="text-[10px] text-gray-600">
                  Chapter {item.chapter}
                </span>
              )}
            </div>

            {/* Flashcard review */}
            {item.type === "flashcard" && (
              <>
                <div
                  onClick={() => !animating && setFlipped(!flipped)}
                  className="cursor-pointer select-none"
                  style={{ perspective: "1000px" }}
                >
                  <div
                    className="relative transition-transform duration-500"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Front - Term */}
                    <div
                      className="rounded-2xl min-h-[300px] md:min-h-[340px] flex flex-col"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="bg-gradient-to-br from-blue-600/20 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col shadow-2xl shadow-blue-900/10">
                        <div className="flex justify-end px-5 pt-4">
                          <span className="text-[10px] uppercase tracking-widest text-gray-600">
                            Term
                          </span>
                        </div>
                        <div className="mx-5 mt-3 h-px bg-gradient-to-r from-blue-500/30 via-gray-700 to-transparent" />
                        <div className="flex-1 flex flex-col items-center justify-center px-8 py-8">
                          <h2 className="text-2xl md:text-3xl font-bold text-white text-center leading-snug">
                            {item.term}
                          </h2>
                        </div>
                        <div className="pb-5 text-center">
                          <span className="text-gray-600 text-xs">
                            Tap to reveal definition
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Back - Definition */}
                    <div
                      className="rounded-2xl min-h-[300px] md:min-h-[340px] flex flex-col absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="bg-gradient-to-br from-green-600/15 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col shadow-2xl shadow-green-900/10">
                        <div className="flex justify-end px-5 pt-4">
                          <span className="text-[10px] uppercase tracking-widest text-gray-600">
                            Definition
                          </span>
                        </div>
                        <div className="mx-5 mt-3 h-px bg-gradient-to-r from-green-500/30 via-gray-700 to-transparent" />
                        <div className="px-6 pt-5">
                          <p className="text-sm font-semibold text-white/60">
                            {item.term}
                          </p>
                        </div>
                        <div className="flex-1 flex items-center px-6 py-4">
                          <p className="text-base md:text-lg text-gray-200 leading-relaxed">
                            {item.definition}
                          </p>
                        </div>
                        <div className="pb-5 text-center">
                          <span className="text-gray-600 text-xs">
                            Rate your recall below
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating buttons - only show when flipped */}
                {flipped && (
                  <div className="grid grid-cols-5 gap-2 mt-5">
                    {RATING_CONFIG.map((rc) => (
                      <button
                        key={rc.value}
                        onClick={() => handleFlashcardRate(rc.value)}
                        className={`py-3 ${rc.bg} border ${rc.border} ${rc.color} rounded-xl transition-all text-xs font-semibold flex flex-col items-center gap-1`}
                      >
                        <span className="text-base font-bold">{rc.value}</span>
                        <span className="leading-tight">{rc.shortLabel}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Question review */}
            {item.type === "question" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
                <p className="text-lg text-white font-medium leading-relaxed mb-6">
                  {item.question}
                </p>

                <div className="space-y-3">
                  {(item.options || []).map((option, i) => {
                    let optionStyle =
                      "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750 hover:border-gray-600";

                    if (answered) {
                      if (i === item.correctAnswer) {
                        optionStyle =
                          "bg-green-950/60 border-green-700 text-green-300";
                      } else if (
                        i === selectedOption &&
                        i !== item.correctAnswer
                      ) {
                        optionStyle =
                          "bg-red-950/60 border-red-700 text-red-300";
                      } else {
                        optionStyle =
                          "bg-gray-800/50 border-gray-800 text-gray-600";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleQuestionAnswer(i)}
                        disabled={answered}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${optionStyle}`}
                      >
                        <span className="font-medium mr-2 text-gray-500">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation after answering */}
                {answered && item.explanation && (
                  <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-widest">
                      Explanation
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
