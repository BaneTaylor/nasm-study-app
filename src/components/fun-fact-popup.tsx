"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { funFacts } from "@/lib/fun-facts/seed-data";

type FunFactRow = {
  id: string;
  chapter: number;
  emoji: string;
  fact: string;
  chapter_label: string;
};

export default function FunFactPopup() {
  const [show, setShow] = useState(false);
  const [fact, setFact] = useState<FunFactRow | null>(null);
  const [dismissing, setDismissing] = useState(false);

  const loadFact = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get facts the user hasn't seen yet
    const { data: viewedRows } = await supabase
      .from("fun_fact_views")
      .select("fun_fact_id")
      .eq("user_id", user.id);

    const viewedIds = (viewedRows ?? []).map((r) => r.fun_fact_id);

    let query = supabase.from("fun_facts").select("*");

    if (viewedIds.length > 0) {
      query = query.not("id", "in", `(${viewedIds.join(",")})`);
    }

    const { data: unseenFacts } = await query;

    if (!unseenFacts || unseenFacts.length === 0) {
      // User has seen all facts — reset views so they cycle again
      await supabase
        .from("fun_fact_views")
        .delete()
        .eq("user_id", user.id);

      const { data: allFacts } = await supabase
        .from("fun_facts")
        .select("*");

      if (!allFacts || allFacts.length === 0) return;
      const random = allFacts[Math.floor(Math.random() * allFacts.length)];
      setFact(random);
    } else {
      const random =
        unseenFacts[Math.floor(Math.random() * unseenFacts.length)];
      setFact(random);
    }
  }, []);

  useEffect(() => {
    // Only show a fun fact if enough time has passed and random chance hits
    const lastShown = localStorage.getItem("funFact_lastShown");
    const cooldownMs = 3 * 60 * 60 * 1000; // 3 hours between fun facts
    const now = Date.now();

    if (lastShown && now - parseInt(lastShown) < cooldownMs) {
      return; // Too soon, skip
    }

    // 30% chance of showing even when cooldown has passed
    if (Math.random() > 0.3) {
      return; // Not this time
    }

    loadFact();
  }, [loadFact]);

  // Show popup after a delay once a fact is loaded
  useEffect(() => {
    if (!fact) return;
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [fact]);

  const handleDismiss = async () => {
    setDismissing(true);
    localStorage.setItem("funFact_lastShown", Date.now().toString());

    if (fact) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("fun_fact_views").insert({
          user_id: user.id,
          fun_fact_id: fact.id,
        });
      }
    }

    // Brief animation delay before hiding
    setTimeout(() => setShow(false), 200);
  };

  if (!show || !fact) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        dismissing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Card */}
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Gradient border wrapper */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-emerald-500 p-[2px]">
          <div className="rounded-2xl bg-gray-900 p-6">
            {/* Emoji */}
            <div className="text-center mb-4">
              <span className="text-5xl">{fact.emoji}</span>
            </div>

            {/* Label */}
            <p className="text-center text-sm font-semibold uppercase tracking-wider text-purple-400 mb-3">
              Did You Know?
            </p>

            {/* Fact text */}
            <p className="text-center text-white text-lg leading-relaxed mb-4">
              {fact.fact}
            </p>

            {/* Chapter badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-block rounded-full bg-gray-800 px-4 py-1.5 text-xs font-medium text-gray-400">
                {fact.chapter_label}
              </span>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-violet-500 active:scale-[0.98]"
            >
              Interesting!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
