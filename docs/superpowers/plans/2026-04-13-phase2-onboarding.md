# Phase 2: Onboarding Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 4-step onboarding flow: quick profile, learning style assessment, knowledge baseline quiz, and personalized study plan generation.

**Architecture:** Multi-step client-side form at `/onboarding` using React state to track current step. Each step is its own component. On completion, profile is updated in Supabase, study plan is generated client-side and saved, and study sessions are created. User is redirected to dashboard.

**Tech Stack:** Next.js 16 (App Router), Supabase, TypeScript, Tailwind CSS

---

## File Structure

```
src/
├── app/
│   └── onboarding/
│       └── page.tsx                    # Onboarding page (orchestrates steps)
├── components/
│   └── onboarding/
│       ├── step-profile.tsx            # Step 1: exam date, hours, experience
│       ├── step-assessment.tsx         # Step 2: learning style quiz
│       ├── step-baseline.tsx           # Step 3: knowledge baseline
│       ├── step-plan.tsx               # Step 4: show generated plan
│       └── progress-bar.tsx            # Visual step indicator
├── lib/
│   ├── onboarding/
│   │   ├── assessment-questions.ts     # Learning style quiz questions
│   │   ├── baseline-questions.ts       # Knowledge baseline questions
│   │   ├── scoring.ts                  # Score learning style + baseline
│   │   └── plan-generator.ts           # Generate week-by-week study plan
│   └── types/
│       └── database.ts                 # (existing — no changes needed)
```

---

### Task 1: Progress Bar Component

**Files:**
- Create: `src/components/onboarding/progress-bar.tsx`

- [ ] **Step 1: Create the progress bar**

```tsx
// src/components/onboarding/progress-bar.tsx
"use client";

const steps = ["Profile", "Learning Style", "Baseline", "Your Plan"];

export default function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i < currentStep
                  ? "bg-green-600 text-white"
                  : i === currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-500"
              }`}
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs mt-1 ${
                i <= currentStep ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mb-4 ${
                i < currentStep ? "bg-green-600" : "bg-gray-800"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/onboarding/progress-bar.tsx
git commit -m "feat: add onboarding progress bar component"
```

---

### Task 2: Assessment Questions Data

**Files:**
- Create: `src/lib/onboarding/assessment-questions.ts`

- [ ] **Step 1: Create learning style assessment questions**

Each question has 4 options, one per learning dimension. User picks the one that resonates most.

```typescript
// src/lib/onboarding/assessment-questions.ts
export type AssessmentQuestion = {
  id: number;
  question: string;
  options: {
    text: string;
    dimension: "visual" | "reading_writing" | "active_recall" | "practical";
  }[];
};

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    question: "When learning a new exercise technique, you prefer to:",
    options: [
      { text: "Watch a video demonstration", dimension: "visual" },
      { text: "Read the step-by-step instructions", dimension: "reading_writing" },
      { text: "Quiz yourself on the muscle groups involved", dimension: "active_recall" },
      { text: "Try performing it right away with guidance", dimension: "practical" },
    ],
  },
  {
    id: 2,
    question: "You remember information best when you:",
    options: [
      { text: "See it in a chart or diagram", dimension: "visual" },
      { text: "Write it down in your own words", dimension: "reading_writing" },
      { text: "Test yourself on it repeatedly", dimension: "active_recall" },
      { text: "Apply it to a real scenario", dimension: "practical" },
    ],
  },
  {
    id: 3,
    question: "If you had to learn the muscles of the leg, you'd start by:",
    options: [
      { text: "Looking at an anatomy diagram", dimension: "visual" },
      { text: "Reading the textbook descriptions", dimension: "reading_writing" },
      { text: "Using flashcards to memorize them", dimension: "active_recall" },
      { text: "Feeling each muscle on your own leg while studying", dimension: "practical" },
    ],
  },
  {
    id: 4,
    question: "When studying for an exam, your ideal setup is:",
    options: [
      { text: "Color-coded notes with highlights and diagrams", dimension: "visual" },
      { text: "Detailed written summaries of each chapter", dimension: "reading_writing" },
      { text: "Practice tests and self-quizzing", dimension: "active_recall" },
      { text: "Teaching the material to someone else", dimension: "practical" },
    ],
  },
  {
    id: 5,
    question: "A client asks you to explain the OPT model. You'd explain it by:",
    options: [
      { text: "Drawing the pyramid diagram on a whiteboard", dimension: "visual" },
      { text: "Walking through each phase in written detail", dimension: "reading_writing" },
      { text: "Asking them questions to guide their understanding", dimension: "active_recall" },
      { text: "Showing them example exercises from each phase", dimension: "practical" },
    ],
  },
  {
    id: 6,
    question: "When you don't understand a concept, you usually:",
    options: [
      { text: "Search for an infographic or visual explanation", dimension: "visual" },
      { text: "Re-read the material more carefully", dimension: "reading_writing" },
      { text: "Try practice problems until it clicks", dimension: "active_recall" },
      { text: "Find a real-world example to relate it to", dimension: "practical" },
    ],
  },
  {
    id: 7,
    question: "You find it easiest to remember:",
    options: [
      { text: "Images and spatial layouts", dimension: "visual" },
      { text: "Written definitions and descriptions", dimension: "reading_writing" },
      { text: "Things you've been tested on before", dimension: "active_recall" },
      { text: "Things you've physically done or applied", dimension: "practical" },
    ],
  },
  {
    id: 8,
    question: "If you had one hour to study, you'd spend it:",
    options: [
      { text: "Reviewing diagrams and visual study guides", dimension: "visual" },
      { text: "Reading and taking notes on a chapter", dimension: "reading_writing" },
      { text: "Doing as many practice questions as possible", dimension: "active_recall" },
      { text: "Working through case studies or client scenarios", dimension: "practical" },
    ],
  },
  {
    id: 9,
    question: "In a classroom setting, you learn best from:",
    options: [
      { text: "Slides with images and diagrams", dimension: "visual" },
      { text: "The textbook and written handouts", dimension: "reading_writing" },
      { text: "Pop quizzes and group review games", dimension: "active_recall" },
      { text: "Hands-on labs and group exercises", dimension: "practical" },
    ],
  },
  {
    id: 10,
    question: "To prepare for the NASM exam, the most helpful resource would be:",
    options: [
      { text: "Video walkthroughs of each chapter with visuals", dimension: "visual" },
      { text: "A condensed study guide with all key points", dimension: "reading_writing" },
      { text: "A huge bank of practice exam questions", dimension: "active_recall" },
      { text: "Real client scenarios to design programs for", dimension: "practical" },
    ],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/onboarding/assessment-questions.ts
git commit -m "feat: add learning style assessment questions"
```

---

### Task 3: Baseline Questions Data

**Files:**
- Create: `src/lib/onboarding/baseline-questions.ts`

- [ ] **Step 1: Create baseline knowledge questions sampling NASM chapters**

```typescript
// src/lib/onboarding/baseline-questions.ts
export type BaselineQuestion = {
  id: number;
  chapter: number;
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
};

export const baselineQuestions: BaselineQuestion[] = [
  {
    id: 1,
    chapter: 1,
    question: "What does NASM stand for?",
    options: [
      "National Academy of Sports Medicine",
      "National Association of Sports Medicine",
      "National Academy of Strength Management",
      "National Association of Strength Medicine",
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    chapter: 2,
    question: "Which muscle is the primary hip flexor?",
    options: ["Gluteus maximus", "Iliopsoas", "Rectus femoris", "Hamstrings"],
    correctAnswer: 1,
  },
  {
    id: 3,
    chapter: 4,
    question: "What does the overhead squat assessment primarily evaluate?",
    options: [
      "Maximum strength",
      "Cardiovascular endurance",
      "Dynamic flexibility and neuromuscular control",
      "Body composition",
    ],
    correctAnswer: 2,
  },
  {
    id: 4,
    chapter: 5,
    question: "What type of muscle action occurs when a muscle lengthens under tension?",
    options: ["Concentric", "Isometric", "Eccentric", "Isokinetic"],
    correctAnswer: 2,
  },
  {
    id: 5,
    chapter: 8,
    question: "How many phases does the NASM OPT model have?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 2,
  },
  {
    id: 6,
    chapter: 10,
    question: "Supersets involve performing two exercises:",
    options: [
      "With long rest periods between them",
      "Back to back with minimal rest",
      "For the same muscle group only",
      "At maximum intensity only",
    ],
    correctAnswer: 1,
  },
  {
    id: 7,
    chapter: 12,
    question: "Which OPT phase focuses on stabilization endurance?",
    options: ["Phase 1", "Phase 2", "Phase 3", "Phase 5"],
    correctAnswer: 0,
  },
  {
    id: 8,
    chapter: 14,
    question: "Approximately how many calories are in one gram of protein?",
    options: ["2", "4", "7", "9"],
    correctAnswer: 1,
  },
  {
    id: 9,
    chapter: 17,
    question: "What is the recommended daily water intake guideline for active adults?",
    options: [
      "4 cups per day",
      "8 cups per day regardless of activity",
      "Half your body weight in ounces",
      "1 gallon minimum for everyone",
    ],
    correctAnswer: 2,
  },
  {
    id: 10,
    chapter: 19,
    question: "What is the primary role of a personal trainer?",
    options: [
      "Diagnose injuries",
      "Prescribe meal plans",
      "Help clients achieve fitness goals safely",
      "Provide physical therapy",
    ],
    correctAnswer: 2,
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/onboarding/baseline-questions.ts
git commit -m "feat: add knowledge baseline questions"
```

---

### Task 4: Scoring Logic

**Files:**
- Create: `src/lib/onboarding/scoring.ts`

- [ ] **Step 1: Create scoring functions**

```typescript
// src/lib/onboarding/scoring.ts
import type { AssessmentQuestion } from "./assessment-questions";
import type { BaselineQuestion } from "./baseline-questions";

export type LearningStyle = {
  visual: number;
  reading_writing: number;
  active_recall: number;
  practical: number;
};

export function scoreLearningStyle(
  questions: AssessmentQuestion[],
  answers: Record<number, string> // questionId -> dimension chosen
): LearningStyle {
  const counts = { visual: 0, reading_writing: 0, active_recall: 0, practical: 0 };
  const total = Object.keys(answers).length;

  for (const dimension of Object.values(answers)) {
    if (dimension in counts) {
      counts[dimension as keyof LearningStyle]++;
    }
  }

  // Convert to 0-100 scale
  return {
    visual: total > 0 ? Math.round((counts.visual / total) * 100) : 25,
    reading_writing: total > 0 ? Math.round((counts.reading_writing / total) * 100) : 25,
    active_recall: total > 0 ? Math.round((counts.active_recall / total) * 100) : 25,
    practical: total > 0 ? Math.round((counts.practical / total) * 100) : 25,
  };
}

export type ChapterScore = {
  chapter: number;
  correct: boolean;
};

export function scoreBaseline(
  questions: BaselineQuestion[],
  answers: Record<number, number> // questionId -> selected index
): ChapterScore[] {
  return questions.map((q) => ({
    chapter: q.chapter,
    correct: answers[q.id] === q.correctAnswer,
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/onboarding/scoring.ts
git commit -m "feat: add learning style and baseline scoring logic"
```

---

### Task 5: Plan Generator

**Files:**
- Create: `src/lib/onboarding/plan-generator.ts`

- [ ] **Step 1: Create the study plan generator**

```typescript
// src/lib/onboarding/plan-generator.ts
import type { LearningStyle, ChapterScore } from "./scoring";

type PlanWeek = {
  week: number;
  chapters: number[];
  focus_type: string;
  hours: number;
};

const ALL_CHAPTERS = Array.from({ length: 20 }, (_, i) => i + 1);

const CHAPTER_NAMES: Record<number, string> = {
  1: "The Scientific Rationale for Integrated Training",
  2: "Basic Exercise Science",
  3: "The Cardiorespiratory System",
  4: "Fitness Assessment",
  5: "Human Movement Science",
  6: "Flexibility Training",
  7: "Cardiorespiratory Training",
  8: "Core Training",
  9: "Balance Training",
  10: "Plyometric Training",
  11: "Speed, Agility, and Quickness Training",
  12: "Resistance Training",
  13: "The Optimum Performance Training (OPT) Model",
  14: "Nutrition",
  15: "Supplementation",
  16: "Lifestyle Modification and Behavioral Coaching",
  17: "Special Populations",
  18: "Chronic Health Conditions",
  19: "The Personal Training Profession",
  20: "Developing a Successful Personal Training Business",
};

function getTopLearningMethod(style: LearningStyle): string {
  const entries = Object.entries(style) as [keyof LearningStyle, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const top = entries[0][0];

  const methodMap: Record<keyof LearningStyle, string> = {
    visual: "Diagrams & visual guides",
    reading_writing: "Summaries & note-taking",
    active_recall: "Quizzes & flashcards",
    practical: "Case studies & scenarios",
  };

  return methodMap[top];
}

export function generateStudyPlan(
  examDate: string,
  hoursPerWeek: number,
  learningStyle: LearningStyle,
  baselineScores: ChapterScore[],
  experience: string
): PlanWeek[] {
  const now = new Date();
  const exam = new Date(examDate);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = Math.max(1, Math.floor((exam.getTime() - now.getTime()) / msPerWeek));

  // Identify weak chapters (ones they got wrong on baseline)
  const weakChapters = new Set(
    baselineScores.filter((s) => !s.correct).map((s) => s.chapter)
  );

  // Sort chapters: weak ones first, then by chapter number
  const sortedChapters = [...ALL_CHAPTERS].sort((a, b) => {
    const aWeak = weakChapters.has(a) ? 0 : 1;
    const bWeak = weakChapters.has(b) ? 0 : 1;
    if (aWeak !== bWeak) return aWeak - bWeak;
    return a - b;
  });

  // Reserve last 1-2 weeks for review
  const reviewWeeks = totalWeeks >= 6 ? 2 : totalWeeks >= 3 ? 1 : 0;
  const studyWeeks = totalWeeks - reviewWeeks;

  if (studyWeeks <= 0) {
    // Very little time — cram everything
    return [
      {
        week: 1,
        chapters: sortedChapters.slice(0, 10),
        focus_type: "Intensive review — " + getTopLearningMethod(learningStyle),
        hours: hoursPerWeek,
      },
      {
        week: 2,
        chapters: sortedChapters.slice(10),
        focus_type: "Intensive review + practice exam",
        hours: hoursPerWeek,
      },
    ];
  }

  // Distribute chapters across study weeks
  const chaptersPerWeek = Math.ceil(sortedChapters.length / studyWeeks);
  const plan: PlanWeek[] = [];

  for (let w = 0; w < studyWeeks; w++) {
    const weekChapters = sortedChapters.slice(
      w * chaptersPerWeek,
      (w + 1) * chaptersPerWeek
    );
    if (weekChapters.length === 0) break;

    const hasWeakChapters = weekChapters.some((ch) => weakChapters.has(ch));

    plan.push({
      week: w + 1,
      chapters: weekChapters,
      focus_type: hasWeakChapters
        ? "Priority review — " + getTopLearningMethod(learningStyle)
        : getTopLearningMethod(learningStyle),
      hours: hasWeakChapters
        ? Math.min(hoursPerWeek + 1, 20)
        : hoursPerWeek,
    });
  }

  // Add review weeks
  for (let r = 0; r < reviewWeeks; r++) {
    plan.push({
      week: studyWeeks + r + 1,
      chapters: r === 0 ? [...weakChapters] : ALL_CHAPTERS,
      focus_type:
        r === 0
          ? "Weak area review + mixed quizzes"
          : "Full practice exam + final review",
      hours: Math.min(hoursPerWeek + 2, 20),
    });
  }

  return plan;
}

export { CHAPTER_NAMES };
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/onboarding/plan-generator.ts
git commit -m "feat: add study plan generator algorithm"
```

---

### Task 6: Step 1 — Profile Component

**Files:**
- Create: `src/components/onboarding/step-profile.tsx`

- [ ] **Step 1: Create profile step**

```tsx
// src/components/onboarding/step-profile.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/onboarding/step-profile.tsx
git commit -m "feat: add onboarding step 1 — profile form"
```

---

### Task 7: Step 2 — Learning Style Assessment Component

**Files:**
- Create: `src/components/onboarding/step-assessment.tsx`

- [ ] **Step 1: Create assessment step**

```tsx
// src/components/onboarding/step-assessment.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/onboarding/step-assessment.tsx
git commit -m "feat: add onboarding step 2 — learning style assessment"
```

---

### Task 8: Step 3 — Baseline Quiz Component

**Files:**
- Create: `src/components/onboarding/step-baseline.tsx`

- [ ] **Step 1: Create baseline quiz step**

```tsx
// src/components/onboarding/step-baseline.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/onboarding/step-baseline.tsx
git commit -m "feat: add onboarding step 3 — knowledge baseline quiz"
```

---

### Task 9: Step 4 — Plan Display Component

**Files:**
- Create: `src/components/onboarding/step-plan.tsx`

- [ ] **Step 1: Create plan display step**

```tsx
// src/components/onboarding/step-plan.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/onboarding/step-plan.tsx
git commit -m "feat: add onboarding step 4 — plan display"
```

---

### Task 10: Onboarding Page — Wire It All Together

**Files:**
- Modify: `src/app/onboarding/page.tsx`

- [ ] **Step 1: Replace the placeholder with the full onboarding flow**

```tsx
// src/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProgressBar from "@/components/onboarding/progress-bar";
import StepProfile from "@/components/onboarding/step-profile";
import StepAssessment from "@/components/onboarding/step-assessment";
import StepBaseline from "@/components/onboarding/step-baseline";
import StepPlan from "@/components/onboarding/step-plan";
import { assessmentQuestions } from "@/lib/onboarding/assessment-questions";
import { baselineQuestions } from "@/lib/onboarding/baseline-questions";
import { scoreLearningStyle, scoreBaseline } from "@/lib/onboarding/scoring";
import type { LearningStyle } from "@/lib/onboarding/scoring";
import { generateStudyPlan } from "@/lib/onboarding/plan-generator";

type PlanWeek = {
  week: number;
  chapters: number[];
  focus_type: string;
  hours: number;
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Collected data
  const [profile, setProfile] = useState<{
    examDate: string;
    hoursPerWeek: number;
    experience: string;
  } | null>(null);
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);
  const [plan, setPlan] = useState<PlanWeek[]>([]);

  function handleProfileComplete(data: {
    examDate: string;
    hoursPerWeek: number;
    experience: string;
  }) {
    setProfile(data);
    setStep(1);
  }

  function handleAssessmentComplete(answers: Record<number, string>) {
    const style = scoreLearningStyle(assessmentQuestions, answers);
    setLearningStyle(style);
    setStep(2);
  }

  function handleBaselineComplete(answers: Record<number, number>) {
    if (!profile || !learningStyle) return;

    const scores = scoreBaseline(baselineQuestions, answers);
    const generatedPlan = generateStudyPlan(
      profile.examDate,
      profile.hoursPerWeek,
      learningStyle,
      scores,
      profile.experience
    );
    setPlan(generatedPlan);
    setStep(3);
  }

  async function handlePlanComplete() {
    if (!profile || !learningStyle) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Update profile
    await supabase
      .from("profiles")
      .update({
        exam_date: profile.examDate,
        hours_per_week: profile.hoursPerWeek,
        prior_experience: profile.experience,
        learning_style: learningStyle,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    // Save study plan
    await supabase.from("study_plans").insert({
      user_id: user.id,
      plan: plan,
      is_active: true,
    });

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <ProgressBar currentStep={step} />

      {step === 0 && <StepProfile onComplete={handleProfileComplete} />}
      {step === 1 && <StepAssessment onComplete={handleAssessmentComplete} />}
      {step === 2 && <StepBaseline onComplete={handleBaselineComplete} />}
      {step === 3 && learningStyle && (
        <div>
          <StepPlan
            plan={plan}
            learningStyle={learningStyle}
            onComplete={handlePlanComplete}
          />
          {saving && (
            <p className="text-center text-gray-400 mt-4">
              Saving your plan...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Re-enable onboarding redirect in dashboard**

In `src/app/dashboard/page.tsx`, uncomment the onboarding redirect.

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding/page.tsx src/app/dashboard/page.tsx
git commit -m "feat: wire up complete onboarding flow with all 4 steps"
```
