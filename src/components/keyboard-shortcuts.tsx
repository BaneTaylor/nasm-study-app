"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function dispatch(action: string, value?: string | number) {
  window.dispatchEvent(
    new CustomEvent("shortcut", { detail: { action, value } })
  );
}

export default function KeyboardShortcuts() {
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Escape — close any popup/modal
      if (e.key === "Escape") {
        dispatch("escape");
        return;
      }

      // Flashcards page shortcuts
      if (pathname === "/flashcards") {
        if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          dispatch("flip");
          return;
        }
        if (e.key === "1") {
          dispatch("rate", "didnt_know");
          return;
        }
        if (e.key === "2") {
          dispatch("rate", "kinda_knew");
          return;
        }
        if (e.key === "3") {
          dispatch("rate", "nailed_it");
          return;
        }
      }

      // Quiz session page shortcuts
      if (pathname === "/quiz/session") {
        // 1-4 or A-D to select answer
        if (["1", "2", "3", "4"].includes(e.key)) {
          dispatch("select_answer", parseInt(e.key) - 1);
          return;
        }
        const letterMap: Record<string, number> = {
          a: 0,
          b: 1,
          c: 2,
          d: 3,
        };
        if (letterMap[e.key.toLowerCase()] !== undefined) {
          dispatch("select_answer", letterMap[e.key.toLowerCase()]);
          return;
        }
        // Enter or Space to advance
        if (e.key === "Enter" || e.key === " " || e.code === "Space") {
          e.preventDefault();
          dispatch("next_question");
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname]);

  return null;
}
