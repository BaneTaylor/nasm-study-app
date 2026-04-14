"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { scenarios } from "@/lib/scenarios/scenario-data";
import { createClient } from "@/lib/supabase/client";

const NASM_CHAPTER_NAMES: Record<number, string> = {
  1: "The Scientific Rationale for Integrated Training",
  2: "Basic Exercise Science",
  3: "The Cardiorespiratory System",
  4: "Exercise Metabolism & Bioenergetics",
  5: "Human Movement Science",
  6: "Fitness Assessment",
  7: "Flexibility Training Concepts",
  8: "Cardiorespiratory Fitness Training",
  9: "Core Training Concepts",
  10: "Balance Training Concepts",
  11: "Plyometric Training Concepts",
  12: "Speed, Agility & Quickness Training",
  13: "Resistance Training Concepts",
  14: "The OPT Model",
  15: "Introduction to Exercise Program Design",
  16: "Nutrition",
  17: "Supplementation",
  18: "Lifestyle Modification & Behavioral Coaching",
  19: "Special Populations",
  20: "Professional Development & Responsibility",
};

const categoryLabels: Record<string, string> = {
  assessment: "Assessment",
  "phase-selection": "OPT Phase Selection",
  "exercise-selection": "Exercise Selection",
  programming: "Program Design",
};

const categoryColors: Record<string, string> = {
  assessment: "text-cyan-400",
  "phase-selection": "text-purple-400",
  "exercise-selection": "text-amber-400",
  programming: "text-emerald-400",
};

export default function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const scenarioId = parseInt(id, 10);
  const scenario = scenarios.find((s) => s.id === scenarioId);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [savedResult, setSavedResult] = useState(false);

  const supabase = createClient();

  const totalSteps = scenario?.steps.length ?? 0;
  const correctCount = answers.filter(
    (a, i) => scenario && a === scenario.steps[i].correctAnswer
  ).length;

  const saveResult = useCallback(
    async (score: number, total: number) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("scenario_results").insert({
          user_id: user.id,
          scenario_id: scenarioId,
          score,
          total,
          completed_at: new Date().toISOString(),
        });
        setSavedResult(true);
      } catch {
        // Silently fail if table does not exist or user not logged in
      }
    },
    [supabase, scenarioId]
  );

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Scenario Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            This scenario does not exist.
          </p>
          <Link
            href="/scenarios"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
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
            Back to Scenarios
          </Link>
        </div>
      </div>
    );
  }

  const step = scenario.steps[currentStep];

  function handleSelect(optionIndex: number) {
    if (showExplanation) return;
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
    const updated = [...answers];
    updated[currentStep] = optionIndex;
    setAnswers(updated);
  }

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
      const finalCorrect = answers.filter(
        (a, i) => a === scenario!.steps[i].correctAnswer
      ).length;
      // Include current step in count if not already recorded
      const lastCorrect =
        selectedAnswer === step.correctAnswer ? 1 : 0;
      const alreadyCounted = answers[currentStep] !== null && answers[currentStep] !== undefined;
      const totalCorrect = alreadyCounted
        ? finalCorrect
        : finalCorrect + lastCorrect;
      saveResult(totalCorrect, totalSteps);
    }
  }

  const scorePercent =
    totalSteps > 0 ? Math.round((correctCount / totalSteps) * 100) : 0;

  // Finished / Review Screen
  if (finished) {
    const finalAnswers = [...answers];
    const finalCorrectCount = finalAnswers.filter(
      (a, i) => a === scenario.steps[i].correctAnswer
    ).length;
    const finalPercent = Math.round((finalCorrectCount / totalSteps) * 100);

    return (
      <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Link
            href="/scenarios"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
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
            All Scenarios
          </Link>

          {/* Score Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Scenario Complete
            </h1>
            <p className="text-gray-400 mb-6">{scenario.title}</p>
            <div
              className={`text-6xl font-bold mb-2 ${
                finalPercent >= 80
                  ? "text-green-400"
                  : finalPercent >= 60
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {finalPercent}%
            </div>
            <p className="text-gray-400">
              {finalCorrectCount} of {totalSteps} correct
            </p>
            {finalPercent >= 80 && (
              <p className="text-green-400 text-sm mt-2 font-medium">
                Excellent work! You have strong clinical reasoning skills.
              </p>
            )}
            {finalPercent >= 60 && finalPercent < 80 && (
              <p className="text-yellow-400 text-sm mt-2 font-medium">
                Good effort. Review the explanations below to strengthen weak
                areas.
              </p>
            )}
            {finalPercent < 60 && (
              <p className="text-red-400 text-sm mt-2 font-medium">
                Keep studying. Review the related chapters and try again.
              </p>
            )}
            {savedResult && (
              <p className="text-gray-600 text-xs mt-3">Result saved</p>
            )}
          </div>

          {/* Answer Review */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-white">Answer Review</h2>
            {scenario.steps.map((s, i) => {
              const userAnswer = finalAnswers[i];
              const isCorrect = userAnswer === s.correctAnswer;
              return (
                <div
                  key={i}
                  className={`bg-gray-900 border rounded-xl p-4 sm:p-5 ${
                    isCorrect ? "border-green-500/30" : "border-red-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold ${
                        isCorrect
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {isCorrect ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs font-medium ${categoryColors[s.category] ?? "text-gray-400"}`}
                      >
                        {categoryLabels[s.category] ?? s.category}
                      </span>
                      <p className="text-sm text-white font-medium mt-1">
                        {s.question}
                      </p>
                    </div>
                  </div>
                  {!isCorrect && userAnswer !== null && userAnswer !== undefined && (
                    <p className="text-sm text-red-400/80 ml-9 mb-1">
                      Your answer: {s.options[userAnswer]}
                    </p>
                  )}
                  <p className="text-sm text-green-400/80 ml-9 mb-2">
                    Correct: {s.options[s.correctAnswer]}
                  </p>
                  <p className="text-xs text-gray-500 ml-9 leading-relaxed">
                    {s.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Related Chapters */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-3">
              Study These Chapters
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Review these chapters to strengthen your understanding of the
              concepts tested in this scenario.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {scenario.relatedChapters.map((ch) => (
                <Link
                  key={ch}
                  href={`/chapters/${ch}`}
                  className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg px-4 py-3 transition-colors min-h-[56px]"
                >
                  <span className="text-blue-400 font-bold text-sm w-8 text-center flex-shrink-0">
                    Ch {ch}
                  </span>
                  <span className="text-sm text-gray-300">
                    {NASM_CHAPTER_NAMES[ch] ?? `Chapter ${ch}`}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/scenarios"
              className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl px-6 py-4 min-h-[56px] flex items-center justify-center transition-colors"
            >
              All Scenarios
            </Link>
            <button
              onClick={() => {
                setCurrentStep(0);
                setSelectedAnswer(null);
                setShowExplanation(false);
                setAnswers([]);
                setFinished(false);
                setSavedResult(false);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl px-6 py-4 min-h-[56px] flex items-center justify-center transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Scenario
  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/scenarios"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
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
            Exit
          </Link>
          <div className="text-sm text-gray-400">
            Score:{" "}
            <span className="text-white font-semibold">{correctCount}</span>/
            {answers.length || currentStep}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span>
              {categoryLabels[step.category] ?? step.category}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
          {/* Step dots */}
          <div className="flex gap-1.5 mt-2 justify-center">
            {scenario.steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < currentStep
                    ? answers[i] === scenario.steps[i].correctAnswer
                      ? "bg-green-500"
                      : "bg-red-500"
                    : i === currentStep
                      ? "bg-blue-500"
                      : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Client Profile Card (collapsible on mobile) */}
        <details className="group bg-gray-900 border border-gray-800 rounded-2xl mb-6 overflow-hidden">
          <summary className="p-4 sm:p-5 cursor-pointer list-none flex items-center justify-between hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {scenario.client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm sm:text-base">
                  {scenario.client.name}
                </h2>
                <p className="text-xs text-gray-400">
                  {scenario.client.age} y/o {scenario.client.gender} &middot;{" "}
                  {scenario.client.occupation}
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-800 pt-4 space-y-3">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Goals
              </h3>
              <p className="text-sm text-gray-300">{scenario.client.goals}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                History
              </h3>
              <p className="text-sm text-gray-300">{scenario.client.history}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Assessment Findings
              </h3>
              <p className="text-sm text-gray-300">
                {scenario.client.assessmentFindings}
              </p>
            </div>
          </div>
        </details>

        {/* Question */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 mb-4">
          <span
            className={`text-xs font-medium ${categoryColors[step.category] ?? "text-gray-400"}`}
          >
            {categoryLabels[step.category] ?? step.category}
          </span>
          <h3 className="text-white font-semibold text-base sm:text-lg mt-2 mb-5 leading-relaxed">
            {step.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {step.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === step.correctAnswer;
              const showResult = showExplanation;

              let borderColor = "border-gray-700 hover:border-gray-500";
              let bgColor = "bg-gray-800/50 hover:bg-gray-800";
              let textColor = "text-gray-300";
              let ringColor = "ring-transparent";

              if (showResult && isCorrect) {
                borderColor = "border-green-500/50";
                bgColor = "bg-green-500/10";
                textColor = "text-green-300";
                ringColor = "ring-green-500/20";
              } else if (showResult && isSelected && !isCorrect) {
                borderColor = "border-red-500/50";
                bgColor = "bg-red-500/10";
                textColor = "text-red-300";
                ringColor = "ring-red-500/20";
              } else if (showResult) {
                borderColor = "border-gray-800";
                bgColor = "bg-gray-900/50";
                textColor = "text-gray-600";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showExplanation}
                  className={`w-full text-left border rounded-xl px-4 py-4 min-h-[56px] transition-all duration-200 ring-2 ${borderColor} ${bgColor} ${textColor} ${ringColor} ${
                    !showExplanation
                      ? "active:scale-[0.98] cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                        showResult && isCorrect
                          ? "border-green-500 bg-green-500/20 text-green-400"
                          : showResult && isSelected && !isCorrect
                            ? "border-red-500 bg-red-500/20 text-red-400"
                            : showResult
                              ? "border-gray-700 text-gray-700"
                              : "border-gray-600 text-gray-500"
                      }`}
                    >
                      {showResult && isCorrect ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : showResult && isSelected && !isCorrect ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed">
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div
            className={`border rounded-2xl p-5 sm:p-6 mb-4 ${
              selectedAnswer === step.correctAnswer
                ? "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {selectedAnswer === step.correctAnswer ? (
                <span className="text-green-400 font-semibold text-sm">
                  Correct!
                </span>
              ) : (
                <span className="text-red-400 font-semibold text-sm">
                  Incorrect
                </span>
              )}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {step.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {showExplanation && (
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl px-6 py-4 min-h-[56px] flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            {currentStep < totalSteps - 1 ? (
              <>
                Next Question
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            ) : (
              "See Results"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
