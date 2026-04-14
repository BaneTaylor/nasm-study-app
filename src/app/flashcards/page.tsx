"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNextReviewDate } from "@/lib/flashcards/spaced-repetition";
import { seedFlashcards } from "@/lib/flashcards/seed-data";
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

    // Check if flashcards exist, if not seed them
    const { count } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("is_default", true);

    if (count === 0) {
      await supabase.from("flashcards").insert(
        seedFlashcards.map((f) => ({
          chapter: f.chapter,
          term: f.term,
          definition: f.definition,
          is_default: true,
          created_by: null,
        }))
      );
    }

    // Fetch flashcards with optional chapter filter
    let query = supabase.from("flashcards").select("*").eq("is_default", true);
    if (selectedChapter) {
      query = query.eq("chapter", selectedChapter);
    }
    const { data: flashcards } = await query;

    // Fetch user's progress
    const { data: progress } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", user.id);

    const progressMap = new Map(
      (progress || []).map((p: { flashcard_id: string; id: string; review_count: number }) => [
        p.flashcard_id,
        p,
      ])
    );

    // Build cards with progress, prioritize due cards
    const now = new Date();
    const cardsWithProgress: FlashcardWithProgress[] = (flashcards || []).map(
      (f: Flashcard) => {
        const prog = progressMap.get(f.id) as { id: string; review_count: number; next_review_at: string } | undefined;
        return {
          ...f,
          progressId: prog?.id,
          reviewCount: prog?.review_count || 0,
        };
      }
    );

    // Sort: unreviewed first, then due for review, then by chapter
    cardsWithProgress.sort((a, b) => {
      const aProg = progressMap.get(a.id) as { next_review_at: string } | undefined;
      const bProg = progressMap.get(b.id) as { next_review_at: string } | undefined;
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

    setFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(-1); // session complete
    }
  }

  const chapters = Array.from({ length: 20 }, (_, i) => i + 1);
  const card = currentIndex >= 0 ? cards[currentIndex] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading flashcards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Flashcards</h1>
            <p className="text-gray-400 text-sm">
              {cards.length} cards{" "}
              {selectedChapter ? `· Chapter ${selectedChapter}` : "· All chapters"}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Chapter filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedChapter(null)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
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
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedChapter === ch
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Ch {ch}
            </button>
          ))}
        </div>

        {/* Session stats */}
        {sessionStats.reviewed > 0 && (
          <div className="flex gap-4 mb-6 text-sm">
            <span className="text-gray-400">
              Reviewed: <span className="text-white">{sessionStats.reviewed}</span>
            </span>
            <span className="text-green-400">
              Nailed: {sessionStats.nailed}
            </span>
            <span className="text-yellow-400">
              Kinda: {sessionStats.kinda}
            </span>
            <span className="text-red-400">
              Missed: {sessionStats.missed}
            </span>
          </div>
        )}

        {/* Card or completion */}
        {card ? (
          <>
            {/* Progress */}
            <div className="mb-4 text-sm text-gray-500">
              Card {currentIndex + 1} of {cards.length}
            </div>

            {/* Flashcard */}
            <div
              onClick={() => setFlipped(!flipped)}
              className="bg-gray-900 border border-gray-800 rounded-xl p-8 min-h-[280px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-700 transition-colors"
            >
              <div className="text-xs text-blue-400 uppercase tracking-wider mb-4">
                Ch {card.chapter} · {flipped ? "Definition" : "Term"}
              </div>

              {!flipped ? (
                <p className="text-2xl font-bold text-white">{card.term}</p>
              ) : (
                <p className="text-lg text-gray-300 leading-relaxed">
                  {card.definition}
                </p>
              )}

              {!flipped && (
                <p className="text-gray-600 text-sm mt-6">Tap to flip</p>
              )}
            </div>

            {/* Rating buttons — only show when flipped */}
            {flipped && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <button
                  onClick={() => rateCard("didnt_know")}
                  className="py-3 bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
                >
                  Didn&apos;t Know
                </button>
                <button
                  onClick={() => rateCard("kinda_knew")}
                  className="py-3 bg-yellow-600/20 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm font-medium"
                >
                  Kinda Knew
                </button>
                <button
                  onClick={() => rateCard("nailed_it")}
                  className="py-3 bg-green-600/20 border border-green-600 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm font-medium"
                >
                  Nailed It
                </button>
              </div>
            )}
          </>
        ) : cards.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">
              No flashcards available for this chapter yet.
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Session Complete!
            </h2>
            <p className="text-gray-400 mb-4">
              You reviewed {sessionStats.reviewed} cards.
            </p>
            <div className="flex justify-center gap-6 mb-6 text-sm">
              <span className="text-green-400">
                Nailed: {sessionStats.nailed}
              </span>
              <span className="text-yellow-400">
                Kinda: {sessionStats.kinda}
              </span>
              <span className="text-red-400">
                Missed: {sessionStats.missed}
              </span>
            </div>
            <button
              onClick={() => {
                setSessionStats({ reviewed: 0, nailed: 0, kinda: 0, missed: 0 });
                loadCards();
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Study Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
