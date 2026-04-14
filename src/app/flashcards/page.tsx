"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNextReviewDate } from "@/lib/flashcards/spaced-repetition";
import Link from "next/link";

type Flashcard = {
  id: string;
  chapter: number;
  term: string;
  definition: string;
};

type FlashcardWithProgress = Flashcard & {
  progressId?: string;
  reviewCount: number;
};

export default function FlashcardsPage() {
  const [cards, setCards] = useState<FlashcardWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    nailed: 0,
    kinda: 0,
    missed: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    loadCards();
  }, [selectedChapter]);

  async function loadCards() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase.from("flashcards").select("*").eq("is_default", true);
    if (selectedChapter) {
      query = query.eq("chapter", selectedChapter);
    }
    const { data: flashcards } = await query;

    const { data: progress } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", user.id);

    const progressMap = new Map(
      (progress || []).map(
        (p: { flashcard_id: string; id: string; review_count: number }) => [
          p.flashcard_id,
          p,
        ]
      )
    );

    const now = new Date();
    const cardsWithProgress: FlashcardWithProgress[] = (flashcards || []).map(
      (f: Flashcard) => {
        const prog = progressMap.get(f.id) as
          | { id: string; review_count: number; next_review_at: string }
          | undefined;
        return {
          ...f,
          progressId: prog?.id,
          reviewCount: prog?.review_count || 0,
        };
      }
    );

    cardsWithProgress.sort((a, b) => {
      const aProg = progressMap.get(a.id) as
        | { next_review_at: string }
        | undefined;
      const bProg = progressMap.get(b.id) as
        | { next_review_at: string }
        | undefined;
      const aDue = !aProg || new Date(aProg.next_review_at) <= now;
      const bDue = !bProg || new Date(bProg.next_review_at) <= now;
      if (aDue !== bDue) return aDue ? -1 : 1;
      return a.chapter - b.chapter;
    });

    setCards(cardsWithProgress);
    setCurrentIndex(0);
    setFlipped(false);
    setLoading(false);
  }

  async function rateCard(rating: "didnt_know" | "kinda_knew" | "nailed_it") {
    const card = cards[currentIndex];
    if (!card) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const nextReview = getNextReviewDate(rating, card.reviewCount);

    if (card.progressId) {
      await supabase
        .from("flashcard_progress")
        .update({
          rating,
          next_review_at: nextReview.toISOString(),
          review_count: card.reviewCount + 1,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", card.progressId);
    } else {
      await supabase.from("flashcard_progress").insert({
        user_id: user.id,
        flashcard_id: card.id,
        rating,
        next_review_at: nextReview.toISOString(),
        review_count: 1,
        last_reviewed_at: new Date().toISOString(),
      });
    }

    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      nailed: prev.nailed + (rating === "nailed_it" ? 1 : 0),
      kinda: prev.kinda + (rating === "kinda_knew" ? 1 : 0),
      missed: prev.missed + (rating === "didnt_know" ? 1 : 0),
    }));

    // Animate out then advance
    setAnimating(true);
    setTimeout(() => {
      setFlipped(false);
      setAnimating(false);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(-1);
      }
    }, 300);
  }

  function handleFlip() {
    if (animating) return;
    setFlipped(!flipped);
  }

  const chapters = Array.from({ length: 20 }, (_, i) => i + 1);
  const card = currentIndex >= 0 ? cards[currentIndex] : null;
  const progressPercent =
    cards.length > 0
      ? Math.round(((sessionStats.reviewed) / cards.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Flashcards</h1>
            <p className="text-gray-500 text-xs">
              {cards.length} cards
              {selectedChapter ? ` · Chapter ${selectedChapter}` : ""}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-white text-sm"
          >
            Back
          </Link>
        </div>

        {/* Chapter filter — compact scrollable pills */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedChapter(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !selectedChapter
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {chapters.map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChapter(ch)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedChapter === ch
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        {card && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                Card {currentIndex + 1} of {cards.length}
              </span>
              <span>{progressPercent}% complete</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Session stats bar */}
        {sessionStats.reviewed > 0 && card && (
          <div className="flex justify-center gap-5 mb-4 text-xs">
            <span className="text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
              {sessionStats.nailed}
            </span>
            <span className="text-yellow-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full inline-block" />
              {sessionStats.kinda}
            </span>
            <span className="text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full inline-block" />
              {sessionStats.missed}
            </span>
          </div>
        )}

        {/* THE FLASHCARD */}
        {card ? (
          <>
            <div
              onClick={handleFlip}
              className={`relative cursor-pointer select-none transition-all duration-300 ${
                animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
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
                {/* FRONT — Term */}
                <div
                  className="rounded-2xl min-h-[340px] md:min-h-[380px] flex flex-col"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="bg-gradient-to-br from-blue-600/20 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col shadow-2xl shadow-blue-900/10">
                    {/* Card top bar */}
                    <div className="flex justify-between items-center px-5 pt-4">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400/80">
                        Chapter {card.chapter}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-gray-600">
                        Term
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="mx-5 mt-3 h-px bg-gradient-to-r from-blue-500/30 via-gray-700 to-transparent" />

                    {/* Term content */}
                    <div className="flex-1 flex flex-col items-center justify-center px-8 py-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-white text-center leading-snug">
                        {card.term}
                      </h2>
                    </div>

                    {/* Bottom hint */}
                    <div className="pb-5 text-center">
                      <span className="text-gray-600 text-xs">
                        Tap to reveal definition
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK — Definition */}
                <div
                  className="rounded-2xl min-h-[340px] md:min-h-[380px] flex flex-col absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="bg-gradient-to-br from-green-600/15 via-gray-900 to-gray-900 border border-gray-700 rounded-2xl flex-1 flex flex-col shadow-2xl shadow-green-900/10">
                    {/* Card top bar */}
                    <div className="flex justify-between items-center px-5 pt-4">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400/80">
                        Chapter {card.chapter}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-gray-600">
                        Definition
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="mx-5 mt-3 h-px bg-gradient-to-r from-green-500/30 via-gray-700 to-transparent" />

                    {/* Term (small, at top for reference) */}
                    <div className="px-6 pt-5">
                      <p className="text-sm font-semibold text-white/60">
                        {card.term}
                      </p>
                    </div>

                    {/* Definition content */}
                    <div className="flex-1 flex items-center px-6 py-4">
                      <p className="text-base md:text-lg text-gray-200 leading-relaxed">
                        {card.definition}
                      </p>
                    </div>

                    {/* Bottom hint */}
                    <div className="pb-5 text-center">
                      <span className="text-gray-600 text-xs">
                        Rate your knowledge below
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating buttons — only show when flipped */}
            {flipped && (
              <div className="grid grid-cols-3 gap-3 mt-5">
                <button
                  onClick={() => rateCard("didnt_know")}
                  className="py-4 bg-red-950/60 border border-red-800 text-red-400 rounded-xl hover:bg-red-900/40 transition-all text-sm font-semibold flex flex-col items-center gap-1"
                >
                  <span className="text-lg">&#10060;</span>
                  <span>Missed</span>
                </button>
                <button
                  onClick={() => rateCard("kinda_knew")}
                  className="py-4 bg-yellow-950/60 border border-yellow-800 text-yellow-400 rounded-xl hover:bg-yellow-900/40 transition-all text-sm font-semibold flex flex-col items-center gap-1"
                >
                  <span className="text-lg">&#128566;</span>
                  <span>Kinda</span>
                </button>
                <button
                  onClick={() => rateCard("nailed_it")}
                  className="py-4 bg-green-950/60 border border-green-800 text-green-400 rounded-xl hover:bg-green-900/40 transition-all text-sm font-semibold flex flex-col items-center gap-1"
                >
                  <span className="text-lg">&#9989;</span>
                  <span>Nailed It</span>
                </button>
              </div>
            )}
          </>
        ) : cards.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-4">🗂️</div>
            <p className="text-gray-400">
              No flashcards for this chapter yet.
            </p>
          </div>
        ) : (
          /* Session complete */
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Session Complete!
            </h2>
            <p className="text-gray-400 mb-6">
              You reviewed {sessionStats.reviewed} cards
            </p>

            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {sessionStats.nailed}
                </div>
                <div className="text-xs text-gray-500">Nailed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {sessionStats.kinda}
                </div>
                <div className="text-xs text-gray-500">Kinda</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {sessionStats.missed}
                </div>
                <div className="text-xs text-gray-500">Missed</div>
              </div>
            </div>

            {sessionStats.reviewed > 0 && (
              <div className="mb-6">
                <div className="text-4xl font-bold text-white">
                  {Math.round(
                    (sessionStats.nailed / sessionStats.reviewed) * 100
                  )}
                  %
                </div>
                <div className="text-xs text-gray-500 mt-1">Accuracy</div>
              </div>
            )}

            <button
              onClick={() => {
                setSessionStats({
                  reviewed: 0,
                  nailed: 0,
                  kinda: 0,
                  missed: 0,
                });
                loadCards();
              }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Study Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
