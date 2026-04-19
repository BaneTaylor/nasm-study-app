"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "./theme-toggle";

const primaryNav = [
  { href: "/campaign", label: "Learn", icon: "\u{1F393}" },
  { href: "/dashboard", label: "Home", icon: "\u{1F3E0}" },
  { href: "/review", label: "Review", icon: "\u{1F504}" },
  { href: "/coach", label: "Coach", icon: "\u{1F916}" },
  { href: "/stats", label: "Stats", icon: "\u{1F4CA}" },
];

const moreNav = [
  { href: "/flashcards", label: "Flashcards", icon: "\u{1F5C2}\uFE0F" },
  { href: "/quiz", label: "Quiz", icon: "\u{1F4DD}" },
  { href: "/chapters", label: "Chapters", icon: "\u{1F4D6}" },
  { href: "/anatomy", label: "Anatomy", icon: "\u{1F9B4}" },
  { href: "/scenarios", label: "Scenarios", icon: "\u{1F3CB}\uFE0F" },
  { href: "/schedule", label: "Schedule", icon: "\u{1F4C5}" },
  { href: "/exam-mode", label: "Exam Mode", icon: "\u{1F3C6}" },
  { href: "/share", label: "Share", icon: "\u{1F4E4}" },
  { href: "/settings", label: "Settings", icon: "\u2699\uFE0F" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [hasDueCards, setHasDueCards] = useState(false);

  useEffect(() => {
    async function checkDueCards() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date().toISOString();

      const { count: fcCount } = await supabase
        .from("flashcard_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("next_review_at", now);

      const { count: qCount } = await supabase
        .from("question_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("next_review_at", now);

      setHasDueCards(((fcCount ?? 0) + (qCount ?? 0)) > 0);
    }
    checkDueCards();
  }, [pathname]);

  const isMoreActive = moreNav.some(
    (item) =>
      pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 p-4 shadow-2xl animate-fade-in">
            <div className="max-w-lg mx-auto">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-400">More</span>
                <ThemeToggle />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {moreNav.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "text-blue-400 bg-blue-600/10"
                          : "text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-105"
                      }`}
                    >
                      <span className="text-xl mb-1">{item.icon}</span>
                      <span className="text-[10px]">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-gray-900/80 border-t border-gray-800 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center py-2">
          {primaryNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center px-3 py-1 min-w-[48px] text-xs transition-all duration-200 ${
                  isActive
                    ? "text-blue-400"
                    : "text-gray-500 hover:text-gray-300 hover:scale-105"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                )}
                {item.href === "/review" && hasDueCards && (
                  <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse-gentle" />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`relative flex flex-col items-center px-3 py-1 min-w-[48px] text-xs transition-all duration-200 ${
              showMore || isMoreActive
                ? "text-blue-400"
                : "text-gray-500 hover:text-gray-300 hover:scale-105"
            }`}
          >
            <span className="text-lg">&bull;&bull;&bull;</span>
            <span>More</span>
            {(showMore || isMoreActive) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
