"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  domainLabels,
  chapterDomains,
  colors,
} from "@/lib/design-system";
import type { Question } from "@/lib/types/database";

// ─── Constants ────────────────────────────────────────────────────────────────

const FULL_EXAM_COUNT = 120;
const FULL_EXAM_TIME_SECONDS = 2 * 60 * 60; // 2 hours
const DRILL_QUESTION_COUNT = 15;
const PASSING_SCORE = 70;

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

// Build a reverse map: domain key -> chapter numbers
const domainChapters: Record<string, number[]> = {};
for (const [ch, domain] of Object.entries(chapterDomains)) {
  if (!domainChapters[domain]) domainChapters[domain] = [];
  domainChapters[domain].push(Number(ch));
}

const LETTER_BADGES = ["A", "B", "C", "D"];
const LETTER_COLORS = [
  "bg-blue-600/20 text-blue-400 border-blue-500/30",
  "bg-purple-600/20 text-purple-400 border-purple-500/30",
  "bg-amber-600/20 text-amber-400 border-amber-500/30",
  "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ExamAnswer = {
  question_id: string;
  selected: number | null;
  correct: number;
};

type ExamPhase =
  | "landing"
  | "domain-select"
  | "active"
  | "review"
  | "results"
  | "past-exams";

type ExamType = "full" | "drill";

type PastExam = {
  id: string;
  quiz_type: string;
  score: number;
  total_questions: number;
  correct_count: number;
  completed_at: string;
  chapter: number | null;
  answers: {
    question_id: string;
    selected: number;
    correct: number;
    time_spent_seconds: number;
  }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Circular Score Display ───────────────────────────────────────────────────

function CircularScore({
  score,
  size = 180,
  strokeWidth = 14,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const passed = score >= PASSING_SCORE;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={`stroke-current ${passed ? "text-green-900/40" : "text-red-900/40"}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`stroke-current ${passed ? "text-green-400" : "text-red-400"} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${passed ? "text-green-400" : "text-red-400"}`}>
          {score}%
        </span>
        <span className="text-sm text-gray-500 mt-1">
          {passed ? "PASSED" : "NOT YET"}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExamModePage() {
  // Phase & config
  const [phase, setPhase] = useState<ExamPhase>("landing");
  const [examType, setExamType] = useState<ExamType>("full");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Exam state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(FULL_EXAM_TIME_SECONDS);
  const [timeTaken, setTimeTaken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  // AI Debrief
  const [debriefText, setDebriefText] = useState("");
  const [debriefLoading, setDebriefLoading] = useState(false);
  const debriefRef = useRef<HTMLDivElement>(null);

  // Past exams
  const [pastExams, setPastExams] = useState<PastExam[]>([]);
  const [pastLoading, setPastLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const supabase = createClient();

  // ─── Timer Logic ────────────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeTaken(elapsed);
      if (examType === "full") {
        const remaining = FULL_EXAM_TIME_SECONDS - elapsed;
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          // auto-submit on time expiry
          stopTimer();
        }
      }
    }, 1000);
  }, [examType, stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (examType === "full" && timeRemaining <= 0 && phase === "active") {
      setPhase("review");
    }
  }, [timeRemaining, examType, phase]);

  // ─── Load Questions ─────────────────────────────────────────────────────────

  const startExam = useCallback(
    async (type: ExamType, domain?: string) => {
      setLoading(true);
      setExamType(type);
      setSelectedDomain(domain || null);
      setCurrentIndex(0);
      setFlagged(new Set());
      setDebriefText("");
      setTimeTaken(0);
      setTimeRemaining(FULL_EXAM_TIME_SECONDS);

      let query = supabase.from("questions").select("*");

      if (type === "drill" && domain) {
        const chapters = domainChapters[domain] || [];
        if (chapters.length > 0) {
          query = query.in("chapter", chapters);
        }
      }

      const { data } = await query;
      let qs = shuffle((data || []) as Question[]);

      const targetCount = type === "full" ? FULL_EXAM_COUNT : DRILL_QUESTION_COUNT;
      qs = qs.slice(0, targetCount);
      setQuestionCount(qs.length);

      const initialAnswers: ExamAnswer[] = qs.map((q) => ({
        question_id: q.id,
        selected: null,
        correct: q.correct_answer,
      }));

      setQuestions(qs);
      setAnswers(initialAnswers);
      setLoading(false);
      setPhase("active");
      startTimer();
    },
    [supabase, startTimer]
  );

  // ─── Answer handling ────────────────────────────────────────────────────────

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = { ...next[currentIndex], selected: optionIndex };
        return next;
      });
    },
    [currentIndex]
  );

  const toggleFlag = useCallback(() => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  }, [currentIndex]);

  const goToQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  // ─── Submit Exam ────────────────────────────────────────────────────────────

  const submitExam = useCallback(async () => {
    stopTimer();
    setPhase("results");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const correctCount = answers.filter((a) => a.selected === a.correct).length;
    const answered = answers.filter((a) => a.selected !== null).length;
    const score = answered > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    await supabase.from("quiz_results").insert({
      user_id: user.id,
      quiz_type: examType === "full" ? "exam_simulation" : "mixed",
      chapter: null,
      score,
      total_questions: questions.length,
      correct_count: correctCount,
      answers: answers.map((a) => ({
        question_id: a.question_id,
        selected: a.selected ?? -1,
        correct: a.correct,
        time_spent_seconds: 0,
      })),
      completed_at: new Date().toISOString(),
    });
  }, [answers, questions, examType, supabase, stopTimer]);

  // ─── Score Calculations ─────────────────────────────────────────────────────

  const scoreData = useMemo(() => {
    const correct = answers.filter((a) => a.selected !== null && a.selected === a.correct).length;
    const total = questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= PASSING_SCORE;
    const unanswered = answers.filter((a) => a.selected === null).length;

    // Per-chapter breakdown
    const chapterStats: Record<number, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      if (!chapterStats[q.chapter]) chapterStats[q.chapter] = { correct: 0, total: 0 };
      chapterStats[q.chapter].total++;
      if (answers[i]?.selected === q.correct_answer) chapterStats[q.chapter].correct++;
    });

    // Per-domain breakdown
    const domainStats: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      const domain = chapterDomains[q.chapter] || "other";
      if (!domainStats[domain]) domainStats[domain] = { correct: 0, total: 0 };
      domainStats[domain].total++;
      if (answers[i]?.selected === q.correct_answer) domainStats[domain].correct++;
    });

    // Wrong questions
    const wrongQuestions = questions
      .map((q, i) => ({ question: q, answer: answers[i], index: i }))
      .filter((item) => item.answer.selected !== null && item.answer.selected !== item.answer.correct);

    return { correct, total, score, passed, unanswered, chapterStats, domainStats, wrongQuestions };
  }, [answers, questions]);

  // ─── AI Debrief ─────────────────────────────────────────────────────────────

  const runDebrief = useCallback(async () => {
    if (scoreData.wrongQuestions.length === 0) {
      setDebriefText("Perfect score -- nothing to debrief! Outstanding work.");
      return;
    }

    setDebriefLoading(true);
    setDebriefText("");

    const wrongDetails = scoreData.wrongQuestions.map((item) => {
      const q = item.question;
      const userAnswer = item.answer.selected !== null ? q.options[item.answer.selected] : "(unanswered)";
      return `- Chapter ${q.chapter} (${NASM_CHAPTER_NAMES[q.chapter] || "Unknown"}): "${q.question}" | Student chose: "${userAnswer}" | Correct: "${q.options[q.correct_answer]}" | Explanation: ${q.explanation}`;
    });

    const weakDomains = Object.entries(scoreData.domainStats)
      .map(([domain, stats]) => ({
        domain,
        label: domainLabels[domain] || domain,
        pct: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      }))
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3);

    const debriefMessage = `I just completed a ${examType === "full" ? "full 120-question practice exam" : "domain drill quiz"} and scored ${scoreData.score}% (${scoreData.correct}/${scoreData.total}). ${scoreData.passed ? "I PASSED (70% threshold)." : "I did NOT pass (needed 70%)."}

My weakest domains: ${weakDomains.map((d) => `${d.label} (${d.pct}%)`).join(", ")}

Here are my WRONG ANSWERS:
${wrongDetails.join("\n")}

Please give me a personalized debrief:
1. Group the wrong answers by concept/chapter and explain what I need to understand
2. Identify patterns in my mistakes (e.g., "You consistently confuse eccentric and concentric contractions")
3. Explain the reasoning gap for the most critical mistakes
4. Give exactly 3 specific, actionable study tasks I should do TODAY
5. Reference specific chapters I should revisit (use "Chapter X: [name]" format)

Use markdown with headers (##), bold, and bullet points. Be direct, encouraging, and specific.`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: debriefMessage,
          history: [],
        }),
      });

      if (!response.ok) {
        setDebriefText("Could not generate debrief. Please try again later.");
        setDebriefLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setDebriefText("Could not generate debrief.");
        setDebriefLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const parsed = JSON.parse(payload);
              if (parsed.text) {
                accumulated += parsed.text;
                setDebriefText(accumulated);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      setDebriefLoading(false);
      setTimeout(() => {
        debriefRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch {
      setDebriefText("Could not generate debrief. Check your connection and try again.");
      setDebriefLoading(false);
    }
  }, [scoreData, examType]);

  // ─── Past Exams ─────────────────────────────────────────────────────────────

  const loadPastExams = useCallback(async () => {
    setPastLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPastLoading(false);
      return;
    }

    const { data } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .in("quiz_type", ["exam_simulation", "mixed"])
      .order("completed_at", { ascending: false })
      .limit(20);

    setPastExams((data as PastExam[]) || []);
    setPastLoading(false);
    setPhase("past-exams");
  }, [supabase]);

  // ─── Keyboard Shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "active") return;
    function handleKey(e: KeyboardEvent) {
      const q = questions[currentIndex];
      if (!q) return;
      if (e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key) - 1;
        if (idx < q.options.length) selectAnswer(idx);
      }
      if (e.key === "ArrowRight" || e.key === "n") nextQuestion();
      if (e.key === "ArrowLeft" || e.key === "p") prevQuestion();
      if (e.key === "f") toggleFlag();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, currentIndex, questions, selectAnswer, nextQuestion, prevQuestion, toggleFlag]);

  // ─── RENDER: Loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-lg">Preparing your exam...</p>
        </div>
      </div>
    );
  }

  // ─── RENDER: Landing ────────────────────────────────────────────────────────

  if (phase === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900 p-4 sm:p-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 text-sm mb-8 inline-flex items-center gap-1 py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Exam Center</h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Simulate the real NASM CPT exam, drill specific domains, or review past attempts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Full Exam Card */}
            <button
              onClick={() => startExam("full")}
              className="group text-left rounded-2xl border border-gray-800 bg-gray-900/80 hover:border-amber-600/50 hover:bg-gray-900 transition-all p-6 sm:p-8"
            >
              <div className="w-14 h-14 rounded-xl bg-amber-500/15 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                Full Exam
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                120 questions, 2-hour timer. Simulates the real NASM CPT exam experience with all chapters represented.
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="bg-gray-800 px-2.5 py-1 rounded-lg">120 Q</span>
                <span className="bg-gray-800 px-2.5 py-1 rounded-lg">2 hrs</span>
                <span className="bg-gray-800 px-2.5 py-1 rounded-lg">70% to pass</span>
              </div>
            </button>

            {/* Domain Drill Card */}
            <button
              onClick={() => setPhase("domain-select")}
              className="group text-left rounded-2xl border border-gray-800 bg-gray-900/80 hover:border-blue-600/50 hover:bg-gray-900 transition-all p-6 sm:p-8"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-500/15 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                Domain Drill
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Pick a domain and get 15 targeted questions. Perfect for focusing on specific weak areas.
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="bg-gray-800 px-2.5 py-1 rounded-lg">15 Q</span>
                <span className="bg-gray-800 px-2.5 py-1 rounded-lg">8 domains</span>
                <span className="bg-gray-800 px-2.5 py-1 rounded-lg">Focused</span>
              </div>
            </button>

            {/* Past Exams Card */}
            <button
              onClick={loadPastExams}
              className="group text-left rounded-2xl border border-gray-800 bg-gray-900/80 hover:border-purple-600/50 hover:bg-gray-900 transition-all p-6 sm:p-8"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-500/15 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                Review Past Exams
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Look back at your previous exam attempts, scores, and track your improvement over time.
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="bg-gray-800 px-2.5 py-1 rounded-lg">History</span>
                <span className="bg-gray-800 px-2.5 py-1 rounded-lg">Trends</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Domain Select ──────────────────────────────────────────────────

  if (phase === "domain-select") {
    const domainKeys = Object.keys(domainLabels);
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900 p-4 sm:p-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setPhase("landing")}
            className="text-blue-400 hover:text-blue-300 text-sm mb-8 inline-flex items-center gap-1 py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Choose a Domain</h1>
            <p className="text-gray-400">Pick a domain to drill with {DRILL_QUESTION_COUNT} targeted questions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {domainKeys.map((key) => {
              const domainColor = colors.domains[key as keyof typeof colors.domains];
              const chapters = domainChapters[key] || [];
              return (
                <button
                  key={key}
                  onClick={() => startExam("drill", key)}
                  className="group text-left rounded-2xl border border-gray-800 bg-gray-900/80 hover:bg-gray-900 transition-all p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${domainColor?.bg || "bg-gray-500"}`} />
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {domainLabels[key]}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Chapters: {chapters.sort((a, b) => a - b).join(", ")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Past Exams ─────────────────────────────────────────────────────

  if (phase === "past-exams") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900 p-4 sm:p-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setPhase("landing")}
            className="text-blue-400 hover:text-blue-300 text-sm mb-8 inline-flex items-center gap-1 py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1 className="text-2xl font-bold text-white mb-6">Past Exams</h1>

          {pastLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pastExams.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/80 rounded-2xl border border-gray-800">
              <p className="text-gray-400 text-lg mb-2">No past exams yet</p>
              <p className="text-gray-500 text-sm">Complete a full exam or domain drill to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastExams.map((exam) => {
                const passed = exam.score >= PASSING_SCORE;
                return (
                  <div
                    key={exam.id}
                    className={`rounded-2xl border p-5 ${
                      passed
                        ? "border-green-800/40 bg-green-900/10"
                        : "border-red-800/40 bg-red-900/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-bold ${passed ? "text-green-400" : "text-red-400"}`}>
                            {exam.score}%
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            passed
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {passed ? "PASS" : "FAIL"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {exam.quiz_type === "exam_simulation" ? "Full Exam" : "Drill"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs">
                          {exam.correct_count}/{exam.total_questions} correct
                          {exam.completed_at &&
                            ` -- ${new Date(exam.completed_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}`}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        passed ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                      }`}>
                        {exam.score}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── RENDER: Active Exam ────────────────────────────────────────────────────

  if (phase === "active" && questions.length > 0) {
    const question = questions[currentIndex];
    const answer = answers[currentIndex];
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;
    const answeredCount = answers.filter((a) => a.selected !== null).length;

    // Timer color
    let timerColorClass = "text-gray-300";
    let timerBgClass = "bg-gray-800/60 border-gray-700/50";
    if (examType === "full") {
      if (timeRemaining <= 600) {
        timerColorClass = "text-red-400";
        timerBgClass = "bg-red-900/30 border-red-500/40";
      } else if (timeRemaining <= 1800) {
        timerColorClass = "text-amber-400";
        timerBgClass = "bg-amber-900/20 border-amber-500/30";
      }
    }

    return (
      <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to quit? Your progress will be lost.")) {
                    stopTimer();
                    setPhase("landing");
                  }
                }}
                className="text-gray-500 hover:text-gray-300 p-2 -ml-2 rounded-lg hover:bg-gray-800/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="text-sm text-gray-500">
                {examType === "full" ? "Full Exam" : `${domainLabels[selectedDomain || ""] || "Domain"} Drill`}
                {questionCount < (examType === "full" ? FULL_EXAM_COUNT : DRILL_QUESTION_COUNT) && (
                  <span className="text-gray-600 ml-1">({questionCount} available)</span>
                )}
              </span>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timerBgClass}`}>
              <svg className={`w-4 h-4 ${timerColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-mono font-bold text-lg ${timerColorClass}`}>
                {examType === "full" ? formatTime(Math.max(0, timeRemaining)) : formatTime(timeTaken)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">
                Question {currentIndex + 1} <span className="text-gray-500">of {questions.length}</span>
              </span>
              <span className="text-xs text-gray-500">
                {answeredCount} answered | Ch. {question.chapter}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
            <p className="text-lg text-white leading-relaxed">{question.question}</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-5">
            {question.options.map((opt, i) => {
              const isSelected = answer?.selected === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={`w-full text-left px-4 py-4 rounded-xl border transition-all min-h-[56px] flex items-center gap-3 ${
                    isSelected
                      ? "border-blue-500 bg-blue-900/30 ring-1 ring-blue-500/40"
                      : "border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-900/80"
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                      isSelected
                        ? "bg-blue-600/30 text-blue-300 border-blue-500/50"
                        : LETTER_COLORS[i] || LETTER_COLORS[0]
                    }`}
                  >
                    {LETTER_BADGES[i]}
                  </span>
                  <span className={isSelected ? "text-blue-200" : "text-gray-200"}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation & Flag */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors min-h-[48px]"
            >
              Prev
            </button>

            <button
              onClick={toggleFlag}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all min-h-[48px] flex items-center gap-2 ${
                flagged.has(currentIndex)
                  ? "border-amber-500/50 bg-amber-900/30 text-amber-400"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:text-amber-400 hover:border-amber-600/30"
              }`}
            >
              <svg className="w-4 h-4" fill={flagged.has(currentIndex) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              {flagged.has(currentIndex) ? "Flagged" : "Flag"}
            </button>

            <div className="flex-1" />

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors min-h-[48px]"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => {
                  stopTimer();
                  setPhase("review");
                }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-medium transition-all min-h-[48px]"
              >
                Review & Submit
              </button>
            )}
          </div>

          {/* Question Grid (quick nav) */}
          <div className="mt-8 bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Question Navigator</p>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((_, i) => {
                const isAnswered = answers[i]?.selected !== null;
                const isCurrent = i === currentIndex;
                const isFlagged = flagged.has(i);

                let bg = "bg-gray-800 text-gray-500";
                if (isCurrent) bg = "bg-blue-600 text-white ring-2 ring-blue-400/50";
                else if (isFlagged && isAnswered) bg = "bg-amber-600/40 text-amber-300";
                else if (isFlagged) bg = "bg-amber-800/30 text-amber-400 border border-amber-600/40";
                else if (isAnswered) bg = "bg-gray-700 text-gray-300";

                return (
                  <button
                    key={i}
                    onClick={() => goToQuestion(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${bg}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gray-700 inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-800/30 border border-amber-600/40 inline-block" /> Flagged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gray-800 inline-block" /> Unanswered
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Review Before Submit ───────────────────────────────────────────

  if (phase === "review") {
    const answeredCount = answers.filter((a) => a.selected !== null).length;
    const unansweredCount = questions.length - answeredCount;
    const flaggedCount = flagged.size;

    return (
      <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2 mt-4">Review Your Answers</h1>
          <p className="text-gray-400 mb-6">
            Review before submitting. You can go back to change any answer.
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{answeredCount}</p>
              <p className="text-gray-500 text-xs mt-1">Answered</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{unansweredCount}</p>
              <p className="text-gray-500 text-xs mt-1">Unanswered</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{flaggedCount}</p>
              <p className="text-gray-500 text-xs mt-1">Flagged</p>
            </div>
          </div>

          {/* Flagged Questions */}
          {flaggedCount > 0 && (
            <div className="bg-amber-900/10 border border-amber-800/30 rounded-2xl p-4 mb-6">
              <p className="text-amber-400 text-sm font-medium mb-3">Flagged for Review</p>
              <div className="space-y-2">
                {Array.from(flagged)
                  .sort((a, b) => a - b)
                  .map((i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentIndex(i);
                        setPhase("active");
                        startTimer();
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-amber-600/40 transition-colors flex items-center gap-3 text-sm"
                    >
                      <span className="text-amber-400 font-bold w-8">Q{i + 1}</span>
                      <span className="text-gray-300 truncate flex-1">{questions[i].question}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        answers[i]?.selected !== null
                          ? "bg-green-500/15 text-green-400"
                          : "bg-red-500/15 text-red-400"
                      }`}>
                        {answers[i]?.selected !== null ? "Answered" : "Blank"}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Unanswered Questions */}
          {unansweredCount > 0 && (
            <div className="bg-red-900/10 border border-red-800/30 rounded-2xl p-4 mb-6">
              <p className="text-red-400 text-sm font-medium mb-3">Unanswered Questions</p>
              <div className="flex flex-wrap gap-2">
                {answers.map((a, i) =>
                  a.selected === null ? (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentIndex(i);
                        setPhase("active");
                        startTimer();
                      }}
                      className="w-10 h-10 rounded-lg bg-gray-900/60 border border-red-800/30 hover:border-red-500/50 text-red-400 text-sm font-medium transition-colors"
                    >
                      {i + 1}
                    </button>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => {
                setPhase("active");
                startTimer();
              }}
              className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white text-center font-semibold rounded-xl transition-colors min-h-[56px]"
            >
              Go Back
            </button>
            <button
              onClick={submitExam}
              className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-center font-semibold rounded-xl transition-all min-h-[56px] shadow-lg shadow-green-900/20"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Results ────────────────────────────────────────────────────────

  if (phase === "results") {
    const { score, correct, total, passed, unanswered, chapterStats, domainStats, wrongQuestions } = scoreData;

    // Sort domains by score ascending (worst first)
    const sortedDomains = Object.entries(domainStats)
      .map(([key, stats]) => ({
        key,
        label: domainLabels[key] || key,
        pct: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        correct: stats.correct,
        total: stats.total,
      }))
      .sort((a, b) => a.pct - b.pct);

    // Sort chapters by score ascending
    const sortedChapters = Object.entries(chapterStats)
      .map(([ch, stats]) => ({
        chapter: Number(ch),
        pct: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        correct: stats.correct,
        total: stats.total,
      }))
      .sort((a, b) => a.pct - b.pct);

    return (
      <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Pass/Fail Banner */}
          <div
            className={`rounded-2xl p-6 sm:p-8 mb-6 text-center border ${
              passed
                ? "bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-700/40"
                : "bg-gradient-to-br from-red-900/30 to-orange-900/20 border-red-700/40"
            }`}
          >
            <p className={`text-sm uppercase tracking-widest font-semibold mb-4 ${passed ? "text-green-400" : "text-red-400"}`}>
              {passed ? "Congratulations -- You Passed!" : "Keep Studying -- You Can Do This"}
            </p>

            <CircularScore score={score} />

            <div className="flex justify-center gap-6 mt-6 text-sm">
              <div className="text-center">
                <p className="text-white font-bold text-lg">{correct}/{total}</p>
                <p className="text-gray-500 text-xs">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">{formatTime(timeTaken)}</p>
                <p className="text-gray-500 text-xs">Time Taken</p>
              </div>
              {unanswered > 0 && (
                <div className="text-center">
                  <p className="text-amber-400 font-bold text-lg">{unanswered}</p>
                  <p className="text-gray-500 text-xs">Unanswered</p>
                </div>
              )}
            </div>
          </div>

          {/* Domain Breakdown */}
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Domain Breakdown</h2>
            <div className="space-y-3">
              {sortedDomains.map((d) => {
                const domainColor = colors.domains[d.key as keyof typeof colors.domains];
                return (
                  <div key={d.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${domainColor?.bg || "bg-gray-500"}`} />
                        <span className="text-sm text-gray-300">{d.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${d.pct >= PASSING_SCORE ? "text-green-400" : d.pct >= 50 ? "text-amber-400" : "text-red-400"}`}>
                        {d.pct}% <span className="text-gray-600 font-normal text-xs">({d.correct}/{d.total})</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          d.pct >= PASSING_SCORE ? "bg-green-500" : d.pct >= 50 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chapter Breakdown */}
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Chapter Breakdown</h2>
            <div className="space-y-2">
              {sortedChapters.map((ch) => (
                <div key={ch.chapter} className="flex items-center gap-3">
                  <span className="w-8 text-right text-xs text-gray-500 font-mono shrink-0">{ch.chapter}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 truncate">
                        {NASM_CHAPTER_NAMES[ch.chapter] || `Chapter ${ch.chapter}`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ch.pct >= PASSING_SCORE ? "bg-green-500" : ch.pct >= 50 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.max(ch.pct, 2)}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-bold w-12 text-right shrink-0 ${
                    ch.pct >= PASSING_SCORE ? "text-green-400" : ch.pct >= 50 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {ch.correct}/{ch.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Debrief Section */}
          <div ref={debriefRef} className="bg-gradient-to-br from-gray-900 via-indigo-950/10 to-purple-950/10 border border-indigo-800/30 rounded-2xl p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                AI Debrief
              </h2>
              {!debriefText && !debriefLoading && (
                <button
                  onClick={runDebrief}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Generate Debrief
                </button>
              )}
              {debriefLoading && (
                <div className="flex items-center gap-2 text-indigo-400 text-sm">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </div>
              )}
            </div>

            {!debriefText && !debriefLoading && (
              <p className="text-gray-500 text-sm">
                Get a personalized analysis of your mistakes, identify patterns, and receive specific study actions.
              </p>
            )}

            {debriefText && (
              <div className="prose prose-invert prose-sm max-w-none">
                <div
                  className="text-gray-300 leading-relaxed whitespace-pre-wrap [&_h2]:text-white [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-gray-200 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                  dangerouslySetInnerHTML={{
                    __html: debriefText
                      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                  }}
                />
              </div>
            )}
          </div>

          {/* Wrong Answers Detail */}
          {wrongQuestions.length > 0 && (
            <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Missed Questions ({wrongQuestions.length})
              </h2>
              <div className="space-y-3">
                {wrongQuestions.map((item) => {
                  const q = item.question;
                  const a = item.answer;
                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-red-800/40 bg-red-900/10">
                      <p className="text-white text-sm mb-2 leading-relaxed">
                        Q{item.index + 1}. {q.question}
                      </p>
                      <p className="text-sm text-red-400/80 mb-1">
                        Your answer: {a.selected !== null ? q.options[a.selected] : "(unanswered)"}
                      </p>
                      <p className="text-sm text-green-400/80 mb-2">
                        Correct: {q.options[q.correct_answer]}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed mb-2">{q.explanation}</p>
                      <Link
                        href={`/chapters/${q.chapter}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 transition-colors inline-flex items-center gap-1"
                      >
                        Study Ch. {q.chapter}: {NASM_CHAPTER_NAMES[q.chapter] || ""}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-4">
            <button
              onClick={() => setPhase("landing")}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-center font-semibold rounded-xl transition-all min-h-[56px] shadow-lg shadow-blue-900/20"
            >
              New Exam
            </button>
            <Link
              href="/dashboard"
              className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white text-center font-semibold rounded-xl transition-colors min-h-[56px] flex items-center justify-center"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
