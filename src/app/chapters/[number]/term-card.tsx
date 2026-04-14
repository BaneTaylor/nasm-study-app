"use client";

import { useState } from "react";

export default function TermCard({
  term,
  definition,
}: {
  term: string;
  definition: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left bg-gray-900/80 border border-gray-800 rounded-2xl p-5 hover:border-purple-500/50 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-purple-400 font-semibold text-base">
          {term}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <p className="text-gray-400 text-sm leading-relaxed mt-3 pt-3 border-t border-gray-800">
          {definition}
        </p>
      )}
    </button>
  );
}
