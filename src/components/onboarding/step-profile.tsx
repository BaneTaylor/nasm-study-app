"use client";

import { useState } from "react";

type ProfileData = {
  examDate: string;
  hoursPerWeek: number;
  experience: string;
};

export default function StepProfile({
  onComplete,
}: {
  onComplete: (data: ProfileData) => void;
}) {
  const [examDate, setExamDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [experience, setExperience] = useState("");

  const canContinue = examDate && experience;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Quick Profile</h2>
      <p className="text-gray-400 mb-8">
        Tell us a bit about your situation so we can build your plan.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            When is your exam date?
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            How many hours per week can you study?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={2}
              max={20}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-white font-bold text-lg w-16 text-center">
              {hoursPerWeek} hrs
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Fitness industry experience?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "none", label: "None" },
              { value: "some", label: "Some" },
              { value: "extensive", label: "Extensive" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setExperience(opt.value)}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  experience === opt.value
                    ? "border-blue-500 bg-blue-600/20 text-blue-400"
                    : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onComplete({ examDate, hoursPerWeek, experience })}
        disabled={!canContinue}
        className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
