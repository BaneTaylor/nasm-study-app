"use client";

import { useState } from "react";
import Link from "next/link";

type Chapter = {
  number: number;
  title: string;
  termCount: number;
  conceptCount: number;
};

const chapterGradients = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-amber-500",
  "from-rose-500 to-red-500",
  "from-indigo-500 to-violet-500",
  "from-teal-500 to-green-500",
  "from-fuchsia-500 to-purple-500",
  "from-sky-500 to-blue-500",
  "from-lime-500 to-emerald-500",
];

function getGradient(index: number) {
  return chapterGradients[index % chapterGradients.length];
}

export default function ChapterSearch({ chapters }: { chapters: Chapter[] }) {
  const [query, setQuery] = useState("");

  const filtered = chapters.filter(
    (ch) =>
      ch.title.toLowerCase().includes(query.toLowerCase()) ||
      String(ch.number).includes(query)
  );

  return (
    <>
      <div className="relative mb-8">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search chapters by name or number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((chapter) => (
          <Link
            key={chapter.number}
            href={`/chapters/${chapter.number}`}
            className="group relative bg-gray-900/80 rounded-2xl p-1 transition-all duration-300 hover:scale-[1.02]"
          >
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getGradient(
                chapter.number - 1
              )} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="relative bg-gray-900 rounded-xl p-5 h-full">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGradient(
                    chapter.number - 1
                  )} flex items-center justify-center shrink-0`}
                >
                  <span className="text-xl font-bold text-white">
                    {chapter.number}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white font-semibold group-hover:text-purple-300 transition-colors leading-tight text-base">
                    {chapter.title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2">
                    {chapter.termCount} key terms &middot;{" "}
                    {chapter.conceptCount} concepts
                  </p>
                  {/* Mini progress bar placeholder */}
                  <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getGradient(
                        chapter.number - 1
                      )} rounded-full`}
                      style={{ width: `${Math.min(100, chapter.termCount * 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No chapters match your search.
          </div>
        )}
      </div>
    </>
  );
}
