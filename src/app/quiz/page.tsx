"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function QuizSetupPage() {
  const [mode, setMode] = useState<string>("");
  const [chapter, setChapter] = useState<number>(1);
  const router = useRouter();

  function startQuiz() {
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (mode === "chapter") params.set("chapter", chapter.toString());
    router.push(`/quiz/session?${params.toString()}`);
  }

  const chapters = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Practice Quiz</h1>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm"
          >
            Back
          </Link>
        </div>

        <p className="text-gray-400 mb-6">Choose a quiz mode:</p>

        <div className="space-y-3 mb-6">
          {[
            {
              value: "chapter",
              label: "By Chapter",
              desc: "Focus on one chapter at a time",
            },
            {
              value: "mixed",
              label: "Mixed Review",
              desc: "Random questions across all chapters",
            },
            {
              value: "exam_simulation",
              label: "Exam Simulation",
              desc: "Timed — 20 questions like the real exam",
            },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                mode === opt.value
                  ? "border-blue-500 bg-blue-600/20"
                  : "border-gray-700 bg-gray-900 hover:border-gray-500"
              }`}
            >
              <div
                className={`font-medium ${
                  mode === opt.value ? "text-blue-400" : "text-white"
                }`}
              >
                {opt.label}
              </div>
              <div className="text-sm text-gray-400">{opt.desc}</div>
            </button>
          ))}
        </div>

        {mode === "chapter" && (
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2">
              Select chapter:
            </label>
            <select
              value={chapter}
              onChange={(e) => setChapter(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {chapters.map((ch) => (
                <option key={ch} value={ch}>
                  Chapter {ch}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={startQuiz}
          disabled={!mode}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}
