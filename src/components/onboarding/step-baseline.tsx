"use client";

import { useState } from "react";
import { baselineQuestions } from "@/lib/onboarding/baseline-questions";

export default function StepBaseline({
  onComplete,
}: {
  onComplete: (answers: Record<number, number>) => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const question = baselineQuestions[currentQ];
  const totalQuestions = baselineQuestions.length;
  const isLast = currentQ === totalQuestions - 1;

  function selectOption(index: number) {
    const newAnswers = { ...answers, [question.id]: index };
    setAnswers(newAnswers);

    if (isLast) {
      onComplete(newAnswers);
    } else {
      setTimeout(() => setCurrentQ((prev) => prev + 1), 300);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">
        What Do You Already Know?
      </h2>
      <p className="text-gray-400 mb-6">
        Question {currentQ + 1} of {totalQuestions} — don&apos;t worry about
        getting these right. This helps us find your starting point.
      </p>

      <div className="mb-4 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-600 transition-all duration-300"
          style={{ width: `${((currentQ + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <p className="text-lg text-white mb-6">{question.question}</p>

      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => selectOption(i)}
            className={`w-full text-left px-4 py-4 rounded-lg border transition-colors ${
              answers[question.id] === i
                ? "border-green-500 bg-green-600/20 text-green-300"
                : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
