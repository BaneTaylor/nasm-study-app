"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  clientProfiles,
  commonCompensations,
  optPhases,
  exerciseDatabase,
  type ClientProfile,
} from "@/lib/opt-simulator/client-profiles";

// ─── Types ───────────────────────────────────────────────────────────────────

type SimulationStep =
  | "assessment"
  | "phase-selection"
  | "corrective-strategy"
  | "acute-variables"
  | "exercise-selection"
  | "progression"
  | "ai-feedback";

type StepResult = {
  step: SimulationStep;
  label: string;
  userAnswer: string;
  correct: boolean;
  explanation: string;
};

type Mode = "browse" | "custom" | "simulation";

// ─── Constants ───────────────────────────────────────────────────────────────

const STEP_LABELS: Record<SimulationStep, string> = {
  assessment: "Assessment Review",
  "phase-selection": "Phase Selection",
  "corrective-strategy": "Corrective Strategy",
  "acute-variables": "Acute Variables",
  "exercise-selection": "Exercise Selection",
  progression: "Progression Plan",
  "ai-feedback": "AI Feedback",
};

const STEP_ORDER: SimulationStep[] = [
  "assessment",
  "phase-selection",
  "corrective-strategy",
  "acute-variables",
  "exercise-selection",
  "progression",
  "ai-feedback",
];

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

// ─── Helper: shuffle array ──────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Build custom profile from form data ─────────────────────────────────────

function buildCustomProfile(form: CustomForm): ClientProfile {
  const selectedSquat = commonCompensations.overheadSquat.filter((c) =>
    form.overheadSquatFindings.includes(c.id)
  );
  const selectedPostural = commonCompensations.posturalObservations.filter(
    (c) => form.posturalFindings.includes(c.id)
  );

  // Determine correct phase based on fitness level and findings
  let correctPhase = 1;
  if (
    form.fitnessLevel === "advanced" &&
    selectedSquat.length <= 1 &&
    form.goals.toLowerCase().includes("power")
  ) {
    correctPhase = 5;
  } else if (
    form.fitnessLevel === "advanced" &&
    selectedSquat.length <= 1
  ) {
    correctPhase = 4;
  } else if (
    form.fitnessLevel === "intermediate" &&
    selectedSquat.length <= 2
  ) {
    correctPhase = 2;
  }

  return {
    id: 999,
    name: "Custom Client",
    age: form.age,
    gender: form.gender,
    occupation: "Not specified",
    fitnessLevel: form.fitnessLevel,
    goals: form.goals,
    medicalHistory: form.medicalHistory || "None reported",
    assessmentFindings: {
      overheadSquat: selectedSquat.map((c) => c.label),
      posturalObservations: selectedPostural.map((c) => c.label),
      movementCompensations: selectedSquat
        .flatMap((c) => [
          `Overactive: ${c.overactive.join(", ")}`,
          `Underactive: ${c.underactive.join(", ")}`,
        ])
        .slice(0, 4),
    },
    correctPhase,
    phaseRationale: `Based on the client's ${form.fitnessLevel} fitness level, ${selectedSquat.length} movement compensation(s), and stated goals, Phase ${correctPhase} is the recommended starting point.`,
    difficulty: form.fitnessLevel === "sedentary" ? "beginner" : form.fitnessLevel === "advanced" ? "advanced" : "intermediate",
  };
}

type CustomForm = {
  age: number;
  gender: string;
  fitnessLevel: "sedentary" | "beginner" | "intermediate" | "advanced";
  goals: string;
  medicalHistory: string;
  overheadSquatFindings: string[];
  posturalFindings: string[];
};

// ─── Main page component ────────────────────────────────────────────────────

export default function OptSimulatorPage() {
  const [mode, setMode] = useState<Mode>("browse");
  const [activeProfile, setActiveProfile] = useState<ClientProfile | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [results, setResults] = useState<StepResult[]>([]);
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Custom form state
  const [customForm, setCustomForm] = useState<CustomForm>({
    age: 30,
    gender: "Male",
    fitnessLevel: "beginner",
    goals: "",
    medicalHistory: "",
    overheadSquatFindings: [],
    posturalFindings: [],
  });

  const currentStep = STEP_ORDER[currentStepIdx];
  const score = results.filter((r) => r.correct).length;
  const totalAnswered = results.length;

  function startSimulation(profile: ClientProfile) {
    setActiveProfile(profile);
    setCurrentStepIdx(0);
    setResults([]);
    setAiFeedback("");
    setMode("simulation");
  }

  function recordResult(result: StepResult) {
    setResults((prev) => [...prev, result]);
    if (currentStepIdx < STEP_ORDER.length - 1) {
      setCurrentStepIdx((i) => i + 1);
    }
  }

  function handleGenerateCustom() {
    const profile = buildCustomProfile(customForm);
    startSimulation(profile);
  }

  function resetSimulator() {
    setMode("browse");
    setActiveProfile(null);
    setCurrentStepIdx(0);
    setResults([]);
    setAiFeedback("");
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">OPT Model Simulator</h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Practice program design with realistic client scenarios. Walk through assessments, phase selection, and exercise programming.
          </p>
        </div>

        {/* Mode tabs (only when not in simulation) */}
        {mode !== "simulation" && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("browse")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "browse"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white"
              }`}
            >
              Pre-built Scenarios
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "custom"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white"
              }`}
            >
              Custom Client
            </button>
          </div>
        )}

        {/* ─── Browse Mode ──────────────────────────────────────────────── */}
        {mode === "browse" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clientProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => startSimulation(profile)}
                className="group text-left bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/20"
              >
                <div className="h-1.5 bg-gradient-to-r from-rose-500 to-pink-500" />
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-base font-semibold text-white group-hover:text-rose-400 transition-colors leading-tight">
                      {profile.name}
                    </h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${difficultyColors[profile.difficulty]}`}>
                      {profile.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    {profile.age} y/o {profile.gender} &middot; {profile.fitnessLevel}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">{profile.occupation}</p>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{profile.goals}</p>
                  <span className="text-sm text-rose-400 group-hover:text-rose-300 font-medium flex items-center gap-1 transition-colors">
                    Start Simulation
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ─── Custom Client Mode ───────────────────────────────────────── */}
        {mode === "custom" && (
          <CustomClientForm
            form={customForm}
            setForm={setCustomForm}
            onGenerate={handleGenerateCustom}
          />
        )}

        {/* ─── Simulation Mode ──────────────────────────────────────────── */}
        {mode === "simulation" && activeProfile && (
          <SimulationView
            profile={activeProfile}
            currentStepIdx={currentStepIdx}
            currentStep={currentStep}
            results={results}
            score={score}
            totalAnswered={totalAnswered}
            aiFeedback={aiFeedback}
            aiLoading={aiLoading}
            setAiFeedback={setAiFeedback}
            setAiLoading={setAiLoading}
            onRecord={recordResult}
            onReset={resetSimulator}
          />
        )}
      </div>
    </div>
  );
}

// ─── Custom Client Form ──────────────────────────────────────────────────────

function CustomClientForm({
  form,
  setForm,
  onGenerate,
}: {
  form: CustomForm;
  setForm: React.Dispatch<React.SetStateAction<CustomForm>>;
  onGenerate: () => void;
}) {
  function toggleCheckbox(field: "overheadSquatFindings" | "posturalFindings", id: string) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((v) => v !== id)
        : [...prev[field], id],
    }));
  }

  const canGenerate = form.goals.trim().length > 0 && form.overheadSquatFindings.length > 0;

  return (
    <div className="max-w-2xl">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Build a Custom Client</h2>

        {/* Basic info row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Age</label>
            <input
              type="number"
              min={10}
              max={100}
              value={form.age}
              onChange={(e) => setForm((p) => ({ ...p, age: Number(e.target.value) }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm text-gray-400 mb-1">Fitness Level</label>
            <select
              value={form.fitnessLevel}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  fitnessLevel: e.target.value as CustomForm["fitnessLevel"],
                }))
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
            >
              <option value="sedentary">Sedentary</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Goals</label>
          <textarea
            rows={2}
            value={form.goals}
            onChange={(e) => setForm((p) => ({ ...p, goals: e.target.value }))}
            placeholder="e.g., Lose weight, build strength, improve posture..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
          />
        </div>

        {/* Medical history */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Medical History</label>
          <textarea
            rows={2}
            value={form.medicalHistory}
            onChange={(e) => setForm((p) => ({ ...p, medicalHistory: e.target.value }))}
            placeholder="e.g., Hypertension, diabetes, previous injuries..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
          />
        </div>

        {/* Overhead squat compensations */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Overhead Squat Assessment Findings
          </label>
          <div className="space-y-2">
            {commonCompensations.overheadSquat.map((comp) => (
              <label
                key={comp.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.overheadSquatFindings.includes(comp.id)
                    ? "bg-rose-500/10 border-rose-500/40 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.overheadSquatFindings.includes(comp.id)}
                  onChange={() => toggleCheckbox("overheadSquatFindings", comp.id)}
                  className="mt-0.5 accent-rose-500"
                />
                <div>
                  <span className="text-sm font-medium">{comp.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Overactive: {comp.overactive.join(", ")} | Underactive: {comp.underactive.join(", ")}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Postural observations */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Postural Observations</label>
          <div className="grid grid-cols-2 gap-2">
            {commonCompensations.posturalObservations.map((obs) => (
              <label
                key={obs.id}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                  form.posturalFindings.includes(obs.id)
                    ? "bg-rose-500/10 border-rose-500/40 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.posturalFindings.includes(obs.id)}
                  onChange={() => toggleCheckbox("posturalFindings", obs.id)}
                  className="accent-rose-500"
                />
                {obs.label}
              </label>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
            canGenerate
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/20"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          Generate Program Simulation
        </button>
      </div>
    </div>
  );
}

// ─── Simulation View ─────────────────────────────────────────────────────────

function SimulationView({
  profile,
  currentStepIdx,
  currentStep,
  results,
  score,
  totalAnswered,
  aiFeedback,
  aiLoading,
  setAiFeedback,
  setAiLoading,
  onRecord,
  onReset,
}: {
  profile: ClientProfile;
  currentStepIdx: number;
  currentStep: SimulationStep;
  results: StepResult[];
  score: number;
  totalAnswered: number;
  aiFeedback: string;
  aiLoading: boolean;
  setAiFeedback: (s: string) => void;
  setAiLoading: (b: boolean) => void;
  onRecord: (r: StepResult) => void;
  onReset: () => void;
}) {
  const isComplete = results.length >= 6;

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* Sidebar — client profile card */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-rose-500 to-pink-500" />
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white">{profile.name}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${difficultyColors[profile.difficulty]}`}>
                {profile.difficulty}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                {profile.age} y/o {profile.gender}
              </p>
              <p className="text-gray-400">{profile.occupation}</p>
              <p className="text-gray-400">
                <span className="text-gray-500">Fitness:</span>{" "}
                <span className="capitalize">{profile.fitnessLevel}</span>
              </p>
              <div>
                <span className="text-gray-500">Goals:</span>
                <p className="text-gray-300 mt-0.5">{profile.goals}</p>
              </div>
              <div>
                <span className="text-gray-500">Medical:</span>
                <p className="text-gray-300 mt-0.5">{profile.medicalHistory}</p>
              </div>
            </div>

            {/* Score */}
            {totalAnswered > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Score</span>
                  <span className="text-sm font-semibold text-white">
                    {score}/{totalAnswered}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalAnswered > 0 ? (score / totalAnswered) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress nodes */}
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Progress</h4>
          <div className="space-y-1">
            {STEP_ORDER.map((step, i) => {
              const result = results.find((r) => r.step === step);
              const isCurrent = i === currentStepIdx && !isComplete;
              const isPast = result !== undefined;
              const isFuture = !isPast && !isCurrent;

              return (
                <div key={step} className="flex items-center gap-3">
                  {/* Node */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                      isPast && result?.correct
                        ? "bg-green-500/20 text-green-400 border border-green-500/40"
                        : isPast && !result?.correct
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : isCurrent
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 ring-2 ring-rose-500/20"
                        : "bg-gray-800 text-gray-600 border border-gray-700"
                    }`}
                  >
                    {isPast ? (result?.correct ? "\u2713" : "\u2717") : i + 1}
                  </div>
                  {/* Label */}
                  <span
                    className={`text-sm ${
                      isCurrent ? "text-white font-medium" : isPast ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {STEP_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onReset}
          className="mt-4 w-full py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
        >
          Exit Simulation
        </button>
      </div>

      {/* Main content area */}
      <div>
        {!isComplete ? (
          <StepContent
            profile={profile}
            step={currentStep}
            stepIdx={currentStepIdx}
            onRecord={onRecord}
          />
        ) : (
          <CompletionView
            profile={profile}
            results={results}
            score={score}
            aiFeedback={aiFeedback}
            aiLoading={aiLoading}
            setAiFeedback={setAiFeedback}
            setAiLoading={setAiLoading}
            onReset={onReset}
          />
        )}
      </div>
    </div>
  );
}

// ─── Step Content Router ─────────────────────────────────────────────────────

function StepContent({
  profile,
  step,
  stepIdx,
  onRecord,
}: {
  profile: ClientProfile;
  step: SimulationStep;
  stepIdx: number;
  onRecord: (r: StepResult) => void;
}) {
  switch (step) {
    case "assessment":
      return <AssessmentStep profile={profile} onRecord={onRecord} />;
    case "phase-selection":
      return <PhaseSelectionStep profile={profile} onRecord={onRecord} />;
    case "corrective-strategy":
      return <CorrectiveStrategyStep profile={profile} onRecord={onRecord} />;
    case "acute-variables":
      return <AcuteVariablesStep profile={profile} onRecord={onRecord} />;
    case "exercise-selection":
      return <ExerciseSelectionStep profile={profile} onRecord={onRecord} />;
    case "progression":
      return <ProgressionStep profile={profile} onRecord={onRecord} />;
    default:
      return null;
  }
}

// ─── Step Card Wrapper ───────────────────────────────────────────────────────

function StepCard({
  stepNum,
  title,
  children,
}: {
  stepNum: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm font-bold border border-rose-500/30">
            {stepNum}
          </div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Feedback Display (shown after answering) ────────────────────────────────

function StepFeedback({
  correct,
  explanation,
  onContinue,
}: {
  correct: boolean;
  explanation: string;
  onContinue: () => void;
}) {
  return (
    <div className="mt-5 space-y-4">
      <div
        className={`p-4 rounded-xl border ${
          correct
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-lg ${correct ? "text-green-400" : "text-red-400"}`}>
            {correct ? "\u2713" : "\u2717"}
          </span>
          <span className={`font-semibold text-sm ${correct ? "text-green-400" : "text-red-400"}`}>
            {correct ? "Correct!" : "Not quite"}
          </span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
      </div>
      <button
        onClick={onContinue}
        className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:from-rose-600 hover:to-pink-600 transition-all"
      >
        Continue
      </button>
    </div>
  );
}

// ─── Step 1: Assessment Review ───────────────────────────────────────────────

function AssessmentStep({
  profile,
  onRecord,
}: {
  profile: ClientProfile;
  onRecord: (r: StepResult) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Build choices: real compensations + distractors
  const realCompensations = profile.assessmentFindings.movementCompensations;
  const distractors = [
    "Excessive thoracic rotation during gait",
    "Bilateral ankle instability",
    "Scapular elevation during arm abduction",
    "Excessive hip external rotation",
    "Cervical spine lateral flexion",
    "Pes cavus foot type contributing to lateral chain dysfunction",
  ];
  const allChoices = useRef(
    shuffle([...realCompensations, ...shuffle(distractors).slice(0, 3)])
  ).current;

  function handleSubmit() {
    const correctSet = new Set(realCompensations);
    const selectedCorrectCount = selected.filter((s) => correctSet.has(s)).length;
    const selectedWrongCount = selected.filter((s) => !correctSet.has(s)).length;
    const isCorrect =
      selectedCorrectCount >= Math.ceil(realCompensations.length / 2) &&
      selectedWrongCount <= 1;

    setSubmitted(true);
    onRecord({
      step: "assessment",
      label: "Assessment Review",
      userAnswer: selected.join("; "),
      correct: isCorrect,
      explanation: `The primary movement compensations for this client are: ${realCompensations.join(
        "; "
      )}. These findings are based on the overhead squat assessment and postural observations. Identifying the correct compensations is critical because they determine which muscles are overactive vs. underactive and drive the entire corrective exercise strategy.`,
    });
  }

  return (
    <StepCard stepNum={1} title="Assessment Review">
      {/* Show findings */}
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Overhead Squat Findings</h3>
          <ul className="space-y-1">
            {profile.assessmentFindings.overheadSquat.map((f, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-rose-400 mt-1">&#8226;</span> {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Postural Observations</h3>
          <ul className="space-y-1">
            {profile.assessmentFindings.posturalObservations.map((f, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-rose-400 mt-1">&#8226;</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-sm text-white font-medium mb-3">
        Based on these findings, what are the primary movement compensations? (Select all that apply)
      </p>

      <div className="space-y-2 mb-4">
        {allChoices.map((choice, i) => {
          const isSelected = selected.includes(choice);
          const isReal = realCompensations.includes(choice);
          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() =>
                setSelected((prev) =>
                  prev.includes(choice) ? prev.filter((s) => s !== choice) : [...prev, choice]
                )
              }
              className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                submitted && isReal
                  ? "bg-green-500/10 border-green-500/40 text-green-300"
                  : submitted && isSelected && !isReal
                  ? "bg-red-500/10 border-red-500/40 text-red-300"
                  : isSelected
                  ? "bg-rose-500/10 border-rose-500/40 text-white"
                  : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            selected.length > 0
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit Answer
        </button>
      )}
    </StepCard>
  );
}

// ─── Step 2: Phase Selection ─────────────────────────────────────────────────

function PhaseSelectionStep({
  profile,
  onRecord,
}: {
  profile: ClientProfile;
  onRecord: (r: StepResult) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (selected === null) return;
    const correct = selected === profile.correctPhase;
    setSubmitted(true);
    onRecord({
      step: "phase-selection",
      label: "Phase Selection",
      userAnswer: `Phase ${selected} (${optPhases[selected - 1].name})`,
      correct,
      explanation: profile.phaseRationale,
    });
  }

  return (
    <StepCard stepNum={2} title="Phase Selection">
      <p className="text-sm text-white font-medium mb-4">
        Which OPT phase should this client start in?
      </p>

      <div className="space-y-3 mb-5">
        {optPhases.map((phase) => {
          const isSelected = selected === phase.phase;
          const isCorrect = phase.phase === profile.correctPhase;
          return (
            <button
              key={phase.phase}
              disabled={submitted}
              onClick={() => setSelected(phase.phase)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                submitted && isCorrect
                  ? "bg-green-500/10 border-green-500/40"
                  : submitted && isSelected && !isCorrect
                  ? "bg-red-500/10 border-red-500/40"
                  : isSelected
                  ? "bg-rose-500/10 border-rose-500/40"
                  : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    submitted && isCorrect
                      ? "bg-green-500/20 text-green-400"
                      : submitted && isSelected && !isCorrect
                      ? "bg-red-500/20 text-red-400"
                      : isSelected
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {phase.phase}
                </span>
                <span className={`text-sm font-semibold ${submitted && isCorrect ? "text-green-400" : submitted && isSelected && !isCorrect ? "text-red-400" : "text-white"}`}>
                  {phase.name}
                </span>
              </div>
              <p className="text-xs text-gray-400 ml-10">{phase.description}</p>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            selected !== null
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit Answer
        </button>
      )}
    </StepCard>
  );
}

// ─── Step 3: Corrective Strategy ─────────────────────────────────────────────

function CorrectiveStrategyStep({
  profile,
  onRecord,
}: {
  profile: ClientProfile;
  onRecord: (r: StepResult) => void;
}) {
  const [inhibitSelections, setInhibitSelections] = useState<string[]>([]);
  const [activateSelections, setActivateSelections] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Derive overactive/underactive from the compensation data
  const compensationData = commonCompensations.overheadSquat;
  const matchedComps = compensationData.filter((c) =>
    profile.assessmentFindings.overheadSquat.some(
      (f) => f.toLowerCase().includes(c.label.toLowerCase().split(" (")[0].slice(0, 10))
    )
  );

  const overactiveMuscles = [...new Set(matchedComps.flatMap((c) => c.overactive))];
  const underactiveMuscles = [...new Set(matchedComps.flatMap((c) => c.underactive))];

  // If no matches from the database, fall back to generic lists based on findings
  const displayOveractive = overactiveMuscles.length > 0
    ? overactiveMuscles
    : ["Hip flexors", "Upper trapezius", "Adductors", "Latissimus dorsi"];
  const displayUnderactive = underactiveMuscles.length > 0
    ? underactiveMuscles
    : ["Gluteus maximus", "Gluteus medius", "Lower trapezius", "Core stabilizers"];

  const allMuscles = useRef(
    shuffle([...displayOveractive, ...displayUnderactive, "Deltoid (anterior)", "Biceps brachii", "Rectus femoris", "Popliteus"])
      .filter((v, i, a) => a.indexOf(v) === i) // dedupe
  ).current;

  function handleSubmit() {
    const overactiveSet = new Set(displayOveractive);
    const underactiveSet = new Set(displayUnderactive);

    const inhibitCorrect = inhibitSelections.filter((m) => overactiveSet.has(m)).length;
    const activateCorrect = activateSelections.filter((m) => underactiveSet.has(m)).length;
    const totalNeeded = displayOveractive.length + displayUnderactive.length;
    const totalCorrect = inhibitCorrect + activateCorrect;
    const isCorrect = totalCorrect >= Math.ceil(totalNeeded * 0.5);

    setSubmitted(true);
    onRecord({
      step: "corrective-strategy",
      label: "Corrective Strategy",
      userAnswer: `Inhibit: ${inhibitSelections.join(", ")}; Activate: ${activateSelections.join(", ")}`,
      correct: isCorrect,
      explanation: `Muscles to inhibit/lengthen (overactive): ${displayOveractive.join(
        ", "
      )}. Muscles to activate/strengthen (underactive): ${displayUnderactive.join(
        ", "
      )}. The corrective exercise continuum follows: Inhibit (SMR/foam rolling) -> Lengthen (static/neuromuscular stretching) -> Activate (isolated strengthening) -> Integrate (integrated dynamic movements). This is a key exam concept.`,
    });
  }

  return (
    <StepCard stepNum={3} title="Corrective Strategy">
      <p className="text-sm text-white font-medium mb-4">
        Based on the compensations found, categorize these muscles as needing to be
        inhibited/lengthened (overactive) or activated/strengthened (underactive).
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {/* Inhibit column */}
        <div>
          <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-red-500/20 flex items-center justify-center text-xs">I</span>
            Inhibit / Lengthen (Overactive)
          </h3>
          <div className="space-y-1.5">
            {allMuscles.map((muscle) => {
              const isInhibit = inhibitSelections.includes(muscle);
              const isActivate = activateSelections.includes(muscle);
              const isCorrectInhibit = displayOveractive.includes(muscle);
              return (
                <button
                  key={`i-${muscle}`}
                  disabled={submitted || isActivate}
                  onClick={() =>
                    setInhibitSelections((prev) =>
                      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
                    )
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    submitted && isCorrectInhibit
                      ? "bg-green-500/10 border-green-500/40 text-green-300"
                      : submitted && isInhibit && !isCorrectInhibit
                      ? "bg-red-500/10 border-red-500/40 text-red-300"
                      : isInhibit
                      ? "bg-red-500/10 border-red-500/40 text-white"
                      : isActivate
                      ? "bg-gray-800/30 border-gray-700/50 text-gray-600 cursor-not-allowed"
                      : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  {muscle}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activate column */}
        <div>
          <h3 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center text-xs">A</span>
            Activate / Strengthen (Underactive)
          </h3>
          <div className="space-y-1.5">
            {allMuscles.map((muscle) => {
              const isActivate = activateSelections.includes(muscle);
              const isInhibit = inhibitSelections.includes(muscle);
              const isCorrectActivate = displayUnderactive.includes(muscle);
              return (
                <button
                  key={`a-${muscle}`}
                  disabled={submitted || isInhibit}
                  onClick={() =>
                    setActivateSelections((prev) =>
                      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
                    )
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    submitted && isCorrectActivate
                      ? "bg-green-500/10 border-green-500/40 text-green-300"
                      : submitted && isActivate && !isCorrectActivate
                      ? "bg-red-500/10 border-red-500/40 text-red-300"
                      : isActivate
                      ? "bg-green-500/10 border-green-500/40 text-white"
                      : isInhibit
                      ? "bg-gray-800/30 border-gray-700/50 text-gray-600 cursor-not-allowed"
                      : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  {muscle}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={inhibitSelections.length === 0 && activateSelections.length === 0}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            inhibitSelections.length > 0 || activateSelections.length > 0
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit Answer
        </button>
      )}
    </StepCard>
  );
}

// ─── Step 4: Acute Variables ─────────────────────────────────────────────────

function AcuteVariablesStep({
  profile,
  onRecord,
}: {
  profile: ClientProfile;
  onRecord: (r: StepResult) => void;
}) {
  const correctPhaseData = optPhases[profile.correctPhase - 1];
  const variables = correctPhaseData.acuteVariables;

  // Create a matching exercise: present jumbled variables and ask user to match them
  const variableKeys = ["sets", "reps", "intensity", "tempo", "rest"] as const;
  const [answers, setAnswers] = useState<Record<string, string>>({
    sets: "",
    reps: "",
    intensity: "",
    tempo: "",
    rest: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Shuffled options for each variable
  const options = useRef(() => {
    const allSets = ["1-3", "2-4", "3-5", "4-6"];
    const allReps = ["12-20", "8-12", "6-12", "1-5", "1-5 / 8-10"];
    const allIntensity = ["50-70% 1RM", "70-80% 1RM", "75-85% 1RM", "85-100% 1RM", "85-100% / 30-45%"];
    const allTempo = ["4/2/1 (slow)", "2/0/2 (moderate)", "X/X/X (explosive)"];
    const allRest = ["0-90 seconds", "0-60 seconds", "3-5 minutes"];

    return {
      sets: shuffle(allSets),
      reps: shuffle(allReps),
      intensity: shuffle(allIntensity),
      tempo: shuffle(allTempo),
      rest: shuffle(allRest),
    };
  }).current();

  function handleSubmit() {
    let correctCount = 0;
    variableKeys.forEach((key) => {
      if (answers[key] === variables[key]) correctCount++;
    });
    const isCorrect = correctCount >= 3;

    setSubmitted(true);
    onRecord({
      step: "acute-variables",
      label: "Acute Variables",
      userAnswer: variableKeys.map((k) => `${k}: ${answers[k]}`).join("; "),
      correct: isCorrect,
      explanation: `The correct acute variables for Phase ${profile.correctPhase} (${correctPhaseData.name}) are: Sets: ${variables.sets}, Reps: ${variables.reps}, Intensity: ${variables.intensity}, Tempo: ${variables.tempo}, Rest: ${variables.rest}. Memorizing the acute variable chart for all 5 phases is essential for the NASM exam. Remember: as you progress through phases, reps generally decrease, intensity increases, and rest periods increase (except Phase 2 which uses short rest for superset format).`,
    });
  }

  const variableLabels: Record<string, string> = {
    sets: "Sets",
    reps: "Reps",
    intensity: "Intensity",
    tempo: "Tempo",
    rest: "Rest Period",
  };

  return (
    <StepCard stepNum={4} title="Acute Variables">
      <p className="text-sm text-white font-medium mb-1">
        Match the correct acute variables for Phase {profile.correctPhase} ({correctPhaseData.name}).
      </p>
      <p className="text-xs text-gray-500 mb-5">Select the correct value for each variable.</p>

      <div className="space-y-4 mb-5">
        {variableKeys.map((key) => {
          const isCorrect = answers[key] === variables[key];
          return (
            <div key={key}>
              <label className="block text-sm text-gray-400 mb-1.5">{variableLabels[key]}</label>
              <div className="flex flex-wrap gap-2">
                {options[key].map((opt) => {
                  const isSelected = answers[key] === opt;
                  const isCorrectOpt = opt === variables[key];
                  return (
                    <button
                      key={opt}
                      disabled={submitted}
                      onClick={() => setAnswers((prev) => ({ ...prev, [key]: opt }))}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        submitted && isCorrectOpt
                          ? "bg-green-500/10 border-green-500/40 text-green-300"
                          : submitted && isSelected && !isCorrectOpt
                          ? "bg-red-500/10 border-red-500/40 text-red-300"
                          : isSelected
                          ? "bg-rose-500/10 border-rose-500/40 text-white"
                          : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.values(answers).some((v) => !v)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            Object.values(answers).every((v) => v)
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit Answer
        </button>
      )}
    </StepCard>
  );
}

// ─── Step 5: Exercise Selection ──────────────────────────────────────────────

function ExerciseSelectionStep({
  profile,
  onRecord,
}: {
  profile: ClientProfile;
  onRecord: (r: StepResult) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const correctPhase = profile.correctPhase;
  const phaseExercises = exerciseDatabase.filter((e) => e.phase.includes(correctPhase));
  const wrongExercises = exerciseDatabase.filter((e) => !e.phase.includes(correctPhase));

  // Present 8 exercises: some correct, some wrong
  const exerciseChoices = useRef(
    shuffle([
      ...shuffle(phaseExercises).slice(0, 5),
      ...shuffle(wrongExercises).slice(0, 3),
    ])
  ).current;

  function handleSubmit() {
    const correctNames = new Set(phaseExercises.map((e) => e.name));
    const correctlySelected = selected.filter((s) => correctNames.has(s)).length;
    const incorrectlySelected = selected.filter((s) => !correctNames.has(s)).length;
    const isCorrect = correctlySelected >= 3 && incorrectlySelected <= 1;

    setSubmitted(true);
    onRecord({
      step: "exercise-selection",
      label: "Exercise Selection",
      userAnswer: selected.join("; "),
      correct: isCorrect,
      explanation: `For Phase ${correctPhase} (${optPhases[correctPhase - 1].name}), appropriate exercises include: ${phaseExercises
        .map((e) => e.name)
        .join(", ")}. Exercise selection should match the phase's goals and acute variables. Phase 1 emphasizes stability and proprioception, Phase 2 uses supersets, Phase 3 focuses on volume, Phase 4 on heavy loads, and Phase 5 pairs strength with power exercises.`,
    });
  }

  return (
    <StepCard stepNum={5} title="Exercise Selection">
      <p className="text-sm text-white font-medium mb-1">
        Build a workout for this client in Phase {correctPhase} ({optPhases[correctPhase - 1].name}).
      </p>
      <p className="text-xs text-gray-500 mb-5">
        Select the exercises appropriate for this phase and client. Choose 4-5 exercises.
      </p>

      <div className="space-y-2 mb-5">
        {exerciseChoices.map((exercise) => {
          const isSelected = selected.includes(exercise.name);
          const isPhaseCorrect = exercise.phase.includes(correctPhase);
          return (
            <button
              key={exercise.name}
              disabled={submitted}
              onClick={() =>
                setSelected((prev) =>
                  prev.includes(exercise.name)
                    ? prev.filter((s) => s !== exercise.name)
                    : [...prev, exercise.name]
                )
              }
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                submitted && isPhaseCorrect && isSelected
                  ? "bg-green-500/10 border-green-500/40"
                  : submitted && isPhaseCorrect && !isSelected
                  ? "bg-green-500/5 border-green-500/20"
                  : submitted && !isPhaseCorrect && isSelected
                  ? "bg-red-500/10 border-red-500/40"
                  : isSelected
                  ? "bg-rose-500/10 border-rose-500/40"
                  : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-medium ${submitted && isPhaseCorrect ? "text-green-300" : submitted && !isPhaseCorrect && isSelected ? "text-red-300" : "text-white"}`}>
                    {exercise.name}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">{exercise.description}</p>
                </div>
                <span className="text-xs text-gray-600 ml-3 flex-shrink-0">{exercise.category}</span>
              </div>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            selected.length > 0
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit Answer
        </button>
      )}
    </StepCard>
  );
}

// ─── Step 6: Progression Plan ────────────────────────────────────────────────

function ProgressionStep({
  profile,
  onRecord,
}: {
  profile: ClientProfile;
  onRecord: (r: StepResult) => void;
}) {
  const [whenAnswer, setWhenAnswer] = useState("");
  const [criteriaAnswers, setCriteriaAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const correctPhase = profile.correctPhase;
  const nextPhase = Math.min(correctPhase + 1, 5);

  const whenOptions = [
    "After 2-4 weeks if client demonstrates proper form and can complete all sets/reps",
    "Immediately — the client should move to the next phase as fast as possible",
    "After 6-12 months — the client should stay in this phase long-term",
    "Only when the client specifically asks to progress",
  ];

  const criteriaOptions = [
    { id: "form", label: "Client demonstrates proper exercise form with minimal compensations", correct: true },
    { id: "soreness", label: "Client reports no soreness after sessions", correct: false },
    { id: "endurance", label: "Client can complete all prescribed sets and reps with current loads", correct: true },
    { id: "core", label: "Core stability has improved (can hold plank, perform drawing-in maneuver)", correct: true },
    { id: "balance", label: "Balance and proprioception have measurably improved", correct: true },
    { id: "weight", label: "Client has reached their goal body weight", correct: false },
    { id: "pain", label: "Any pain or discomfort has been resolved or significantly reduced", correct: true },
  ];

  const correctWhen = whenOptions[0];

  function handleSubmit() {
    const whenCorrect = whenAnswer === correctWhen;
    const correctCriteria = criteriaOptions.filter((c) => c.correct).map((c) => c.id);
    const criteriaCorrectCount = criteriaAnswers.filter((a) => correctCriteria.includes(a)).length;
    const isCorrect = whenCorrect && criteriaCorrectCount >= 3;

    setSubmitted(true);
    onRecord({
      step: "progression",
      label: "Progression Plan",
      userAnswer: `When: ${whenAnswer}; Criteria: ${criteriaAnswers.join(", ")}`,
      correct: isCorrect,
      explanation: `Clients typically spend 2-4 weeks in each phase before progressing, depending on their response. Progression criteria include: demonstrating proper form, completing prescribed volume, improved stability/balance, and resolution of pain. The NASM OPT model is systematic — each phase builds on the previous one. Skipping phases or progressing too quickly increases injury risk and undermines long-term results. Key exam point: progression is based on demonstrated competency, not arbitrary time frames.`,
    });
  }

  return (
    <StepCard stepNum={6} title="Progression Plan">
      <p className="text-sm text-white font-medium mb-4">
        When should this client progress from Phase {correctPhase} to Phase {nextPhase}?
      </p>

      <div className="space-y-2 mb-6">
        {whenOptions.map((option) => {
          const isSelected = whenAnswer === option;
          const isCorrectOpt = option === correctWhen;
          return (
            <button
              key={option}
              disabled={submitted}
              onClick={() => setWhenAnswer(option)}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                submitted && isCorrectOpt
                  ? "bg-green-500/10 border-green-500/40 text-green-300"
                  : submitted && isSelected && !isCorrectOpt
                  ? "bg-red-500/10 border-red-500/40 text-red-300"
                  : isSelected
                  ? "bg-rose-500/10 border-rose-500/40 text-white"
                  : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-white font-medium mb-3">
        What criteria indicate readiness to progress? (Select all that apply)
      </p>

      <div className="space-y-2 mb-5">
        {criteriaOptions.map((option) => {
          const isSelected = criteriaAnswers.includes(option.id);
          return (
            <button
              key={option.id}
              disabled={submitted}
              onClick={() =>
                setCriteriaAnswers((prev) =>
                  prev.includes(option.id)
                    ? prev.filter((a) => a !== option.id)
                    : [...prev, option.id]
                )
              }
              className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                submitted && option.correct
                  ? "bg-green-500/10 border-green-500/40 text-green-300"
                  : submitted && isSelected && !option.correct
                  ? "bg-red-500/10 border-red-500/40 text-red-300"
                  : isSelected
                  ? "bg-rose-500/10 border-rose-500/40 text-white"
                  : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!whenAnswer || criteriaAnswers.length === 0}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            whenAnswer && criteriaAnswers.length > 0
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit Answer
        </button>
      )}
    </StepCard>
  );
}

// ─── Completion View ─────────────────────────────────────────────────────────

function CompletionView({
  profile,
  results,
  score,
  aiFeedback,
  aiLoading,
  setAiFeedback,
  setAiLoading,
  onReset,
}: {
  profile: ClientProfile;
  results: StepResult[];
  score: number;
  aiFeedback: string;
  aiLoading: boolean;
  setAiFeedback: (s: string) => void;
  setAiLoading: (b: boolean) => void;
  onReset: () => void;
}) {
  const feedbackRef = useRef<HTMLDivElement>(null);

  const fetchAiFeedback = useCallback(async () => {
    if (aiFeedback || aiLoading) return;
    setAiLoading(true);

    const prompt = `I just completed an OPT Model program design simulation for a client. Please review my decisions and provide detailed feedback.

CLIENT PROFILE:
- Name: ${profile.name}, ${profile.age} y/o ${profile.gender}
- Occupation: ${profile.occupation}
- Fitness Level: ${profile.fitnessLevel}
- Goals: ${profile.goals}
- Medical History: ${profile.medicalHistory}
- Assessment Findings: ${JSON.stringify(profile.assessmentFindings)}
- Correct Starting Phase: Phase ${profile.correctPhase} (${optPhases[profile.correctPhase - 1].name})

MY DECISIONS AND RESULTS (${score}/6 correct):
${results
  .map(
    (r) =>
      `- ${r.label}: ${r.correct ? "CORRECT" : "INCORRECT"} — My answer: ${r.userAnswer}`
  )
  .join("\n")}

Please provide:
1. Overall assessment of my program design choices
2. What I did well
3. What I could improve
4. Specific exam tips related to this type of client scenario
5. Common NASM exam traps related to these topics

Keep your response focused and practical — this is for NASM CPT exam preparation.`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, history: [] }),
      });

      if (!response.ok) {
        setAiFeedback("Unable to load AI feedback. Please try again later.");
        setAiLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setAiFeedback("Unable to load AI feedback.");
        setAiLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setAiFeedback(accumulated);
              }
            } catch {
              // skip
            }
          }
        }
      }

      setAiLoading(false);
    } catch {
      setAiFeedback("Unable to load AI feedback. Please try again later.");
      setAiLoading(false);
    }
  }, [profile, results, score, aiFeedback, aiLoading, setAiFeedback, setAiLoading]);

  // Auto-fetch feedback when completion view mounts
  useEffect(() => {
    fetchAiFeedback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const percentage = Math.round((score / 6) * 100);

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
        <div className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Simulation Complete</h2>
          <div className="flex items-center gap-6 mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#1f2937" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke={percentage >= 70 ? "#22c55e" : percentage >= 50 ? "#eab308" : "#ef4444"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(percentage / 100) * 220} 220`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                {percentage}%
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {score}/6 Steps Correct
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {percentage >= 80
                  ? "Excellent work! You have a strong grasp of OPT model program design."
                  : percentage >= 60
                  ? "Good effort! Review the areas you missed to strengthen your understanding."
                  : "Keep practicing! Focus on the explanations for each step to improve."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-step results */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Step-by-Step Review</h3>
          <div className="space-y-3">
            {results.map((result, i) => (
              <details
                key={i}
                className={`rounded-xl border overflow-hidden ${
                  result.correct
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <summary className="px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-white/5 transition-colors">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      result.correct
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {result.correct ? "\u2713" : "\u2717"}
                  </span>
                  <span className="text-sm font-medium text-white">{result.label}</span>
                  <span
                    className={`ml-auto text-xs font-medium ${
                      result.correct ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {result.correct ? "Correct" : "Incorrect"}
                  </span>
                </summary>
                <div className="px-4 pb-4 pt-1 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Your answer: {result.userAnswer}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{result.explanation}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* AI Feedback */}
      <div
        ref={feedbackRef}
        className="bg-gray-900 border border-rose-500/30 rounded-2xl overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">AI Coach Feedback</h3>
          </div>

          {aiLoading && !aiFeedback && (
            <div className="flex items-center gap-3 text-gray-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm">Analyzing your program design decisions...</span>
            </div>
          )}

          {aiFeedback && (
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {aiFeedback}
            </div>
          )}

          {!aiLoading && !aiFeedback && (
            <button
              onClick={fetchAiFeedback}
              className="px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-sm hover:bg-rose-500/30 transition-colors"
            >
              Get AI Feedback
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          Try Another Client
        </button>
      </div>
    </div>
  );
}
