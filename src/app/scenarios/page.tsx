"use client";

import Link from "next/link";
import { scenarios } from "@/lib/scenarios/scenario-data";

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

const categoryGradients = [
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

export default function ScenariosPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Practice Client Scenarios
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Walk through realistic NASM exam scenarios. Design exercise programs
            for fictional clients by selecting assessments, OPT phases, and
            exercises.
          </p>
        </div>

        {/* Scenario Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {scenarios.map((scenario, index) => (
            <Link
              key={scenario.id}
              href={`/scenarios/${scenario.id}`}
              className="group block"
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 h-full">
                {/* Gradient header */}
                <div
                  className={`h-2 bg-gradient-to-r ${categoryGradients[index % categoryGradients.length]}`}
                />
                <div className="p-5">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight">
                      {scenario.title}
                    </h2>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${difficultyColors[scenario.difficulty]}`}
                    >
                      {scenario.difficulty}
                    </span>
                  </div>

                  {/* Domain badge */}
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">
                    {scenario.domain}
                  </p>

                  {/* Client info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <svg
                        className="w-4 h-4 text-gray-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>
                        {scenario.client.name}, {scenario.client.age} y/o{" "}
                        {scenario.client.gender}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-400">
                      <svg
                        className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{scenario.client.occupation}</span>
                    </div>
                  </div>

                  {/* Goals preview */}
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {scenario.client.goals}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {scenario.steps.length} questions
                    </span>
                    <span className="text-sm text-blue-400 group-hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
                      Start
                      <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
