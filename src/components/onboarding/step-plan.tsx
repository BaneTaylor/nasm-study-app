"use client";

import { CHAPTER_NAMES } from "@/lib/onboarding/plan-generator";
import type { LearningStyle } from "@/lib/onboarding/scoring";

type PlanWeek = {
  week: number;
  chapters: number[];
  focus_type: string;
  hours: number;
};

export default function StepPlan({
  plan,
  learningStyle,
  onComplete,
}: {
  plan: PlanWeek[];
  learningStyle: LearningStyle;
  onComplete: () => void;
}) {
  const topStyle = Object.entries(learningStyle).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const styleLabels: Record<string, string> = {
    visual: "Visual Learner",
    reading_writing: "Reading/Writing Learner",
    active_recall: "Active Recall Learner",
    practical: "Practical Learner",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">
        Your Personalized Study Plan
      </h2>
      <p className="text-gray-400 mb-6">
        Based on your learning style and current knowledge, here&apos;s your
        week-by-week plan.
      </p>

      <div className="flex gap-3 mb-6 flex-wrap">
        <span className="px-3 py-1 bg-blue-600/20 border border-blue-500 text-blue-400 rounded-full text-sm">
          {styleLabels[topStyle[0]] || topStyle[0]} ({topStyle[1]}%)
        </span>
        <span className="px-3 py-1 bg-purple-600/20 border border-purple-500 text-purple-400 rounded-full text-sm">
          {plan.length} week plan
        </span>
      </div>

      <div className="space-y-3 mb-8 max-h-96 overflow-y-auto pr-2">
        {plan.map((week) => (
          <div
            key={week.week}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-blue-400 font-bold">
                Week {week.week}
              </span>
              <span className="text-gray-500 text-sm">{week.hours} hrs</span>
            </div>
            <div className="text-sm text-gray-300 mb-1">
              {week.chapters.map((ch) => CHAPTER_NAMES[ch] || `Ch ${ch}`).join(", ")}
            </div>
            <div className="text-xs text-gray-500">{week.focus_type}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onComplete}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
      >
        Start Studying
      </button>
    </div>
  );
}
