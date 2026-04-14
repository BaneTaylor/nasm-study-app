"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CHAPTER_NAMES } from "@/lib/onboarding/plan-generator";
import Link from "next/link";

type PlanWeek = {
  week: number;
  chapters: number[];
  focus_type: string;
  hours: number;
};

type StudyPlan = {
  id: string;
  user_id: string;
  plan: PlanWeek[];
  generated_at: string;
  is_active: boolean;
};

type StudySession = {
  id: string;
  user_id: string;
  scheduled_date: string;
  chapter: number;
  activity_type: "flashcards" | "quiz" | "summary" | "practice_exam";
  duration_minutes: number;
  completed: boolean;
  completed_at: string | null;
};

type Profile = {
  exam_date: string | null;
  hours_per_week: number | null;
};

const ACTIVITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: "cards" | "quiz" | "book" | "target" }
> = {
  flashcards: {
    label: "Flashcards",
    color: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: "cards",
  },
  quiz: {
    label: "Quiz",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: "quiz",
  },
  summary: {
    label: "Summary",
    color: "text-purple-300",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    icon: "book",
  },
  practice_exam: {
    label: "Practice Exam",
    color: "text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: "target",
  },
};

function ActivityIcon({ type, className = "" }: { type: string; className?: string }) {
  const config = ACTIVITY_CONFIG[type];
  const iconType = config?.icon || "book";

  switch (iconType) {
    case "cards":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.011.672-1.866 1.595-2.147m14.81 0H4.595" />
        </svg>
      );
    case "quiz":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      );
    case "target":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    case "book":
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
  }
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateSessionsForWeek(
  weekPlan: PlanWeek,
  monday: Date,
  userId: string
): Omit<StudySession, "id">[] {
  const sessions: Omit<StudySession, "id">[] = [];
  const chapters = weekPlan.chapters;
  const totalMinutes = weekPlan.hours * 60;
  const activityTypes: StudySession["activity_type"][] = [
    "summary",
    "flashcards",
    "quiz",
  ];

  const daysToUse = Math.min(6, Math.max(3, chapters.length));
  const minutesPerSession = Math.round(
    totalMinutes / (chapters.length * activityTypes.length)
  );
  const clampedMinutes = Math.max(15, Math.min(60, minutesPerSession));

  let dayIndex = 0;

  for (const chapter of chapters) {
    for (const activity of activityTypes) {
      const sessionDate = new Date(monday);
      sessionDate.setDate(monday.getDate() + (dayIndex % daysToUse));

      sessions.push({
        user_id: userId,
        scheduled_date: formatDate(sessionDate),
        chapter,
        activity_type: activity,
        duration_minutes: clampedMinutes,
        completed: false,
        completed_at: null,
      });

      dayIndex++;
    }
  }

  if (weekPlan.focus_type.toLowerCase().includes("practice exam")) {
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    sessions.push({
      user_id: userId,
      scheduled_date: formatDate(saturday),
      chapter: chapters[0] || 1,
      activity_type: "practice_exam",
      duration_minutes: 90,
      completed: false,
      completed_at: null,
    });
  }

  return sessions;
}

function getMotivationalText(pct: number): string {
  if (pct === 0) return "Ready to start? You got this!";
  if (pct < 25) return "Great start! Keep the momentum going.";
  if (pct < 50) return "Nice progress! You are building strong habits.";
  if (pct < 75) return "Keep it up! More than halfway there.";
  if (pct < 100) return "Almost there! Finish strong this week.";
  return "Incredible week! You crushed every session.";
}

/* --- Skeleton Loader --- */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-800/60 rounded-xl animate-pulse ${className}`} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <SkeletonBlock className="w-48 h-7 mb-2" />
            <SkeletonBlock className="w-32 h-4" />
          </div>
          <SkeletonBlock className="w-28 h-8 rounded-lg" />
        </div>
        {/* Progress bar */}
        <SkeletonBlock className="h-28 mb-6" />
        {/* Plan summary */}
        <SkeletonBlock className="h-20 mb-6" />
        {/* Calendar grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-40" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentWeekPlan, setCurrentWeekPlan] = useState<PlanWeek | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [justToggled, setJustToggled] = useState<string | null>(null);

  const supabase = createClient();
  const now = new Date();
  const monday = getMonday(now);
  const weekDays = getWeekDays(monday);

  const loadData = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, planRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("exam_date, hours_per_week")
        .eq("id", user.id)
        .single(),
      supabase
        .from("study_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single(),
    ]);

    const userProfile = profileRes.data as Profile | null;
    const activePlan = planRes.data as StudyPlan | null;

    setProfile(userProfile);
    setStudyPlan(activePlan);

    let weekPlan: PlanWeek | null = null;
    if (activePlan) {
      const planStart = new Date(activePlan.generated_at);
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeksSinceStart = Math.floor(
        (now.getTime() - planStart.getTime()) / msPerWeek
      );
      const currentWeekNumber = weeksSinceStart + 1;

      weekPlan =
        activePlan.plan.find((w) => w.week === currentWeekNumber) ||
        activePlan.plan[activePlan.plan.length - 1] ||
        null;
      setCurrentWeekPlan(weekPlan);
    }

    const mondayStr = formatDate(monday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const sundayStr = formatDate(sunday);

    const sessionsRes = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_date", mondayStr)
      .lte("scheduled_date", sundayStr)
      .order("scheduled_date", { ascending: true });

    let weekSessions = (sessionsRes.data || []) as StudySession[];

    if (weekSessions.length === 0 && weekPlan) {
      const newSessions = generateSessionsForWeek(weekPlan, monday, user.id);
      const { data: inserted } = await supabase
        .from("study_sessions")
        .insert(newSessions)
        .select();

      weekSessions = (inserted || []) as StudySession[];
    }

    setSessions(weekSessions);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function toggleSession(session: StudySession) {
    setToggling(session.id);
    const newCompleted = !session.completed;

    const updateData: { completed: boolean; completed_at: string | null } = {
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from("study_sessions")
      .update(updateData)
      .eq("id", session.id);

    if (!error) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id
            ? {
                ...s,
                completed: newCompleted,
                completed_at: updateData.completed_at,
              }
            : s
        )
      );
      // Trigger pop animation
      setJustToggled(session.id);
      setTimeout(() => setJustToggled(null), 400);
    }

    setToggling(null);
  }

  // Calculate weekly progress
  const totalMinutesTarget = profile?.hours_per_week
    ? profile.hours_per_week * 60
    : sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const completedMinutes = sessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.duration_minutes, 0);
  const progressPercent =
    totalMinutesTarget > 0
      ? Math.min(100, Math.round((completedMinutes / totalMinutesTarget) * 100))
      : 0;

  // Group sessions by date
  const sessionsByDate: Record<string, StudySession[]> = {};
  for (const s of sessions) {
    if (!sessionsByDate[s.scheduled_date]) {
      sessionsByDate[s.scheduled_date] = [];
    }
    sessionsByDate[s.scheduled_date].push(s);
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  const todayStr = formatDate(now);

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Study Schedule
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Week of{" "}
              {monday.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              &ndash;{" "}
              {weekDays[6].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1 touch-manipulation py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* ===== WEEKLY PROGRESS ===== */}
        <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              Weekly Progress
            </span>
            <span className="text-sm text-gray-400">
              {Math.round((completedMinutes / 60) * 10) / 10}h /{" "}
              {Math.round((totalMinutesTarget / 60) * 10) / 10}h
            </span>
          </div>
          <div className="w-full bg-gray-800/60 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background:
                  progressPercent >= 100
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : progressPercent >= 50
                    ? "linear-gradient(90deg, #3b82f6, #8b5cf6)"
                    : "linear-gradient(90deg, #3b82f6, #60a5fa)",
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-300 font-medium">
              {getMotivationalText(progressPercent)}
            </p>
            <span className="text-xs text-gray-500 font-mono">{progressPercent}%</span>
          </div>
        </div>

        {/* ===== PLAN SUMMARY ===== */}
        {currentWeekPlan && (
          <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-gray-800/50 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <h2 className="text-sm font-semibold text-white">
                Week {currentWeekPlan.week} Plan
              </h2>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              {currentWeekPlan.focus_type}
            </p>
            <div className="flex flex-wrap gap-2">
              {currentWeekPlan.chapters.map((ch) => (
                <span
                  key={ch}
                  className="px-3 py-1.5 bg-gray-800/60 border border-gray-700/40 rounded-lg text-xs text-gray-300 font-medium"
                >
                  Ch {ch}: {CHAPTER_NAMES[ch] || `Chapter ${ch}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== NO PLAN ===== */}
        {!studyPlan && (
          <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl p-8 text-center mb-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4 max-w-sm mx-auto">
              No active study plan found. Complete onboarding to generate your
              personalized plan.
            </p>
            <Link
              href="/onboarding"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all text-sm font-medium touch-manipulation active:scale-95"
            >
              Start Onboarding
            </Link>
          </div>
        )}

        {/* ===== WEEKLY CALENDAR ===== */}
        {/* Desktop: 7-column grid, Mobile: stacked cards */}
        <div className="hidden md:grid md:grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const dateStr = formatDate(day);
            const daySessions = sessionsByDate[dateStr] || [];
            const isToday = todayStr === dateStr;
            const isPast = dateStr < todayStr;
            const dayComplete =
              daySessions.length > 0 && daySessions.every((s) => s.completed);

            return (
              <div
                key={dateStr}
                className={`rounded-2xl p-3 min-h-[180px] flex flex-col transition-all ${
                  isToday
                    ? "bg-gradient-to-b from-blue-950/40 to-gray-900/80 border-2 border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    : "bg-gray-900/60 border border-gray-800/40"
                } ${isPast && !isToday ? "opacity-70" : ""}`}
              >
                {/* Day header */}
                <div className="text-center mb-3">
                  <p
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isToday ? "text-blue-400" : "text-gray-500"
                    }`}
                  >
                    {DAY_NAMES[idx]}
                  </p>
                  <p
                    className={`text-lg font-bold mt-0.5 ${
                      isToday ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {day.getDate()}
                  </p>
                  {isToday && (
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mx-auto mt-1" />
                  )}
                  {dayComplete && !isToday && (
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto mt-1" />
                  )}
                </div>

                {/* Sessions */}
                <div className="flex-1 space-y-1.5">
                  {daySessions.map((session) => {
                    const config = ACTIVITY_CONFIG[session.activity_type] || ACTIVITY_CONFIG.summary;
                    return (
                      <button
                        key={session.id}
                        onClick={() => toggleSession(session)}
                        disabled={toggling === session.id}
                        className={`w-full text-left rounded-lg p-2 transition-all touch-manipulation ${
                          session.completed
                            ? "bg-emerald-500/10 border border-emerald-500/20"
                            : `${config.bg} border ${config.border}`
                        } ${
                          toggling === session.id
                            ? "opacity-50"
                            : "hover:brightness-110 active:scale-95"
                        } ${
                          justToggled === session.id ? "animate-bounce-once" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {session.completed ? (
                            <svg
                              className="w-3.5 h-3.5 text-emerald-400 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <ActivityIcon
                              type={session.activity_type}
                              className={`w-3.5 h-3.5 shrink-0 ${config.color}`}
                            />
                          )}
                          <span
                            className={`text-[11px] font-medium truncate ${
                              session.completed
                                ? "text-emerald-300 line-through"
                                : config.color
                            }`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 truncate pl-5">
                          Ch {session.chapter} &middot; {session.duration_minutes}m
                        </p>
                      </button>
                    );
                  })}
                  {daySessions.length === 0 && (
                    <p className="text-[10px] text-gray-700 text-center mt-2">
                      Rest day
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-3">
          {weekDays.map((day, idx) => {
            const dateStr = formatDate(day);
            const daySessions = sessionsByDate[dateStr] || [];
            const isToday = todayStr === dateStr;
            const isPast = dateStr < todayStr;

            return (
              <div
                key={dateStr}
                className={`rounded-2xl p-4 transition-all ${
                  isToday
                    ? "bg-gradient-to-r from-blue-950/40 to-gray-900/80 border-2 border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    : "bg-gray-900/60 border border-gray-800/40"
                } ${isPast && !isToday ? "opacity-70" : ""}`}
              >
                {/* Day header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${
                      isToday
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div>
                    <span
                      className={`text-sm font-semibold ${
                        isToday ? "text-blue-400" : "text-white"
                      }`}
                    >
                      {DAY_NAMES[idx]}
                    </span>
                    {isToday && (
                      <span className="text-xs text-blue-300/80 ml-2 font-medium">
                        Today
                      </span>
                    )}
                    {daySessions.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {daySessions.filter((s) => s.completed).length}/{daySessions.length} complete
                      </p>
                    )}
                  </div>
                </div>

                {/* Sessions for this day */}
                {daySessions.length > 0 ? (
                  <div className="space-y-2">
                    {daySessions.map((session) => {
                      const config =
                        ACTIVITY_CONFIG[session.activity_type] ||
                        ACTIVITY_CONFIG.summary;
                      return (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                            session.completed
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : `${config.bg} border ${config.border}`
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                session.completed
                                  ? "bg-emerald-500/20"
                                  : config.bg
                              }`}
                            >
                              {session.completed ? (
                                <svg
                                  className="w-5 h-5 text-emerald-400"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <ActivityIcon
                                  type={session.activity_type}
                                  className={`w-5 h-5 ${config.color}`}
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${
                                  session.completed
                                    ? "text-emerald-300 line-through"
                                    : "text-white"
                                }`}
                              >
                                Ch {session.chapter}:{" "}
                                {CHAPTER_NAMES[session.chapter] ||
                                  `Chapter ${session.chapter}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {config.label} &middot;{" "}
                                {session.duration_minutes} min
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleSession(session)}
                            disabled={toggling === session.id}
                            className={`shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all touch-manipulation ${
                              session.completed
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-gray-600 text-transparent hover:border-gray-400"
                            } ${
                              toggling === session.id
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer active:scale-110"
                            } ${
                              justToggled === session.id
                                ? "scale-125"
                                : ""
                            }`}
                            aria-label={
                              session.completed
                                ? "Mark as incomplete"
                                : "Mark as complete"
                            }
                          >
                            {session.completed && (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={3}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 pl-1">
                    Rest day &mdash; recharge and recover
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline keyframes for bounce-once animation */}
      <style jsx>{`
        @keyframes bounce-once {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
