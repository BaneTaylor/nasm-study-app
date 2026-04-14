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

const ACTIVITY_ICONS: Record<string, string> = {
  flashcards: "🗂",
  quiz: "📝",
  summary: "📖",
  practice_exam: "🎯",
};

const ACTIVITY_LABELS: Record<string, string> = {
  flashcards: "Flashcards",
  quiz: "Quiz",
  summary: "Summary",
  practice_exam: "Practice Exam",
};

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

  // Spread sessions across weekdays (Mon-Fri primarily, Sat for review)
  const daysToUse = Math.min(6, Math.max(3, chapters.length));
  const minutesPerSession = Math.round(totalMinutes / (chapters.length * activityTypes.length));
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

  // If the plan focus mentions "practice exam", add one on Saturday
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

export default function SchedulePage() {
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentWeekPlan, setCurrentWeekPlan] = useState<PlanWeek | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

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

    // Fetch profile, active plan, and current week sessions in parallel
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

    // Determine which week of the plan we're on
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

    // Fetch sessions for the current week
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

    // Auto-generate sessions if none exist and we have a plan
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
            ? { ...s, completed: newCompleted, completed_at: updateData.completed_at }
            : s
        )
      );
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
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Study Schedule</h1>
            <p className="text-gray-400 text-sm">
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
            className="text-gray-400 hover:text-white text-sm"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Weekly progress bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white">
              Weekly Progress
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(completedMinutes / 60 * 10) / 10}h /{" "}
              {Math.round(totalMinutesTarget / 60 * 10) / 10}h
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500 bg-blue-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {progressPercent}% complete
            {progressPercent >= 100 ? " — Great work this week!" : ""}
          </p>
        </div>

        {/* This week's plan summary */}
        {currentWeekPlan && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-white mb-2">
              This Week&apos;s Plan (Week {currentWeekPlan.week})
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              {currentWeekPlan.focus_type}
            </p>
            <div className="flex flex-wrap gap-2">
              {currentWeekPlan.chapters.map((ch) => (
                <span
                  key={ch}
                  className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                >
                  Ch {ch}: {CHAPTER_NAMES[ch] || `Chapter ${ch}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* No plan state */}
        {!studyPlan && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center mb-6">
            <p className="text-gray-400 mb-3">
              No active study plan found. Complete onboarding to generate your
              personalized plan.
            </p>
            <Link
              href="/onboarding"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              Start Onboarding
            </Link>
          </div>
        )}

        {/* Weekly calendar */}
        <div className="space-y-3">
          {weekDays.map((day, idx) => {
            const dateStr = formatDate(day);
            const daySessions = sessionsByDate[dateStr] || [];
            const isToday = formatDate(now) === dateStr;

            return (
              <div
                key={dateStr}
                className={`bg-gray-900 border rounded-xl p-4 ${
                  isToday ? "border-blue-500" : "border-gray-800"
                }`}
              >
                {/* Day header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div>
                    <span
                      className={`text-sm font-medium ${
                        isToday ? "text-blue-400" : "text-white"
                      }`}
                    >
                      {DAY_NAMES[idx]}
                    </span>
                    {isToday && (
                      <span className="text-xs text-blue-400 ml-2">Today</span>
                    )}
                  </div>
                </div>

                {/* Sessions for this day */}
                {daySessions.length > 0 ? (
                  <div className="space-y-2">
                    {daySessions.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          session.completed
                            ? "bg-green-900/20 border border-green-800/50"
                            : "bg-gray-800/50 border border-gray-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-lg flex-shrink-0">
                            {ACTIVITY_ICONS[session.activity_type] || "📚"}
                          </span>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                session.completed
                                  ? "text-green-300 line-through"
                                  : "text-white"
                              }`}
                            >
                              Ch {session.chapter}:{" "}
                              {CHAPTER_NAMES[session.chapter] ||
                                `Chapter ${session.chapter}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {ACTIVITY_LABELS[session.activity_type] ||
                                session.activity_type}{" "}
                              &middot; {session.duration_minutes} min
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSession(session)}
                          disabled={toggling === session.id}
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                            session.completed
                              ? "bg-green-600 border-green-600 text-white"
                              : "border-gray-600 text-transparent hover:border-gray-400"
                          } ${
                            toggling === session.id
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          aria-label={
                            session.completed
                              ? "Mark as incomplete"
                              : "Mark as complete"
                          }
                        >
                          {session.completed ? (
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
                          ) : null}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 pl-1">
                    No sessions scheduled
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
