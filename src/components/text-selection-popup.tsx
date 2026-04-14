"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chapters } from "@/lib/chapters/chapter-data";

type MatchResult = {
  term: string;
  definition: string;
  chapterNumber: number;
  chapterTitle: string;
};

type PopupState = {
  visible: boolean;
  x: number;
  y: number;
  above: boolean;
  match: MatchResult | null;
  selectedText: string;
};

const INITIAL_STATE: PopupState = {
  visible: false,
  x: 0,
  y: 0,
  above: true,
  match: null,
  selectedText: "",
};

function findBestMatch(query: string): MatchResult | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  const matches: MatchResult[] = [];

  for (const chapter of chapters) {
    for (const kt of chapter.keyTerms) {
      const termLower = kt.term.toLowerCase();
      // Match if the selected text is contained in the term, or the term is
      // contained in the selected text (partial match both directions)
      if (termLower.includes(normalized) || normalized.includes(termLower)) {
        matches.push({
          term: kt.term,
          definition: kt.definition,
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
        });
      }
    }
  }

  if (matches.length === 0) return null;

  // Best match: shortest term that contains the selection, or exact/closest
  // length match if the selection contains the term
  matches.sort((a, b) => {
    const aExact = a.term.toLowerCase() === normalized ? 0 : 1;
    const bExact = b.term.toLowerCase() === normalized ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    return a.term.length - b.term.length;
  });

  return matches[0];
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function TextSelectionPopup() {
  const [popup, setPopup] = useState<PopupState>(INITIAL_STATE);
  const popupRef = useRef<HTMLDivElement>(null);
  const isTouch = useRef(false);

  const dismiss = useCallback(() => {
    setPopup(INITIAL_STATE);
  }, []);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (text.length < 3) return;

    // Don't trigger if the selection is inside the popup itself
    if (popupRef.current) {
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      if (
        (anchorNode && popupRef.current.contains(anchorNode)) ||
        (focusNode && popupRef.current.contains(focusNode))
      ) {
        return;
      }
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) return;

    // Determine if popup should appear above or below
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceAbove > spaceBelow && spaceAbove > 160;

    // Horizontal center, clamped to viewport
    const popupWidth = 340;
    let x = rect.left + rect.width / 2 - popupWidth / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - popupWidth - 8));

    // Vertical: above or below the selection
    const y = above ? rect.top + window.scrollY - 12 : rect.bottom + window.scrollY + 12;

    const match = findBestMatch(text);

    setPopup({
      visible: true,
      x,
      y,
      above,
      match,
      selectedText: text,
    });
  }, []);

  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      if (isTouch.current) return;
      // Ignore clicks inside the popup
      if (popupRef.current && popupRef.current.contains(e.target as Node)) {
        return;
      }
      // Small delay to let the browser finalize the selection
      setTimeout(handleSelection, 10);
    };

    const onTouchEnd = (e: TouchEvent) => {
      isTouch.current = true;
      if (popupRef.current && popupRef.current.contains(e.target as Node)) {
        return;
      }
      // Longer delay for mobile selection handles
      setTimeout(handleSelection, 300);
    };

    const onMouseDown = (e: MouseEvent) => {
      // Dismiss popup when clicking outside of it
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        dismiss();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
      }
    };

    const onSelectionChange = () => {
      // If the selection is cleared, dismiss the popup
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // Small delay to avoid race with mouseup handler
        setTimeout(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) {
            dismiss();
          }
        }, 50);
      }
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("selectionchange", onSelectionChange);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [handleSelection, dismiss]);

  if (!popup.visible) return null;

  const words = wordCount(popup.selectedText);

  return (
    <div
      ref={popupRef}
      role="tooltip"
      className="absolute z-[9999] w-[340px] animate-in fade-in duration-200"
      style={{
        left: popup.x,
        top: popup.above ? popup.y : popup.y,
        transform: popup.above ? "translateY(-100%)" : undefined,
      }}
    >
      {/* Arrow indicator */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-gray-900 border-gray-700 ${
          popup.above
            ? "bottom-[-7px] border-r border-b"
            : "top-[-7px] border-l border-t"
        }`}
      />

      <div className="rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500" />

        <div className="p-4 relative">
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
              window.getSelection()?.removeAllRanges();
            }}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>

          {popup.match ? (
            <>
              {/* Term */}
              <p className="text-white font-semibold text-sm leading-snug pr-6 mb-2">
                {popup.match.term}
              </p>

              {/* Definition */}
              <p className="text-gray-200 text-sm leading-relaxed mb-3">
                {popup.match.definition}
              </p>

              {/* Chapter badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-400">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Ch. {popup.match.chapterNumber} — {popup.match.chapterTitle}
              </span>
            </>
          ) : words <= 3 ? (
            <p className="text-gray-400 text-sm leading-relaxed pr-6">
              Term not in study materials — try searching in your chapter
              summaries
            </p>
          ) : (
            <p className="text-gray-400 text-sm leading-relaxed pr-6">
              Highlight key terms within this passage for definitions
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
