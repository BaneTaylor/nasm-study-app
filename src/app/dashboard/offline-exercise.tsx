"use client";

import { useEffect, useState } from "react";

const exercises = [
  "Write the 5 OPT phases on paper from memory",
  "Do an overhead squat \u2014 notice your compensations",
  "Explain the kinetic chain to someone in 60 seconds",
  "Name 5 muscles tested on the NASM exam without looking",
  "Check your own posture \u2014 what syndrome do you have?",
  "Write down everything you know about Type I vs Type II fibers",
  "Teach someone the difference between concentric and eccentric",
  "Draw the heart and label the 4 chambers from memory",
  "List the acute variables of resistance training (FITTE)",
  "Name 3 muscles that are overactive in lower crossed syndrome",
  "Write out the stages of the General Adaptation Syndrome",
  "Explain reciprocal inhibition to a friend in plain English",
  "Name the 3 body composition assessment methods",
  "Do 10 single-leg squats \u2014 note which side is weaker",
  "List 5 special population considerations without looking",
  "Write the macronutrient calorie values from memory",
  "Name the prime movers, synergists, and stabilizers in a squat",
  "Explain autogenic inhibition using a foam roller example",
  "List the cardiorespiratory training zones and their %HRmax",
  "Write the flexibility continuum: corrective to functional",
  "Draw and label the muscle spindle vs Golgi tendon organ",
  "Name the 4 types of assessments in the NASM CPT model",
  "Recite the pulling vs pushing assessment compensations",
  "Write the formula for BMI and target heart rate from memory",
  "Explain why progression matters using the overload principle",
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getStorageKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `offline-exercise-done-${today}`;
}

export default function OfflineExercise() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(localStorage.getItem(getStorageKey()) === "true");
  }, []);

  const dayIndex = getDayOfYear() % exercises.length;
  const exercise = exercises[dayIndex];

  function toggle() {
    const next = !done;
    setDone(next);
    if (next) {
      localStorage.setItem(getStorageKey(), "true");
    } else {
      localStorage.removeItem(getStorageKey());
    }
  }

  return (
    <div className="rounded-xl border border-gray-800/40 bg-gray-900/40 p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={toggle}
          className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            done
              ? "bg-green-500 border-green-500"
              : "border-gray-600 hover:border-gray-400"
          }`}
          aria-label={done ? "Mark as not done" : "Mark as done"}
        >
          {done && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500 mb-1">
            Today&apos;s offline exercise
          </div>
          <p className={`text-sm ${done ? "text-gray-500 line-through" : "text-gray-200"}`}>
            {exercise}
          </p>
        </div>
      </div>
    </div>
  );
}
