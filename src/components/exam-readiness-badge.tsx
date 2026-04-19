"use client";

import { useEffect, useState } from "react";

interface ExamReadinessProps {
  quizAvg: number;
  srsRetention: number;
  practiceExamScores: number;
  scenarioAccuracy: number;
  coveragePercent: number;
  weakestDomain?: string;
  weakestChapter?: number;
}

function getScoreConfig(score: number) {
  if (score >= 85) {
    return {
      color: "#22c55e",
      glowColor: "rgba(34, 197, 94, 0.4)",
      status: "Ready to Book!",
      ringClass: "text-green-400",
    };
  }
  if (score >= 70) {
    return {
      color: "#4ade80",
      glowColor: "rgba(74, 222, 128, 0.2)",
      status: "Almost Ready",
      ringClass: "text-green-400",
    };
  }
  if (score >= 50) {
    return {
      color: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.2)",
      status: "Getting There",
      ringClass: "text-amber-400",
    };
  }
  return {
    color: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.2)",
    status: "Not Ready",
    ringClass: "text-red-400",
  };
}

export default function ExamReadinessBadge({
  quizAvg,
  srsRetention,
  practiceExamScores,
  scenarioAccuracy,
  coveragePercent,
  weakestDomain,
  weakestChapter,
}: ExamReadinessProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const score = Math.round(
    quizAvg * 0.25 +
    srsRetention * 0.25 +
    practiceExamScores * 0.2 +
    scenarioAccuracy * 0.15 +
    coveragePercent * 0.15
  );

  const config = getScoreConfig(score);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;

    function animate(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [score]);

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (circumference * (animatedScore / 100));

  return (
    <div className="flex flex-col items-center py-6">
      {/* Circular progress ring */}
      <div
        className="relative"
        style={score >= 85 ? { filter: `drop-shadow(0 0 20px ${config.glowColor})` } : undefined}
      >
        <svg width="140" height="140" viewBox="0 0 120 120">
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgb(31, 41, 55)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{ color: config.color }}
          >
            {animatedScore}
          </span>
          <span className="text-xs text-gray-500 -mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold text-white">{config.status}</p>
        {score >= 85 && (
          <p className="text-green-400 text-sm mt-1 font-medium">
            You&apos;re ready to book your exam!
          </p>
        )}
      </div>

      {/* Weakest area callout */}
      {weakestDomain && (
        <div className="mt-3 px-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50 max-w-sm text-center">
          <p className="text-sm text-gray-300">
            Your weakest area is{" "}
            <span className="font-semibold text-amber-400">{weakestDomain}</span>
            {weakestChapter && (
              <span className="text-gray-400">
                {" "}&mdash; review Chapter {weakestChapter} today
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
