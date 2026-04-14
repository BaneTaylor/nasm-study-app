"use client";

import { useState } from "react";
import { assessmentQuestions } from "@/lib/onboarding/assessment-questions";

export default function StepAssessment({
  onComplete,
}: {
  onComplete: (answers: Record<number, string>) => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const question = assessmentQuestions[currentQ];
  const totalQuestions = assessmentQuestions.length;
  const isLast = currentQ === totalQuestions - 1;

  function selectOption(dimension: string) {
    const newAnswers = { ...answers, [question.id]: dimension };
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
        How Do You Learn Best?
      </h2>
      <p className="text-gray-400 mb-6">
        Question {currentQ + 1} of {totalQuestions} — pick what feels most
        natural.
      </p>

      <div className="mb-4 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentQ + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <p className="text-lg text-white mb-6">{question.question}</p>

      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => selectOption(opt.dimension)}
            className={`w-full text-left px-4 py-4 rounded-lg border transition-colors ${
              answers[question.id] === opt.dimension
                ? "border-blue-500 bg-blue-600/20 text-blue-300"
                : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500"
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
