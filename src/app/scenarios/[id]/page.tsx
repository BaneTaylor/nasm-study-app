"use client";

import { use, useState, useCallback, useMemo } from "react";
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
  "client-communication": "Client Communication",
};

const categoryColors: Record<string, string> = {
  assessment: "text-cyan-400",
  "phase-selection": "text-purple-400",
  "exercise-selection": "text-amber-400",
  programming: "text-emerald-400",
  "client-communication": "text-rose-400",
};

const categoryBgColors: Record<string, string> = {
  assessment: "bg-cyan-500/10 border-cyan-500/30",
  "phase-selection": "bg-purple-500/10 border-purple-500/30",
  "exercise-selection": "bg-amber-500/10 border-amber-500/30",
  programming: "bg-emerald-500/10 border-emerald-500/30",
  "client-communication": "bg-rose-500/10 border-rose-500/30",
};

// ASCII assessment diagrams for certain question categories
function AssessmentDiagram({ category }: { category: string }) {
  if (category === "assessment") {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-4 font-mono text-[10px] leading-tight text-gray-500">
        <p className="text-gray-400 text-[10px] font-sans font-semibold mb-1 uppercase tracking-wider">Overhead Squat Assessment View</p>
        <pre className="whitespace-pre text-center">{`
     O
    /|\\      Arms: Forward? Elevated?
   / | \\     Torso: Forward lean?
     |        Spine: Lordosis? Kyphosis?
    / \\       Hips: Shift? Tilt?
   /   \\      Knees: Valgus? Varus?
  /     \\     Feet: Turn out? Flatten?
 /       \\
`}</pre>
      </div>
    );
  }
  if (category === "phase-selection") {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-4 font-mono text-[10px] leading-tight text-gray-500">
        <p className="text-gray-400 text-[10px] font-sans font-semibold mb-1 uppercase tracking-wider">OPT Model Phases</p>
        <pre className="whitespace-pre">{`
Phase 1: Stabilization Endurance
Phase 2: Strength Endurance
 -------- Strength Level --------
Phase 3: Hypertrophy (Muscular Dev.)
Phase 4: Maximal Strength
 --------- Power Level ----------
Phase 5: Power
`}</pre>
      </div>
    );
  }
  return null;
}

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
  const [profileOpen, setProfileOpen] = useState(true);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const supabase = createClient();

  const totalSteps = scenario?.steps.length ?? 0;
  const correctCount = answers.filter(
    (a, i) => scenario && a === scenario.steps[i].correctAnswer
  ).length;

  // Category accuracy tracking
  const categoryAccuracy = useMemo(() => {
    if (!scenario || !finished) return {};
    const cats: Record<string, { correct: number; total: number }> = {};
    scenario.steps.forEach((s, i) => {
      if (!cats[s.category]) cats[s.category] = { correct: 0, total: 0 };
      cats[s.category].total++;
      if (answers[i] === s.correctAnswer) cats[s.category].correct++;
    });
    return cats;
  }, [scenario, answers, finished]);

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

  const fetchAIFeedback = useCallback(
    async (finalAnswers: (number | null)[]) => {
      if (!scenario) return;
      setLoadingFeedback(true);
      try {
        const review = scenario.steps.map((s, i) => ({
          question: s.question,
          userAnswer: finalAnswers[i] !== null && finalAnswers[i] !== undefined ? s.options[finalAnswers[i]!] : "No answer",
          correctAnswer: s.options[s.correctAnswer],
          wasCorrect: finalAnswers[i] === s.correctAnswer,
          category: s.category,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `You are a NASM CPT exam coach. A student just completed a client scenario called "${scenario.title}" about ${scenario.client.name} (${scenario.client.age}yo ${scenario.client.gender}, ${scenario.client.occupation}). Here is their performance:\n\n${JSON.stringify(review, null, 2)}\n\nGive brief, personalized feedback (3-4 sentences) on their program design choices. Focus on patterns of strength and weakness across categories. If they got everything right, affirm their reasoning. If they missed questions, explain the NASM principle they should review. Be encouraging but specific.`,
              },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setAiFeedback(data.response || data.message || data.content || "Feedback unavailable.");
        }
      } catch {
        setAiFeedback(null);
      } finally {
        setLoadingFeedback(false);
      }
    },
    [scenario]
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
      const finalAnswers = [...answers];
      const finalCorrect = finalAnswers.filter(
        (a, i) => a === scenario!.steps[i].correctAnswer
      ).length;
      saveResult(finalCorrect, totalSteps);
      fetchAIFeedback(finalAnswers);
    }
  }

  const scorePercent =
    totalSteps > 0 ? Math.round((correctCount / totalSteps) * 100) : 0;

  // ── Finished / Review Screen ──────────────────────────────
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Scenarios
          </Link>

          {/* Score Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              Scenario Complete
            </h1>
            <p className="text-gray-400 mb-1">{scenario.title}</p>
            <p className="text-xs text-gray-600 mb-6">Domain: {scenario.domain}</p>
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
                Good effort. Review the explanations below to strengthen weak areas.
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

          {/* Category Accuracy Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Accuracy by Category</h2>
            <div className="space-y-2">
              {Object.entries(categoryAccuracy).map(([cat, data]) => {
                const pct = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className={`text-xs font-medium w-40 ${categoryColors[cat] ?? "text-gray-400"}`}>
                      {categoryLabels[cat] ?? cat}
                    </span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right">
                      {data.correct}/{data.total} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Feedback */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Coach Feedback
            </h2>
            {loadingFeedback ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Analyzing your program design choices...
              </div>
            ) : aiFeedback ? (
              <p className="text-sm text-gray-300 leading-relaxed">{aiFeedback}</p>
            ) : (
              <p className="text-sm text-gray-500">AI feedback unavailable. Review the explanations below for detailed guidance.</p>
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
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
                  {/* Study link for wrong answers */}
                  {!isCorrect && s.relatedChapter && (
                    <Link
                      href={`/chapters/${s.relatedChapter}`}
                      className="ml-9 mt-2 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Study Ch. {s.relatedChapter}: {NASM_CHAPTER_NAMES[s.relatedChapter] ?? ""}
                    </Link>
                  )}
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
                setAiFeedback(null);
                setLoadingFeedback(false);
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

  // ── Active Scenario ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/scenarios"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Exit
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">{scenario.domain}</span>
            <div className="text-sm text-gray-400">
              Score:{" "}
              <span className="text-white font-semibold">{correctCount}</span>/
              {answers.filter((a) => a !== null && a !== undefined).length || "0"}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className={categoryColors[step.category] ?? "text-gray-400"}>
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
          <div className="flex gap-1.5 mt-2 justify-center flex-wrap">
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

        {/* Client Profile Card — collapsible, sticky */}
        <div className="sticky top-0 z-20 mb-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {scenario.client.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="text-left">
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
                className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${profileOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {profileOpen && (
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
            )}
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 mb-4">
          {/* Category badge */}
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border mb-3 ${categoryBgColors[step.category] ?? "bg-gray-800 border-gray-700"}`}>
            <span className={categoryColors[step.category] ?? "text-gray-400"}>
              {categoryLabels[step.category] ?? step.category}
            </span>
          </div>

          {/* Assessment diagram */}
          <AssessmentDiagram category={step.category} />

          <h3 className="text-white font-semibold text-base sm:text-lg mb-5 leading-relaxed">
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
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : showResult && isSelected && !isCorrect ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
            {/* Study link for wrong answer */}
            {selectedAnswer !== step.correctAnswer && step.relatedChapter && (
              <Link
                href={`/chapters/${step.relatedChapter}`}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Study this topic: Ch. {step.relatedChapter} - {NASM_CHAPTER_NAMES[step.relatedChapter] ?? ""}
              </Link>
            )}
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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
